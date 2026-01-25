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
}

// Ontario-focused sample data with global entries
export const mapItems: MapItem[] = [
  // Ontario - Toronto Area
  {
    id: "map-1",
    type: "organization",
    title: "Islamic Relief Canada",
    orgName: "Islamic Relief Canada",
    category: "Food",
    verifiedStatus: "verified",
    endorsedBy: "Islamic Society of Toronto",
    zakatEligible: true,
    locationLabel: "Toronto, ON",
    lat: 43.6532,
    lng: -79.3832,
    lastUpdated: "2 hours ago",
    privacyLevel: "global_ok",
    description: "Emergency food assistance and sustainable livelihoods programs.",
    countryCode: "CA"
  },
  {
    id: "map-2",
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
    id: "map-3",
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
    description: "Verified restaurant partner for Fidya meal distribution.",
    countryCode: "CA"
  },
  // Mississauga
  {
    id: "map-4",
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
    privacyLevel: "global_ok",
    description: "Weekly food bank serving 500+ families in the Peel region.",
    countryCode: "CA"
  },
  {
    id: "map-5",
    type: "qurbani_partner",
    title: "Qurbani Distribution Centre",
    orgName: "Muslim Association of Canada",
    category: "Qurbani",
    verifiedStatus: "verified",
    zakatEligible: false,
    locationLabel: "Mississauga, ON",
    lat: 43.5480,
    lng: -79.6125,
    lastUpdated: "12 hours ago",
    privacyLevel: "global_ok",
    description: "Official Qurbani meat processing and distribution partner.",
    countryCode: "CA"
  },
  // Kitchener-Waterloo
  {
    id: "map-6",
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
    lastUpdated: "6 hours ago",
    fundingRaised: 12000,
    goal: 20000,
    privacyLevel: "global_ok",
    description: "Supporting Muslim students facing unexpected financial hardship.",
    countryCode: "CA"
  },
  // London
  {
    id: "map-7",
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
    privacyLevel: "global_ok",
    description: "Community services, prayer facilities, and educational programs.",
    countryCode: "CA"
  },
  {
    id: "map-8",
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
  // Ottawa
  {
    id: "map-9",
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
    privacyLevel: "global_ok",
    description: "Central mosque and community hub for Ottawa's Muslim population.",
    countryCode: "CA"
  },
  {
    id: "map-10",
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
  // Hamilton
  {
    id: "map-11",
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
  // Global entries
  {
    id: "map-12",
    type: "need",
    title: "Gaza Emergency Relief",
    orgName: "UNRWA",
    category: "Medical",
    verifiedStatus: "verified",
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
    id: "map-13",
    type: "appeal",
    title: "Syria Winterization",
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
    id: "map-14",
    type: "organization",
    title: "Bangladesh Flood Response",
    orgName: "Muslim Aid",
    category: "Food",
    verifiedStatus: "verified",
    zakatEligible: true,
    locationLabel: "Sylhet, Bangladesh",
    lat: 24.8949,
    lng: 91.8687,
    lastUpdated: "6 hours ago",
    privacyLevel: "global_ok",
    description: "Emergency food packages for flood-affected communities.",
    countryCode: "BD"
  },
  {
    id: "map-15",
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
  }
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

// Canada bounds for focused view
export const CANADA_BOUNDS: [[number, number], [number, number]] = [[-141, 41.7], [-52, 83.1]];
export const CANADA_CENTER = { lat: 56.13, lng: -106.35 };
export const CANADA_ZOOM = 3.2;

// Global view settings
export const GLOBAL_CENTER = { lat: 30, lng: 20 };
export const GLOBAL_ZOOM = 1.8;

// Local view settings
export const LOCAL_ZOOM = 12;
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
