import { supabase } from '@/lib/supabase'
import type { GivingType } from '@/lib/supabase'
import type { DonationReceipt } from '@/types/receipt'

// ── Local row type for the joined query ─────────────────────────────────────
type DonationWithCampaign = {
  id: string
  campaign_id: string
  giving_type: GivingType
  amount: number
  frequency: string
  is_anonymous: boolean
  hide_amount: boolean
  dua_intention: string | null
  created_at: string
  campaigns: { title: string } | null
}

// giving_type DB enum uses underscores; DonationReceipt.donationType uses dashes
function mapGivingType(
  gt: GivingType
): DonationReceipt['donationType'] {
  switch (gt) {
    case 'sadaqah_jariyah': return 'sadaqah-jariyah'
    case 'meal_sponsorship': return 'sadaqah'
    default: return gt as DonationReceipt['donationType']
  }
}

function mapDonationToReceipt(row: DonationWithCampaign): DonationReceipt {
  return {
    receiptId: row.id,
    amount: row.amount,
    campaignId: row.campaign_id,
    campaignTitle: row.campaigns?.title ?? 'Donation',
    organizationName: 'Maddad Partner',
    donationType: mapGivingType(row.giving_type),
    frequency: row.frequency,
    date: row.created_at,
    isAnonymous: row.is_anonymous,
    hideAmount: row.hide_amount,
    duaIntention: row.dua_intention ?? undefined,
  }
}

export async function getMyDonations(donorId: string): Promise<DonationReceipt[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('id, campaign_id, giving_type, amount, frequency, is_anonymous, hide_amount, dua_intention, created_at, campaigns(title)')
    .eq('donor_id', donorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as unknown as DonationWithCampaign[]).map(mapDonationToReceipt)
}
