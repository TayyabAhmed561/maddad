import { supabase } from '@/lib/supabase'
import type {
  Tables,
  CampaignCategory,
  CampaignType,
  VerificationStatus,
} from '@/lib/supabase'
import type { CommunityAppeal, AppealUpdate, AppealVerification, AppealEndorser, TransparencyEntry } from '@/data/appealsData'

// ── Local row types ───────────────────────────────────────────────────────────

type AppealRow = {
  id: string
  campaign_type: CampaignType
  title: string
  slug: string
  description: string | null
  category: CampaignCategory
  zakat_eligible: boolean
  location_label: string
  goal_amount: number | null
  raised_amount: number
  verification_status: VerificationStatus
  is_active: boolean
  created_at: string
  updated_at: string
  endorsed_by_name: string | null
  endorsed_by_type: 'masjid' | 'organization' | null
  beneficiary_name: string | null
  coverage_items: unknown
  organizations: { display_name: string } | null
}

type CampaignUpdateRow = Tables<'campaign_updates'>

type EvidenceItemRow = Tables<'evidence_items'>

interface CoverageItem {
  label: string
  amount: string
  percentage: number
}

// ── Column selection string ───────────────────────────────────────────────────

const APPEAL_SELECT = [
  'id', 'campaign_type', 'title', 'slug', 'description', 'category',
  'zakat_eligible', 'location_label', 'goal_amount', 'raised_amount',
  'verification_status', 'is_active', 'created_at', 'updated_at',
  'endorsed_by_name', 'endorsed_by_type', 'beneficiary_name', 'coverage_items',
  'organizations(display_name)',
].join(', ')

// ── Helper functions ──────────────────────────────────────────────────────────

function formatRelativeDate(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return new Date(isoString).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Named mapper functions ────────────────────────────────────────────────────

function mapUpdateToAppealUpdate(row: CampaignUpdateRow): AppealUpdate {
  return {
    id: row.id,
    date: new Date(row.posted_at).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }),
    content: row.content,
    author: row.posted_by ?? 'Team',
  }
}

function mapUpdateToTransparencyEntry(row: CampaignUpdateRow): TransparencyEntry {
  return {
    id: row.id,
    date: new Date(row.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    action: row.title,
    verifier: row.posted_by ?? 'Team',
  }
}

function mapEvidenceToAppealVerification(row: EvidenceItemRow): AppealVerification {
  return {
    label: row.title,
    verified: row.status === 'approved',
    verifier: row.verifier_display_name ?? undefined,
  }
}

function mapRowToCommunityAppeal(row: AppealRow): CommunityAppeal {
  const coverageItems: string[] = Array.isArray(row.coverage_items)
    ? (row.coverage_items as CoverageItem[]).map(ci => ci.label).filter(Boolean)
    : []

  const endorsedBy: AppealEndorser = row.endorsed_by_type && row.endorsed_by_name
    ? { type: row.endorsed_by_type, name: row.endorsed_by_name }
    : { type: 'organization', name: row.organizations?.display_name ?? '' }

  return {
    id: row.id,
    title: row.title,
    beneficiary: row.beneficiary_name ?? row.organizations?.display_name ?? '',
    category: row.category,
    location: row.location_label,
    raised: row.raised_amount,
    goal: row.goal_amount ?? 0,
    endorsedBy,
    lastUpdated: formatRelativeDate(row.updated_at),
    description: row.description ?? '',
    zakatEligible: row.zakat_eligible,
    coverageItems,
    updates: [],
    verificationChecks: [],
    transparencyLog: [],
  }
}

// ── Base query builder ────────────────────────────────────────────────────────

function appealBaseQuery() {
  return supabase
    .from('campaigns')
    .select(APPEAL_SELECT)
    .in('campaign_type', ['appeal', 'community_appeal'] as CampaignType[])
    .is('deleted_at', null)
    .eq('is_active', true)
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function getAppeals(): Promise<CommunityAppeal[]> {
  const { data, error } = await appealBaseQuery()
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[getAppeals]', error)
    return []
  }

  return (data as unknown as AppealRow[]).map(mapRowToCommunityAppeal)
}

export async function getAppealById(id: string): Promise<CommunityAppeal | null> {
  const { data, error } = await appealBaseQuery()
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[getAppealById]', error)
    return null
  }
  if (!data) return null

  const row = data as unknown as AppealRow
  const appeal = mapRowToCommunityAppeal(row)
  return enrichAppealWithRelatedData(appeal, row.id)
}

async function enrichAppealWithRelatedData(
  appeal: CommunityAppeal,
  campaignId: string,
): Promise<CommunityAppeal> {
  const [updatesResult, evidenceResult] = await Promise.all([
    supabase
      .from('campaign_updates')
      .select('id, campaign_id, title, content, progress_percent, posted_by, posted_at, created_at, updated_at, deleted_at')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('posted_at', { ascending: false }),

    supabase
      .from('evidence_items')
      .select('id, submission_id, campaign_id, organization_id, evidence_type, title, description, status, confidence_score, visibility, evidence_date, submitted_by, verifier_display_name, created_at, updated_at, deleted_at')
      .eq('campaign_id', campaignId)
      .eq('visibility', 'public')
      .eq('status', 'approved')
      .is('deleted_at', null),
  ])

  const updateRows: CampaignUpdateRow[] = updatesResult.error
    ? []
    : (updatesResult.data as CampaignUpdateRow[])

  const updates: AppealUpdate[] = updateRows.map(mapUpdateToAppealUpdate)
  const transparencyLog: TransparencyEntry[] = updateRows.map(mapUpdateToTransparencyEntry)

  const verificationChecks: AppealVerification[] = evidenceResult.error
    ? []
    : (evidenceResult.data as EvidenceItemRow[]).map(mapEvidenceToAppealVerification)

  return { ...appeal, updates, verificationChecks, transparencyLog }
}
