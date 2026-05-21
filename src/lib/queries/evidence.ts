import { supabase } from '@/lib/supabase'
import type { Tables, MediaType } from '@/lib/supabase'

// Import the UI evidence types from the verification types module.
// NOTE: src/lib/supabase.ts also exports a type named EvidenceItem (the DB row
// type). To avoid the name collision, this file imports from @/types/verification
// as UIEvidenceItem and from @/lib/supabase via Tables<'evidence_items'>.
import type {
  EvidenceItem as UIEvidenceItem,
  EvidenceMedia as UIEvidenceMedia,
  EvidenceType,
} from '@/types/verification'

// ── Local row types ───────────────────────────────────────────────────────────

type DbEvidenceItem = Tables<'evidence_items'>
type DbEvidenceMedia = Tables<'evidence_media'>

type EvidenceItemWithMedia = DbEvidenceItem & {
  evidence_media: DbEvidenceMedia[]
}

// ── Column selection string ───────────────────────────────────────────────────

const EVIDENCE_SELECT = [
  'id', 'submission_id', 'campaign_id', 'organization_id', 'evidence_type',
  'title', 'description', 'status', 'confidence_score', 'visibility',
  'evidence_date', 'submitted_by', 'verifier_display_name', 'created_at', 'updated_at', 'deleted_at',
  'evidence_media(id, evidence_id, url, storage_path, media_type, thumbnail_url, caption, sort_order, created_at)',
].join(', ')

// ── Named mapper functions ────────────────────────────────────────────────────

function mapMediaType(dbType: MediaType): UIEvidenceMedia['kind'] {
  // MediaType ('image' | 'video' | 'pdf' | 'link') matches UIEvidenceMedia.kind exactly.
  return dbType
}

function mapDbMediaToUIMedia(media: DbEvidenceMedia[]): UIEvidenceMedia {
  // Take the first media item by sort_order; fall back to a PDF placeholder
  // when evidence_media rows are absent (seed data has no media files yet).
  const first = media.slice().sort((a, b) => a.sort_order - b.sort_order)[0]

  if (!first) {
    return { kind: 'pdf', url: '#' }
  }

  const result: UIEvidenceMedia = {
    kind: mapMediaType(first.media_type),
    url: first.url,
  }
  if (first.thumbnail_url) {
    result.thumbnailUrl = first.thumbnail_url
  }
  return result
}

function mapDbToUIEvidenceItem(row: EvidenceItemWithMedia): UIEvidenceItem {
  return {
    id: row.id,
    // DB column is 'evidence_type'; UI field is 'type'
    type: row.evidence_type as EvidenceType,
    title: row.title,
    description: row.description ?? '',
    media: mapDbMediaToUIMedia(row.evidence_media),
    // DB column is 'evidence_date'; UI field is 'date'
    date: row.evidence_date ?? row.created_at.slice(0, 10),
    visibility: row.visibility as UIEvidenceItem['visibility'],
    status: row.status as UIEvidenceItem['status'],
    verifierDisplayName: row.verifier_display_name ?? undefined,
  }
}

// ── Base query builder ────────────────────────────────────────────────────────

function publicApprovedEvidenceQuery() {
  return supabase
    .from('evidence_items')
    .select(EVIDENCE_SELECT)
    .eq('visibility', 'public')
    .eq('status', 'approved')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
}

// ── Query functions ───────────────────────────────────────────────────────────

export async function getEvidenceForCampaign(campaignId: string): Promise<UIEvidenceItem[]> {
  const { data, error } = await publicApprovedEvidenceQuery()
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('[getEvidenceForCampaign]', error)
    return []
  }

  return (data as unknown as EvidenceItemWithMedia[]).map(mapDbToUIEvidenceItem)
}

export async function getEvidenceForOrganization(orgId: string): Promise<UIEvidenceItem[]> {
  const { data, error } = await publicApprovedEvidenceQuery()
    .eq('organization_id', orgId)

  if (error) {
    console.error('[getEvidenceForOrganization]', error)
    return []
  }

  return (data as unknown as EvidenceItemWithMedia[]).map(mapDbToUIEvidenceItem)
}
