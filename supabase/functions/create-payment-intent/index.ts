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

// ── Types ────────────────────────────────────────────────────────────────────

interface RequestBody {
  campaignId: string
  amount: number          // CAD dollars
  givingType: string
  frequency: string
  tipAmount: number       // CAD dollars
  coverFees: boolean
  isAnonymous: boolean
  donorId: string | null
}

interface SuccessResponse {
  clientSecret: string
}

interface ErrorResponse {
  error: string
}

// ── CORS headers ──────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!stripeKey) {
    return jsonError('STRIPE_SECRET_KEY is not configured', 500)
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
  // Service role client — used for writes that bypass RLS
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return jsonError('Invalid request body', 400)
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
  } = body

  // ── Validate inputs ───────────────────────────────────────────────────────
  if (!campaignId || typeof campaignId !== 'string') {
    return jsonError('campaignId is required', 400)
  }
  if (!amount || amount <= 0 || !isFinite(amount)) {
    return jsonError('amount must be a positive number', 400)
  }
  if (!givingType) {
    return jsonError('givingType is required', 400)
  }

  // ── Verify donor identity ─────────────────────────────────────────────────
  // If donorId is provided, verify the caller's JWT matches it.
  // Guest donations (donorId === null) are allowed without a session.
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

  // ── Validate campaign ─────────────────────────────────────────────────────
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

  // Zakat can only go to zakat-eligible campaigns
  if (givingType === 'zakat' && !campaign.zakat_eligible) {
    return jsonError('This campaign is not eligible to receive Zakat funds', 400)
  }

  // ── Calculate amounts in cents ────────────────────────────────────────────
  const baseCents   = Math.round(amount * 100)
  const tipCents    = Math.round(tipAmount * 100)
  // CAD Stripe rate: 2.9% + $0.30
  const feesCents   = coverFees ? Math.round((amount * 0.029 + 0.30) * 100) : 0
  const totalCents  = baseCents + tipCents + feesCents
  // Maddad takes 0% from donations — revenue comes entirely from optional tips
  const platformFeeCents = 0

  // ── Create Stripe Payment Intent ──────────────────────────────────────────
  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'cad',
      automatic_payment_methods: { enabled: true },
      metadata: {
        campaignId,
        givingType,
        frequency,
        donorId: donorId ?? 'guest',
        tipAmount: String(tipCents),
        tipSkipped: String(tipCents === 0),
        platformFee: '0',
        coverFees: String(coverFees),
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
      campaign_id: campaignId,
      donor_id: donorId ?? null,
      giving_type: givingType,
      amount,                             // CAD dollars
      platform_fee_amount: platformFeeCents / 100,
      status: 'pending',
      frequency,
      is_anonymous: isAnonymous,
      hide_amount: false,
      stripe_payment_intent_id: paymentIntent.id,
    })

  if (insertError) {
    // The Payment Intent was already created — log and continue so the donor
    // can still complete payment. The webhook will reconcile the row.
    console.error('[create-payment-intent] DB insert error:', insertError)
  }

  return json<SuccessResponse>({ clientSecret: paymentIntent.client_secret! }, 200)
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function json<T>(body: T, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(error: string, status: number): Response {
  return json<ErrorResponse>({ error }, status)
}
