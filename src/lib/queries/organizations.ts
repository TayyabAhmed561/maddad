import { supabase } from '@/lib/supabase'
import type { VerificationStatus } from '@/lib/supabase'

// ── Local row type (selected columns only — not the full Organization type) ──
// Do NOT select contact_phone or created_by.
export type OrgRow = {
  id: string
  legal_name: string
  display_name: string
  slug: string
  description: string | null
  website_url: string | null
  logo_url: string | null
  contact_email: string | null
  verification_status: VerificationStatus
  trust_score: number | null
  ontario_charity_registration_number: string | null
  created_at: string
}

const ORG_SELECT =
  'id, legal_name, display_name, slug, description, website_url, logo_url, contact_email, verification_status, trust_score, ontario_charity_registration_number, created_at'

export async function getOrganizationById(id: string): Promise<OrgRow | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select(ORG_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as unknown as OrgRow
}

export async function getOrganizationBySlug(slug: string): Promise<OrgRow | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select(ORG_SELECT)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as unknown as OrgRow
}
