import { supabase } from '@/lib/supabase'
import type {
  SubmissionType,
  VerificationStatus,
  EvidenceVisibility,
  MediaType,
  EvidenceTypeEnum,
  CampaignCategory,
  CampaignType,
} from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EvidenceUpload {
  type: EvidenceTypeEnum
  title: string
  description: string
  url: string
  visibility: EvidenceVisibility
  mediaType: MediaType
}

export interface OrgSubmissionData {
  legalName: string
  location: string
  websiteUrl: string | null
  contactEmail: string
  contactPhone: string | null
  evidence: EvidenceUpload[]
}

export interface CampaignSubmissionData {
  title: string
  category: string
  goalAmount: number
  locationLabel: string
  description: string
  organizationId: string | null
  submitterType: 'organization' | 'private'
  evidence: EvidenceUpload[]
}

export interface SubmissionRow {
  id: string
  submissionType: SubmissionType
  organizationId: string | null
  campaignId: string | null
  status: VerificationStatus
  submittedAt: string | null
  submitterNotes: string | null
  createdAt: string
  organizationName: string | null
  campaignTitle: string | null
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) +
    '-' + Date.now().toString(36)
  )
}

const CATEGORY_MAP: Record<string, CampaignCategory> = {
  medical:   'medical',
  disaster:  'shelter',
  education: 'education',
  housing:   'shelter',
  food:      'food',
  masjid:    'masjid',
  other:     'education',
  shelter:   'shelter',
  fidya:     'fidya',
  qurbani:   'qurbani',
  zakat:     'zakat',
}

function mapCategory(cat: string): CampaignCategory {
  return CATEGORY_MAP[cat] ?? 'education'
}

function mapRows(data: Array<{
  id: string
  submission_type: string
  organization_id: string | null
  campaign_id: string | null
  status: string
  submitted_at: string | null
  submitter_notes: string | null
  created_at: string
  organizations: unknown
  campaigns: unknown
}>): SubmissionRow[] {
  return data.map(row => ({
    id: row.id,
    submissionType: row.submission_type as SubmissionType,
    organizationId: row.organization_id,
    campaignId: row.campaign_id,
    status: row.status as VerificationStatus,
    submittedAt: row.submitted_at,
    submitterNotes: row.submitter_notes,
    createdAt: row.created_at,
    organizationName: (row.organizations as { legal_name: string } | null)?.legal_name ?? null,
    campaignTitle: (row.campaigns as { title: string } | null)?.title ?? null,
  }))
}

const SUBMISSION_SELECT = `
  id, submission_type, organization_id, campaign_id,
  status, submitted_at, submitter_notes, created_at,
  organizations ( legal_name ),
  campaigns ( title )
`

// ── createOrgSubmission ───────────────────────────────────────────────────────

export async function createOrgSubmission(data: OrgSubmissionData): Promise<{ id: string } | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({
      legal_name:          data.legalName,
      display_name:        data.legalName,
      slug:                generateSlug(data.legalName),
      contact_email:       data.contactEmail,
      contact_phone:       data.contactPhone,
      website_url:         data.websiteUrl,
      verification_status: 'draft',
      created_by:          user.id,
    })
    .select('id')
    .single()

  if (orgErr || !org) {
    console.error('[createOrgSubmission] org insert failed:', orgErr?.message)
    return null
  }

  const { data: sub, error: subErr } = await supabase
    .from('verification_submissions')
    .insert({
      submission_type: 'organization',
      organization_id: org.id,
      status:          'submitted',
      submitted_by:    user.id,
      submitted_at:    new Date().toISOString(),
    })
    .select('id')
    .single()

  if (subErr || !sub) {
    console.error('[createOrgSubmission] submission insert failed:', subErr?.message)
    return null
  }

  for (const ev of data.evidence) {
    const { data: item, error: evErr } = await supabase
      .from('evidence_items')
      .insert({
        submission_id:  sub.id,
        organization_id: org.id,
        evidence_type:  ev.type,
        title:          ev.title,
        description:    ev.description,
        visibility:     ev.visibility,
        status:         'pending',
        evidence_date:  today,
        submitted_by:   user.id,
      })
      .select('id')
      .single()

    if (evErr || !item) {
      console.error('[createOrgSubmission] evidence insert failed:', evErr?.message)
      continue
    }

    await supabase.from('evidence_media').insert({
      evidence_id: item.id,
      url:         ev.url,
      media_type:  ev.mediaType,
      sort_order:  0,
    })
  }

  return { id: sub.id }
}

// ── createCampaignSubmission ──────────────────────────────────────────────────

export async function createCampaignSubmission(data: CampaignSubmissionData): Promise<{ id: string } | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)
  const campaignType: CampaignType = data.submitterType === 'private' ? 'community_appeal' : 'need'

  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .insert({
      title:               data.title,
      slug:                generateSlug(data.title),
      category:            mapCategory(data.category),
      campaign_type:       campaignType,
      organization_id:     data.organizationId,
      location_label:      data.locationLabel,
      goal_amount:         data.goalAmount,
      description:         data.description,
      verification_status: 'draft',
      is_active:           false,
      created_by:          user.id,
    })
    .select('id')
    .single()

  if (campErr || !campaign) {
    console.error('[createCampaignSubmission] campaign insert failed:', campErr?.message)
    return null
  }

  const { data: sub, error: subErr } = await supabase
    .from('verification_submissions')
    .insert({
      submission_type: 'campaign',
      campaign_id:     campaign.id,
      organization_id: data.organizationId,
      status:          'submitted',
      submitted_by:    user.id,
      submitted_at:    new Date().toISOString(),
    })
    .select('id')
    .single()

  if (subErr || !sub) {
    console.error('[createCampaignSubmission] submission insert failed:', subErr?.message)
    return null
  }

  for (const ev of data.evidence) {
    const { data: item, error: evErr } = await supabase
      .from('evidence_items')
      .insert({
        submission_id:   sub.id,
        campaign_id:     campaign.id,
        organization_id: data.organizationId,
        evidence_type:   ev.type,
        title:           ev.title,
        description:     ev.description,
        visibility:      ev.visibility,
        status:          'pending',
        evidence_date:   today,
        submitted_by:    user.id,
      })
      .select('id')
      .single()

    if (evErr || !item) {
      console.error('[createCampaignSubmission] evidence insert failed:', evErr?.message)
      continue
    }

    await supabase.from('evidence_media').insert({
      evidence_id: item.id,
      url:         ev.url,
      media_type:  ev.mediaType,
      sort_order:  0,
    })
  }

  return { id: sub.id }
}

// ── getMySubmissions ──────────────────────────────────────────────────────────

export async function getMySubmissions(): Promise<SubmissionRow[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('verification_submissions')
    .select(SUBMISSION_SELECT)
    .eq('submitted_by', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return mapRows(data as Parameters<typeof mapRows>[0])
}

// ── getSubmissionById ─────────────────────────────────────────────────────────

export async function getSubmissionById(id: string): Promise<SubmissionRow | null> {
  const { data, error } = await supabase
    .from('verification_submissions')
    .select(SUBMISSION_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null
  return mapRows([data as Parameters<typeof mapRows>[0][0]])[0]
}

// ── getSubmissionsQueue ───────────────────────────────────────────────────────

export async function getSubmissionsQueue(): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from('verification_submissions')
    .select(SUBMISSION_SELECT)
    .in('status', ['submitted', 'under_review'])
    .is('deleted_at', null)
    .order('submitted_at', { ascending: true })

  if (error || !data) return []
  return mapRows(data as Parameters<typeof mapRows>[0])
}
