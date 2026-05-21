// Edge Function: send-verification-email
// Sends a verification status update email to the submission's author.
// Called fire-and-forget from the client after updateSubmissionStatus.
// Errors are logged but never re-thrown — always returns 200.
//
// SECRETS REQUIRED:
//   RESEND_API_KEY
//   SUPABASE_SERVICE_ROLE_KEY  (auto-provided)
//   SUPABASE_URL               (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

interface RequestBody {
  submissionId: string
  decision: 'under_review' | 'approved' | 'rejected'
  notes: string | null
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const resendKey   = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!resendKey) {
    console.error('[send-verification-email] RESEND_API_KEY not configured')
    return new Response('ok', { status: 200 })
  }

  const admin = createClient(supabaseUrl, serviceKey)

  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    console.error('[send-verification-email] Invalid request body')
    return new Response('ok', { status: 200 })
  }

  const { submissionId, decision, notes } = body
  if (!submissionId || !decision) {
    console.error('[send-verification-email] Missing submissionId or decision')
    return new Response('ok', { status: 200 })
  }

  // ── Fetch submission + org/campaign name ──────────────────────────────────
  const { data: sub } = await admin
    .from('verification_submissions')
    .select(`
      submission_type,
      submitted_by,
      organization_id,
      campaign_id,
      organizations ( legal_name ),
      campaigns ( title )
    `)
    .eq('id', submissionId)
    .single()

  if (!sub || !sub.submitted_by) {
    console.error('[send-verification-email] Submission not found or no submitter:', submissionId)
    return new Response('ok', { status: 200 })
  }

  // ── Resolve submitter email ───────────────────────────────────────────────
  const { data: { user }, error: authErr } = await admin.auth.admin.getUserById(sub.submitted_by)
  if (authErr || !user?.email) {
    console.error('[send-verification-email] Could not resolve submitter email:', authErr?.message)
    return new Response('ok', { status: 200 })
  }

  const entityType  = sub.submission_type === 'organization' ? 'Organization' : 'Campaign'
  const entityName  = sub.submission_type === 'organization'
    ? (sub.organizations as { legal_name: string } | null)?.legal_name ?? 'your submission'
    : (sub.campaigns as { title: string } | null)?.title ?? 'your submission'

  const subjectMap: Record<string, string> = {
    under_review: `Your ${entityType} is Under Review`,
    approved:     `Your ${entityType} Has Been Approved`,
    rejected:     `Your ${entityType} Submission Update`,
  }
  const subject = subjectMap[decision] ?? `Verification Update for ${entityName}`

  // ── Build email HTML ──────────────────────────────────────────────────────
  const html = buildEmail({ entityType, entityName, decision, notes })

  // ── Send via Resend ───────────────────────────────────────────────────────
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Maddad Verification <verify@maddad.ca>',
      to:      [user.email],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    console.error('[send-verification-email] Resend error:', res.status, await res.text())
  }

  return new Response(JSON.stringify({ sent: res.ok }), {
    status:  200,
    headers: { 'Content-Type': 'application/json' },
  })
})

// ── Email HTML builder ────────────────────────────────────────────────────────

function buildEmail(d: {
  entityType: string
  entityName: string
  decision: string
  notes: string | null
}): string {
  const statusConfig: Record<string, { label: string; color: string; message: string }> = {
    under_review: {
      label:   'Under Review',
      color:   '#d97706',
      message: 'Our verification team has begun reviewing your submission. We typically complete reviews within 5–7 business days.',
    },
    approved: {
      label:   'Approved',
      color:   '#1a3c34',
      message: `Your ${d.entityType.toLowerCase()} has been verified and is now live on Maddad. Donors can now discover and support your work.`,
    },
    rejected: {
      label:   'Not Approved',
      color:   '#dc2626',
      message: 'Unfortunately, your submission did not meet our verification requirements. Please review the notes below and feel free to resubmit with updated documentation.',
    },
  }

  const cfg = statusConfig[d.decision] ?? statusConfig['under_review']

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Maddad Verification Update</title>
</head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:Georgia,serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e0d8;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#1a3c34;padding:28px 36px;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#fff;">Maddad</h1>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#a8c5be;letter-spacing:1px;text-transform:uppercase;">
              Verification Update
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="font-family:Arial,sans-serif;font-size:14px;color:#666;margin:0 0 8px;">
              ${d.entityType} Submission
            </p>
            <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:20px;">${d.entityName}</h2>
            <div style="display:inline-block;padding:6px 14px;border-radius:20px;background:${cfg.color}20;margin-bottom:20px;">
              <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${cfg.color};">${cfg.label}</span>
            </div>
            <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#444;margin:0 0 20px;">
              ${cfg.message}
            </p>
            ${d.notes ? `
            <div style="background:#f9f7f4;border:1px solid #e5e0d8;border-radius:6px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Review Notes</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#444;line-height:1.6;">${d.notes}</p>
            </div>` : ''}
          </td>
        </tr>
        <tr>
          <td style="background:#f0ebe3;padding:16px 36px;text-align:center;border-top:1px solid #e5e0d8;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#999;">
              Questions? Contact us at <a href="mailto:verify@maddad.ca" style="color:#1a3c34;">verify@maddad.ca</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
