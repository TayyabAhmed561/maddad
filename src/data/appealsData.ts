// Centralized community appeals data with full metadata for detail pages

export interface AppealEndorser {
  type: "masjid" | "organization";
  name: string;
}

export interface AppealUpdate {
  id: string;
  date: string;
  content: string;
  author: string;
}

export interface AppealVerification {
  label: string;
  verified: boolean;
  verifier?: string;
}

export interface TransparencyEntry {
  id: string;
  date: string;
  action: string;
  verifier: string;
}

export type AppealCategory = "medical" | "disaster" | "education" | "housing";

export interface CommunityAppeal {
  id: string;
  title: string;
  beneficiary: string;
  category: AppealCategory;
  location: string;
  raised: number;
  goal: number;
  endorsedBy: AppealEndorser;
  lastUpdated: string;
  description: string;
  zakatEligible: boolean;
  coverageItems: string[];
  updates: AppealUpdate[];
  verificationChecks: AppealVerification[];
  transparencyLog: TransparencyEntry[];
}

export const categoryLabels: Record<AppealCategory, { label: string; color: string }> = {
  medical: { 
    label: "Medical", 
    color: "bg-red-50 text-red-700 border-red-200" 
  },
  disaster: { 
    label: "Disaster Relief", 
    color: "bg-orange-50 text-orange-700 border-orange-200" 
  },
  education: { 
    label: "Education", 
    color: "bg-purple-50 text-purple-700 border-purple-200" 
  },
  housing: { 
    label: "Housing", 
    color: "bg-blue-50 text-blue-700 border-blue-200" 
  }
};

export const appealsData: CommunityAppeal[] = [
  {
    id: "1",
    title: "Medical Treatment for Brother Ahmad",
    beneficiary: "Ahmad Hassan Family",
    category: "medical",
    location: "Chicago, IL",
    raised: 12500,
    goal: 25000,
    endorsedBy: { type: "masjid", name: "Masjid Al-Huda" },
    lastUpdated: "Updated 3 hours ago by family",
    description: "Brother Ahmad requires urgent kidney treatment. His family has been part of our community for 15 years. The treatment involves dialysis and potential transplant surgery. Your support will help cover medical bills and living expenses during recovery.",
    zakatEligible: true,
    coverageItems: [
      "Dialysis treatments (6 months)",
      "Transplant surgery costs",
      "Post-operative care",
      "Family living expenses during treatment"
    ],
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "Brother Ahmad completed his third dialysis session this week. Doctors are optimistic about his recovery.",
        author: "Family Representative"
      },
      {
        id: "u2",
        date: "January 18, 2024",
        content: "Transplant evaluation scheduled for next month. Thank you for your continued support.",
        author: "Ahmad Hassan Family"
      },
      {
        id: "u3",
        date: "January 10, 2024",
        content: "Appeal launched with endorsement from Masjid Al-Huda.",
        author: "Community Coordinator"
      }
    ],
    verificationChecks: [
      { label: "Medical condition verified", verified: true, verifier: "Hospital Documentation" },
      { label: "Masjid endorsement confirmed", verified: true, verifier: "Imam of Masjid Al-Huda" },
      { label: "Financial need assessed", verified: true, verifier: "Community Committee" },
      { label: "Identity verified", verified: true, verifier: "Masjid Records" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Released $4,000 for dialysis treatment", verifier: "Masjid Treasurer" },
      { id: "t2", date: "Jan 18", action: "Funds held in escrow for transplant", verifier: "Community Fund" },
      { id: "t3", date: "Jan 10", action: "Initial verification completed", verifier: "Masjid Committee" }
    ]
  },
  {
    id: "2",
    title: "House Fire Recovery - Fatima's Family",
    beneficiary: "Fatima Begum",
    category: "disaster",
    location: "Detroit, MI",
    raised: 8200,
    goal: 15000,
    endorsedBy: { type: "masjid", name: "Islamic Center of Detroit" },
    lastUpdated: "Updated 1 day ago by volunteers",
    description: "Sister Fatima lost her home in a fire last week. This appeal covers temporary housing, essential items, and helps the family get back on their feet. Fatima is a single mother of three children.",
    zakatEligible: true,
    coverageItems: [
      "Temporary housing (3 months)",
      "Essential furniture and appliances",
      "Children's school supplies",
      "Clothing and personal items"
    ],
    updates: [
      {
        id: "u1",
        date: "January 22, 2024",
        content: "Family moved into temporary housing. Children are back in school.",
        author: "Volunteer Coordinator"
      },
      {
        id: "u2",
        date: "January 17, 2024",
        content: "Emergency supplies delivered. Family is safe at community shelter.",
        author: "Islamic Center of Detroit"
      }
    ],
    verificationChecks: [
      { label: "Incident verified", verified: true, verifier: "Fire Department Report" },
      { label: "Masjid endorsement", verified: true, verifier: "Islamic Center of Detroit" },
      { label: "Family situation assessed", verified: true, verifier: "Social Services" },
      { label: "Fund usage plan approved", verified: true, verifier: "Community Committee" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 22", action: "Paid $2,500 for temporary housing deposit", verifier: "Masjid Treasurer" },
      { id: "t2", date: "Jan 17", action: "Released $1,200 for emergency supplies", verifier: "Volunteer Team" }
    ]
  },
  {
    id: "3",
    title: "College Tuition for Orphaned Student",
    beneficiary: "Yusuf Mohammed",
    category: "education",
    location: "Houston, TX",
    raised: 4500,
    goal: 12000,
    endorsedBy: { type: "organization", name: "Muslim Youth Foundation" },
    lastUpdated: "Updated 2 days ago",
    description: "Yusuf lost both parents in a car accident two years ago and needs support to continue his engineering degree. He is a junior at University of Houston with a 3.7 GPA.",
    zakatEligible: true,
    coverageItems: [
      "Spring semester tuition",
      "Textbooks and materials",
      "Housing expenses",
      "Living stipend"
    ],
    updates: [
      {
        id: "u1",
        date: "January 21, 2024",
        content: "Yusuf registered for spring classes. Tuition payment due February 1st.",
        author: "Muslim Youth Foundation"
      },
      {
        id: "u2",
        date: "January 12, 2024",
        content: "Appeal approved after thorough verification of circumstances.",
        author: "Foundation Director"
      }
    ],
    verificationChecks: [
      { label: "Orphan status verified", verified: true, verifier: "Legal Documentation" },
      { label: "Enrollment confirmed", verified: true, verifier: "University Registrar" },
      { label: "Academic standing verified", verified: true, verifier: "University Records" },
      { label: "Sponsor endorsement", verified: true, verifier: "Muslim Youth Foundation" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 21", action: "Reserved funds for tuition payment", verifier: "Foundation Treasurer" },
      { id: "t2", date: "Jan 12", action: "Completed verification process", verifier: "Foundation Committee" }
    ]
  },
  {
    id: "4",
    title: "Emergency Housing Assistance",
    beneficiary: "Al-Rahman Family",
    category: "housing",
    location: "Atlanta, GA",
    raised: 3200,
    goal: 8000,
    endorsedBy: { type: "masjid", name: "Atlanta Masjid" },
    lastUpdated: "Updated 5 hours ago",
    description: "A refugee family facing eviction needs immediate support for rent and deposit. The father recently lost his job and they have three young children.",
    zakatEligible: true,
    coverageItems: [
      "Back rent payment (2 months)",
      "Security deposit for new housing",
      "Moving expenses",
      "Emergency food assistance"
    ],
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "Negotiated with landlord for payment extension. Family has until February 15th.",
        author: "Case Manager"
      },
      {
        id: "u2",
        date: "January 20, 2024",
        content: "Father has job interview scheduled for next week.",
        author: "Atlanta Masjid"
      }
    ],
    verificationChecks: [
      { label: "Eviction notice verified", verified: true, verifier: "Legal Aid" },
      { label: "Refugee status confirmed", verified: true, verifier: "UNHCR Documentation" },
      { label: "Masjid endorsement", verified: true, verifier: "Atlanta Masjid Imam" },
      { label: "Family circumstances verified", verified: true, verifier: "Social Worker" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Negotiated payment plan with landlord", verifier: "Case Manager" },
      { id: "t2", date: "Jan 20", action: "Provided emergency food assistance", verifier: "Masjid Food Bank" }
    ]
  },
  {
    id: "5",
    title: "Cancer Treatment Support",
    beneficiary: "Sister Amina Abdullah",
    category: "medical",
    location: "Dallas, TX",
    raised: 18500,
    goal: 35000,
    endorsedBy: { type: "masjid", name: "Dallas Central Masjid" },
    lastUpdated: "Updated 6 hours ago",
    description: "Sister Amina was recently diagnosed with breast cancer and requires chemotherapy treatment. She is a widow with two teenage children and has no health insurance.",
    zakatEligible: true,
    coverageItems: [
      "Chemotherapy treatments (6 cycles)",
      "Medication costs",
      "Transportation to hospital",
      "Family support during treatment"
    ],
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "Completed second chemotherapy cycle. Doctors report positive response to treatment.",
        author: "Family Friend"
      },
      {
        id: "u2",
        date: "January 15, 2024",
        content: "Treatment plan finalized. Community support has been overwhelming.",
        author: "Dallas Central Masjid"
      }
    ],
    verificationChecks: [
      { label: "Medical diagnosis verified", verified: true, verifier: "Oncologist Report" },
      { label: "Treatment plan confirmed", verified: true, verifier: "Hospital Administration" },
      { label: "Financial need assessed", verified: true, verifier: "Masjid Committee" },
      { label: "Masjid endorsement", verified: true, verifier: "Imam of Dallas Central" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Released $6,000 for second treatment cycle", verifier: "Masjid Treasurer" },
      { id: "t2", date: "Jan 15", action: "Paid $8,000 for first treatment cycle", verifier: "Hospital Billing" }
    ]
  },
  {
    id: "6",
    title: "Flood Damage Recovery",
    beneficiary: "Ibrahim Jalloh Family",
    category: "disaster",
    location: "New Orleans, LA",
    raised: 6800,
    goal: 20000,
    endorsedBy: { type: "organization", name: "Louisiana Muslim Relief" },
    lastUpdated: "Updated 12 hours ago",
    description: "The Jalloh family's home was severely damaged in recent flooding. They need help with repairs, replacing damaged belongings, and temporary housing while repairs are completed.",
    zakatEligible: false,
    coverageItems: [
      "Home repair and restoration",
      "Replacement of damaged furniture",
      "Temporary housing (2 months)",
      "Children's belongings"
    ],
    updates: [
      {
        id: "u1",
        date: "January 22, 2024",
        content: "Damage assessment completed. Estimated repair cost is $15,000.",
        author: "Contractor"
      },
      {
        id: "u2",
        date: "January 18, 2024",
        content: "Family temporarily housed at community member's home.",
        author: "Louisiana Muslim Relief"
      }
    ],
    verificationChecks: [
      { label: "Flood damage verified", verified: true, verifier: "Insurance Adjuster" },
      { label: "Organization endorsement", verified: true, verifier: "Louisiana Muslim Relief" },
      { label: "Repair estimates verified", verified: true, verifier: "Licensed Contractor" },
      { label: "Family situation assessed", verified: true, verifier: "Relief Coordinator" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 22", action: "Reserved funds for initial repairs", verifier: "Relief Treasurer" },
      { id: "t2", date: "Jan 18", action: "Provided emergency supplies", verifier: "Volunteer Team" }
    ]
  }
];

// Helper function to get an appeal by ID
export function getAppealById(id: string): CommunityAppeal | undefined {
  return appealsData.find(appeal => appeal.id === id);
}

// Helper function to get appeals by category
export function getAppealsByCategory(category: AppealCategory): CommunityAppeal[] {
  return appealsData.filter(appeal => appeal.category === category);
}

// Helper function to get zakat-eligible appeals
export function getZakatEligibleAppeals(): CommunityAppeal[] {
  return appealsData.filter(appeal => appeal.zakatEligible);
}
