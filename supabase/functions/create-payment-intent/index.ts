// Edge Function: create-payment-intent
// Creates a Stripe Payment Intent for a donation and inserts a pending
// donations row. Called from the client-side DonationModule checkout.
//
// SECRETS REQUIRED (set in Supabase dashboard → Edge Function secrets):
//   STRIPE_SECRET_KEY
//   SUPABASE_SERVICE_ROLE_KEY  (auto-provided by Supabase runtime)
//   SUPABASE_URL               (auto-provided by Supabase runtime)

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod'

// ── CORS headers ──────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Request schema (Zod) ──────────────────────────────────────────────────────

const AMOUNT_MIN_CAD = 1        // $1.00 CAD minimum
const AMOUNT_MAX_CAD = 25_000   // $25,000.00 CAD maximum per transaction

const requestSchema = z.object({
  campaignId:  z.string().uuid('campaignId must be a valid UUID'),
  amount:      z.number()
    .min(AMOUNT_MIN_CAD, `Minimum donation is $${AMOUNT_MIN_CAD}.00 CAD`)
    .max(AMOUNT_MAX_CAD, `Maximum donation per transaction is $${AMOUNT_MAX_CAD.toLocaleString()}.00 CAD`),
  givingType:  z.enum([
    'zakat', 'fidya', 'kaffarah', 'qurbani',
    'sadaqah_jariyah', 'meal_sponsorship', 'sadaqah',
  ]),
  frequency:   z.enum(['one-time', 'weekly', 'monthly', 'yearly']),
  tipAmount:   z.number().min(0).max(1_000),
  coverFees:   z.boolean(),
  isAnonymous: z.boolean(),
  donorId:     z.string().uuid().nullable(),
})

type RequestBody = z.infer<typeof requestSchema>

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Max 10 requests per IP per minute for payment intents (card-testing protection)

async function checkRateLimit(
  admin: ReturnType<typeof createClient>,
  identifier: string,
  action: string,
  maxCount: number,
  windowMinutes: number,
): Promise<boolean> {
  try {
    const windowStart = new Date(
      Math.floor(Date.now() / (windowMinutes * 60_000)) * (windowMinutes * 60_000)
    ).toISOString()

    const { data, error } = await admin.rpc('upsert_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_window_start: windowStart,
    })

    if (error) {
      // On error, allow the request (fail open — don't break payments over rate-limit errors)
      console.warn('[create-payment-intent] rate limit check error:', error.message)
      return true
    }

    return (data as number) <= maxCount
  } catch {
    return true // fail open
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripeKey      = Deno.env.get('STRIPE_SECRET_KEY')
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!stripeKey) {
    return jsonError('STRIPE_SECRET_KEY is not configured', 500)
  }

  const stripe      = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // ── Rate limit check ──────────────────────────────────────────────────────
  const clientIp =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'

  const allowed = await checkRateLimit(adminClient, clientIp, 'create_payment_intent', 10, 1)
  if (!allowed) {
    console.warn('[create-payment-intent] Rate limited IP:', clientIp)
    return new Response(
      JSON.stringify({ error: 'Too many requests — please wait a moment and try again.' }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      },
    )
  }

  // ── Parse and validate body ───────────────────────────────────────────────
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const parsed = requestSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues.map(i => i.message).join('; ')
    return jsonError(`Validation error: ${message}`, 400)
  }

  const {
    campaignId,
    amount,
    givingType,
    frequency,
    tipAmount,
    coverFees,
    isAnonymous,
    donorId,
  }: RequestBody = parsed.data

  // ── Server-side amount bounds (logged for monitoring) ─────────────────────
  // Zod catches this above, but double-check after parse in case of bypass attempts.
  if (amount < AMOUNT_MIN_CAD || amount > AMOUNT_MAX_CAD) {
    console.warn('[create-payment-intent] Out-of-bounds amount attempt:', { amount, clientIp })
    return jsonError(`Amount must be between $${AMOUNT_MIN_CAD} and $${AMOUNT_MAX_CAD.toLocaleString()} CAD`, 400)
  }

  // ── Verify donor identity ─────────────────────────────────────────────────
  if (donorId !== null) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return jsonError('Authorization header required for authenticated donations', 401)
    }
    const { data: { user }, error: authError } = await adminClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user || user.id !== donorId) {
      return jsonError('Unauthorized — donorId does not match session', 403)
    }
  }

  // ── Validate campaign (server-side — never trust client claims) ───────────
  const { data: campaign, error: campaignError } = await adminClient
    .from('campaigns')
    .select('id, title, verification_status, is_active, zakat_eligible, giving_type')
    .eq('id', campaignId)
    .is('deleted_at', null)
    .single()

  if (campaignError || !campaign) {
    return jsonError('Campaign not found', 400)
  }
  if (!campaign.is_active) {
    return jsonError('This campaign is no longer active', 400)
  }
  if (campaign.verification_status !== 'approved') {
    return jsonError('This campaign has not been approved for donations', 400)
  }
  if (givingType === 'zakat' && !campaign.zakat_eligible) {
    return jsonError('This campaign is not eligible to receive Zakat funds', 400)
  }

  // ── Calculate amounts in cents ────────────────────────────────────────────
  const baseCents  = Math.round(amount * 100)
  const tipCents   = Math.round(tipAmount * 100)
  const feesCents  = coverFees ? Math.round((amount * 0.029 + 0.30) * 100) : 0
  const totalCents = baseCents + tipCents + feesCents

  // ── Create Stripe Payment Intent ──────────────────────────────────────────
  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount:   totalCents,
      currency: 'cad',
      automatic_payment_methods: { enabled: true },
      metadata: {
        campaignId,
        givingType,
        frequency,
        donorId:     donorId ?? 'guest',
        tipAmount:   String(tipCents),
        tipSkipped:  String(tipCents === 0),
        platformFee: '0',
        coverFees:   String(coverFees),
        isAnonymous: String(isAnonymous),
      },
    })
  } catch (err) {
    console.error('[create-payment-intent] Stripe error:', err)
    return jsonError('Payment provider error — please try again', 500)
  }

  // ── Insert pending donations row ──────────────────────────────────────────
  const { error: insertError } = await adminClient
    .from('donations')
    .insert({
      campaign_id:              campaignId,
      donor_id:                 donorId ?? null,
      giving_type:              givingType,
      amount,
      platform_fee_amount:      0,
      status:                   'pending',
      frequency,
      is_anonymous:             isAnonymous,
      hide_amount:              false,
      stripe_payment_intent_id: paymentIntent.id,
    })

  if (insertError) {
    // PI already created — log and continue so the donor can complete payment.
    // The webhook will reconcile the row on success.
    console.error('[create-payment-intent] DB insert error:', insertError)
  }

  return json({ clientSecret: paymentIntent.client_secret! }, 200)
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function json<T>(body: T, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(error: string, status: number): Response {
  return json({ error }, status)
}
