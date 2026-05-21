// Edge Function: send-receipt
// Fetches a completed receipt and emails it to the donor via Resend.
// Called fire-and-forget from stripe-webhook — errors are logged but never
// re-thrown so the calling webhook always returns 200.
//
// SECRETS REQUIRED:
//   RESEND_API_KEY
//   SUPABASE_SERVICE_ROLE_KEY  (auto-provided)
//   SUPABASE_URL               (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

interface RequestBody {
  donationId: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  const resendKey   = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!resendKey) {
    console.error('[send-receipt] RESEND_API_KEY is not configured')
    return new Response('ok', { status: 200 })
  }

  const admin = createClient(supabaseUrl, serviceKey)

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    console.error('[send-receipt] Invalid request body')
    return new Response('ok', { status: 200 })
  }

  const { donationId } = body
  if (!donationId) {
    console.error('[send-receipt] Missing donationId')
    return new Response('ok', { status: 200 })
  }

  // ── Fetch receipt + donation + campaign + org ─────────────────────────────
  const { data: receipt, error: fetchError } = await admin
    .from('receipts')
    .select(`
      id,
      receipt_serial_number,
      charity_legal_name,
      charity_registration_number,
      donor_full_name,
      donor_address,
      donation_amount,
      eligible_amount_for_tax,
      currency,
      donation_date,
      digital_signature_text,
      is_anonymous,
      donations (
        id,
        donor_id,
        giving_type,
        campaign_id,
        campaigns ( title )
      )
    `)
    .eq('donation_id', donationId)
    .single()

  if (fetchError || !receipt) {
    console.error('[send-receipt] Receipt not found for donationId:', donationId, fetchError)
    return new Response('ok', { status: 200 })
  }

  // ── Resolve donor email ───────────────────────────────────────────────────
  const donation = receipt.donations as { donor_id: string | null; giving_type: string; campaigns: { title: string } | null } | null
  const donorId  = donation?.donor_id ?? null

  let donorEmail: string | null = null
  if (donorId) {
    // Fetch from auth.users via service role (only service role can read auth.users)
    const { data: { user }, error: authError } = await admin.auth.admin.getUserById(donorId)
    if (!authError && user?.email) {
      donorEmail = user.email
    }
  }

  if (!donorEmail) {
    console.error('[send-receipt] No donor email for donationId:', donationId)
    return new Response('ok', { status: 200 })
  }

  const campaignTitle = (donation?.campaigns as { title: string } | null)?.title ?? 'your donation'
  const givingType    = donation?.giving_type ?? 'sadaqah'
  const donorAddress  = receipt.donor_address as Record<string, string>

  // ── Generate receipt HTML ─────────────────────────────────────────────────
  const receiptHtml = buildReceiptHtml({
    serialNumber:         receipt.receipt_serial_number,
    charityLegalName:     receipt.charity_legal_name,
    charityRegNumber:     receipt.charity_registration_number,
    donorFullName:        receipt.donor_full_name,
    donorAddress,
    donationAmount:       receipt.donation_amount,
    eligibleAmount:       receipt.eligible_amount_for_tax,
    currency:             receipt.currency,
    donationDate:         receipt.donation_date,
    digitalSignatureText: receipt.digital_signature_text,
    campaignTitle,
    givingType,
  })

  // ── Send via Resend ───────────────────────────────────────────────────────
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Maddad Receipts <receipts@maddad.ca>',
      to: [donorEmail],
      subject: `Your Maddad donation receipt — ${receipt.receipt_serial_number}`,
      html: receiptHtml,
    }),
  })

  if (!resendRes.ok) {
    const resendBody = await resendRes.text()
    console.error('[send-receipt] Resend API error:', resendRes.status, resendBody)
    // Return 200 — caller (stripe-webhook) must not be blocked by email failure
    return new Response('ok', { status: 200 })
  }

  // ── Mark receipt as emailed ───────────────────────────────────────────────
  await admin
    .from('receipts')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', receipt.id)

  return new Response(JSON.stringify({ sent: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

// ── Receipt HTML builder ──────────────────────────────────────────────────────

interface ReceiptData {
  serialNumber: string
  charityLegalName: string
  charityRegNumber: string
  donorFullName: string
  donorAddress: Record<string, string>
  donationAmount: number
  eligibleAmount: number
  currency: string
  donationDate: string
  digitalSignatureText: string
  campaignTitle: string
  givingType: string
}

function buildReceiptHtml(d: ReceiptData): string {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(d.donationAmount)

  const formattedEligible = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(d.eligibleAmount)

  const addressLine = [d.donorAddress.street, d.donorAddress.city, d.donorAddress.province]
    .filter(Boolean)
    .join(', ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Maddad Donation Receipt ${d.serialNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:Georgia,serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e0d8;border-radius:8px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1a3c34;padding:28px 36px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                Maddad
              </h1>
              <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a8c5be;letter-spacing:1px;text-transform:uppercase;">
                Official Donation Receipt for Income Tax Purposes
              </p>
            </td>
          </tr>

          <!-- Receipt number banner -->
          <tr>
            <td style="background:#f0ebe3;padding:12px 36px;border-bottom:1px solid #e5e0d8;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#666;">
                Receipt No. <strong style="color:#1a1a1a;font-size:14px;">${d.serialNumber}</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Date: <strong>${d.donationDate}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">

              <!-- Charity info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:4px;">
                    Registered Charity
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#1a1a1a;">
                    ${d.charityLegalName}
                  </td>
                </tr>
                ${d.charityRegNumber ? `<tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding-top:2px;">
                  CRA Registration No.: ${d.charityRegNumber}
                </td></tr>` : ''}
              </table>

              <!-- Donor info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;padding-top:16px;border-top:1px solid #eee;">
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:4px;">
                    Donor
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Georgia,serif;font-size:15px;color:#1a1a1a;">
                    ${d.donorFullName}
                  </td>
                </tr>
                ${addressLine ? `<tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding-top:2px;">
                  ${addressLine}
                </td></tr>` : ''}
              </table>

              <!-- Donation details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;padding-top:16px;border-top:1px solid #eee;">
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:6px 0;">Campaign</td>
                  <td align="right" style="font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;">${d.campaignTitle}</td>
                </tr>
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:6px 0;">Giving Type</td>
                  <td align="right" style="font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;text-transform:capitalize;">${d.givingType.replace('_', ' ')}</td>
                </tr>
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:6px 0;">Amount Donated</td>
                  <td align="right" style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#1a3c34;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:6px 0;">Eligible for Tax Credit</td>
                  <td align="right" style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a1a;">${formattedEligible}</td>
                </tr>
              </table>

              <!-- CRA statement -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;padding:16px;background:#f9f7f4;border-radius:4px;border:1px solid #e5e0d8;">
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:11px;color:#666;line-height:1.6;">
                    This receipt is issued in accordance with the Income Tax Act of Canada.
                    Official receipts are available for cash donations and can be used to claim
                    a charitable donation tax credit on your federal and provincial tax return.
                  </td>
                </tr>
              </table>

              <!-- Digital signature -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:16px;border-top:1px solid #eee;">
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:11px;color:#999;line-height:1.6;">
                    ${d.digitalSignatureText}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0ebe3;padding:16px 36px;border-top:1px solid #e5e0d8;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#999;">
                Questions? Contact us at <a href="mailto:receipts@maddad.ca" style="color:#1a3c34;">receipts@maddad.ca</a>
                &nbsp;|&nbsp; maddad.ca
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
