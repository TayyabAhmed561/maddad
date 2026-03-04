// ============================================
// Maddad Platform Extension Types
// ============================================

/** Urgency level for map pins and need cards */
export type UrgencyLevel = "low" | "medium" | "critical";

/** Crisis layer categories for map filtering */
export type CrisisLayer = 
  | "emergency_relief"
  | "refugee_support" 
  | "food_security"
  | "medical_aid"
  | "education_projects";

export const crisisLayerConfig: Record<CrisisLayer, { label: string; color: string; icon: string }> = {
  emergency_relief: { label: "Emergency Relief", color: "hsl(0, 50%, 48%)", icon: "AlertTriangle" },
  refugee_support: { label: "Refugee Support", color: "hsl(198, 45%, 42%)", icon: "Users" },
  food_security: { label: "Food Security", color: "hsl(32, 65%, 42%)", icon: "Utensils" },
  medical_aid: { label: "Medical Aid", color: "hsl(0, 40%, 55%)", icon: "Stethoscope" },
  education_projects: { label: "Education Projects", color: "hsl(265, 40%, 48%)", icon: "GraduationCap" },
};

/** Campaign update from organizers */
export interface CampaignUpdate {
  id: string;
  date: string;
  title: string;
  content: string;
  images?: string[];
  progressPercent?: number;
}

/** Supporter message / dua */
export interface SupporterMessage {
  id: string;
  donorName: string;
  isAnonymous: boolean;
  message: string;
  timestamp: string;
}

/** Trust score for organizations */
export interface TrustScore {
  overall: number; // 0-100
  verificationLevel: number;
  evidenceCompleteness: number;
  projectCompletionRate: number;
  financialClarity: number;
}

/** Impact metrics for dashboard */
export interface ImpactMetric {
  label: string;
  value: number;
  previousValue?: number;
  unit: string;
  category: string;
}

/** Recurring giving program */
export interface RecurringProgram {
  id: string;
  title: string;
  description: string;
  suggestedAmount: number;
  frequency: "weekly" | "monthly" | "yearly";
  impactDescription: string;
  icon: string;
}

/** Ramadan night plan entry */
export interface RamadanNightPlan {
  night: number;
  date: string;
  amount: number;
  allocated: boolean;
  cause?: string;
}
