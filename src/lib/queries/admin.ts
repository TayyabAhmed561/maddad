import { supabase } from '@/lib/supabase'
import type { VerificationStatus, CampaignCategory } from '@/lib/supabase'
import type { SubmissionRow } from '@/lib/queries/verification'
import { getSubmissionsQueue } from '@/lib/queries/verification'

// Re-export for consumers that only need admin imports
export { getSubmissionsQueue }

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminOrg {
  id: string
  legalName: string
  displayName: string
  verificationStatus: VerificationStatus
  contactEmail: string | null
  trustScore: number | null
  createdAt: string
}

export interface AdminCampaign {
  id: string
  title: string
  category: CampaignCategory
  verificationStatus: VerificationStatus
  isActive: boolean
  goalAmount: number | null
  raisedAmount: number
  organizationId: string | null
  createdAt: string
}

export interface AdminDonation {
  id: string
  campaignId: string
  campaignTitle: string | null
  givingType: string
  amount: number
  status: string
  frequency: string
  isAnonymous: boolean
  createdAt: string
}

// ── updateSubmissionStatus ────────────────────────────────────────────────────

export async function updateSubmissionStatus(
  submission: Pick<SubmissionRow, 'id' | 'organizationId' | 'campaignId'>,
  decision: 'under_review' | 'approved' | 'rejected',
  notes: string | null,
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // 1. Insert decision record (append-only; verifier + platform_admin allowed)
  const { error: decisionErr } = await supabase
    .from('verification_decisions')
    .insert({
      submission_id: submission.id,
      decided_by:    user.id,
      decision,
      notes:         notes || null,
      decided_at:    new Date().toISOString(),
    })

  if (decisionErr) {
    console.error('[updateSubmissionStatus] decision insert failed:', decisionErr.message)
    return false
  }

  // 2. Update submission status
  await supabase
    .from('verification_submissions')
    .update({ status: decision })
    .eq('id', submission.id)

  // 3. Update org/campaign verification_status
  if (submission.organizationId) {
    await supabase
      .from('organizations')
      .update({ verification_status: decision })
      .eq('id', submission.organizationId)
  }

  if (submission.campaignId) {
    await supabase
      .from('campaigns')
      .update({ verification_status: decision })
      .eq('id', submission.campaignId)
  }

  // 4. Fire-and-forget email notification
  supabase.functions.invoke('send-verification-email', {
    body: { submissionId: submission.id, decision, notes },
  }).catch(err => {
    console.error('[updateSubmissionStatus] send-verification-email error:', err)
  })

  return true
}

// ── getAllOrganizations ───────────────────────────────────────────────────────

export async function getAllOrganizations(): Promise<AdminOrg[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, legal_name, display_name, verification_status, contact_email, trust_score, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id:                 row.id,
    legalName:          row.legal_name,
    displayName:        row.display_name,
    verificationStatus: row.verification_status as VerificationStatus,
    contactEmail:       row.contact_email,
    trustScore:         row.trust_score,
    createdAt:          row.created_at,
  }))
}

// ── getAllCampaigns ───────────────────────────────────────────────────────────

export async function getAllCampaigns(
  statusFilter?: VerificationStatus,
): Promise<AdminCampaign[]> {
  let query = supabase
    .from('campaigns')
    .select('id, title, category, verification_status, is_active, goal_amount, raised_amount, organization_id, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('verification_status', statusFilter)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map(row => ({
    id:                 row.id,
    title:              row.title,
    category:           row.category as CampaignCategory,
    verificationStatus: row.verification_status as VerificationStatus,
    isActive:           row.is_active,
    goalAmount:         row.goal_amount,
    raisedAmount:       row.raised_amount,
    organizationId:     row.organization_id,
    createdAt:          row.created_at,
  }))
}

// ── getRecentDonations ────────────────────────────────────────────────────────

export async function getRecentDonations(): Promise<AdminDonation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('id, campaign_id, giving_type, amount, status, frequency, is_anonymous, created_at, campaigns ( title )')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map(row => ({
    id:           row.id,
    campaignId:   row.campaign_id,
    campaignTitle: (row.campaigns as unknown as { title: string } | null)?.title ?? null,
    givingType:   row.giving_type,
    amount:       row.amount,
    status:       row.status,
    frequency:    row.frequency,
    isAnonymous:  row.is_anonymous,
    createdAt:    row.created_at,
  }))
}

// ── toggleCampaignActive ──────────────────────────────────────────────────────

export async function toggleCampaignActive(
  campaignId: string,
  isActive: boolean,
): Promise<boolean> {
  const { error } = await supabase
    .from('campaigns')
    .update({ is_active: isActive })
    .eq('id', campaignId)

  if (error) {
    console.error('[toggleCampaignActive] update failed:', error.message)
    return false
  }
  return true
}
