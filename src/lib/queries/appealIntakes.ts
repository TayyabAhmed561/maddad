import { supabase } from '@/lib/supabase'

export interface AppealIntakeInsert {
  name: string
  email: string
  need_type: 'medical' | 'housing' | 'education' | 'emergency' | 'other'
  description: string
  endorsing_contact: string
}

export interface AppealIntakeRow extends AppealIntakeInsert {
  id: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'more_info'
  admin_notes: string | null
  created_at: string
}

export async function submitAppealIntake(data: AppealIntakeInsert): Promise<boolean> {
  const { error } = await supabase
    .from('community_appeal_intakes')
    .insert(data)
  if (error) {
    console.error('[Maddad] submitAppealIntake failed:', error.message)
    return false
  }
  return true
}

export async function getAppealIntakes(): Promise<AppealIntakeRow[]> {
  const { data, error } = await supabase
    .from('community_appeal_intakes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[Maddad] getAppealIntakes failed:', error.message)
    return []
  }
  return (data ?? []) as AppealIntakeRow[]
}

export async function updateAppealIntakeStatus(
  id: string,
  status: AppealIntakeRow['status'],
  admin_notes?: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('community_appeal_intakes')
    .update({ status, admin_notes: admin_notes ?? null })
    .eq('id', id)
  if (error) {
    console.error('[Maddad] updateAppealIntakeStatus failed:', error.message)
    return false
  }
  return true
}
