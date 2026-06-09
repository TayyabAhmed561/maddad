import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrgType = 'registered_charity' | 'masjid' | 'university_msa' | 'community_group'
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_needed'

export interface OrgApplication {
  id: string
  orgName: string
  orgType: OrgType
  province: string
  websiteUrl: string | null
  orgDescription: string
  campaignTitle: string
  campaignType: string
  campaignCategory: string
  campaignGoalCad: number | null
  campaignDescription: string
  zakatEligible: boolean
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string | null
  craNumber: string | null
  howHeard: string | null
  documentPaths: string[]
  status: ApplicationStatus
  adminNotes: string | null
  reviewedAt: string | null
  createdOrganizationId: string | null
  createdAt: string
  riskScore: number
}

export interface ApplicationInsert {
  orgName: string
  orgType: OrgType
  province: string
  websiteUrl: string | null
  orgDescription: string
  campaignTitle: string
  campaignType: string
  campaignCategory: string
  campaignGoalCad: number | null
  campaignDescription: string
  zakatEligible: boolean
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string | null
  craNumber: string | null
  howHeard: string | null
  documentPaths: string[]
}

// ── Row mapper ────────────────────────────────────────────────────────────────

function toApp(row: Record<string, unknown>): OrgApplication {
  return {
    id:                    row.id as string,
    orgName:               row.org_name as string,
    orgType:               row.org_type as OrgType,
    province:              row.province as string,
    websiteUrl:            row.website_url as string | null,
    orgDescription:        row.org_description as string,
    campaignTitle:         row.campaign_title as string,
    campaignType:          row.campaign_type as string,
    campaignCategory:      row.campaign_category as string,
    campaignGoalCad:       row.campaign_goal_cad as number | null,
    campaignDescription:   row.campaign_description as string,
    zakatEligible:         row.zakat_eligible as boolean,
    contactName:           row.contact_name as string,
    contactRole:           row.contact_role as string,
    contactEmail:          row.contact_email as string,
    contactPhone:          row.contact_phone as string | null,
    craNumber:             row.cra_number as string | null,
    howHeard:              row.how_heard as string | null,
    documentPaths:         (row.document_paths as string[]) ?? [],
    status:                row.status as ApplicationStatus,
    adminNotes:            row.admin_notes as string | null,
    reviewedAt:            row.reviewed_at as string | null,
    createdOrganizationId: row.created_organization_id as string | null,
    createdAt:             row.created_at as string,
    riskScore:             (row.risk_score as number) ?? 0,
  }
}

// ── submitApplication ─────────────────────────────────────────────────────────

export async function submitApplication(
  data: ApplicationInsert,
): Promise<{ id: string } | null> {
  const { data: row, error } = await supabase
    .from('organization_applications')
    .insert({
      org_name:             data.orgName,
      org_type:             data.orgType,
      province:             data.province,
      website_url:          data.websiteUrl,
      org_description:      data.orgDescription,
      campaign_title:       data.campaignTitle,
      campaign_type:        data.campaignType,
      campaign_category:    data.campaignCategory,
      campaign_goal_cad:    data.campaignGoalCad,
      campaign_description: data.campaignDescription,
      zakat_eligible:       data.zakatEligible,
      contact_name:         data.contactName,
      contact_role:         data.contactRole,
      contact_email:        data.contactEmail,
      contact_phone:        data.contactPhone,
      cra_number:           data.craNumber,
      how_heard:            data.howHeard,
      document_paths:       data.documentPaths,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[submitApplication] insert failed:', error.message)
    return null
  }
  return { id: row.id as string }
}

// ── getApplications (admin) ───────────────────────────────────────────────────

export async function getApplications(): Promise<OrgApplication[]> {
  const { data, error } = await supabase
    .from('organization_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map(row => toApp(row as Record<string, unknown>))
}

// ── updateApplicationStatus (admin) ──────────────────────────────────────────

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  adminNotes: string | null,
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('organization_applications')
    .update({
      status,
      admin_notes:  adminNotes,
      reviewed_by:  user.id,
      reviewed_at:  new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[updateApplicationStatus] update failed:', error.message)
    return false
  }

  // Fire-and-forget email to applicant
  supabase.functions.invoke('send-application-email', {
    body: { type: `application_${status}`, applicationId: id, adminNotes },
  }).catch(err => {
    console.error('[updateApplicationStatus] send-application-email error:', err)
  })

  return true
}

// ── approveApplication (admin) ────────────────────────────────────────────────
// Creates org + campaign from application data, then marks approved.

export async function approveApplication(app: OrgApplication): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const slug = app.orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)

  // 1. Create organization
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({
      legal_name:                            app.orgName,
      display_name:                          app.orgName,
      slug,
      description:                           app.orgDescription,
      website_url:                           app.websiteUrl,
      contact_email:                         app.contactEmail,
      ontario_charity_registration_number:   app.craNumber,
      verification_status:                   'approved' as const,
      trust_score:                           70,
    })
    .select('id')
    .single()

  if (orgErr || !org) {
    console.error('[approveApplication] org insert failed:', orgErr?.message)
    return false
  }

  const orgId = (org as { id: string }).id

  // 2. Create draft campaign
  const campaignSlug = `${slug}-${Date.now()}`
  const { error: campErr } = await supabase
    .from('campaigns')
    .insert({
      title:               app.campaignTitle,
      organization_id:     orgId,
      slug:                campaignSlug,
      category:            app.campaignCategory as 'food' | 'shelter' | 'medical' | 'education' | 'masjid' | 'fidya' | 'qurbani' | 'zakat',
      campaign_type:       app.campaignType as 'need' | 'appeal' | 'community_appeal',
      description:         app.campaignDescription,
      goal_amount:         app.campaignGoalCad,
      zakat_eligible:      app.zakatEligible,
      verification_status: 'submitted' as const,
      location_label:      'Ontario, Canada',
      country_code:        'CA',
      urgency:             3,
    })

  if (campErr) {
    console.error('[approveApplication] campaign insert failed:', campErr.message)
    // Org was created — still mark approved but log the campaign failure
  }

  // 3. Update application
  const { error: appErr } = await supabase
    .from('organization_applications')
    .update({
      status:                   'approved',
      reviewed_by:              user.id,
      reviewed_at:              new Date().toISOString(),
      created_organization_id:  orgId,
      updated_at:               new Date().toISOString(),
    })
    .eq('id', app.id)

  if (appErr) {
    console.error('[approveApplication] application update failed:', appErr.message)
    return false
  }

  // 4. Fire-and-forget welcome email
  supabase.functions.invoke('send-application-email', {
    body: { type: 'application_approved', applicationId: app.id, adminNotes: null },
  }).catch(err => {
    console.error('[approveApplication] send-application-email error:', err)
  })

  return true
}

// ── uploadApplicationDocument ─────────────────────────────────────────────────

export async function uploadApplicationDocument(
  applicationId: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `applications/${applicationId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`

  const { error } = await supabase.storage
    .from('evidence-docs')
    .upload(path, file, { upsert: false })

  if (error) {
    console.error('[uploadApplicationDocument] upload failed:', error.message)
    return null
  }
  return path
}
