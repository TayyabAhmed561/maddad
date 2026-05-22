import { supabase } from '@/lib/supabase'

export interface ReceiptRow {
  id: string
  receiptSerial: string
  campaignTitle: string
  amount: number
  date: string
  pdfPath: string | null
}

export async function getMyReceipts(userId: string): Promise<ReceiptRow[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      id,
      receipt_serial_number,
      donation_amount,
      donation_date,
      charity_legal_name,
      pdf_storage_path,
      donations!inner(
        donor_id,
        campaigns(title)
      )
    `)
    .eq('donations.donor_id', userId)
    .order('donation_date', { ascending: false })

  if (error) {
    console.error('[getMyReceipts] query failed:', error.message)
    return []
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string
      receipt_serial_number: string
      donation_amount: number
      donation_date: string
      charity_legal_name: string
      pdf_storage_path: string | null
      donations: { campaigns: { title: string } | null } | null
    }
    return {
      id: r.id,
      receiptSerial: r.receipt_serial_number,
      campaignTitle: r.donations?.campaigns?.title ?? r.charity_legal_name,
      amount: r.donation_amount,
      date: r.donation_date,
      pdfPath: r.pdf_storage_path,
    }
  })
}
