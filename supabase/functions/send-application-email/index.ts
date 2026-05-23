// Edge Function: send-application-email
// Handles all outbound emails for the org application workflow.
//
// Types handled:
//   application_received      → confirmation to applicant + notification to admin
//   application_under_review  → status email to applicant
//   application_more_info_needed → email with admin notes to applicant
//   application_approved      → welcome email with signup link to applicant
//   application_rejected      → rejection email to applicant
//
// SECRETS REQUIRED:
//   RESEND_API_KEY
//   ADMIN_EMAIL         (receives new-application notifications)
//   SITE_URL            (used in welcome email CTA)
//   SUPABASE_SERVICE_ROLE_KEY  (auto-provided)
//   SUPABASE_URL               (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

interface RequestBody {
  type: string
  applicationId: string
  adminNotes: string | null
}

interface ApplicationRow {
  org_name: string
  campaign_title: string
  contact_name: string
  contact_email: string
  contact_role: string
  org_type: string
  province: string
  website_url: string | null
  org_description: string
  campaign_type: string
  campaign_category: string
  campaign_goal_cad: number | null
  campaign_description: string
  zakat_eligible: boolean
  cra_number: string | null
  how_heard: string | null
  status: string
  created_at: string
}

const CORS = { 'Access-Control-Allow-Origin': '*' }

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const resendKey   = Deno.env.get('RESEND_API_KEY')
  const adminEmail  = Deno.env.get('ADMIN_EMAIL')
  const siteUrl     = Deno.env.get('SITE_URL') ?? 'https://maddad.ca'
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!resendKey) {
    console.error('[send-application-email] RESEND_API_KEY not configured')
    return new Response('ok', { status: 200 })
  }

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    console.error('[send-application-email] Invalid JSON body')
    return new Response('ok', { status: 200 })
  }

  const { type, applicationId, adminNotes } = body
  if (!type || !applicationId) {
    console.error('[send-application-email] Missing type or applicationId')
    return new Response('ok', { status: 200 })
  }

  const admin = createClient(supabaseUrl, serviceKey)

  const { data: app, error: fetchErr } = await admin
    .from('organization_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !app) {
    console.error('[send-application-email] Application not found:', applicationId)
    return new Response('ok', { status: 200 })
  }

  const a = app as ApplicationRow
  const fromAddress = 'Maddad <hello@maddad.ca>'

  const sends: Promise<Response>[] = []

  // ── application_received ─────────────────────────────────────────────────
  if (type === 'application_received') {
    // 1. Confirmation to applicant
    sends.push(sendEmail(resendKey, {
      from:    fromAddress,
      to:      [a.contact_email],
      subject: 'We received your Maddad application',
      html:    buildConfirmationEmail(a),
    }))

    // 2. Notification to admin
    if (adminEmail) {
      sends.push(sendEmail(resendKey, {
        from:    fromAddress,
        to:      [adminEmail],
        subject: `New Maddad application: ${a.org_name}`,
        html:    buildAdminNotificationEmail(a, siteUrl),
      }))
    }
  }

  // ── application_under_review ─────────────────────────────────────────────
  if (type === 'application_under_review') {
    sends.push(sendEmail(resendKey, {
      from:    fromAddress,
      to:      [a.contact_email],
      subject: `Your Maddad application is under review`,
      html:    buildStatusEmail(a, 'under_review', adminNotes),
    }))
  }

  // ── application_more_info_needed ─────────────────────────────────────────
  if (type === 'application_more_info_needed') {
    sends.push(sendEmail(resendKey, {
      from:    fromAddress,
      to:      [a.contact_email],
      subject: `More information needed — Maddad application`,
      html:    buildStatusEmail(a, 'more_info_needed', adminNotes),
    }))
  }

  // ── application_approved ─────────────────────────────────────────────────
  if (type === 'application_approved') {
    sends.push(sendEmail(resendKey, {
      from:    fromAddress,
      to:      [a.contact_email],
      subject: `Welcome to Maddad — ${a.org_name} has been approved`,
      html:    buildApprovedEmail(a, siteUrl),
    }))
  }

  // ── application_rejected ─────────────────────────────────────────────────
  if (type === 'application_rejected') {
    sends.push(sendEmail(resendKey, {
      from:    fromAddress,
      to:      [a.contact_email],
      subject: `Your Maddad application — an update`,
      html:    buildStatusEmail(a, 'rejected', adminNotes),
    }))
  }

  await Promise.allSettled(sends)

  return new Response(JSON.stringify({ sent: true }), {
    status:  200,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
})

// ── sendEmail helper ──────────────────────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  payload: { from: string; to: string[]; subject: string; html: string },
): Promise<Response> {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    console.error('[send-application-email] Resend error:', res.status, await res.text())
  }
  return res
}

// ── Email wrappers ────────────────────────────────────────────────────────────

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>Maddad</title></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:Georgia,serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border:1px solid #e5e0d8;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#1a3c34;padding:24px 36px;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#fff;">Maddad</h1>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:11px;
                      color:#a8c5be;letter-spacing:1px;text-transform:uppercase;">
              Islamic Giving Platform
            </p>
          </td>
        </tr>
        <tr><td style="padding:32px 36px;">${content}</td></tr>
        <tr>
          <td style="background:#f0ebe3;padding:16px 36px;text-align:center;
                     border-top:1px solid #e5e0d8;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#999;">
              Questions? Email us at
              <a href="mailto:hello@maddad.ca" style="color:#1a3c34;">hello@maddad.ca</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function p(text: string) {
  return `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;
             color:#444;margin:0 0 16px;">${text}</p>`
}

function ctaButton(url: string, label: string) {
  return `<div style="margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:#1a3c34;color:#fff;
       font-family:Arial,sans-serif;font-size:14px;font-weight:700;padding:12px 28px;
       border-radius:6px;text-decoration:none;">${label}</a>
  </div>`
}

function notesBlock(notes: string) {
  return `<div style="background:#f9f7f4;border:1px solid #e5e0d8;border-radius:6px;
             padding:16px;margin:16px 0;">
    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;
              color:#999;text-transform:uppercase;letter-spacing:0.5px;">Notes from our team</p>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#444;
              line-height:1.6;">${notes}</p>
  </div>`
}

// ── Email builders ────────────────────────────────────────────────────────────

function buildConfirmationEmail(a: ApplicationRow): string {
  return emailShell(`
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;">
      JazakAllah Khayran, ${a.contact_name}
    </h2>
    ${p(`We've received your application for <strong>${a.org_name}</strong> to join Maddad.`)}
    ${p(`We review all applications within <strong>3 business days</strong> and will be in touch at
         <strong>${a.contact_email}</strong>.`)}
    ${p(`In the meantime, if you have any questions or need to update your application,
         reply to this email.`)}
    <div style="background:#f0ebe3;border-radius:6px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#666;">
        <strong>Application summary:</strong><br />
        Organization: ${a.org_name}<br />
        Campaign: ${a.campaign_title}<br />
        Submitted: ${new Date(a.created_at).toLocaleDateString('en-CA')}
      </p>
    </div>
    ${p('JazakAllah Khayran for your interest in joining Maddad.')}
  `)
}

function buildAdminNotificationEmail(a: ApplicationRow, siteUrl: string): string {
  const orgTypeLabels: Record<string, string> = {
    registered_charity: 'Registered Canadian charity',
    masjid:             'Masjid / Islamic centre',
    university_msa:     'University MSA',
    community_group:    'Community group',
  }
  return emailShell(`
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;">
      New application: ${a.org_name}
    </h2>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;
                  font-size:13px;margin-bottom:20px;">
      ${[
        ['Organization', a.org_name],
        ['Type', orgTypeLabels[a.org_type] ?? a.org_type],
        ['Province', a.province],
        ['Website', a.website_url ?? '—'],
        ['Campaign', a.campaign_title],
        ['Campaign type', a.campaign_type],
        ['Category', a.campaign_category],
        ['Goal', a.campaign_goal_cad != null ? `$${a.campaign_goal_cad.toLocaleString()} CAD` : '—'],
        ['Zakat-eligible', a.zakat_eligible ? 'Yes' : 'No'],
        ['Contact', `${a.contact_name} (${a.contact_role})`],
        ['Email', a.contact_email],
        ['Phone', a.contact_phone ?? '—'],
        ['CRA number', a.cra_number ?? '—'],
        ['How heard', a.how_heard ?? '—'],
      ].map(([k, v]) => `
        <tr style="border-bottom:1px solid #e5e0d8;">
          <td style="padding:8px 12px 8px 0;color:#888;white-space:nowrap;">${k}</td>
          <td style="padding:8px 0;color:#1a1a1a;">${v}</td>
        </tr>
      `).join('')}
    </table>
    <div style="background:#f9f7f4;border-radius:6px;padding:14px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;
                color:#999;text-transform:uppercase;">Org description</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#444;line-height:1.6;">
        ${a.org_description}
      </p>
    </div>
    ${ctaButton(`${siteUrl}/admin`, 'Review in Admin Dashboard')}
  `)
}

function buildStatusEmail(a: ApplicationRow, status: string, notes: string | null): string {
  const messages: Record<string, { heading: string; body: string }> = {
    under_review: {
      heading: `We're reviewing your application`,
      body: `Our team has started reviewing your application for <strong>${a.org_name}</strong>.
             We aim to complete reviews within 3 business days and will be in touch soon.`,
    },
    more_info_needed: {
      heading: `We need a bit more information`,
      body: `Thank you for applying to Maddad. To complete our review of
             <strong>${a.org_name}</strong>'s application, we need some additional information.`,
    },
    rejected: {
      heading: `An update on your application`,
      body: `Thank you for your interest in joining Maddad. Unfortunately, after reviewing
             your application for <strong>${a.org_name}</strong>, we are unable to proceed
             at this time.`,
    },
  }

  const cfg = messages[status] ?? messages['under_review']

  return emailShell(`
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;">
      ${cfg.heading}
    </h2>
    ${p(`Assalamu alaikum ${a.contact_name},`)}
    ${p(cfg.body)}
    ${notes ? notesBlock(notes) : ''}
    ${status === 'more_info_needed'
      ? p('Please reply to this email with the requested information and we will continue our review.')
      : ''}
    ${status === 'rejected'
      ? p('If you believe this decision was made in error, or if your circumstances change, you are welcome to resubmit a new application in the future.')
      : ''}
    ${p('JazakAllah Khayran for your patience.')}
  `)
}

function buildApprovedEmail(a: ApplicationRow, siteUrl: string): string {
  const signupUrl = `${siteUrl}/signup?email=${encodeURIComponent(a.contact_email)}`
  return emailShell(`
    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;">
      Welcome to Maddad 🌿
    </h2>
    ${p(`Assalamu alaikum ${a.contact_name},`)}
    ${p(`We are pleased to let you know that <strong>${a.org_name}</strong> has been
         approved on Maddad.`)}
    ${p(`Your first campaign <strong>"${a.campaign_title}"</strong> has been created
         as a draft and is ready for your review.`)}
    ${ctaButton(signupUrl, 'Create your account to get started')}
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin:0 0 20px;">
      Link: ${signupUrl}
    </p>
    <div style="background:#f0ebe3;border-radius:6px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;
                color:#666;font-weight:700;">Once you're signed in, you'll be able to:</p>
      <ul style="margin:0;padding-left:18px;font-family:Arial,sans-serif;
                 font-size:13px;color:#444;line-height:2;">
        <li>Edit and publish your campaign</li>
        <li>Upload verification evidence</li>
        <li>Track donations in real time</li>
      </ul>
    </div>
    ${p('JazakAllah Khayran for joining Maddad. We look forward to supporting your work.')}
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#444;">
      The Maddad Team
    </p>
  `)
}
