// Islamic Giving Types

export type GivingCategory = 
  | "fidya" 
  | "meal-sponsorship" 
  | "zakat" 
  | "qurbani" 
  | "sadaqah-jariyah";

export type DonationFrequency = "one-time" | "weekly" | "monthly" | "yearly";

export interface GivingPartner {
  id: string;
  name: string;
  region: string;
  verified: boolean;
  taxDeductible: boolean;
  description?: string;
}

export interface MealImpactLog {
  id: string;
  date: string;
  mealsDelivered: number;
  location: string;
  partner: string;
}

export interface ZakatCase {
  id: string;
  category: string;
  description: string;
  needed: number;
  allocated: number;
  verifiedBy: string;
  region: string;
}

export interface QurbaniPackage {
  id: string;
  animal: "sheep" | "goat" | "cow-share" | "cow-full";
  price: number;
  region: string;
  partner: string;
  description: string;
}

export interface SadaqahJariyahProject {
  id: string;
  title: string;
  type: "education" | "water" | "masjid" | "healthcare" | "orphan-care";
  description: string;
  raised: number;
  goal: number;
  impactYears: number;
  location: string;
  partner: string;
}

export interface DonorPreferences {
  anonymous: boolean;
  hideAmount: boolean;
  frequency: DonationFrequency;
  duaIntention?: string;
}

export interface TaxReceipt {
  id: string;
  date: string;
  amount: number;
  organization: string;
  taxDeductible: boolean;
  downloadUrl?: string;
}
