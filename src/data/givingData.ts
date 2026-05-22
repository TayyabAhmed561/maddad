// Centralized data model for Islamic giving
// All giving pages consume from this source to avoid duplication

import type {
  GivingPartner,
  MealImpactLog,
  ZakatCase,
  QurbaniPackage,
  SadaqahJariyahProject,
  DonationFrequency,
} from "@/types/giving";
import type { RecurringProgram } from "@/types/platform";

// ============================================
// GIVING TYPES CONFIGURATION
// ============================================

export interface GivingTypeConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  seasonal: boolean;
  seasonLabel?: string;
  icon: string; // Icon name as string for dynamic lookup
}

export const givingTypes: GivingTypeConfig[] = [
  {
    id: "fidya",
    title: "Fidya",
    description: "Compensate for missed fasts by providing meals to those in need. Calculate your obligation and support verified feeding partners.",
    href: "/giving/fidya",
    seasonal: false,
    icon: "Moon"
  },
  {
    id: "meal-sponsorship",
    title: "Meal Sponsorship",
    description: "Sponsor nutritious meals for verified beneficiaries through trusted partner organizations and masjids.",
    href: "/giving/meal-sponsorship",
    seasonal: false,
    icon: "Utensils"
  },
  {
    id: "zakat",
    title: "Zakat Distribution",
    description: "Fulfill your Zakat obligation through verified, eligible recipients confirmed by local masjids and scholars.",
    href: "/giving/zakat",
    seasonal: false,
    icon: "Coins"
  },
  {
    id: "qurbani",
    title: "Qurbani / Udhiyah",
    description: "Sponsor Qurbani during Eid al-Adha. Select your region, choose a partner, and receive distribution confirmation.",
    href: "/giving/qurbani",
    seasonal: true,
    seasonLabel: "Dhul Hijjah",
    icon: "Heart"
  },
  {
    id: "sadaqah-jariyah",
    title: "Sadaqah Jariyah",
    description: "Invest in ongoing reward through endowment-style projects: wells, education, masjid construction, and more.",
    href: "/giving/sadaqah-jariyah",
    seasonal: false,
    icon: "Infinity"
  },
  {
    id: "kaffarah",
    title: "Kaffarah",
    description: "Fulfill Kaffarah obligations by providing required compensation for broken fasts or oaths through verified feeding programs.",
    href: "/giving/kaffarah",
    seasonal: false,
    icon: "Scale"
  }
];

// ============================================
// VERIFIED PARTNERS
// ============================================

export const verifiedPartners: Record<string, GivingPartner[]> = {
  fidya: [
    {
      id: "fidya-1",
      name: "Verified Local Partners",
      region: "Local (USA)",
      verified: true,
      taxDeductible: true,
      description: "Community kitchens providing meals across verified local channels."
    },
    {
      id: "fidya-2",
      name: "Global Feeding Initiative",
      region: "International",
      verified: true,
      taxDeductible: true,
      description: "Provides meals in Yemen, Syria, and Gaza through trusted local partners."
    },
    {
      id: "fidya-3",
      name: "Verified Masjid Network",
      region: "Multiple Regions",
      verified: true,
      taxDeductible: true,
      description: "Masjid-operated food programs serving families in need."
    }
  ],
  "meal-sponsorship": [
    {
      id: "meal-1",
      name: "Community Iftar Network",
      region: "USA Nationwide",
      verified: true,
      taxDeductible: true,
      description: "Provides hot meals at community centers and masjids across 40+ cities."
    },
    {
      id: "meal-2",
      name: "Mercy Kitchen International",
      region: "Middle East & Africa",
      verified: true,
      taxDeductible: true,
      description: "Operates feeding centers in refugee camps and underserved communities."
    },
    {
      id: "meal-3",
      name: "Local Masjid Food Program",
      region: "Your City",
      verified: true,
      taxDeductible: true,
      description: "Support your local masjid's weekly food distribution program."
    }
  ]
};

// ============================================
// ALLOCATION RULES
// ============================================

export interface AllocationRule {
  label: string;
  percentage: number;
}

export const allocationRules: Record<string, AllocationRule[]> = {
  fidya: [
    { label: "Meal delivery", percentage: 92 },
    { label: "Logistics", percentage: 6 },
    { label: "Platform", percentage: 2 }
  ],
  "meal-sponsorship": [
    { label: "Food & preparation", percentage: 88 },
    { label: "Distribution", percentage: 8 },
    { label: "Admin & platform", percentage: 4 }
  ],
  zakat: [
    { label: "Direct to recipients", percentage: 100 }
  ],
  qurbani: [
    { label: "Animal & slaughter", percentage: 85 },
    { label: "Distribution", percentage: 12 },
    { label: "Admin", percentage: 3 }
  ],
  "sadaqah-jariyah": [
    { label: "Project delivery", percentage: 90 },
    { label: "Maintenance fund", percentage: 7 },
    { label: "Admin", percentage: 3 }
  ],
  kaffarah: [
    { label: "Meal delivery", percentage: 92 },
    { label: "Logistics", percentage: 6 },
    { label: "Platform", percentage: 2 }
  ],
  "msa-iftaar": [
    { label: "Meals & catering", percentage: 65 },
    { label: "Supplies & materials", percentage: 20 },
    { label: "Venue & logistics", percentage: 15 }
  ],
  general: [
    { label: "Direct aid", percentage: 92 },
    { label: "Operations", percentage: 6 },
    { label: "Platform fee", percentage: 2 }
  ]
};

// ============================================
// FIDYA CONFIGURATION
// ============================================

export const fidyaConfig = {
  amountPerDay: 20,
  currency: "CAD"
};

// ============================================
// MEAL SPONSORSHIP CONFIGURATION
// ============================================

export const mealSponsorshipConfig = {
  mealCost: 15,
  presetMeals: [10, 25, 50, 100, 250],
  currency: "CAD"
};

// ============================================
// ZAKAT CONFIGURATION
// ============================================

export const zakatConfig = {
  presetAmounts: [100, 250, 500, 1000, 2500],
  currency: "CAD",
  categories: [
    { id: "poor", label: "The Poor (Al-Fuqara)", count: 234 },
    { id: "needy", label: "The Needy (Al-Masakin)", count: 189 },
    { id: "debt", label: "Those in Debt (Al-Gharimin)", count: 67 },
    { id: "wayfarer", label: "The Wayfarer (Ibn Al-Sabil)", count: 45 },
    { id: "convert", label: "New Muslims (Al-Mu'allafah)", count: 23 }
  ]
};

// Anonymized Zakat cases - no personal identifiable information
export const zakatCases: ZakatCase[] = [
  {
    id: "zakat-1",
    category: "The Poor",
    description: "Family of 5 requiring monthly support for basic necessities",
    needed: 1200,
    allocated: 800,
    verifiedBy: "Verified Masjid",
    region: "Midwest, USA"
  },
  {
    id: "zakat-2",
    category: "Those in Debt",
    description: "Medical debt relief for chronic illness treatment",
    needed: 3500,
    allocated: 2100,
    verifiedBy: "Islamic Center",
    region: "Northeast, USA"
  },
  {
    id: "zakat-3",
    category: "The Needy",
    description: "Housing assistance for family facing eviction",
    needed: 2000,
    allocated: 1400,
    verifiedBy: "Community Center",
    region: "Southwest, USA"
  }
];

// ============================================
// QURBANI CONFIGURATION
// ============================================

export const qurbaniPackages: QurbaniPackage[] = [
  {
    id: "qurbani-1",
    animal: "sheep",
    price: 150,
    region: "Pakistan",
    partner: "Islamic Relief",
    description: "One sheep provides meat for approximately 15-20 families"
  },
  {
    id: "qurbani-2",
    animal: "goat",
    price: 120,
    region: "Bangladesh",
    partner: "Muslim Aid",
    description: "One goat provides meat for approximately 12-15 families"
  },
  {
    id: "qurbani-3",
    animal: "cow-share",
    price: 180,
    region: "India",
    partner: "Helping Hand",
    description: "1/7 share of a cow, provides for approximately 8-10 families"
  },
  {
    id: "qurbani-4",
    animal: "sheep",
    price: 200,
    region: "Palestine",
    partner: "PCRF",
    description: "One sheep distributed to families in Gaza and West Bank"
  },
  {
    id: "qurbani-5",
    animal: "cow-full",
    price: 950,
    region: "Somalia",
    partner: "Islamic Relief",
    description: "Full cow provides meat for approximately 70+ families"
  },
  {
    id: "qurbani-6",
    animal: "sheep",
    price: 175,
    region: "Yemen",
    partner: "Mercy Corps",
    description: "One sheep for families affected by ongoing crisis"
  }
];

export const animalLabels: Record<string, string> = {
  "sheep": "Sheep",
  "goat": "Goat",
  "cow-share": "Cow Share (1/7)",
  "cow-full": "Full Cow"
};

export const qurbaniProcessSteps = [
  { step: 1, title: "Selection", description: "Choose your Qurbani animal and region" },
  { step: 2, title: "Verification", description: "Animal is inspected for health and eligibility" },
  { step: 3, title: "Sacrifice", description: "Performed on Eid days following Islamic guidelines" },
  { step: 4, title: "Distribution", description: "Fresh meat distributed to verified families" },
  { step: 5, title: "Confirmation", description: "You receive a report with distribution details" }
];

// ============================================
// SADAQAH JARIYAH PROJECTS
// ============================================

export const sadaqahJariyahProjects: SadaqahJariyahProject[] = [
  {
    id: "sj-1",
    title: "Community Water Well — Rural Pakistan",
    type: "water",
    description: "A deep-bore water well serving 500+ villagers daily. Provides clean drinking water for generations.",
    raised: 3200,
    goal: 5000,
    impactYears: 25,
    location: "Punjab, Pakistan",
    partner: "Islamic Relief"
  },
  {
    id: "sj-2",
    title: "Quran School Endowment — Somalia",
    type: "education",
    description: "Endowment fund to support teachers, materials, and facilities for a Quran memorization school.",
    raised: 8500,
    goal: 15000,
    impactYears: 50,
    location: "Mogadishu, Somalia",
    partner: "Muslim Aid"
  },
  {
    id: "sj-3",
    title: "Masjid Construction — Rural Indonesia",
    type: "masjid",
    description: "Building a masjid in an underserved village. Will serve as community center and place of worship.",
    raised: 22000,
    goal: 35000,
    impactYears: 100,
    location: "Sumatra, Indonesia",
    partner: "Helping Hand"
  },
  {
    id: "sj-4",
    title: "Medical Clinic Equipment — Yemen",
    type: "healthcare",
    description: "Equipping a maternal health clinic with essential medical equipment to save lives.",
    raised: 12000,
    goal: 20000,
    impactYears: 15,
    location: "Sana'a, Yemen",
    partner: "ICNA Relief"
  },
  {
    id: "sj-5",
    title: "Orphan Education Fund — Gaza",
    type: "orphan-care",
    description: "Long-term educational support for orphaned children, covering tuition and supplies.",
    raised: 6800,
    goal: 12000,
    impactYears: 18,
    location: "Gaza, Palestine",
    partner: "PCRF"
  },
  {
    id: "sj-6",
    title: "Islamic Library Endowment — USA",
    type: "education",
    description: "Creating a permanent Islamic library resource center for a growing Muslim community.",
    raised: 15000,
    goal: 25000,
    impactYears: 30,
    location: "Chicago, USA",
    partner: "ISNA"
  }
];

export const sadaqahJariyahConfig = {
  presetAmounts: [50, 100, 250, 500, 1000],
  projectTypes: [
    { id: "all", label: "All Projects", icon: "Infinity" },
    { id: "water", label: "Water Wells", icon: "Droplets" },
    { id: "education", label: "Education", icon: "BookOpen" },
    { id: "masjid", label: "Masjid", icon: "Building2" },
    { id: "healthcare", label: "Healthcare", icon: "Stethoscope" },
    { id: "orphan-care", label: "Orphan Care", icon: "Users" }
  ]
};

// ============================================
// IMPACT LOGS (Anonymized, aggregate data only)
// ============================================

// Fidya impact logs - anonymized, aggregate only
export const fidyaImpactLogs: MealImpactLog[] = [
  { 
    id: "fi-1", 
    date: "January 22, 2024", 
    mealsDelivered: 1250, 
    location: "Midwest, USA", 
    partner: "Verified Local Partner" 
  },
  { 
    id: "fi-2", 
    date: "January 20, 2024", 
    mealsDelivered: 3400, 
    location: "Middle East", 
    partner: "Global Feeding Initiative" 
  },
  { 
    id: "fi-3", 
    date: "January 18, 2024", 
    mealsDelivered: 890, 
    location: "Northeast, USA", 
    partner: "Verified Masjid Network" 
  }
];

// Meal sponsorship impact logs - anonymized
export const mealSponsorshipImpactLogs: MealImpactLog[] = [
  { 
    id: "mi-1", 
    date: "January 23, 2024", 
    mealsDelivered: 2100, 
    location: "Southwest, USA", 
    partner: "Community Iftar Network" 
  },
  { 
    id: "mi-2", 
    date: "January 21, 2024", 
    mealsDelivered: 5600, 
    location: "Middle East", 
    partner: "Mercy Kitchen International" 
  },
  { 
    id: "mi-3", 
    date: "January 19, 2024", 
    mealsDelivered: 340, 
    location: "Texas, USA", 
    partner: "Local Masjid Program" 
  }
];

// Zakat transparency log - anonymized
export interface TransparencyLogEntry {
  id: string;
  date: string;
  action: string;
  verifier: string;
}

export const zakatTransparencyLog: TransparencyLogEntry[] = [
  { 
    id: "zt-1",
    date: "Jan 22", 
    action: "Distributed to 3 verified families", 
    verifier: "Verified Masjid" 
  },
  { 
    id: "zt-2",
    date: "Jan 20", 
    action: "Allocated for medical debt relief", 
    verifier: "Islamic Relief Partner" 
  },
  { 
    id: "zt-3",
    date: "Jan 18", 
    action: "Disbursed across 5 eligible recipients", 
    verifier: "Verified Community Organization" 
  }
];

// ============================================
// TAX ELIGIBILITY
// ============================================

export interface TaxEligibility {
  partnerId: string;
  eligible: boolean;
  country: string;
  taxIdRequired: boolean;
}

export const taxEligibilityRules: TaxEligibility[] = [
  { partnerId: "fidya-1", eligible: true, country: "USA", taxIdRequired: false },
  { partnerId: "fidya-2", eligible: true, country: "USA", taxIdRequired: false },
  { partnerId: "fidya-3", eligible: true, country: "USA", taxIdRequired: false },
  { partnerId: "meal-1", eligible: true, country: "USA", taxIdRequired: false },
  { partnerId: "meal-2", eligible: true, country: "USA", taxIdRequired: false },
  { partnerId: "meal-3", eligible: true, country: "USA", taxIdRequired: false }
];

// ============================================
// RECURRING DONATION OPTIONS
// ============================================

export interface RecurringOption {
  value: DonationFrequency;
  label: string;
  description: string;
}

export const recurringOptions: RecurringOption[] = [
  { value: "one-time", label: "One-time", description: "Single contribution" },
  { value: "weekly", label: "Weekly", description: "Contribute every week" },
  { value: "monthly", label: "Monthly", description: "Contribute every month" },
  { value: "yearly", label: "Yearly", description: "Contribute once a year" }
];

// ============================================
// PLATFORM STATISTICS (Aggregate only)
// ============================================

export const platformStats = {
  verifiedPartners: 47,
  countriesServed: 23,
  mealsDelivered: "180K+"
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPartnersByGivingType(givingType: string): GivingPartner[] {
  return verifiedPartners[givingType] || [];
}

export function getAllocationByGivingType(givingType: string): AllocationRule[] {
  return allocationRules[givingType] || allocationRules.general;
}

export function isPartnerTaxDeductible(partnerId: string): boolean {
  const rule = taxEligibilityRules.find(r => r.partnerId === partnerId);
  return rule?.eligible || false;
}

export function getImpactLogsByGivingType(givingType: string): MealImpactLog[] {
  switch (givingType) {
    case "fidya":
      return fidyaImpactLogs;
    case "meal-sponsorship":
      return mealSponsorshipImpactLogs;
    default:
      return [];
  }
}

export const recurringPrograms: RecurringProgram[] = [
  {
    id: "rp-1",
    title: "Monthly Sadaqah",
    description: "Consistent monthly giving distributed to the most urgent verified needs.",
    suggestedAmount: 25,
    frequency: "monthly",
    impactDescription: "$25/month → Provides 50 meals monthly to families in need.",
    icon: "Heart",
  },
  {
    id: "rp-2",
    title: "Weekly Giving",
    description: "Small weekly contributions that compound into significant impact over time.",
    suggestedAmount: 10,
    frequency: "weekly",
    impactDescription: "$10/week → Feeds 2 families per month through verified partners.",
    icon: "Calendar",
  },
  {
    id: "rp-3",
    title: "Ramadan Nightly Giving",
    description: "Automated donations each night of Ramadan to maximize reward during the blessed month.",
    suggestedAmount: 15,
    frequency: "monthly",
    impactDescription: "$15/night × 30 nights → $450 total supporting multiple causes.",
    icon: "Moon",
  },
  {
    id: "rp-4",
    title: "Yearly Charity Plan",
    description: "Annual giving plan covering Zakat, Fidya, and general Sadaqah obligations.",
    suggestedAmount: 500,
    frequency: "yearly",
    impactDescription: "$500/year → Comprehensive coverage of annual Islamic giving obligations.",
    icon: "Star",
  },
];
