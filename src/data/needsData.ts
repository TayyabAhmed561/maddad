// Centralized needs data with full metadata for detail pages
import type { Category } from "@/components/CategoryTag";

export interface NeedUpdate {
  id: string;
  date: string;
  content: string;
  author: string;
}

export interface VerificationCheck {
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

export interface Need {
  id: string;
  title: string;
  organization: string;
  isVerified: boolean;
  category: Category;
  location: string;
  raised: number;
  goal: number;
  lastUpdated: string;
  description: string;
  coverageItems: string[];
  zakatEligible: boolean;
  updates: NeedUpdate[];
  verificationChecks: VerificationCheck[];
  transparencyLog: TransparencyEntry[];
}

export const needsData: Need[] = [
  {
    id: "1",
    title: "Emergency Food Distribution in Gaza",
    organization: "Palestine Relief Network",
    isVerified: true,
    category: "food",
    location: "Gaza, Palestine",
    raised: 45000,
    goal: 75000,
    lastUpdated: "2 hours ago",
    description: "Providing emergency food packages to families affected by the ongoing crisis in Gaza. Each package sustains a family of 5 for two weeks and includes essential staples, fresh produce, and clean water.",
    coverageItems: [
      "Food packages for 500+ families",
      "Clean water distribution",
      "Emergency nutrition for children",
      "Coordination with local partners"
    ],
    zakatEligible: true,
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "Distributed 200 food packages in northern Gaza through our local partner network.",
        author: "On-site coordinator"
      },
      {
        id: "u2",
        date: "January 20, 2024",
        content: "Received new shipment of supplies. Distribution to begin this week.",
        author: "Logistics team"
      },
      {
        id: "u3",
        date: "January 15, 2024",
        content: "Campaign launched with initial goal of reaching 500 families.",
        author: "Palestine Relief Network"
      }
    ],
    verificationChecks: [
      { label: "Organization registered", verified: true, verifier: "Government Registry" },
      { label: "On-ground presence confirmed", verified: true, verifier: "Partner Network" },
      { label: "Financial audit completed", verified: true, verifier: "Independent Auditor" },
      { label: "Distribution reports verified", verified: true, verifier: "Local Masjid" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Released $12,000 for food procurement", verifier: "Finance Team" },
      { id: "t2", date: "Jan 20", action: "Verified delivery of 200 packages", verifier: "On-site Partner" },
      { id: "t3", date: "Jan 15", action: "Initial fund allocation approved", verifier: "Board Committee" }
    ]
  },
  {
    id: "2",
    title: "Shelter Rebuilding After Earthquake",
    organization: "Turkish Red Crescent",
    isVerified: true,
    category: "shelter",
    location: "Hatay, Turkey",
    raised: 128000,
    goal: 200000,
    lastUpdated: "1 day ago",
    description: "Rebuilding permanent shelters for families displaced by the February 2023 earthquake. Each shelter provides a safe, insulated home designed to withstand seismic activity.",
    coverageItems: [
      "Construction of 50 permanent shelters",
      "Winterization materials",
      "Basic furniture and essentials",
      "Community infrastructure"
    ],
    zakatEligible: false,
    updates: [
      {
        id: "u1",
        date: "January 22, 2024",
        content: "Completed construction of 15 shelters. Families have begun moving in.",
        author: "Construction Manager"
      },
      {
        id: "u2",
        date: "January 10, 2024",
        content: "Foundation work completed for all 50 planned units.",
        author: "Site Engineer"
      }
    ],
    verificationChecks: [
      { label: "Organization registered", verified: true, verifier: "Turkish Government" },
      { label: "Land permits secured", verified: true, verifier: "Municipal Authority" },
      { label: "Engineering plans approved", verified: true, verifier: "Licensed Engineer" },
      { label: "Partner verification", verified: true, verifier: "Islamic Relief" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 22", action: "Released $45,000 for construction phase 2", verifier: "Finance Director" },
      { id: "t2", date: "Jan 10", action: "Verified completion of foundations", verifier: "Site Inspector" }
    ]
  },
  {
    id: "3",
    title: "Medical Supplies for Rural Clinic",
    organization: "Health Without Borders",
    isVerified: true,
    category: "medical",
    location: "Dhaka, Bangladesh",
    raised: 8500,
    goal: 15000,
    lastUpdated: "5 hours ago",
    description: "Equipping a rural clinic serving 10,000+ patients annually with essential medical supplies, medications, and diagnostic equipment.",
    coverageItems: [
      "Essential medications for 6 months",
      "Diagnostic equipment",
      "Medical consumables",
      "Staff training materials"
    ],
    zakatEligible: true,
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "First shipment of medications received at the clinic.",
        author: "Clinic Administrator"
      },
      {
        id: "u2",
        date: "January 18, 2024",
        content: "Procurement process initiated with verified suppliers.",
        author: "Logistics Team"
      }
    ],
    verificationChecks: [
      { label: "Clinic registration verified", verified: true, verifier: "Health Ministry" },
      { label: "Need assessment completed", verified: true, verifier: "Medical Advisor" },
      { label: "Supply chain verified", verified: true, verifier: "Partner Organization" },
      { label: "Staff credentials confirmed", verified: true, verifier: "Medical Board" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Disbursed $5,000 for medications", verifier: "Finance Team" },
      { id: "t2", date: "Jan 18", action: "Approved supplier contracts", verifier: "Procurement Committee" }
    ]
  },
  {
    id: "4",
    title: "Masjid Construction Project",
    organization: "Al-Noor Foundation",
    isVerified: true,
    category: "masjid",
    location: "Lagos, Nigeria",
    raised: 67000,
    goal: 120000,
    lastUpdated: "3 days ago",
    description: "Building a new masjid to serve a growing Muslim community of 5,000+ in Lagos. The project includes prayer halls, wudu facilities, and community space.",
    coverageItems: [
      "Main prayer hall (500 capacity)",
      "Women's prayer area",
      "Wudu facilities",
      "Community education center"
    ],
    zakatEligible: false,
    updates: [
      {
        id: "u1",
        date: "January 20, 2024",
        content: "Structural framework completed. Roofing work to begin next week.",
        author: "Project Manager"
      },
      {
        id: "u2",
        date: "January 5, 2024",
        content: "Community fundraising event raised additional $8,000.",
        author: "Al-Noor Foundation"
      }
    ],
    verificationChecks: [
      { label: "Land ownership verified", verified: true, verifier: "Legal Team" },
      { label: "Building permits approved", verified: true, verifier: "City Planning" },
      { label: "Architectural plans certified", verified: true, verifier: "Licensed Architect" },
      { label: "Community endorsement", verified: true, verifier: "Local Masjid Council" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 20", action: "Released $25,000 for construction materials", verifier: "Finance Committee" },
      { id: "t2", date: "Jan 5", action: "Updated budget for additional features", verifier: "Project Board" }
    ]
  },
  {
    id: "5",
    title: "School Supplies for Orphans",
    organization: "Yemen Education Trust",
    isVerified: false,
    category: "education",
    location: "Sana'a, Yemen",
    raised: 3200,
    goal: 10000,
    lastUpdated: "12 hours ago",
    description: "Providing educational materials, uniforms, and supplies to orphaned children in Yemen to ensure their continued access to education.",
    coverageItems: [
      "School uniforms for 200 children",
      "Textbooks and workbooks",
      "Stationery supplies",
      "School bags"
    ],
    zakatEligible: true,
    updates: [
      {
        id: "u1",
        date: "January 22, 2024",
        content: "Identified 200 children in need through partner orphanages.",
        author: "Program Coordinator"
      }
    ],
    verificationChecks: [
      { label: "Organization registered", verified: true, verifier: "NGO Registry" },
      { label: "Partner orphanages verified", verified: false },
      { label: "Distribution plan reviewed", verified: true, verifier: "Education Advisor" },
      { label: "Financial audit pending", verified: false }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 22", action: "Initial funds held pending verification", verifier: "Compliance Team" }
    ]
  },
  {
    id: "6",
    title: "Winter Food Packages",
    organization: "Syrian Relief Initiative",
    isVerified: true,
    category: "food",
    location: "Aleppo, Syria",
    raised: 22000,
    goal: 40000,
    lastUpdated: "6 hours ago",
    description: "Distributing winter food packages to families in Aleppo, including warm meals, heating fuel, and essential supplies to survive the harsh winter months.",
    coverageItems: [
      "Winter food packages for 300 families",
      "Heating fuel supplies",
      "Warm clothing distribution",
      "Emergency blankets"
    ],
    zakatEligible: true,
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "Distributed 100 winter packages in northern Aleppo.",
        author: "Field Coordinator"
      },
      {
        id: "u2",
        date: "January 19, 2024",
        content: "Secured additional heating fuel from local suppliers.",
        author: "Logistics Team"
      }
    ],
    verificationChecks: [
      { label: "Organization registered", verified: true, verifier: "International Registry" },
      { label: "Local presence confirmed", verified: true, verifier: "Partner Network" },
      { label: "Distribution verified", verified: true, verifier: "On-ground Monitor" },
      { label: "Financial transparency", verified: true, verifier: "External Auditor" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Released $8,000 for package procurement", verifier: "Finance Team" },
      { id: "t2", date: "Jan 19", action: "Verified fuel delivery to warehouse", verifier: "Logistics Manager" }
    ]
  },
  {
    id: "7",
    title: "Clean Water Well Project",
    organization: "Water for Life Foundation",
    isVerified: true,
    category: "masjid",
    location: "Mogadishu, Somalia",
    raised: 18500,
    goal: 25000,
    lastUpdated: "4 hours ago",
    description: "Installing deep-bore water wells to provide clean drinking water to communities without access to safe water sources.",
    coverageItems: [
      "Deep-bore well installation",
      "Hand pump and maintenance kit",
      "Community training program",
      "5-year maintenance fund"
    ],
    zakatEligible: false,
    updates: [
      {
        id: "u1",
        date: "January 23, 2024",
        content: "Site survey completed. Drilling to begin next week.",
        author: "Project Engineer"
      }
    ],
    verificationChecks: [
      { label: "Organization verified", verified: true, verifier: "Charity Commission" },
      { label: "Site assessment completed", verified: true, verifier: "Water Engineer" },
      { label: "Community agreement signed", verified: true, verifier: "Local Elder" },
      { label: "Equipment sourced", verified: true, verifier: "Procurement Team" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 23", action: "Approved site for drilling", verifier: "Technical Team" }
    ]
  },
  {
    id: "8",
    title: "Refugee Education Center",
    organization: "Islamic Education Initiative",
    isVerified: true,
    category: "education",
    location: "Amman, Jordan",
    raised: 42000,
    goal: 60000,
    lastUpdated: "8 hours ago",
    description: "Establishing a learning center for Syrian refugee children, providing quality education, Quran classes, and psychosocial support.",
    coverageItems: [
      "Classroom facilities for 150 students",
      "Teaching materials and equipment",
      "Qualified teachers (12 months)",
      "Counseling services"
    ],
    zakatEligible: true,
    updates: [
      {
        id: "u1",
        date: "January 22, 2024",
        content: "Hired 5 qualified teachers. Classes begin February 1st.",
        author: "Center Director"
      },
      {
        id: "u2",
        date: "January 15, 2024",
        content: "Renovation of facility completed ahead of schedule.",
        author: "Project Manager"
      }
    ],
    verificationChecks: [
      { label: "Organization licensed", verified: true, verifier: "Education Ministry" },
      { label: "Facility inspected", verified: true, verifier: "Safety Inspector" },
      { label: "Curriculum approved", verified: true, verifier: "Education Board" },
      { label: "Staff vetted", verified: true, verifier: "HR Department" }
    ],
    transparencyLog: [
      { id: "t1", date: "Jan 22", action: "Disbursed $15,000 for staff salaries", verifier: "Finance Director" },
      { id: "t2", date: "Jan 15", action: "Final payment to contractors", verifier: "Project Manager" }
    ]
  },
  {
    id: "kw-17",
    title: "Ibtikar Iftaar",
    organization: "Ibtikar",
    isVerified: true,
    category: "food",
    location: "Waterloo, ON",
    raised: 950,
    goal: 2500,
    lastUpdated: "1 hour ago",
    description: "Community iftaar initiative providing hot meals for students and families during Ramadan. Ibtikar brings together students, volunteers, and local businesses to serve nightly iftar meals, fostering community spirit and ensuring no one breaks their fast alone.",
    coverageItems: [
      "Hot meals for 150+ attendees per night",
      "Fresh halal ingredients and catering",
      "Venue rental and event setup",
      "Volunteer coordination and supplies"
    ],
    zakatEligible: false,
    updates: [
      {
        id: "u1",
        date: "February 6, 2026",
        content: "Secured venue at the Waterloo Community Centre for the full month of Ramadan. Volunteer sign-ups now open.",
        author: "Ibtikar Team"
      },
      {
        id: "u2",
        date: "February 2, 2026",
        content: "Partnered with 3 local halal restaurants for nightly meal preparation. Menu rotation finalized.",
        author: "Program Coordinator"
      },
      {
        id: "u3",
        date: "January 25, 2026",
        content: "Campaign launched with support from UW Muslim Students Association. Initial fundraising target set.",
        author: "Ibtikar"
      }
    ],
    verificationChecks: [
      { label: "Organization registered", verified: true, verifier: "University of Waterloo" },
      { label: "Venue confirmed", verified: true, verifier: "Waterloo Community Centre" },
      { label: "Catering partners verified", verified: true, verifier: "Ibtikar Team" },
      { label: "Community endorsement", verified: true, verifier: "UW Muslim Students Association" }
    ],
    transparencyLog: [
      { id: "t1", date: "Feb 6", action: "Released $400 for venue deposit", verifier: "Finance Lead" },
      { id: "t2", date: "Feb 2", action: "Signed catering agreements with 3 partners", verifier: "Program Coordinator" },
      { id: "t3", date: "Jan 25", action: "Campaign approved and published on Maddad", verifier: "Maddad Verification" }
    ]
  }
];

// Helper function to get a need by ID
export function getNeedById(id: string): Need | undefined {
  return needsData.find(need => need.id === id);
}

// Helper function to get needs by category
export function getNeedsByCategory(category: Category): Need[] {
  return needsData.filter(need => need.category === category);
}

// Helper function to get verified needs only
export function getVerifiedNeeds(): Need[] {
  return needsData.filter(need => need.isVerified);
}

// Helper function to get zakat-eligible needs
export function getZakatEligibleNeeds(): Need[] {
  return needsData.filter(need => need.zakatEligible);
}
