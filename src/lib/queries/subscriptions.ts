import { supabase } from '@/lib/supabase'

interface SubscribeData {
  campaignId: string
  email?: string
  whatsapp?: string
}

export async function subscribeToUpdates(data: SubscribeData): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  // At least one contact method must be present
  if (!data.email && !data.whatsapp && !user) return false

  const { error } = await supabase
    .from('update_subscriptions')
    .insert({
      campaign_id:   data.campaignId,
      donor_id:      user?.id ?? null,
      email:         data.email   || null,
      whatsapp:      data.whatsapp || null,
    })

  if (error) {
    console.error('[subscribeToUpdates] insert failed:', error.message)
    return false
  }
  return true
}
