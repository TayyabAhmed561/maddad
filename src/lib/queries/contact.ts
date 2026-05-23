import { supabase } from '@/lib/supabase'

export interface ContactInsert {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactMessage(data: ContactInsert): Promise<boolean> {
  const { error } = await supabase
    .from('contact_messages')
    .insert({
      name:    data.name,
      email:   data.email,
      subject: data.subject,
      message: data.message,
    })

  if (error) {
    console.error('[submitContactMessage] failed:', error.message)
    return false
  }
  return true
}
