export interface DonationReceipt {
  receiptId: string;
  amount: number;
  campaignId?: string;
  needId?: string;
  campaignTitle: string;
  organizationName: string;
  donationType?: "zakat" | "sadaqah" | "fidya" | "kaffarah" | "qurbani" | "sadaqah-jariyah" | "general";
  frequency: string;
  date: string;
  isAnonymous: boolean;
  hideAmount: boolean;
  duaIntention?: string;
  givingCategory?: string;
  givingCampaignId?: string;
}

function generateReceiptId(): string {
  const num = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0");
  return `MDD-RCPT-2026-${num}`;
}

export function createReceipt(
  data: Omit<DonationReceipt, "receiptId" | "date">
): DonationReceipt {
  return {
    ...data,
    receiptId: generateReceiptId(),
    date: new Date().toISOString(),
  };
}

// Real receipts are stored in the Supabase `receipts` table and fetched by
// serial number. This stub preserves the call signature used by ReceiptDetail.tsx
// until that page is wired to Supabase (Phase 2).
export function getReceiptById(
  _receiptId: string
): DonationReceipt | undefined {
  return undefined;
}
