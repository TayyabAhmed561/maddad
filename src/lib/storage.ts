import { supabase } from '@/lib/supabase'

// ── Storage bucket names ──────────────────────────────────────────────────────
// Buckets must be created manually in Supabase Dashboard → Storage.
// evidence-docs  — private bucket for verification evidence files
// campaign-media — public bucket for campaign cover images

const EVIDENCE_BUCKET   = 'evidence-docs'
const CAMPAIGN_BUCKET   = 'campaign-media'

// ── uploadEvidenceFile ────────────────────────────────────────────────────────

export async function uploadEvidenceFile(
  file: File,
  submissionId: string,
): Promise<{ publicUrl: string; storagePath: string } | null> {
  const ext  = file.name.split('.').pop() ?? 'bin'
  const path = `submissions/${submissionId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .upload(path, file, { upsert: false })

  if (error) {
    console.error('[uploadEvidenceFile] upload failed:', error.message)
    return null
  }

  const { data } = supabase.storage.from(EVIDENCE_BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, storagePath: path }
}

// ── uploadCampaignImage ───────────────────────────────────────────────────────

export async function uploadCampaignImage(
  file: File,
  campaignId: string,
): Promise<{ publicUrl: string; storagePath: string } | null> {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `campaigns/${campaignId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(CAMPAIGN_BUCKET)
    .upload(path, file, { upsert: false })

  if (error) {
    console.error('[uploadCampaignImage] upload failed:', error.message)
    return null
  }

  const { data } = supabase.storage.from(CAMPAIGN_BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl, storagePath: path }
}

// ── deleteStorageFile ─────────────────────────────────────────────────────────

export async function deleteStorageFile(
  bucket: 'evidence-docs' | 'campaign-media',
  storagePath: string,
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath])
  if (error) {
    console.error('[deleteStorageFile] delete failed:', error.message)
    return false
  }
  return true
}
