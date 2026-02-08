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
}

const STORAGE_KEY = "maddad_receipts";

function generateReceiptId(): string {
  const num = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0");
  return `MDD-RCPT-2026-${num}`;
}

export function createReceipt(
  data: Omit<DonationReceipt, "receiptId" | "date">
): DonationReceipt {
  const receipt: DonationReceipt = {
    ...data,
    receiptId: generateReceiptId(),
    date: new Date().toISOString(),
  };
  saveReceipt(receipt);
  return receipt;
}

export function saveReceipt(receipt: DonationReceipt): void {
  const existing = getReceipts();
  existing.unshift(receipt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getReceipts(): DonationReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getReceiptById(
  receiptId: string
): DonationReceipt | undefined {
  return getReceipts().find((r) => r.receiptId === receiptId);
}
