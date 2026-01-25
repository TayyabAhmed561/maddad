export type MapItemType = "organization" | "need" | "appeal" | "fidya_partner" | "qurbani_partner";
export type MapCategory = "Food" | "Shelter" | "Medical" | "Education" | "Masjid" | "Fidya" | "Qurbani" | "Zakat";
export type VerifiedStatus = "verified" | "pending" | "unverified";
export type PrivacyLevel = "local_private" | "global_ok";

export interface MapItem {
  id: string;
  type: MapItemType;
  title: string;
  orgName?: string;
  category: MapCategory;
  verifiedStatus: VerifiedStatus;
  endorsedBy?: string;
  zakatEligible: boolean;
  locationLabel: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  fundingRaised?: number;
  goal?: number;
  privacyLevel: PrivacyLevel;
  description?: string;
  countryCode?: string;
  isPlaceholder?: boolean; // Placeholder pins don't appear in card list
}

// ============================================
// CURATED REAL ENTRIES (Trust Anchors)
// ============================================

// Kitchener-Waterloo Area (Local) - High quality, detailed entries
const kitchenerWaterlooItems: MapItem[] = [
  {
    id: "kw-1",
    type: "need",
    title: "Student Emergency Fund",
    orgName: "K-W Muslim Community",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "Waterloo Masjid",
    zakatEligible: true,
    locationLabel: "Kitchener, ON",
    lat: 43.4516,
    lng: -80.4925,
    lastUpdated: "3 hours ago",
    fundingRaised: 12000,
    goal: 20000,
    privacyLevel: "global_ok",
    description: "Supporting Muslim students facing unexpected financial hardship at local universities.",
    countryCode: "CA"
  },
  {
    id: "kw-2",
    type: "organization",
    title: "Waterloo Region Food Bank",
    orgName: "Muslim Welfare of Waterloo",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "Islamic Centre of Waterloo",
    zakatEligible: true,
    locationLabel: "Waterloo, ON",
    lat: 43.4643,
    lng: -80.5204,
    lastUpdated: "1 hour ago",
    fundingRaised: 8500,
    goal: 15000,
    privacyLevel: "global_ok",
    description: "Weekly halal food distribution serving 200+ families in the Waterloo Region.",
    countryCode: "CA"
  },
  {
    id: "kw-3",
    type: "appeal",
    title: "Winter Clothing Drive",
    orgName: "Cambridge Islamic Centre",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Cambridge, ON",
    lat: 43.3601,
    lng: -80.3123,
    lastUpdated: "5 hours ago",
    fundingRaised: 3200,
    goal: 8000,
    privacyLevel: "global_ok",
    description: "Providing winter coats, boots, and warm clothing for newcomer families.",
    countryCode: "CA"
  },
  {
    id: "kw-4",
    type: "organization",
    title: "Masjid Al-Hidaya Expansion",
    orgName: "Masjid Al-Hidaya",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Kitchener, ON",
    lat: 43.4423,
    lng: -80.4851,
    lastUpdated: "2 days ago",
    fundingRaised: 125000,
    goal: 500000,
    privacyLevel: "global_ok",
    description: "Building expansion to accommodate growing community and add youth programs.",
    countryCode: "CA"
  },
  {
    id: "kw-5",
    type: "need",
    title: "Refugee Family Resettlement",
    orgName: "Reception House Waterloo",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "Waterloo Region Immigration Partnership",
    zakatEligible: true,
    locationLabel: "Kitchener, ON",
    lat: 43.4489,
    lng: -80.4903,
    lastUpdated: "12 hours ago",
    fundingRaised: 18000,
    goal: 30000,
    privacyLevel: "global_ok",
    description: "First month essentials and housing deposits for newly arrived refugee families.",
    countryCode: "CA"
  },
  {
    id: "kw-6",
    type: "fidya_partner",
    title: "Halal Kitchen KW",
    orgName: "Halal Kitchen KW",
    category: "Fidya",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Waterloo, ON",
    lat: 43.4723,
    lng: -80.5289,
    lastUpdated: "6 hours ago",
    privacyLevel: "local_private",
    description: "Verified restaurant partner for Fidya meal preparation and delivery.",
    countryCode: "CA"
  },
  {
    id: "kw-7",
    type: "need",
    title: "Medical Equipment for Clinic",
    orgName: "Muslim Health Professionals KW",
    category: "Medical",
    verifiedStatus: "pending",
    zakatEligible: true,
    locationLabel: "Kitchener, ON",
    lat: 43.4556,
    lng: -80.5012,
    lastUpdated: "1 day ago",
    fundingRaised: 4500,
    goal: 12000,
    privacyLevel: "global_ok",
    description: "Essential medical equipment for the community health clinic serving uninsured residents.",
    countryCode: "CA"
  },
  {
    id: "kw-8",
    type: "organization",
    title: "Zakat Distribution Fund",
    orgName: "Islamic Centre of Waterloo",
    category: "Zakat",
    verifiedStatus: "verified",
    endorsedBy: "National Zakat Foundation",
    zakatEligible: true,
    locationLabel: "Waterloo, ON",
    lat: 43.4701,
    lng: -80.5156,
    lastUpdated: "4 hours ago",
    fundingRaised: 45000,
    goal: 100000,
    privacyLevel: "global_ok",
    description: "Local Zakat fund distributed to verified recipients in the Waterloo Region.",
    countryCode: "CA"
  },
  {
    id: "kw-9",
    type: "appeal",
    title: "Youth Mentorship Program",
    orgName: "Muslim Youth of KW",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Kitchener, ON",
    lat: 43.4378,
    lng: -80.4756,
    lastUpdated: "8 hours ago",
    fundingRaised: 6200,
    goal: 10000,
    privacyLevel: "global_ok",
    description: "After-school tutoring and mentorship for at-risk youth in the community.",
    countryCode: "CA"
  },
  {
    id: "kw-10",
    type: "qurbani_partner",
    title: "Qurbani Distribution Centre",
    orgName: "MAC Kitchener-Waterloo",
    category: "Qurbani",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Kitchener, ON",
    lat: 43.4234,
    lng: -80.4623,
    lastUpdated: "3 days ago",
    privacyLevel: "global_ok",
    description: "Official Qurbani meat processing and distribution for Eid al-Adha.",
    countryCode: "CA"
  },
  {
    id: "kw-11",
    type: "need",
    title: "Single Mother Support Fund",
    orgName: "Sisters' Circle KW",
    category: "Zakat",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Waterloo, ON",
    lat: 43.4589,
    lng: -80.5234,
    lastUpdated: "2 hours ago",
    fundingRaised: 7800,
    goal: 15000,
    privacyLevel: "local_private",
    description: "Emergency assistance for single mothers covering rent, utilities, and childcare.",
    countryCode: "CA"
  },
  {
    id: "kw-12",
    type: "organization",
    title: "Seniors Meal Delivery",
    orgName: "Muslim Seniors of Waterloo",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Cambridge, ON",
    lat: 43.3745,
    lng: -80.3234,
    lastUpdated: "5 hours ago",
    fundingRaised: 2100,
    goal: 5000,
    privacyLevel: "local_private",
    description: "Weekly halal meal delivery to homebound seniors in Cambridge and area.",
    countryCode: "CA"
  }
];

// Ontario (Provincial) - Semi-detailed entries for major cities
const ontarioRealItems: MapItem[] = [
  // Toronto & GTA
  {
    id: "on-1",
    type: "organization",
    title: "Islamic Relief Canada HQ",
    orgName: "Islamic Relief Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "Islamic Society of Toronto",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.6532,
    lng: -79.3832,
    lastUpdated: "2 hours ago",
    fundingRaised: 850000,
    goal: 1500000,
    privacyLevel: "global_ok",
    description: "National headquarters coordinating emergency food assistance across Canada.",
    countryCode: "CA"
  },
  {
    id: "on-2",
    type: "need",
    title: "Winter Shelter Support",
    orgName: "Muslim Welfare Centre",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Scarborough, ON",
    lat: 43.7731,
    lng: -79.2578,
    lastUpdated: "5 hours ago",
    fundingRaised: 45000,
    goal: 75000,
    privacyLevel: "global_ok",
    description: "Providing warm shelter for homeless families during winter months.",
    countryCode: "CA"
  },
  {
    id: "on-3",
    type: "fidya_partner",
    title: "Barakah Bites",
    orgName: "Barakah Bites Restaurant",
    category: "Fidya",
    verifiedStatus: "verified",
    endorsedBy: "Masjid Toronto",
    zakatEligible: false,
    locationLabel: "Greater Toronto Area",
    lat: 43.7001,
    lng: -79.4163,
    lastUpdated: "1 day ago",
    privacyLevel: "local_private",
    description: "Verified restaurant partner for Fidya meal distribution in the GTA.",
    countryCode: "CA"
  },
  {
    id: "on-4",
    type: "organization",
    title: "ISNA Food Bank",
    orgName: "ISNA Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "ISNA Canada",
    zakatEligible: true,
    locationLabel: "Mississauga, ON",
    lat: 43.5890,
    lng: -79.6441,
    lastUpdated: "3 hours ago",
    fundingRaised: 120000,
    goal: 200000,
    privacyLevel: "global_ok",
    description: "Weekly food bank serving 500+ families in the Peel region.",
    countryCode: "CA"
  },
  {
    id: "on-5",
    type: "qurbani_partner",
    title: "GTA Qurbani Distribution",
    orgName: "Muslim Association of Canada",
    category: "Qurbani",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Mississauga, ON",
    lat: 43.5480,
    lng: -79.6125,
    lastUpdated: "12 hours ago",
    privacyLevel: "global_ok",
    description: "Official Qurbani meat processing and distribution partner for GTA.",
    countryCode: "CA"
  },
  // Ottawa
  {
    id: "on-6",
    type: "organization",
    title: "Ottawa Muslim Association",
    orgName: "Ottawa Muslim Association",
    category: "Masjid",
    verifiedStatus: "verified",
    endorsedBy: "National Council of Canadian Muslims",
    zakatEligible: false,
    locationLabel: "Ottawa, ON",
    lat: 45.4215,
    lng: -75.6972,
    lastUpdated: "8 hours ago",
    fundingRaised: 320000,
    goal: 600000,
    privacyLevel: "global_ok",
    description: "Central mosque and community hub expansion project.",
    countryCode: "CA"
  },
  {
    id: "on-7",
    type: "need",
    title: "Refugee Family Resettlement",
    orgName: "Refugee 613",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "Ottawa Muslim Association",
    zakatEligible: true,
    locationLabel: "Ottawa, ON",
    lat: 45.3970,
    lng: -75.7138,
    lastUpdated: "2 days ago",
    fundingRaised: 32000,
    goal: 50000,
    privacyLevel: "global_ok",
    description: "Housing and integration support for newly arrived refugee families.",
    countryCode: "CA"
  },
  // London
  {
    id: "on-8",
    type: "organization",
    title: "London Muslim Mosque",
    orgName: "London Muslim Mosque",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "London, ON",
    lat: 42.9849,
    lng: -81.2453,
    lastUpdated: "1 day ago",
    fundingRaised: 180000,
    goal: 400000,
    privacyLevel: "global_ok",
    description: "Community services, prayer facilities, and educational programs.",
    countryCode: "CA"
  },
  {
    id: "on-9",
    type: "appeal",
    title: "Medical Equipment Appeal",
    orgName: "Muslim Health Professionals",
    category: "Medical",
    verifiedStatus: "pending",
    zakatEligible: true,
    locationLabel: "London, ON",
    lat: 43.0096,
    lng: -81.2737,
    lastUpdated: "4 hours ago",
    fundingRaised: 8500,
    goal: 15000,
    privacyLevel: "global_ok",
    description: "Providing essential medical equipment for underserved clinics.",
    countryCode: "CA"
  },
  // Hamilton
  {
    id: "on-10",
    type: "fidya_partner",
    title: "Hamilton Halal Kitchen",
    orgName: "Hamilton Halal Kitchen",
    category: "Fidya",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Hamilton, ON",
    lat: 43.2557,
    lng: -79.8711,
    lastUpdated: "3 days ago",
    privacyLevel: "local_private",
    description: "Preparing and delivering Fidya meals to eligible recipients.",
    countryCode: "CA"
  },
  {
    id: "on-11",
    type: "need",
    title: "Hamilton Food Security Project",
    orgName: "Hamilton Muslim Association",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Hamilton, ON",
    lat: 43.2501,
    lng: -79.8496,
    lastUpdated: "6 hours ago",
    fundingRaised: 15000,
    goal: 35000,
    privacyLevel: "global_ok",
    description: "Monthly grocery support for families facing food insecurity.",
    countryCode: "CA"
  }
];

// Canada (outside Ontario) - Major cities
const canadaRealItems: MapItem[] = [
  // British Columbia
  {
    id: "ca-1",
    type: "organization",
    title: "BC Muslim Association",
    orgName: "BC Muslim Association",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Vancouver, BC",
    lat: 49.2827,
    lng: -123.1207,
    lastUpdated: "4 hours ago",
    fundingRaised: 450000,
    goal: 800000,
    privacyLevel: "global_ok",
    description: "Community centre expansion and youth programming.",
    countryCode: "CA"
  },
  {
    id: "ca-2",
    type: "need",
    title: "Vancouver Refugee Support",
    orgName: "Immigrant Services BC",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Vancouver, BC",
    lat: 49.2601,
    lng: -123.1139,
    lastUpdated: "1 day ago",
    fundingRaised: 28000,
    goal: 50000,
    privacyLevel: "global_ok",
    description: "Settlement support for refugee families in Metro Vancouver.",
    countryCode: "CA"
  },
  // Alberta
  {
    id: "ca-3",
    type: "organization",
    title: "Islamic Family & Social Services",
    orgName: "IFSSA Edmonton",
    category: "Zakat",
    verifiedStatus: "verified",
    endorsedBy: "Alberta Islamic Welfare Association",
    zakatEligible: true,
    locationLabel: "Edmonton, AB",
    lat: 53.5461,
    lng: -113.4938,
    lastUpdated: "2 hours ago",
    fundingRaised: 85000,
    goal: 150000,
    privacyLevel: "global_ok",
    description: "Comprehensive Zakat distribution and family support services.",
    countryCode: "CA"
  },
  {
    id: "ca-4",
    type: "need",
    title: "Calgary Food Bank Partnership",
    orgName: "Muslim Families Network",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Calgary, AB",
    lat: 51.0447,
    lng: -114.0719,
    lastUpdated: "5 hours ago",
    fundingRaised: 42000,
    goal: 80000,
    privacyLevel: "global_ok",
    description: "Halal food distribution in partnership with Calgary Food Bank.",
    countryCode: "CA"
  },
  // Quebec
  {
    id: "ca-5",
    type: "organization",
    title: "Montreal Muslim Community",
    orgName: "Muslim Council of Montreal",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Montreal, QC",
    lat: 45.5017,
    lng: -73.5673,
    lastUpdated: "8 hours ago",
    fundingRaised: 65000,
    goal: 120000,
    privacyLevel: "global_ok",
    description: "Weekend Islamic school and youth education programs.",
    countryCode: "CA"
  },
  // Manitoba
  {
    id: "ca-6",
    type: "need",
    title: "Winnipeg Winter Relief",
    orgName: "Manitoba Islamic Association",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Winnipeg, MB",
    lat: 49.8951,
    lng: -97.1384,
    lastUpdated: "1 day ago",
    fundingRaised: 12000,
    goal: 25000,
    privacyLevel: "global_ok",
    description: "Emergency heating and winter supplies for vulnerable families.",
    countryCode: "CA"
  }
];

// Global - High-need regions with detailed entries
const globalRealItems: MapItem[] = [
  // Gaza / Palestine
  {
    id: "gl-1",
    type: "need",
    title: "Gaza Emergency Medical Relief",
    orgName: "UNRWA",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "United Nations",
    zakatEligible: true,
    locationLabel: "Gaza, Palestine",
    lat: 31.5,
    lng: 34.47,
    lastUpdated: "1 hour ago",
    fundingRaised: 2500000,
    goal: 5000000,
    privacyLevel: "global_ok",
    description: "Critical medical supplies and emergency healthcare services.",
    countryCode: "PS"
  },
  {
    id: "gl-2",
    type: "appeal",
    title: "Gaza Food Security Program",
    orgName: "Islamic Relief Worldwide",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Gaza, Palestine",
    lat: 31.45,
    lng: 34.42,
    lastUpdated: "3 hours ago",
    fundingRaised: 1800000,
    goal: 3000000,
    privacyLevel: "global_ok",
    description: "Emergency food packages for families affected by ongoing crisis.",
    countryCode: "PS"
  },
  {
    id: "gl-3",
    type: "need",
    title: "West Bank Education Support",
    orgName: "Penny Appeal",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "West Bank, Palestine",
    lat: 31.9,
    lng: 35.2,
    lastUpdated: "6 hours ago",
    fundingRaised: 120000,
    goal: 250000,
    privacyLevel: "global_ok",
    description: "School supplies and educational materials for displaced children.",
    countryCode: "PS"
  },
  // Syria
  {
    id: "gl-4",
    type: "appeal",
    title: "Syria Winterization Program",
    orgName: "Syria Relief",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "Islamic Relief Worldwide",
    zakatEligible: true,
    locationLabel: "Idlib, Syria",
    lat: 35.93,
    lng: 36.63,
    lastUpdated: "4 hours ago",
    fundingRaised: 180000,
    goal: 300000,
    privacyLevel: "global_ok",
    description: "Winterization kits and heating fuel for displaced families.",
    countryCode: "SY"
  },
  {
    id: "gl-5",
    type: "need",
    title: "Aleppo Reconstruction",
    orgName: "Syria Relief Network",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Aleppo, Syria",
    lat: 36.2,
    lng: 37.15,
    lastUpdated: "12 hours ago",
    fundingRaised: 450000,
    goal: 800000,
    privacyLevel: "global_ok",
    description: "Rebuilding homes and infrastructure for returning families.",
    countryCode: "SY"
  },
  // Yemen
  {
    id: "gl-6",
    type: "need",
    title: "Yemen Famine Relief",
    orgName: "Muslim Aid",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "UN World Food Programme",
    zakatEligible: true,
    locationLabel: "Sana'a, Yemen",
    lat: 15.3694,
    lng: 44.191,
    lastUpdated: "2 hours ago",
    fundingRaised: 920000,
    goal: 2000000,
    privacyLevel: "global_ok",
    description: "Emergency food aid for families facing severe malnutrition.",
    countryCode: "YE"
  },
  {
    id: "gl-7",
    type: "appeal",
    title: "Yemen Medical Crisis Response",
    orgName: "Doctors Worldwide",
    category: "Medical",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Aden, Yemen",
    lat: 12.7855,
    lng: 45.0187,
    lastUpdated: "8 hours ago",
    fundingRaised: 340000,
    goal: 600000,
    privacyLevel: "global_ok",
    description: "Medical supplies and healthcare for cholera prevention.",
    countryCode: "YE"
  },
  // Sudan
  {
    id: "gl-8",
    type: "need",
    title: "Sudan Displacement Crisis",
    orgName: "Islamic Relief",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Khartoum, Sudan",
    lat: 15.5007,
    lng: 32.5599,
    lastUpdated: "5 hours ago",
    fundingRaised: 280000,
    goal: 500000,
    privacyLevel: "global_ok",
    description: "Emergency shelter and supplies for internally displaced families.",
    countryCode: "SD"
  },
  {
    id: "gl-9",
    type: "appeal",
    title: "Darfur Food Security",
    orgName: "Human Appeal",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Darfur, Sudan",
    lat: 13.5,
    lng: 25.0,
    lastUpdated: "1 day ago",
    fundingRaised: 150000,
    goal: 350000,
    privacyLevel: "global_ok",
    description: "Sustainable food programs for communities in Darfur region.",
    countryCode: "SD"
  },
  // Bangladesh
  {
    id: "gl-10",
    type: "organization",
    title: "Bangladesh Flood Response",
    orgName: "Muslim Aid Bangladesh",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Sylhet, Bangladesh",
    lat: 24.8949,
    lng: 91.8687,
    lastUpdated: "6 hours ago",
    fundingRaised: 95000,
    goal: 180000,
    privacyLevel: "global_ok",
    description: "Emergency food packages for flood-affected communities.",
    countryCode: "BD"
  },
  {
    id: "gl-11",
    type: "need",
    title: "Rohingya Education Initiative",
    orgName: "Penny Appeal",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "UNHCR",
    zakatEligible: true,
    locationLabel: "Cox's Bazar, Bangladesh",
    lat: 21.4272,
    lng: 92.0058,
    lastUpdated: "12 hours ago",
    fundingRaised: 75000,
    goal: 150000,
    privacyLevel: "global_ok",
    description: "Learning centres and educational materials for Rohingya children.",
    countryCode: "BD"
  },
  {
    id: "gl-12",
    type: "appeal",
    title: "Rohingya Medical Clinic",
    orgName: "Islamic Medical Association",
    category: "Medical",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Cox's Bazar, Bangladesh",
    lat: 21.45,
    lng: 92.02,
    lastUpdated: "4 hours ago",
    fundingRaised: 62000,
    goal: 100000,
    privacyLevel: "global_ok",
    description: "Primary healthcare services in refugee camps.",
    countryCode: "BD"
  },
  // Pakistan
  {
    id: "gl-13",
    type: "need",
    title: "Pakistan Flood Recovery",
    orgName: "Edhi Foundation",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Sindh, Pakistan",
    lat: 25.8943,
    lng: 68.5247,
    lastUpdated: "3 hours ago",
    fundingRaised: 420000,
    goal: 750000,
    privacyLevel: "global_ok",
    description: "Rebuilding homes destroyed by recent flooding.",
    countryCode: "PK"
  },
  {
    id: "gl-14",
    type: "organization",
    title: "Karachi Orphan Care",
    orgName: "Pakistan Islamic Charity",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Karachi, Pakistan",
    lat: 24.8607,
    lng: 67.0011,
    lastUpdated: "1 day ago",
    fundingRaised: 88000,
    goal: 200000,
    privacyLevel: "global_ok",
    description: "Education and care for orphaned children.",
    countryCode: "PK"
  }
];

// ============================================
// PLACEHOLDER GENERATORS
// ============================================

const categories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];
const verifiedStatuses: VerifiedStatus[] = ["verified", "verified", "verified", "pending", "unverified"];

const placeholderTitles: Record<MapCategory, string[]> = {
  Food: ["Community Food Appeal", "Halal Food Drive", "Emergency Food Aid", "Food Security Program", "Meal Distribution"],
  Shelter: ["Winter Shelter Support", "Housing Assistance", "Emergency Shelter Fund", "Refugee Housing", "Homeless Support"],
  Medical: ["Medical Relief Program", "Healthcare Support", "Medical Equipment Fund", "Community Clinic", "Health Services"],
  Education: ["Education Support Fund", "Student Scholarships", "Learning Centre", "Youth Programs", "Islamic School"],
  Masjid: ["Masjid Renovation", "Community Centre", "Mosque Expansion", "Prayer Space", "Islamic Centre"],
  Fidya: ["Fidya Meal Program", "Elderly Care Meals", "Fidya Distribution", "Senior Nutrition", "Meal Sponsorship"],
  Qurbani: ["Qurbani Distribution", "Eid Meat Program", "Qurbani Campaign", "Meat Distribution", "Eid Relief"],
  Zakat: ["Zakat Fund", "Zakat Distribution", "Local Zakat", "Community Zakat", "Zakat Relief"]
};

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generatePlaceholder(id: string, lat: number, lng: number, category: MapCategory, locationLabel: string, countryCode: string): MapItem {
  const titles = placeholderTitles[category];
  return {
    id,
    type: "need",
    title: titles[Math.floor(Math.random() * titles.length)],
    category,
    verifiedStatus: verifiedStatuses[Math.floor(Math.random() * verifiedStatuses.length)],
    zakatEligible: ["Food", "Shelter", "Medical", "Education", "Zakat"].includes(category),
    locationLabel,
    lat,
    lng,
    lastUpdated: ["1 hour ago", "3 hours ago", "6 hours ago", "1 day ago", "2 days ago"][Math.floor(Math.random() * 5)],
    privacyLevel: "global_ok",
    countryCode,
    isPlaceholder: true
  };
}

// Ontario placeholder locations
const ontarioPlaceholderLocations = [
  { city: "Toronto", lat: 43.65, lng: -79.38, range: 0.15 },
  { city: "North York", lat: 43.77, lng: -79.41, range: 0.08 },
  { city: "Etobicoke", lat: 43.62, lng: -79.52, range: 0.08 },
  { city: "Brampton", lat: 43.73, lng: -79.76, range: 0.1 },
  { city: "Markham", lat: 43.85, lng: -79.33, range: 0.08 },
  { city: "Vaughan", lat: 43.84, lng: -79.50, range: 0.08 },
  { city: "Richmond Hill", lat: 43.88, lng: -79.44, range: 0.05 },
  { city: "Ajax", lat: 43.85, lng: -79.03, range: 0.05 },
  { city: "Oshawa", lat: 43.90, lng: -78.86, range: 0.08 },
  { city: "Burlington", lat: 43.32, lng: -79.79, range: 0.05 },
  { city: "Oakville", lat: 43.45, lng: -79.68, range: 0.05 },
  { city: "Guelph", lat: 43.55, lng: -80.25, range: 0.05 },
  { city: "Barrie", lat: 44.39, lng: -79.69, range: 0.08 },
  { city: "St. Catharines", lat: 43.16, lng: -79.24, range: 0.05 },
  { city: "Windsor", lat: 42.32, lng: -83.04, range: 0.08 },
  { city: "Sudbury", lat: 46.49, lng: -81.01, range: 0.1 },
  { city: "Thunder Bay", lat: 48.38, lng: -89.25, range: 0.1 },
  { city: "Kingston", lat: 44.23, lng: -76.48, range: 0.05 },
  { city: "Peterborough", lat: 44.30, lng: -78.32, range: 0.05 },
  { city: "Brantford", lat: 43.14, lng: -80.26, range: 0.05 }
];

// Canada placeholder locations (outside Ontario)
const canadaPlaceholderLocations = [
  // British Columbia
  { city: "Vancouver", province: "BC", lat: 49.28, lng: -123.12, range: 0.15 },
  { city: "Surrey", province: "BC", lat: 49.19, lng: -122.85, range: 0.1 },
  { city: "Burnaby", province: "BC", lat: 49.25, lng: -122.95, range: 0.05 },
  { city: "Victoria", province: "BC", lat: 48.43, lng: -123.37, range: 0.05 },
  { city: "Kelowna", province: "BC", lat: 49.88, lng: -119.49, range: 0.05 },
  // Alberta
  { city: "Calgary", province: "AB", lat: 51.04, lng: -114.07, range: 0.15 },
  { city: "Edmonton", province: "AB", lat: 53.55, lng: -113.49, range: 0.15 },
  { city: "Red Deer", province: "AB", lat: 52.27, lng: -113.81, range: 0.05 },
  // Saskatchewan
  { city: "Saskatoon", province: "SK", lat: 52.13, lng: -106.67, range: 0.08 },
  { city: "Regina", province: "SK", lat: 50.45, lng: -104.62, range: 0.08 },
  // Manitoba
  { city: "Winnipeg", province: "MB", lat: 49.90, lng: -97.14, range: 0.12 },
  // Quebec
  { city: "Montreal", province: "QC", lat: 45.50, lng: -73.57, range: 0.15 },
  { city: "Quebec City", province: "QC", lat: 46.81, lng: -71.21, range: 0.08 },
  { city: "Laval", province: "QC", lat: 45.57, lng: -73.69, range: 0.05 },
  { city: "Gatineau", province: "QC", lat: 45.48, lng: -75.70, range: 0.05 },
  // Atlantic
  { city: "Halifax", province: "NS", lat: 44.65, lng: -63.58, range: 0.08 },
  { city: "Moncton", province: "NB", lat: 46.09, lng: -64.78, range: 0.05 },
  { city: "Saint John", province: "NB", lat: 45.27, lng: -66.06, range: 0.05 },
  { city: "St. John's", province: "NL", lat: 47.56, lng: -52.71, range: 0.05 }
];

// Global placeholder locations
const globalPlaceholderLocations = [
  // Middle East & North Africa
  { city: "Cairo", country: "Egypt", code: "EG", lat: 30.04, lng: 31.24, range: 0.2 },
  { city: "Alexandria", country: "Egypt", code: "EG", lat: 31.20, lng: 29.92, range: 0.1 },
  { city: "Amman", country: "Jordan", code: "JO", lat: 31.95, lng: 35.93, range: 0.1 },
  { city: "Beirut", country: "Lebanon", code: "LB", lat: 33.89, lng: 35.50, range: 0.08 },
  { city: "Tripoli", country: "Lebanon", code: "LB", lat: 34.44, lng: 35.85, range: 0.05 },
  { city: "Baghdad", country: "Iraq", code: "IQ", lat: 33.31, lng: 44.37, range: 0.15 },
  { city: "Mosul", country: "Iraq", code: "IQ", lat: 36.34, lng: 43.12, range: 0.1 },
  { city: "Damascus", country: "Syria", code: "SY", lat: 33.51, lng: 36.29, range: 0.1 },
  { city: "Homs", country: "Syria", code: "SY", lat: 34.73, lng: 36.71, range: 0.08 },
  { city: "Tunis", country: "Tunisia", code: "TN", lat: 36.81, lng: 10.18, range: 0.08 },
  { city: "Casablanca", country: "Morocco", code: "MA", lat: 33.57, lng: -7.59, range: 0.1 },
  // Sub-Saharan Africa
  { city: "Mogadishu", country: "Somalia", code: "SO", lat: 2.04, lng: 45.34, range: 0.1 },
  { city: "Nairobi", country: "Kenya", code: "KE", lat: -1.29, lng: 36.82, range: 0.15 },
  { city: "Kampala", country: "Uganda", code: "UG", lat: 0.35, lng: 32.58, range: 0.1 },
  { city: "Dar es Salaam", country: "Tanzania", code: "TZ", lat: -6.79, lng: 39.21, range: 0.1 },
  { city: "Lagos", country: "Nigeria", code: "NG", lat: 6.52, lng: 3.38, range: 0.15 },
  { city: "Abuja", country: "Nigeria", code: "NG", lat: 9.08, lng: 7.40, range: 0.1 },
  { city: "Accra", country: "Ghana", code: "GH", lat: 5.56, lng: -0.20, range: 0.1 },
  { city: "Dakar", country: "Senegal", code: "SN", lat: 14.72, lng: -17.47, range: 0.08 },
  { city: "Addis Ababa", country: "Ethiopia", code: "ET", lat: 9.03, lng: 38.75, range: 0.1 },
  // South Asia
  { city: "Lahore", country: "Pakistan", code: "PK", lat: 31.55, lng: 74.34, range: 0.15 },
  { city: "Islamabad", country: "Pakistan", code: "PK", lat: 33.69, lng: 73.07, range: 0.1 },
  { city: "Peshawar", country: "Pakistan", code: "PK", lat: 34.01, lng: 71.53, range: 0.08 },
  { city: "Dhaka", country: "Bangladesh", code: "BD", lat: 23.81, lng: 90.41, range: 0.15 },
  { city: "Chittagong", country: "Bangladesh", code: "BD", lat: 22.36, lng: 91.78, range: 0.1 },
  { city: "Kabul", country: "Afghanistan", code: "AF", lat: 34.53, lng: 69.17, range: 0.12 },
  { city: "Herat", country: "Afghanistan", code: "AF", lat: 34.35, lng: 62.20, range: 0.08 },
  { city: "Mumbai", country: "India", code: "IN", lat: 19.08, lng: 72.88, range: 0.15 },
  { city: "Delhi", country: "India", code: "IN", lat: 28.61, lng: 77.21, range: 0.15 },
  { city: "Hyderabad", country: "India", code: "IN", lat: 17.39, lng: 78.49, range: 0.12 },
  // Southeast Asia
  { city: "Jakarta", country: "Indonesia", code: "ID", lat: -6.21, lng: 106.85, range: 0.2 },
  { city: "Kuala Lumpur", country: "Malaysia", code: "MY", lat: 3.14, lng: 101.69, range: 0.1 },
  // Central Asia
  { city: "Tashkent", country: "Uzbekistan", code: "UZ", lat: 41.30, lng: 69.28, range: 0.1 },
  { city: "Almaty", country: "Kazakhstan", code: "KZ", lat: 43.24, lng: 76.95, range: 0.1 },
  // Turkey
  { city: "Istanbul", country: "Turkey", code: "TR", lat: 41.01, lng: 28.98, range: 0.15 },
  { city: "Ankara", country: "Turkey", code: "TR", lat: 39.93, lng: 32.85, range: 0.1 },
  { city: "Gaziantep", country: "Turkey", code: "TR", lat: 37.07, lng: 37.38, range: 0.08 }
];

// Generate Ontario placeholders (20 pins)
const ontarioPlaceholders: MapItem[] = ontarioPlaceholderLocations.slice(0, 20).map((loc, i) => {
  const category = categories[i % categories.length];
  return generatePlaceholder(
    `on-ph-${i + 1}`,
    loc.lat + randomInRange(-loc.range, loc.range),
    loc.lng + randomInRange(-loc.range, loc.range),
    category,
    `${loc.city}, ON`,
    "CA"
  );
});

// Generate more Ontario placeholders for density (additional 15)
const ontarioPlaceholders2: MapItem[] = ontarioPlaceholderLocations.slice(0, 15).map((loc, i) => {
  const category = categories[(i + 3) % categories.length];
  return generatePlaceholder(
    `on-ph2-${i + 1}`,
    loc.lat + randomInRange(-loc.range * 1.2, loc.range * 1.2),
    loc.lng + randomInRange(-loc.range * 1.2, loc.range * 1.2),
    category,
    `${loc.city}, ON`,
    "CA"
  );
});

// Generate Canada placeholders (40 pins)
const canadaPlaceholders: MapItem[] = canadaPlaceholderLocations.flatMap((loc, i) => {
  const numPins = loc.city === "Vancouver" || loc.city === "Calgary" || loc.city === "Montreal" ? 3 : 2;
  return Array.from({ length: numPins }, (_, j) => {
    const category = categories[(i + j) % categories.length];
    return generatePlaceholder(
      `ca-ph-${i}-${j}`,
      loc.lat + randomInRange(-loc.range, loc.range),
      loc.lng + randomInRange(-loc.range, loc.range),
      category,
      `${loc.city}, ${loc.province}`,
      "CA"
    );
  });
});

// Generate Global placeholders (80 pins)
const globalPlaceholders: MapItem[] = globalPlaceholderLocations.flatMap((loc, i) => {
  const numPins = ["Cairo", "Lagos", "Jakarta", "Istanbul", "Dhaka"].includes(loc.city) ? 3 : 2;
  return Array.from({ length: numPins }, (_, j) => {
    const category = categories[(i + j) % categories.length];
    return generatePlaceholder(
      `gl-ph-${i}-${j}`,
      loc.lat + randomInRange(-loc.range, loc.range),
      loc.lng + randomInRange(-loc.range, loc.range),
      category,
      `${loc.city}, ${loc.country}`,
      loc.code
    );
  });
});

// ============================================
// COMBINED EXPORTS
// ============================================

// All real items (shown in cards)
export const realMapItems: MapItem[] = [
  ...kitchenerWaterlooItems,
  ...ontarioRealItems,
  ...canadaRealItems,
  ...globalRealItems
];

// All placeholder items (map only)
export const placeholderMapItems: MapItem[] = [
  ...ontarioPlaceholders,
  ...ontarioPlaceholders2,
  ...canadaPlaceholders,
  ...globalPlaceholders
];

// Combined for map display
export const mapItems: MapItem[] = [
  ...realMapItems,
  ...placeholderMapItems
];

// Category colors matching the design system
export const categoryColors: Record<MapCategory, { bg: string; text: string; marker: string }> = {
  Food: { bg: "hsl(32, 55%, 94%)", text: "hsl(32, 55%, 28%)", marker: "hsl(32, 65%, 42%)" },
  Shelter: { bg: "hsl(198, 40%, 94%)", text: "hsl(198, 40%, 28%)", marker: "hsl(198, 45%, 42%)" },
  Medical: { bg: "hsl(0, 40%, 95%)", text: "hsl(0, 40%, 35%)", marker: "hsl(0, 50%, 48%)" },
  Education: { bg: "hsl(265, 35%, 94%)", text: "hsl(265, 35%, 35%)", marker: "hsl(265, 40%, 48%)" },
  Masjid: { bg: "hsl(160, 35%, 93%)", text: "hsl(160, 35%, 25%)", marker: "hsl(160, 45%, 32%)" },
  Fidya: { bg: "hsl(38, 50%, 94%)", text: "hsl(38, 50%, 28%)", marker: "hsl(38, 62%, 42%)" },
  Qurbani: { bg: "hsl(28, 45%, 94%)", text: "hsl(28, 45%, 28%)", marker: "hsl(28, 55%, 42%)" },
  Zakat: { bg: "hsl(160, 40%, 93%)", text: "hsl(160, 40%, 22%)", marker: "hsl(160, 50%, 28%)" }
};

// Ontario bounds for focused view [west, south, east, north] in [lng, lat] order
export const ONTARIO_BOUNDS: [[number, number], [number, number]] = [[-95.2, 41.7], [-74.3, 56.9]];
export const ONTARIO_CENTER = { lat: 49.3, lng: -84.75 }; // Fallback center (geometric center of Ontario)
export const ONTARIO_ZOOM = 5.5;
export const ONTARIO_MAX_ZOOM = 6.2;

// Kitchener-Waterloo center for Local view
export const KW_CENTER = { lat: 43.4516, lng: -80.4925 };
export const KW_BOUNDS: [[number, number], [number, number]] = [[-80.7, 43.25], [-80.2, 43.6]];

// Canada bounds for focused view
export const CANADA_BOUNDS: [[number, number], [number, number]] = [[-141, 41.7], [-52, 83.1]];
export const CANADA_CENTER = { lat: 56.13, lng: -106.35 };
export const CANADA_ZOOM = 3.2;

// Global view settings
export const GLOBAL_CENTER = { lat: 30, lng: 20 };
export const GLOBAL_ZOOM = 1.8;

// Local view settings
export const LOCAL_ZOOM = 11;
export const LOCAL_RADIUS_KM = 50;

// Scope level type
export type ScopeLevel = "local" | "provincial" | "canada" | "global";

// Helper: Haversine distance in km
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Check if item is in Kitchener-Waterloo area
export function isKWItem(item: MapItem): boolean {
  return item.id.startsWith("kw-") || (
    item.lat >= 43.25 && item.lat <= 43.6 &&
    item.lng >= -80.7 && item.lng <= -80.2
  );
}

// Helper: Check if item is in Ontario
export function isOntarioItem(item: MapItem): boolean {
  return item.locationLabel.includes("ON") || item.countryCode === "CA" && (
    item.lat >= 41.7 && item.lat <= 56.9 &&
    item.lng >= -95.2 && item.lng <= -74.3
  );
}

// Helper: Check if item is in Canada
export function isCanadaItem(item: MapItem): boolean {
  return item.countryCode === "CA";
}
