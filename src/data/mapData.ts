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
    fundingRaised: 12800,
    goal: 25000,
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
    fundingRaised: 3100,
    goal: 8000,
    privacyLevel: "local_private",
    description: "Weekly halal meal delivery to homebound seniors in Cambridge and area.",
    countryCode: "CA"
  },
  // Additional KW masajid and organizations
  {
    id: "kw-13",
    type: "organization",
    title: "Islamic Centre of Cambridge",
    orgName: "Islamic Centre of Cambridge",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Cambridge, ON",
    lat: 43.3601,
    lng: -80.3123,
    lastUpdated: "1 day ago",
    fundingRaised: 85000,
    goal: 200000,
    privacyLevel: "global_ok",
    description: "Community expansion for the growing Cambridge Muslim population.",
    countryCode: "CA"
  },
  {
    id: "kw-14",
    type: "need",
    title: "University Student Iftar Fund",
    orgName: "UW Muslim Students Association",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "University of Waterloo",
    zakatEligible: false,
    locationLabel: "Waterloo, ON",
    lat: 43.4723,
    lng: -80.5449,
    lastUpdated: "4 hours ago",
    fundingRaised: 4500,
    goal: 8000,
    privacyLevel: "global_ok",
    description: "Daily iftar meals for students during Ramadan at UW campus.",
    countryCode: "CA"
  },
  {
    id: "kw-15",
    type: "organization",
    title: "Kitchener Masjid An-Nur",
    orgName: "Masjid An-Nur",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Kitchener, ON",
    lat: 43.4356,
    lng: -80.4823,
    lastUpdated: "12 hours ago",
    fundingRaised: 42000,
    goal: 100000,
    privacyLevel: "global_ok",
    description: "Prayer space expansion and parking lot improvement project.",
    countryCode: "CA"
  },
  {
    id: "kw-16",
    type: "need",
    title: "Newcomer Welcome Program",
    orgName: "KW Multicultural Centre",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "City of Kitchener",
    zakatEligible: true,
    locationLabel: "Kitchener, ON",
    lat: 43.4501,
    lng: -80.4867,
    lastUpdated: "3 hours ago",
    fundingRaised: 15000,
    goal: 30000,
    privacyLevel: "global_ok",
    description: "Settlement support and housing deposits for newly arrived immigrant families.",
    countryCode: "CA"
  }
];

// Local Ontario pins that explicitly fundraise for Palestine
const palestineFundraisersOntario: MapItem[] = [
  // Kitchener-Waterloo Area
  {
    id: "ps-kw-1",
    type: "appeal",
    title: "KW for Gaza Emergency Relief",
    orgName: "Islamic Relief Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Kitchener, ON",
    lat: 43.4516,
    lng: -80.4925,
    lastUpdated: "2 hours ago",
    fundingRaised: 185000,
    goal: 350000,
    privacyLevel: "global_ok",
    description: "Local Kitchener-Waterloo community fundraiser for medical supplies and emergency relief in Gaza.",
    countryCode: "CA"
  },
  {
    id: "ps-kw-2",
    type: "need",
    title: "Waterloo Masjid Gaza Fund",
    orgName: "Islamic Centre of Waterloo",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "Waterloo Masjid",
    zakatEligible: true,
    locationLabel: "Waterloo, ON",
    lat: 43.4701,
    lng: -80.5156,
    lastUpdated: "4 hours ago",
    fundingRaised: 92000,
    goal: 200000,
    privacyLevel: "global_ok",
    description: "Community-driven food relief campaign for families in Gaza, organized by local masjid.",
    countryCode: "CA"
  },
  {
    id: "ps-kw-3",
    type: "appeal",
    title: "Cambridge Palestine Relief Drive",
    orgName: "Human Concern International",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "HCI Canada",
    zakatEligible: true,
    locationLabel: "Cambridge, ON",
    lat: 43.3601,
    lng: -80.3123,
    lastUpdated: "6 hours ago",
    fundingRaised: 45000,
    goal: 100000,
    privacyLevel: "global_ok",
    description: "Emergency shelter materials and humanitarian aid for displaced Palestinian families.",
    countryCode: "CA"
  },
  {
    id: "ps-kw-4",
    type: "need",
    title: "UW Students for Palestine",
    orgName: "UW Muslim Students Association",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Waterloo, ON",
    lat: 43.4723,
    lng: -80.5449,
    lastUpdated: "3 hours ago",
    fundingRaised: 28000,
    goal: 50000,
    privacyLevel: "global_ok",
    description: "Student-led initiative providing educational support and supplies for Palestinian children.",
    countryCode: "CA"
  },
  // Toronto & GTA
  {
    id: "ps-to-1",
    type: "appeal",
    title: "Toronto Emergency Gaza Response",
    orgName: "Islamic Relief Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.6532,
    lng: -79.3832,
    lastUpdated: "1 hour ago",
    fundingRaised: 1250000,
    goal: 2500000,
    privacyLevel: "global_ok",
    description: "Major Toronto fundraising campaign for emergency medical relief and humanitarian aid in Gaza.",
    countryCode: "CA"
  },
  {
    id: "ps-to-2",
    type: "need",
    title: "GTA Palestine Food Relief",
    orgName: "Muslim Welfare Centre of Toronto",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Scarborough, ON",
    lat: 43.7731,
    lng: -79.2578,
    lastUpdated: "3 hours ago",
    fundingRaised: 320000,
    goal: 600000,
    privacyLevel: "global_ok",
    description: "Food packages and essential supplies for families affected by the Gaza crisis.",
    countryCode: "CA"
  },
  {
    id: "ps-to-3",
    type: "appeal",
    title: "Mississauga Gaza Medical Fund",
    orgName: "Penny Appeal Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Mississauga, ON",
    lat: 43.5890,
    lng: -79.6441,
    lastUpdated: "5 hours ago",
    fundingRaised: 175000,
    goal: 400000,
    privacyLevel: "global_ok",
    description: "Medical supplies and emergency healthcare support for hospitals in Gaza.",
    countryCode: "CA"
  },
  {
    id: "ps-to-4",
    type: "need",
    title: "ISNA Palestine Emergency Appeal",
    orgName: "Islamic Society of North America",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "ISNA Canada",
    zakatEligible: true,
    locationLabel: "Mississauga, ON",
    lat: 43.6048,
    lng: -79.6560,
    lastUpdated: "2 hours ago",
    fundingRaised: 480000,
    goal: 1000000,
    privacyLevel: "global_ok",
    description: "Emergency shelter and humanitarian relief for displaced families in Palestine.",
    countryCode: "CA"
  },
  {
    id: "ps-to-5",
    type: "appeal",
    title: "Brampton Masjid Gaza Relief",
    orgName: "Brampton Islamic Centre",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "Brampton Islamic Centre",
    zakatEligible: true,
    locationLabel: "Brampton, ON",
    lat: 43.7315,
    lng: -79.7624,
    lastUpdated: "4 hours ago",
    fundingRaised: 128000,
    goal: 300000,
    privacyLevel: "global_ok",
    description: "Community masjid fundraiser for emergency food relief in Gaza.",
    countryCode: "CA"
  },
  {
    id: "ps-to-6",
    type: "need",
    title: "NZF Gaza Zakat Campaign",
    orgName: "National Zakat Foundation Canada",
    category: "Zakat",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.6632,
    lng: -79.3932,
    lastUpdated: "1 hour ago",
    fundingRaised: 850000,
    goal: 1500000,
    privacyLevel: "global_ok",
    description: "100% Zakat distribution to verified eligible recipients in Gaza and West Bank.",
    countryCode: "CA"
  }
];

// Ontario (Provincial) - Real Canadian charities and organizations
const ontarioRealItems: MapItem[] = [
  // Major Canadian Islamic Charities - Toronto & GTA
  {
    id: "on-1",
    type: "organization",
    title: "Islamic Relief Canada",
    orgName: "Islamic Relief Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Burlington, ON",
    lat: 43.3255,
    lng: -79.7990,
    lastUpdated: "2 hours ago",
    fundingRaised: 2850000,
    goal: 5000000,
    privacyLevel: "global_ok",
    description: "One of Canada's largest Muslim charities providing emergency relief and development worldwide.",
    countryCode: "CA"
  },
  {
    id: "on-2",
    type: "organization",
    title: "Human Concern International",
    orgName: "Human Concern International",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Ottawa, ON",
    lat: 45.4215,
    lng: -75.6972,
    lastUpdated: "3 hours ago",
    fundingRaised: 1200000,
    goal: 2500000,
    privacyLevel: "global_ok",
    description: "Serving humanity since 1980 with emergency relief, development, and orphan care programs.",
    countryCode: "CA"
  },
  {
    id: "on-3",
    type: "organization",
    title: "Penny Appeal Canada",
    orgName: "Penny Appeal Canada",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Mississauga, ON",
    lat: 43.5890,
    lng: -79.6441,
    lastUpdated: "1 hour ago",
    fundingRaised: 680000,
    goal: 1200000,
    privacyLevel: "global_ok",
    description: "Transforming small change into big impact through education, healthcare, and emergency relief.",
    countryCode: "CA"
  },
  {
    id: "on-4",
    type: "organization",
    title: "ISNA Canada Food Bank",
    orgName: "Islamic Society of North America",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "ISNA Canada",
    zakatEligible: true,
    locationLabel: "Mississauga, ON",
    lat: 43.6048,
    lng: -79.6560,
    lastUpdated: "4 hours ago",
    fundingRaised: 320000,
    goal: 500000,
    privacyLevel: "global_ok",
    description: "Weekly halal food bank serving 800+ families across the Peel region.",
    countryCode: "CA"
  },
  {
    id: "on-5",
    type: "organization",
    title: "National Zakat Foundation",
    orgName: "National Zakat Foundation Canada",
    category: "Zakat",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.6532,
    lng: -79.3832,
    lastUpdated: "1 hour ago",
    fundingRaised: 1450000,
    goal: 2000000,
    privacyLevel: "global_ok",
    description: "Canada's leading Zakat distribution organization ensuring 100% of Zakat reaches eligible recipients.",
    countryCode: "CA"
  },
  {
    id: "on-6",
    type: "organization",
    title: "Muslim Welfare Centre",
    orgName: "Muslim Welfare Centre of Toronto",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Scarborough, ON",
    lat: 43.7731,
    lng: -79.2578,
    lastUpdated: "5 hours ago",
    fundingRaised: 890000,
    goal: 1500000,
    privacyLevel: "global_ok",
    description: "Comprehensive community services including food bank, shelter support, and family counselling.",
    countryCode: "CA"
  },
  {
    id: "on-7",
    type: "need",
    title: "Winter Relief Program",
    orgName: "Muslim Welfare Centre",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.7001,
    lng: -79.4163,
    lastUpdated: "6 hours ago",
    fundingRaised: 125000,
    goal: 250000,
    privacyLevel: "global_ok",
    description: "Providing warm shelter, winter clothing, and heating support for homeless and at-risk families.",
    countryCode: "CA"
  },
  {
    id: "on-8",
    type: "fidya_partner",
    title: "Barakah Bites GTA",
    orgName: "Barakah Bites Restaurant",
    category: "Fidya",
    verifiedStatus: "verified",
    endorsedBy: "Masjid Toronto",
    zakatEligible: false,
    locationLabel: "Greater Toronto Area",
    lat: 43.7201,
    lng: -79.3863,
    lastUpdated: "1 day ago",
    privacyLevel: "local_private",
    description: "Verified restaurant partner for Fidya meal distribution across the GTA.",
    countryCode: "CA"
  },
  {
    id: "on-9",
    type: "qurbani_partner",
    title: "MAC Qurbani Program",
    orgName: "Muslim Association of Canada",
    category: "Qurbani",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Mississauga, ON",
    lat: 43.5480,
    lng: -79.6125,
    lastUpdated: "12 hours ago",
    privacyLevel: "global_ok",
    description: "Official Qurbani meat processing and distribution partner serving the GTA community.",
    countryCode: "CA"
  },
  // Ottawa
  {
    id: "on-10",
    type: "organization",
    title: "Ottawa Muslim Association",
    orgName: "Ottawa Muslim Association",
    category: "Masjid",
    verifiedStatus: "verified",
    endorsedBy: "NCCM",
    zakatEligible: false,
    locationLabel: "Ottawa, ON",
    lat: 45.3970,
    lng: -75.7138,
    lastUpdated: "8 hours ago",
    fundingRaised: 520000,
    goal: 900000,
    privacyLevel: "global_ok",
    description: "Central mosque expansion and community programming for Ottawa's Muslim population.",
    countryCode: "CA"
  },
  {
    id: "on-11",
    type: "need",
    title: "Syrian Refugee Resettlement",
    orgName: "Refugee 613",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "Ottawa Muslim Association",
    zakatEligible: true,
    locationLabel: "Ottawa, ON",
    lat: 45.4115,
    lng: -75.6872,
    lastUpdated: "2 days ago",
    fundingRaised: 48000,
    goal: 80000,
    privacyLevel: "global_ok",
    description: "Housing deposits and first-month essentials for newly arrived refugee families.",
    countryCode: "CA"
  },
  // London
  {
    id: "on-12",
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
    fundingRaised: 280000,
    goal: 600000,
    privacyLevel: "global_ok",
    description: "Community services, prayer facilities, and educational programs for London Muslims.",
    countryCode: "CA"
  },
  {
    id: "on-13",
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
    fundingRaised: 12500,
    goal: 25000,
    privacyLevel: "global_ok",
    description: "Essential medical equipment for the community health clinic serving uninsured residents.",
    countryCode: "CA"
  },
  // Hamilton
  {
    id: "on-14",
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
    description: "Preparing and delivering Fidya meals to eligible recipients in Hamilton area.",
    countryCode: "CA"
  },
  {
    id: "on-15",
    type: "need",
    title: "Hamilton Food Security",
    orgName: "Hamilton Muslim Association",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Hamilton, ON",
    lat: 43.2501,
    lng: -79.8496,
    lastUpdated: "6 hours ago",
    fundingRaised: 22000,
    goal: 45000,
    privacyLevel: "global_ok",
    description: "Monthly grocery support for families facing food insecurity in the Hamilton region.",
    countryCode: "CA"
  },
  // More GTA locations with real charities
  {
    id: "on-16",
    type: "organization",
    title: "IDRF Emergency Relief",
    orgName: "International Development & Relief Foundation",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.6689,
    lng: -79.3892,
    lastUpdated: "2 hours ago",
    fundingRaised: 920000,
    goal: 1800000,
    privacyLevel: "global_ok",
    description: "Healthcare and emergency relief programs for vulnerable communities worldwide.",
    countryCode: "CA"
  },
  {
    id: "on-17",
    type: "need",
    title: "Orphan Sponsorship Program",
    orgName: "Human Concern International",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Ottawa, ON",
    lat: 45.4315,
    lng: -75.7072,
    lastUpdated: "3 hours ago",
    fundingRaised: 340000,
    goal: 500000,
    privacyLevel: "global_ok",
    description: "Long-term education and care support for orphaned children in 12 countries.",
    countryCode: "CA"
  },
  {
    id: "on-18",
    type: "appeal",
    title: "Water Well Campaign",
    orgName: "Penny Appeal Canada",
    category: "Medical",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Mississauga, ON",
    lat: 43.5790,
    lng: -79.6341,
    lastUpdated: "5 hours ago",
    fundingRaised: 85000,
    goal: 150000,
    privacyLevel: "global_ok",
    description: "Building clean water wells in water-scarce communities across Africa and Asia.",
    countryCode: "CA"
  },
  // Brampton
  {
    id: "on-19",
    type: "organization",
    title: "Brampton Islamic Centre",
    orgName: "Brampton Islamic Centre",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Brampton, ON",
    lat: 43.7315,
    lng: -79.7624,
    lastUpdated: "1 day ago",
    fundingRaised: 420000,
    goal: 800000,
    privacyLevel: "global_ok",
    description: "Community expansion project including youth programs and family services.",
    countryCode: "CA"
  },
  {
    id: "on-20",
    type: "need",
    title: "New Muslim Support Fund",
    orgName: "Brampton Islamic Centre",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Brampton, ON",
    lat: 43.7215,
    lng: -79.7524,
    lastUpdated: "8 hours ago",
    fundingRaised: 8500,
    goal: 20000,
    privacyLevel: "global_ok",
    description: "Educational resources and community integration support for new Muslims.",
    countryCode: "CA"
  }
];

// Canada (outside Ontario) - Major cities with real charities
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
    fundingRaised: 650000,
    goal: 1200000,
    privacyLevel: "global_ok",
    description: "Community centre expansion and comprehensive youth programming.",
    countryCode: "CA"
  },
  {
    id: "ca-2",
    type: "need",
    title: "Vancouver Refugee Support",
    orgName: "Immigrant Services Society of BC",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Vancouver, BC",
    lat: 49.2601,
    lng: -123.1139,
    lastUpdated: "1 day ago",
    fundingRaised: 42000,
    goal: 75000,
    privacyLevel: "global_ok",
    description: "Settlement support and housing assistance for refugee families in Metro Vancouver.",
    countryCode: "CA"
  },
  {
    id: "ca-3",
    type: "organization",
    title: "Islamic Relief BC Office",
    orgName: "Islamic Relief Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Surrey, BC",
    lat: 49.1913,
    lng: -122.8490,
    lastUpdated: "3 hours ago",
    fundingRaised: 280000,
    goal: 500000,
    privacyLevel: "global_ok",
    description: "Regional coordination for food security and emergency relief in British Columbia.",
    countryCode: "CA"
  },
  // Alberta
  {
    id: "ca-4",
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
    fundingRaised: 145000,
    goal: 250000,
    privacyLevel: "global_ok",
    description: "Comprehensive Zakat distribution and family support services for Edmonton community.",
    countryCode: "CA"
  },
  {
    id: "ca-5",
    type: "need",
    title: "Calgary Halal Food Bank",
    orgName: "Muslim Families Network Society",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Calgary, AB",
    lat: 51.0447,
    lng: -114.0719,
    lastUpdated: "5 hours ago",
    fundingRaised: 68000,
    goal: 120000,
    privacyLevel: "global_ok",
    description: "Weekly halal food distribution in partnership with Calgary Food Bank.",
    countryCode: "CA"
  },
  {
    id: "ca-6",
    type: "organization",
    title: "Al Rashid Mosque",
    orgName: "Al Rashid Mosque",
    category: "Masjid",
    verifiedStatus: "verified",
    endorsedBy: "Canada's First Mosque",
    zakatEligible: false,
    locationLabel: "Edmonton, AB",
    lat: 53.5461,
    lng: -113.5207,
    lastUpdated: "1 day ago",
    fundingRaised: 380000,
    goal: 700000,
    privacyLevel: "global_ok",
    description: "Historic mosque preservation and community programming expansion.",
    countryCode: "CA"
  },
  // Quebec
  {
    id: "ca-7",
    type: "organization",
    title: "Montreal Muslim Community Services",
    orgName: "Muslim Council of Montreal",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Montreal, QC",
    lat: 45.5017,
    lng: -73.5673,
    lastUpdated: "8 hours ago",
    fundingRaised: 95000,
    goal: 180000,
    privacyLevel: "global_ok",
    description: "Weekend Islamic school and youth education programs for Montreal families.",
    countryCode: "CA"
  },
  {
    id: "ca-8",
    type: "need",
    title: "Quebec City Refugee Aid",
    orgName: "Centre Islamique de Québec",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Quebec City, QC",
    lat: 46.8139,
    lng: -71.2080,
    lastUpdated: "12 hours ago",
    fundingRaised: 28000,
    goal: 50000,
    privacyLevel: "global_ok",
    description: "Integration support and housing assistance for newcomer families.",
    countryCode: "CA"
  },
  // Manitoba
  {
    id: "ca-9",
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
    fundingRaised: 18000,
    goal: 35000,
    privacyLevel: "global_ok",
    description: "Emergency heating supplies and winter essentials for vulnerable families.",
    countryCode: "CA"
  },
  // Atlantic Canada
  {
    id: "ca-10",
    type: "organization",
    title: "Halifax Islamic Centre",
    orgName: "Ummah Masjid & Community Centre",
    category: "Masjid",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Halifax, NS",
    lat: 44.6488,
    lng: -63.5752,
    lastUpdated: "6 hours ago",
    fundingRaised: 120000,
    goal: 250000,
    privacyLevel: "global_ok",
    description: "Community expansion serving Atlantic Canada's growing Muslim population.",
    countryCode: "CA"
  }
];

// Global - High-need regions with detailed entries
// Palestine pins - Canadian orgs supporting Palestine relief (pins placed at high-need locations)
const palestineGlobalItems: MapItem[] = [
  // Gaza City - Canadian orgs supporting Gaza
  {
    id: "ps-gl-1",
    type: "appeal",
    title: "Gaza City Emergency Response",
    orgName: "Islamic Relief Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Gaza City, Palestine",
    lat: 31.5018,
    lng: 34.4668,
    lastUpdated: "1 hour ago",
    fundingRaised: 2850000,
    goal: 5000000,
    privacyLevel: "global_ok",
    description: "Canadian Islamic Relief campaign for emergency medical supplies and healthcare support in Gaza City hospitals.",
    countryCode: "PS"
  },
  {
    id: "ps-gl-2",
    type: "need",
    title: "Gaza Food Security Program",
    orgName: "Human Concern International",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Gaza City, Palestine",
    lat: 31.51,
    lng: 34.45,
    lastUpdated: "2 hours ago",
    fundingRaised: 1450000,
    goal: 3000000,
    privacyLevel: "global_ok",
    description: "HCI Canada emergency food distribution providing daily meals for 15,000+ families in Gaza.",
    countryCode: "PS"
  },
  // Khan Younis
  {
    id: "ps-gl-3",
    type: "appeal",
    title: "Khan Younis Medical Crisis",
    orgName: "Penny Appeal Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Khan Younis, Palestine",
    lat: 31.3462,
    lng: 34.3062,
    lastUpdated: "3 hours ago",
    fundingRaised: 680000,
    goal: 1500000,
    privacyLevel: "global_ok",
    description: "Penny Appeal Canada providing surgical supplies and emergency medical equipment for Khan Younis hospitals.",
    countryCode: "PS"
  },
  {
    id: "ps-gl-4",
    type: "need",
    title: "Khan Younis Shelter Relief",
    orgName: "Muslim Welfare Centre",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Khan Younis, Palestine",
    lat: 31.35,
    lng: 34.31,
    lastUpdated: "4 hours ago",
    fundingRaised: 420000,
    goal: 900000,
    privacyLevel: "global_ok",
    description: "Emergency shelter materials and temporary housing for displaced families in Khan Younis.",
    countryCode: "PS"
  },
  // Rafah
  {
    id: "ps-gl-5",
    type: "appeal",
    title: "Rafah Humanitarian Aid",
    orgName: "Islamic Relief Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Rafah, Palestine",
    lat: 31.2969,
    lng: 34.2455,
    lastUpdated: "1 hour ago",
    fundingRaised: 1120000,
    goal: 2500000,
    privacyLevel: "global_ok",
    description: "Islamic Relief Canada emergency food and essential supply distribution at the Rafah border area.",
    countryCode: "PS"
  },
  {
    id: "ps-gl-6",
    type: "need",
    title: "Rafah Children's Education",
    orgName: "Human Concern International",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Rafah, Palestine",
    lat: 31.29,
    lng: 34.25,
    lastUpdated: "5 hours ago",
    fundingRaised: 185000,
    goal: 400000,
    privacyLevel: "global_ok",
    description: "Educational support and psychological care for children affected by the crisis in Rafah.",
    countryCode: "PS"
  },
  // Deir al-Balah
  {
    id: "ps-gl-7",
    type: "need",
    title: "Deir al-Balah Food Relief",
    orgName: "National Zakat Foundation Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Deir al-Balah, Palestine",
    lat: 31.4182,
    lng: 34.3506,
    lastUpdated: "3 hours ago",
    fundingRaised: 520000,
    goal: 1200000,
    privacyLevel: "global_ok",
    description: "NZF Canada daily meal distribution and food packages for displaced populations.",
    countryCode: "PS"
  },
  {
    id: "ps-gl-8",
    type: "appeal",
    title: "Deir al-Balah Medical Center",
    orgName: "Penny Appeal Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Deir al-Balah, Palestine",
    lat: 31.42,
    lng: 34.35,
    lastUpdated: "2 hours ago",
    fundingRaised: 340000,
    goal: 700000,
    privacyLevel: "global_ok",
    description: "Emergency medical care and surgical support for wounded civilians through Penny Appeal Canada.",
    countryCode: "PS"
  },
  // Jabalia
  {
    id: "ps-gl-9",
    type: "need",
    title: "Jabalia Camp Emergency Aid",
    orgName: "Islamic Relief Canada",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Jabalia, Palestine",
    lat: 31.5275,
    lng: 34.4833,
    lastUpdated: "2 hours ago",
    fundingRaised: 780000,
    goal: 1800000,
    privacyLevel: "global_ok",
    description: "Emergency shelter and humanitarian supplies for Jabalia refugee camp residents.",
    countryCode: "PS"
  },
  // Gaza Zakat
  {
    id: "ps-gl-10",
    type: "organization",
    title: "Gaza Zakat Distribution",
    orgName: "National Zakat Foundation Canada",
    category: "Zakat",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Gaza, Palestine",
    lat: 31.48,
    lng: 34.44,
    lastUpdated: "1 hour ago",
    fundingRaised: 1350000,
    goal: 2500000,
    privacyLevel: "global_ok",
    description: "100% Zakat distribution to verified eligible families in Gaza through NZF Canada's partner network.",
    countryCode: "PS"
  },
  // West Bank - Nablus
  {
    id: "ps-gl-11",
    type: "need",
    title: "Nablus Community Support",
    orgName: "Human Concern International",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Nablus, Palestine",
    lat: 32.2211,
    lng: 35.2544,
    lastUpdated: "6 hours ago",
    fundingRaised: 145000,
    goal: 350000,
    privacyLevel: "global_ok",
    description: "HCI Canada food security and community support programs for families in Nablus.",
    countryCode: "PS"
  },
  // Hebron
  {
    id: "ps-gl-12",
    type: "appeal",
    title: "Hebron Medical Services",
    orgName: "Penny Appeal Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Hebron, Palestine",
    lat: 31.5326,
    lng: 35.0998,
    lastUpdated: "8 hours ago",
    fundingRaised: 98000,
    goal: 220000,
    privacyLevel: "global_ok",
    description: "Emergency medical services and healthcare support for Hebron communities.",
    countryCode: "PS"
  },
  // Ramallah
  {
    id: "ps-gl-13",
    type: "need",
    title: "Ramallah Education Fund",
    orgName: "Islamic Relief Canada",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Ramallah, Palestine",
    lat: 31.9038,
    lng: 35.2034,
    lastUpdated: "5 hours ago",
    fundingRaised: 72000,
    goal: 180000,
    privacyLevel: "global_ok",
    description: "Educational scholarships and school supplies for students in Ramallah through Islamic Relief.",
    countryCode: "PS"
  },
  // Jerusalem
  {
    id: "ps-gl-14",
    type: "organization",
    title: "Al-Aqsa Support Fund",
    orgName: "Muslim Welfare Centre",
    category: "Masjid",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: false,
    locationLabel: "Jerusalem, Palestine",
    lat: 31.7781,
    lng: 35.2356,
    lastUpdated: "4 hours ago",
    fundingRaised: 280000,
    goal: 600000,
    privacyLevel: "global_ok",
    description: "Supporting the preservation and community services at Al-Aqsa through Canadian Muslim organizations.",
    countryCode: "PS"
  },
  // Bethlehem
  {
    id: "ps-gl-15",
    type: "need",
    title: "Bethlehem Family Support",
    orgName: "Human Concern International",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Bethlehem, Palestine",
    lat: 31.7054,
    lng: 35.2024,
    lastUpdated: "6 hours ago",
    fundingRaised: 65000,
    goal: 150000,
    privacyLevel: "global_ok",
    description: "Housing assistance and family support services for vulnerable families in Bethlehem.",
    countryCode: "PS"
  }
];

const globalRealItems: MapItem[] = [
  // Include all Palestine items from Canadian orgs
  ...palestineGlobalItems,
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
    fundingRaised: 620000,
    goal: 1000000,
    privacyLevel: "global_ok",
    description: "Rebuilding homes and infrastructure destroyed by recent flooding.",
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
    fundingRaised: 128000,
    goal: 280000,
    privacyLevel: "global_ok",
    description: "Education and comprehensive care for orphaned children.",
    countryCode: "PK"
  },
  // Lebanon - High-need region
  {
    id: "gl-15",
    type: "need",
    title: "Lebanon Economic Crisis Relief",
    orgName: "Islamic Relief Lebanon",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "Islamic Relief Worldwide",
    zakatEligible: true,
    locationLabel: "Beirut, Lebanon",
    lat: 33.8938,
    lng: 35.5018,
    lastUpdated: "2 hours ago",
    fundingRaised: 380000,
    goal: 750000,
    privacyLevel: "global_ok",
    description: "Emergency food and essential supplies for families affected by economic collapse.",
    countryCode: "LB"
  },
  {
    id: "gl-16",
    type: "appeal",
    title: "Lebanese Syrian Refugee Support",
    orgName: "Human Concern International",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Tripoli, Lebanon",
    lat: 34.4367,
    lng: 35.8497,
    lastUpdated: "6 hours ago",
    fundingRaised: 145000,
    goal: 300000,
    privacyLevel: "global_ok",
    description: "Housing and integration support for Syrian refugees in northern Lebanon.",
    countryCode: "LB"
  },
  // Afghanistan - High-need region
  {
    id: "gl-17",
    type: "need",
    title: "Afghanistan Hunger Crisis",
    orgName: "Islamic Relief",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "UN World Food Programme",
    zakatEligible: true,
    locationLabel: "Kabul, Afghanistan",
    lat: 34.5281,
    lng: 69.1723,
    lastUpdated: "1 hour ago",
    fundingRaised: 520000,
    goal: 1200000,
    privacyLevel: "global_ok",
    description: "Emergency food distribution for families facing severe food insecurity.",
    countryCode: "AF"
  },
  {
    id: "gl-18",
    type: "appeal",
    title: "Afghan Women's Healthcare",
    orgName: "Doctors Worldwide",
    category: "Medical",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Herat, Afghanistan",
    lat: 34.3529,
    lng: 62.2040,
    lastUpdated: "8 hours ago",
    fundingRaised: 85000,
    goal: 200000,
    privacyLevel: "global_ok",
    description: "Maternal healthcare and medical services for women in western Afghanistan.",
    countryCode: "AF"
  },
  {
    id: "gl-19",
    type: "organization",
    title: "Afghan Orphan Education",
    orgName: "Penny Appeal",
    category: "Education",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Mazar-i-Sharif, Afghanistan",
    lat: 36.7069,
    lng: 67.1147,
    lastUpdated: "1 day ago",
    fundingRaised: 62000,
    goal: 120000,
    privacyLevel: "global_ok",
    description: "Education programs and school supplies for orphaned children.",
    countryCode: "AF"
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
// LEBANON RELIEF - Canadian organizations supporting Lebanon
// ============================================

const lebanonReliefItems: MapItem[] = [
  // Beirut
  {
    id: "lb-1",
    type: "appeal",
    title: "Beirut Emergency Relief Fund",
    orgName: "Islamic Relief Canada",
    category: "Medical",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Beirut, Lebanon",
    lat: 33.8938,
    lng: 35.5018,
    lastUpdated: "2 hours ago",
    fundingRaised: 425000,
    goal: 800000,
    privacyLevel: "global_ok",
    description: "Canadian-led emergency medical relief and humanitarian aid for families affected by the crisis in Beirut.",
    countryCode: "LB"
  },
  {
    id: "lb-2",
    type: "need",
    title: "Lebanon Food Security Program",
    orgName: "Human Concern International",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "HCI Canada",
    zakatEligible: true,
    locationLabel: "Beirut, Lebanon",
    lat: 33.8886,
    lng: 35.4955,
    lastUpdated: "3 hours ago",
    fundingRaised: 195000,
    goal: 400000,
    privacyLevel: "global_ok",
    description: "Monthly food packages and essential supplies for 2,500+ vulnerable families across Beirut.",
    countryCode: "LB"
  },
  // Tripoli
  {
    id: "lb-3",
    type: "appeal",
    title: "Tripoli Shelter Reconstruction",
    orgName: "Penny Appeal Canada",
    category: "Shelter",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Tripoli, Lebanon",
    lat: 34.4367,
    lng: 35.8497,
    lastUpdated: "4 hours ago",
    fundingRaised: 312000,
    goal: 600000,
    privacyLevel: "global_ok",
    description: "Rebuilding homes and providing temporary shelter for displaced families in Tripoli and northern Lebanon.",
    countryCode: "LB"
  },
  {
    id: "lb-4",
    type: "need",
    title: "North Lebanon Medical Clinic",
    orgName: "Muslim Welfare Centre",
    category: "Medical",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Tripoli, Lebanon",
    lat: 34.4420,
    lng: 35.8320,
    lastUpdated: "5 hours ago",
    fundingRaised: 87000,
    goal: 200000,
    privacyLevel: "global_ok",
    description: "Operating a free medical clinic providing essential healthcare to underserved communities in Tripoli.",
    countryCode: "LB"
  },
  // Sidon
  {
    id: "lb-5",
    type: "appeal",
    title: "Sidon Orphan Care Program",
    orgName: "Islamic Relief Canada",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "CRA Registered Charity",
    zakatEligible: true,
    locationLabel: "Sidon, Lebanon",
    lat: 33.5633,
    lng: 35.3719,
    lastUpdated: "1 hour ago",
    fundingRaised: 156000,
    goal: 300000,
    privacyLevel: "global_ok",
    description: "Comprehensive orphan sponsorship including education, healthcare, and family support in Sidon.",
    countryCode: "LB"
  },
  // Tyre
  {
    id: "lb-6",
    type: "need",
    title: "Tyre Community Kitchen",
    orgName: "Human Concern International",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "HCI Canada",
    zakatEligible: true,
    locationLabel: "Tyre, Lebanon",
    lat: 33.2705,
    lng: 35.2038,
    lastUpdated: "6 hours ago",
    fundingRaised: 62000,
    goal: 150000,
    privacyLevel: "global_ok",
    description: "Daily hot meals for 800+ families and elderly residents in Tyre and surrounding villages.",
    countryCode: "LB"
  },
  // Baalbek
  {
    id: "lb-7",
    type: "appeal",
    title: "Baalbek Winter Relief",
    orgName: "Penny Appeal Canada",
    category: "Shelter",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Baalbek, Lebanon",
    lat: 34.0047,
    lng: 36.2110,
    lastUpdated: "2 hours ago",
    fundingRaised: 98000,
    goal: 250000,
    privacyLevel: "global_ok",
    description: "Winter heating fuel, blankets, and warm clothing for families in the Bekaa Valley.",
    countryCode: "LB"
  },
  // Zahle
  {
    id: "lb-8",
    type: "need",
    title: "Zahle Refugee Support",
    orgName: "National Zakat Foundation Canada",
    category: "Zakat",
    verifiedStatus: "verified",
    endorsedBy: "NZF Canada",
    zakatEligible: true,
    locationLabel: "Zahle, Lebanon",
    lat: 33.8463,
    lng: 35.9020,
    lastUpdated: "4 hours ago",
    fundingRaised: 234000,
    goal: 500000,
    privacyLevel: "global_ok",
    description: "Zakat-eligible support for Syrian and Palestinian refugees in the Bekaa Valley region.",
    countryCode: "LB"
  },
  // Beirut - Additional
  {
    id: "lb-9",
    type: "organization",
    title: "Lebanon Masjid Restoration",
    orgName: "MAC Lebanon Relief",
    category: "Masjid",
    verifiedStatus: "verified",
    endorsedBy: "Muslim Association of Canada",
    zakatEligible: false,
    locationLabel: "Beirut, Lebanon",
    lat: 33.9010,
    lng: 35.4780,
    lastUpdated: "1 day ago",
    fundingRaised: 145000,
    goal: 350000,
    privacyLevel: "global_ok",
    description: "Restoring damaged masajid and community centres across Beirut following the port explosion.",
    countryCode: "LB"
  },
  // Sidon - Education
  {
    id: "lb-10",
    type: "need",
    title: "Lebanon School Supplies Drive",
    orgName: "ISNA Canada",
    category: "Education",
    verifiedStatus: "verified",
    endorsedBy: "ISNA Canada",
    zakatEligible: false,
    locationLabel: "Sidon, Lebanon",
    lat: 33.5580,
    lng: 35.3850,
    lastUpdated: "3 hours ago",
    fundingRaised: 42000,
    goal: 100000,
    privacyLevel: "global_ok",
    description: "School supplies, uniforms, and tuition support for 1,200 students in South Lebanon.",
    countryCode: "LB"
  }
];

// ============================================
// COMBINED EXPORTS
// ============================================

// All real items (shown in cards)
export const realMapItems: MapItem[] = [
  ...kitchenerWaterlooItems,
  ...palestineFundraisersOntario,
  ...ontarioRealItems,
  ...canadaRealItems,
  ...globalRealItems,
  ...lebanonReliefItems
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
  return item.id.startsWith("kw-") || item.id.startsWith("ps-kw-") || (
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
