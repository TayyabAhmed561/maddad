// ============================================
// Extended Platform Data (Mock)
// ============================================

import type { 
  CampaignUpdate, 
  SupporterMessage, 
  TrustScore, 
  ImpactMetric, 
  RecurringProgram, 
  RamadanNightPlan,
  UrgencyLevel 
} from "@/types/platform";

// ============================================
// URGENCY ASSIGNMENTS
// ============================================

export const needUrgencyMap: Record<string, UrgencyLevel> = {
  "1": "critical",    // Gaza food
  "2": "medium",      // Turkey shelter
  "3": "medium",      // Bangladesh medical
  "4": "low",         // Nigeria masjid
  "5": "medium",      // Yemen education
  "6": "critical",    // Syria food
  "7": "low",         // Somalia well
  "8": "medium",      // Jordan education
  "kw-17": "medium",  // MSA Iftaar
  "kw-1": "medium",
  "kw-5": "critical",
  "kw-7": "medium",
  "kw-11": "critical",
  "ps-kw-1": "critical",
  "ps-kw-2": "critical",
  "ps-to-1": "critical",
};

// ============================================
// CAMPAIGN UPDATES (per need ID)
// ============================================

export const campaignUpdatesMap: Record<string, CampaignUpdate[]> = {
  "1": [
    {
      id: "cu-1-1",
      date: "February 28, 2026",
      title: "Food distribution completed in northern zone",
      content: "We successfully distributed 200 food packages to families in northern Gaza. Each package contains rice, flour, cooking oil, and canned goods sufficient for 2 weeks.",
      images: ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400"],
      progressPercent: 60,
    },
    {
      id: "cu-1-2",
      date: "February 20, 2026",
      title: "Supplies purchased and warehoused",
      content: "Completed bulk purchase of food supplies from verified local vendors. Supplies are stored at our distribution centre and ready for deployment.",
      progressPercent: 45,
    },
    {
      id: "cu-1-3",
      date: "February 10, 2026",
      title: "Campaign launched",
      content: "Campaign officially launched with initial donations received. Partner network activated for distribution coordination.",
      progressPercent: 15,
    },
  ],
  "kw-17": [
    {
      id: "cu-kw17-1",
      date: "March 1, 2026",
      title: "Venue secured and menu finalized",
      content: "Waterloo Community Centre confirmed for the full month of Ramadan. Three local halal restaurants partnered for nightly meal rotation.",
      images: ["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400"],
      progressPercent: 38,
    },
    {
      id: "cu-kw17-2",
      date: "February 20, 2026",
      title: "Volunteer team assembled",
      content: "Over 40 volunteers from UW MSA have signed up for rotating shifts. Training session scheduled for next week.",
      progressPercent: 25,
    },
  ],
  "6": [
    {
      id: "cu-6-1",
      date: "February 25, 2026",
      title: "Winter packages delivered to 100 families",
      content: "First batch of winter food packages delivered in northern Aleppo. Each package includes warm meals, heating fuel, and emergency blankets.",
      images: ["https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400"],
      progressPercent: 55,
    },
  ],
};

// ============================================
// SUPPORTER MESSAGES (per need ID)
// ============================================

export const supporterMessagesMap: Record<string, SupporterMessage[]> = {
  "1": [
    { id: "sm-1-1", donorName: "Ahmad K.", isAnonymous: false, message: "May Allah ease the suffering of our brothers and sisters in Gaza.", timestamp: "2 hours ago" },
    { id: "sm-1-2", donorName: "", isAnonymous: true, message: "اللهم بارك في هذا العمل وتقبله", timestamp: "5 hours ago" },
    { id: "sm-1-3", donorName: "Fatima R.", isAnonymous: false, message: "Donated on behalf of my late father. May it be sadaqah jariyah for him.", timestamp: "1 day ago" },
    { id: "sm-1-4", donorName: "", isAnonymous: true, message: "May Allah reward everyone involved in this effort.", timestamp: "2 days ago" },
  ],
  "kw-17": [
    { id: "sm-kw17-1", donorName: "Sarah M.", isAnonymous: false, message: "Love this initiative! UW MSA is doing amazing work for the community.", timestamp: "3 hours ago" },
    { id: "sm-kw17-2", donorName: "", isAnonymous: true, message: "بارك الله فيكم. May this be a blessed Ramadan for all.", timestamp: "1 day ago" },
    { id: "sm-kw17-3", donorName: "Omar A.", isAnonymous: false, message: "So glad to see local community initiatives on Maddad.", timestamp: "2 days ago" },
  ],
  "6": [
    { id: "sm-6-1", donorName: "", isAnonymous: true, message: "Ya Rabb, protect the people of Syria this winter.", timestamp: "4 hours ago" },
    { id: "sm-6-2", donorName: "Yusuf H.", isAnonymous: false, message: "Small donation but sincere intention. JazakAllah khair to the team.", timestamp: "1 day ago" },
  ],
};

// ============================================
// TRUST SCORES (per org name)
// ============================================

export const trustScoreMap: Record<string, TrustScore> = {
  "Islamic Relief Canada": { overall: 94, verificationLevel: 98, evidenceCompleteness: 92, projectCompletionRate: 95, financialClarity: 91 },
  "Human Concern International": { overall: 91, verificationLevel: 95, evidenceCompleteness: 88, projectCompletionRate: 92, financialClarity: 89 },
  "Penny Appeal Canada": { overall: 89, verificationLevel: 92, evidenceCompleteness: 86, projectCompletionRate: 90, financialClarity: 88 },
  "Palestine Relief Network": { overall: 87, verificationLevel: 90, evidenceCompleteness: 84, projectCompletionRate: 88, financialClarity: 86 },
  "MSA": { overall: 82, verificationLevel: 85, evidenceCompleteness: 80, projectCompletionRate: 78, financialClarity: 85 },
  "K-W Muslim Community": { overall: 85, verificationLevel: 88, evidenceCompleteness: 82, projectCompletionRate: 85, financialClarity: 85 },
};

// ============================================
// IMPACT METRICS (for dashboard)
// ============================================

export const impactMetrics: ImpactMetric[] = [
  { label: "Verified Projects Completed", value: 347, previousValue: 312, unit: "projects", category: "completion" },
  { label: "Total Meals Distributed", value: 245000, previousValue: 198000, unit: "meals", category: "food" },
  { label: "Families Supported", value: 18400, previousValue: 15200, unit: "families", category: "shelter" },
  { label: "Water Wells Built", value: 89, previousValue: 72, unit: "wells", category: "water" },
  { label: "Students Educated", value: 4200, previousValue: 3500, unit: "students", category: "education" },
  { label: "Medical Supplies Delivered", value: 12500, previousValue: 9800, unit: "packages", category: "medical" },
];

export const donationsByCategory = [
  { name: "Food Security", value: 845000, fill: "hsl(32, 65%, 42%)" },
  { name: "Shelter & Housing", value: 534000, fill: "hsl(198, 45%, 42%)" },
  { name: "Medical Aid", value: 378000, fill: "hsl(0, 50%, 48%)" },
  { name: "Education", value: 267000, fill: "hsl(265, 40%, 48%)" },
  { name: "Masjid Projects", value: 174450, fill: "hsl(160, 45%, 32%)" },
];

export const monthlyDonationTrend = [
  { month: "Sep", amount: 178000 },
  { month: "Oct", amount: 267000 },
  { month: "Nov", amount: 198000 },
  { month: "Dec", amount: 312000 },
  { month: "Jan", amount: 245000 },
  { month: "Feb", amount: 289000 },
];

export const milestoneCompletionRates = [
  { stage: "Verified", rate: 100 },
  { stage: "Funds Allocated", rate: 94 },
  { stage: "Procurement", rate: 87 },
  { stage: "In Progress", rate: 78 },
  { stage: "Completed", rate: 72 },
];

// ============================================
// RECURRING GIVING PROGRAMS
// ============================================

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

// ============================================
// RAMADAN DATA
// ============================================

export function generateRamadanNightPlan(baseAmount: number = 10): RamadanNightPlan[] {
  const nights: RamadanNightPlan[] = [];
  const startDate = new Date(2026, 1, 28); // Feb 28, 2026 (approximate Ramadan start)
  
  for (let i = 21; i <= 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i - 1);
    nights.push({
      night: i,
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: i === 27 ? baseAmount * 3 : baseAmount, // Triple on Laylatul Qadr
      allocated: i <= 23, // First 3 nights already allocated for demo
      cause: i === 27 ? "Laylatul Qadr Special" : undefined,
    });
  }
  return nights;
}

export const ramadanFeaturedNeeds = [
  { id: "1", reason: "Critical food relief during Ramadan" },
  { id: "6", reason: "Winter food packages for families breaking fast" },
  { id: "kw-17", reason: "Local community iftaar initiative" },
  { id: "8", reason: "Education for refugee children during Ramadan" },
  { id: "3", reason: "Medical supplies for clinic serving fasting patients" },
];

export const ramadanGivingTracker = {
  totalDonated: 450,
  nightsCompleted: 3,
  totalNights: 10,
  impactSummary: "Your Ramadan giving has provided 90 meals and supported 3 verified causes.",
  dailyReminder: "Night 24 of Ramadan — Consider doubling your giving in these blessed last nights.",
};

// ============================================
// CAMPAIGN CREATED DATES (for timeline slider)
// ============================================

/** Returns a deterministic createdAt date for any map item ID */
export function getCampaignCreatedAt(id: string): Date {
  // Curated items get specific dates
  const knownDates: Record<string, string> = {
    "1": "2026-02-05",
    "2": "2025-11-12",
    "3": "2025-09-20",
    "4": "2025-06-15",
    "5": "2025-10-03",
    "6": "2026-01-18",
    "7": "2025-07-22",
    "8": "2025-12-01",
    "kw-1": "2026-01-10",
    "kw-5": "2026-02-15",
    "kw-7": "2025-11-28",
    "kw-11": "2026-02-20",
    "kw-17": "2026-02-18",
    "ps-kw-1": "2026-01-25",
    "ps-kw-2": "2026-02-01",
    "ps-to-1": "2026-01-15",
  };
  if (knownDates[id]) return new Date(knownDates[id]);

  // Deterministic hash for placeholder items
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const now = Date.now();
  const yearAgo = now - 365 * 86400000;
  const offset = Math.abs(hash) % (365 * 86400000);
  return new Date(yearAgo + offset);
}
