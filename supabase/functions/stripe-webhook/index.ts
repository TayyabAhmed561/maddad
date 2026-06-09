// Edge Function: stripe-webhook
// Processes verified Stripe webhook events.
//
// CRITICAL: Webhook signature is verified before ANY processing.
// An event that fails verification is rejected with 400 — never processed.
//
// SECRETS REQUIRED:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_SERVICE_ROLE_KEY  (auto-provided)
//   SUPABASE_URL               (auto-provided)

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripeKey     = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl   = Deno.env.get('SUPABASE_URL')!
  const serviceKey    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!stripeKey || !webhookSecret) {
    console.error('[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
    return new Response('Configuration error', { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
  const admin  = createClient(supabaseUrl, serviceKey)

  // ── Signature verification (MUST be first) ────────────────────────────────
  const sig     = req.headers.get('stripe-signature')
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return new Response('Webhook signature invalid', { status: 400 })
  }

  // ── Route events ───────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, admin, stripe)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, admin)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, admin)
        break

      default:
        // Unhandled event types are silently ignored — Stripe requires a 200
        break
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err)
    // Return 200 anyway so Stripe doesn't retry indefinitely.
    // Errors are logged for manual investigation.
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

// ── payment_intent.succeeded ─────────────────────────────────────────────────

async function handlePaymentSucceeded(
  pi: Stripe.PaymentIntent,
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
): Promise<void> {
  // ── Idempotency guard ─────────────────────────────────────────────────────
  // Stripe can deliver the same event more than once. If we already marked
  // this PI as succeeded, return immediately — do not re-insert a receipt.
  const { data: existing } = await admin
    .from('donations')
    .select('id, status')
    .eq('stripe_payment_intent_id', pi.id)
    .maybeSingle()

  if (existing?.status === 'succeeded') {
    console.log('[stripe-webhook] Duplicate payment_intent.succeeded for PI:', pi.id, '— skipping')
    return
  }

  const {
    campaignId,
    givingType,
    donorId: donorIdMeta,
    isAnonymous: isAnonymousMeta,
  } = pi.metadata as Record<string, string>

  const isAnonymous = isAnonymousMeta === 'true'
  const isGuest     = donorIdMeta === 'guest'
  const donorId     = isGuest ? null : donorIdMeta

  // Update donations row to succeeded
  const { data: donation, error: updateError } = await admin
    .from('donations')
    .update({ status: 'succeeded' })
    .eq('stripe_payment_intent_id', pi.id)
    .select('id, amount, currency')
    .single()

  if (updateError || !donation) {
    console.error('[stripe-webhook] Failed to update donation for PI:', pi.id, updateError)
    return
  }

  // Fetch donor details (null for guests)
  let donorFullName = 'Guest Donor'
  let donorAddress = { street: '', city: '', province: 'ON', postal_code: '', country: 'CA' }

  if (donorId) {
    const { data: donor } = await admin
      .from('donors')
      .select('full_name, address_street, address_city, address_province, address_postal_code, address_country')
      .eq('id', donorId)
      .single()

    if (donor) {
      donorFullName = donor.full_name ?? 'Anonymous Donor'
      donorAddress = {
        street:      donor.address_street      ?? '',
        city:        donor.address_city        ?? '',
        province:    donor.address_province    ?? 'ON',
        postal_code: donor.address_postal_code ?? '',
        country:     donor.address_country     ?? 'CA',
      }
    }
  }

  // Fetch campaign + organization for receipt
  const { data: campaign } = await admin
    .from('campaigns')
    .select('title, organization_id, organizations(legal_name, ontario_charity_registration_number)')
    .eq('id', campaignId)
    .single()

  const org = campaign?.organizations as
    | { legal_name: string; ontario_charity_registration_number: string | null }
    | null

  const charityLegalName = org?.legal_name ?? 'Maddad Platform'
  const charityRegNumber = org?.ontario_charity_registration_number ?? ''

  // Insert receipt row
  const today = new Date().toISOString().slice(0, 10)
  const { error: receiptError } = await admin
    .from('receipts')
    .insert({
      donation_id:                donation.id,
      charity_legal_name:         charityLegalName,
      charity_registration_number: charityRegNumber,
      donor_full_name:            donorFullName,
      donor_address:              donorAddress,
      donation_amount:            donation.amount,
      eligible_amount_for_tax:    donation.amount,
      currency:                   'CAD',
      donation_date:              today,
      digital_signature_text:
        'I certify that the information in this receipt is true, accurate, and complete. ' +
        'Maddad Platform, authorized signing officer.',
      is_anonymous: isAnonymous,
    })

  if (receiptError) {
    console.error('[stripe-webhook] Failed to insert receipt:', receiptError)
    // Continue — don't block the webhook response
    return
  }

  // Fire-and-forget: send receipt email (do not await)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  fetch(`${supabaseUrl}/functions/v1/send-receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ donationId: donation.id }),
  }).catch((err) => {
    console.error('[stripe-webhook] send-receipt fire-and-forget error:', err)
  })
}

// ── payment_intent.payment_failed ────────────────────────────────────────────

async function handlePaymentFailed(
  pi: Stripe.PaymentIntent,
  admin: ReturnType<typeof createClient>,
): Promise<void> {
  const { error } = await admin
    .from('donations')
    .update({ status: 'failed' })
    .eq('stripe_payment_intent_id', pi.id)

  if (error) {
    console.error('[stripe-webhook] Failed to mark donation as failed for PI:', pi.id, error)
  }
}

// ── subscription events ───────────────────────────────────────────────────────

type StripeSubStatus = Stripe.Subscription['status']

function mapStripeStatus(status: StripeSubStatus): string {
  switch (status) {
    case 'active':    return 'active'
    case 'paused':    return 'paused'
    case 'canceled':
    case 'cancelled': return 'cancelled'
    default:          return 'active'
  }
}

async function handleSubscriptionChange(
  sub: Stripe.Subscription,
  admin: ReturnType<typeof createClient>,
): Promise<void> {
  const mapped = mapStripeStatus(sub.status)

  const { error } = await admin
    .from('recurring_donations')
    .update({
      status: mapped,
      ...(mapped === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
    })
    .eq('stripe_subscription_id', sub.id)

  if (error) {
    console.error('[stripe-webhook] Failed to update recurring_donations for sub:', sub.id, error)
  }
}
