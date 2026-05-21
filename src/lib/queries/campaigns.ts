import { supabase } from '@/lib/supabase'
import type {
  Tables,
  CampaignCategory,
  CampaignType,
  GivingType,
  VerificationStatus,
} from '@/lib/supabase'
import type { Need, NeedUpdate, VerificationCheck, TransparencyEntry } from '@/data/needsData'
import type { MapItem, MapCategory, MapItemType, VerifiedStatus, PrivacyLevel } from '@/data/mapData'

// ── Filter types ─────────────────────────────────────────────────────────────

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface CampaignFilters {
  category?: CampaignCategory[]
  campaignType?: CampaignType[]
  verifiedOnly?: boolean
  givingType?: GivingType
  bounds?: MapBounds
}

export interface MapFilters {
  category?: CampaignCategory[]
  verifiedOnly?: boolean
}

// ── Local row types for joined queries ───────────────────────────────────────
// Supabase TypeScript cannot infer join shapes from plain .select() strings
// when no Relationships type is defined. We define the expected shape manually
// and use `as unknown as` casts to satisfy TypeScript.

type CampaignRow = {
  id: string
  campaign_type: CampaignType
  title: string
  slug: string
  description: string | null
  category: CampaignCategory
  giving_type: GivingType | null
  zakat_eligible: boolean
  location_label: string
  lat: number | null
  lng: number | null
  country_code: string
  urgency: number
  goal_amount: number | null
  raised_amount: number
  currency: string
  verification_status: VerificationStatus
  is_active: boolean
  created_at: string
  updated_at: string
  endorsed_by_name: string | null
  endorsed_by_type: 'masjid' | 'organization' | null
  beneficiary_name: string | null
  cover_image_url: string | null
  coverage_items: unknown
  privacy_level: string
  organizations: { display_name: string } | null
}

type CampaignUpdateRow = Tables<'campaign_updates'>

type EvidenceItemWithMedia = Tables<'evidence_items'> & {
  evidence_media: Array<Tables<'evidence_media'>>
}

type OrgRow = {
  id: string
  display_name: string
  lat: number
  lng: number
  verification_status: VerificationStatus
  description: string | null
  updated_at: string
}

interface CoverageItem {
  label: string
  amount: string
  percentage: number
}

// ── Column selection string ───────────────────────────────────────────────────

const CAMPAIGN_SELECT = [
  'id', 'campaign_type', 'title', 'slug', 'description', 'category', 'giving_type',
  'zakat_eligible', 'location_label', 'lat', 'lng', 'country_code', 'urgency',
  'goal_amount', 'raised_amount', 'currency', 'verification_status', 'is_active',
  'created_at', 'updated_at', 'endorsed_by_name', 'endorsed_by_type',
  'beneficiary_name', 'cover_image_url', 'coverage_items', 'privacy_level',
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

// Maps DB campaign_category to MapCategory (all 8 values, capitalized).
function toMapUICategory(cat: CampaignCategory): MapCategory {
  const mapping: Record<CampaignCategory, MapCategory> = {
    food: 'Food',
    shelter: 'Shelter',
    medical: 'Medical',
    education: 'Education',
    masjid: 'Masjid',
    fidya: 'Fidya',
    qurbani: 'Qurbani',
    zakat: 'Zakat',
  }
  return mapping[cat]
}

function toMapItemType(campaignType: CampaignType, givingType: GivingType | null): MapItemType {
  if (givingType === 'fidya') return 'fidya_partner'
  if (givingType === 'qurbani') return 'qurbani_partner'
  return campaignType === 'need' ? 'need' : 'appeal'
}

function toVerifiedStatus(status: VerificationStatus): VerifiedStatus {
  if (status === 'approved') return 'verified'
  if (status === 'submitted' || status === 'under_review') return 'pending'
  return 'unverified'
}

// ── Named mapper functions ────────────────────────────────────────────────────

function mapCampaignUpdateToNeedUpdate(row: CampaignUpdateRow): NeedUpdate {
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

function mapEvidenceToVerificationCheck(row: EvidenceItemWithMedia): VerificationCheck {
  return {
    label: row.title,
    verified: row.status === 'approved',
    verifier: row.verifier_display_name ?? undefined,
  }
}

function mapRowToNeed(row: CampaignRow): Need {
  const coverageItems: string[] = Array.isArray(row.coverage_items)
    ? (row.coverage_items as CoverageItem[]).map(ci => ci.label).filter(Boolean)
    : []

  return {
    id: row.id,
    title: row.title,
    organization: row.organizations?.display_name ?? '',
    isVerified: row.verification_status === 'approved',
    category: row.category,
    location: row.location_label,
    raised: row.raised_amount,
    goal: row.goal_amount ?? 0,
    lastUpdated: formatRelativeDate(row.updated_at),
    description: row.description ?? '',
    coverageItems,
    zakatEligible: row.zakat_eligible,
    updates: [],
    verificationChecks: [],
    transparencyLog: [],
    urgency: row.urgency,
  }
}

function mapRowToMapItem(row: CampaignRow): MapItem {
  return {
    id: row.id,
    type: toMapItemType(row.campaign_type, row.giving_type),
    title: row.title,
    orgName: row.organizations?.display_name,
    category: toMapUICategory(row.category),
    verifiedStatus: toVerifiedStatus(row.verification_status),
    endorsedBy: row.endorsed_by_name ?? undefined,
    zakatEligible: row.zakat_eligible,
    locationLabel: row.location_label,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    lastUpdated: formatRelativeDate(row.updated_at),
    fundingRaised: row.raised_amount,
    goal: row.goal_amount ?? undefined,
    privacyLevel: row.privacy_level as PrivacyLevel,
    description: row.description ?? undefined,
    countryCode: row.country_code,
    isPlaceholder: false,
    createdAt: row.created_at,
    urgency: row.urgency,
  }
}

function mapOrgToMapItem(row: OrgRow): MapItem {
  return {
    id: row.id,
    type: 'organization',
    title: row.display_name,
    orgName: row.display_name,
    category: 'Masjid',
    verifiedStatus: toVerifiedStatus(row.verification_status),
    zakatEligible: false,
    locationLabel: '',
    lat: row.lat,
    lng: row.lng,
    lastUpdated: formatRelativeDate(row.updated_at),
    privacyLevel: 'global_ok',
    description: row.description ?? undefined,
    isPlaceholder: false,
    urgency: 0,
  }
}

// ── Base query builder ────────────────────────────────────────────────────────

function campaignBaseQuery() {
  return supabase
    .from('campaigns')
    .select(CAMPAIGN_SELECT)
    .is('deleted_at', null)
    .eq('is_active', true)
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function getCampaigns(filters?: CampaignFilters): Promise<Need[]> {
  let query = campaignBaseQuery()

  const campaignTypes: CampaignType[] = filters?.campaignType?.length
    ? filters.campaignType
    : ['need']
  query = query.in('campaign_type', campaignTypes)

  if (filters?.category?.length) {
    query = query.in('category', filters.category)
  }
  if (filters?.verifiedOnly) {
    query = query.eq('verification_status', 'approved')
  }
  if (filters?.givingType) {
    query = query.eq('giving_type', filters.givingType)
  }
  if (filters?.bounds) {
    const { north, south, east, west } = filters.bounds
    query = query
      .gte('lat', south)
      .lte('lat', north)
      .gte('lng', west)
      .lte('lng', east)
  }

  const { data, error } = await query.order('urgency', { ascending: false })

  if (error) {
    console.error('[getCampaigns]', error)
    return []
  }

  return (data as unknown as CampaignRow[]).map(mapRowToNeed)
}

export async function getCampaignBySlug(slug: string): Promise<Need | null> {
  const { data, error } = await campaignBaseQuery()
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[getCampaignBySlug]', error)
    return null
  }
  if (!data) return null

  const row = data as unknown as CampaignRow
  const need = mapRowToNeed(row)
  return enrichNeedWithRelatedData(need, row.id)
}

export async function getCampaignById(id: string): Promise<Need | null> {
  const { data, error } = await campaignBaseQuery()
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[getCampaignById]', error)
    return null
  }
  if (!data) return null

  const row = data as unknown as CampaignRow
  const need = mapRowToNeed(row)
  return enrichNeedWithRelatedData(need, row.id)
}

async function enrichNeedWithRelatedData(need: Need, campaignId: string): Promise<Need> {
  const [updatesResult, evidenceResult] = await Promise.all([
    supabase
      .from('campaign_updates')
      .select('id, campaign_id, title, content, progress_percent, posted_by, posted_at, created_at, updated_at, deleted_at')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('posted_at', { ascending: false }),

    supabase
      .from('evidence_items')
      .select('id, submission_id, campaign_id, organization_id, evidence_type, title, description, status, confidence_score, visibility, evidence_date, submitted_by, verifier_display_name, created_at, updated_at, deleted_at, evidence_media(id, evidence_id, url, storage_path, media_type, thumbnail_url, caption, sort_order, created_at)')
      .eq('campaign_id', campaignId)
      .eq('visibility', 'public')
      .eq('status', 'approved')
      .is('deleted_at', null),
  ])

  const updateRows: CampaignUpdateRow[] = updatesResult.error
    ? []
    : (updatesResult.data as CampaignUpdateRow[])

  const updates: NeedUpdate[] = updateRows.map(mapCampaignUpdateToNeedUpdate)
  const transparencyLog: TransparencyEntry[] = updateRows.map(mapUpdateToTransparencyEntry)

  const verificationChecks: VerificationCheck[] = evidenceResult.error
    ? []
    : (evidenceResult.data as unknown as EvidenceItemWithMedia[]).map(mapEvidenceToVerificationCheck)

  return { ...need, updates, verificationChecks, transparencyLog }
}

export async function getOrganizationMapItems(
  bounds?: MapBounds,
  verifiedOnly?: boolean,
): Promise<MapItem[]> {
  let query = supabase
    .from('organizations')
    .select('id, display_name, lat, lng, verification_status, description, updated_at')
    .is('deleted_at', null)
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (verifiedOnly) {
    query = query.eq('verification_status', 'approved')
  }
  if (bounds) {
    query = query
      .gte('lat', bounds.south)
      .lte('lat', bounds.north)
      .gte('lng', bounds.west)
      .lte('lng', bounds.east)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getOrganizationMapItems]', error)
    return []
  }

  return (data as unknown as OrgRow[]).map(mapOrgToMapItem)
}

export async function getMapItems(
  bounds?: MapBounds,
  filters?: MapFilters,
): Promise<MapItem[]> {
  let query = campaignBaseQuery()
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (filters?.category?.length) {
    query = query.in('category', filters.category)
  }
  if (filters?.verifiedOnly) {
    query = query.eq('verification_status', 'approved')
  }
  if (bounds) {
    query = query
      .gte('lat', bounds.south)
      .lte('lat', bounds.north)
      .gte('lng', bounds.west)
      .lte('lng', bounds.east)
  }

  const [{ data, error }, orgItems] = await Promise.all([
    query,
    getOrganizationMapItems(bounds, filters?.verifiedOnly),
  ])

  if (error) {
    console.error('[getMapItems]', error)
    return []
  }

  return [
    ...(data as unknown as CampaignRow[]).map(mapRowToMapItem),
    ...orgItems,
  ]
}

export async function getCampaignsByGivingType(givingType: GivingType): Promise<Need[]> {
  return getCampaigns({
    givingType,
    campaignType: ['need', 'appeal', 'community_appeal'],
  })
}

export async function getZakatEligibleCampaigns(): Promise<Need[]> {
  const { data, error } = await campaignBaseQuery()
    .eq('zakat_eligible', true)
    .order('urgency', { ascending: false })

  if (error) {
    console.error('[getZakatEligibleCampaigns]', error)
    return []
  }

  return (data as unknown as CampaignRow[]).map(mapRowToNeed)
}
