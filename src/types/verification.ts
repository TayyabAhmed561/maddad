// ============================================
// Maddad Verification & Proof Tracking Types
// ============================================

/** Types of evidence that can be submitted for verification */
export type EvidenceType =
  // Organization-level evidence
  | "org_registration"
  | "org_financial_audit"
  | "org_board_resolution"
  | "org_tax_status"
  // Campaign-level evidence
  | "campaign_need_photo"
  | "campaign_need_video"
  | "campaign_budget_breakdown"
  | "campaign_endorsement_letter"
  | "campaign_beneficiary_consent"
  // Milestone/completion evidence
  | "milestone_progress_photo"
  | "milestone_progress_video"
  | "milestone_receipt"
  | "milestone_delivery_confirmation"
  | "milestone_completion_report"
  | "milestone_beneficiary_feedback";

/** Media attachment for an evidence item */
export interface EvidenceMedia {
  kind: "image" | "video" | "pdf" | "link";
  url: string;
  /** Optional thumbnail for videos/pdfs */
  thumbnailUrl?: string;
}

/** A single piece of evidence submitted for verification */
export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  media: EvidenceMedia;
  date: string;
  visibility: "public" | "private";
  status: "approved" | "pending" | "rejected";
}

/** Verification checklist tracking required and approved evidence */
export interface VerificationChecklist {
  /** Evidence types that must be submitted */
  requiredEvidenceTypes: EvidenceType[];
  /** Evidence types that have been approved */
  approvedEvidenceTypes: EvidenceType[];
  /** Percentage of required evidence that is approved (0–100) */
  completionPercent: number;
  /** ISO date of last verification review */
  lastVerifiedDate: string;
  /** Display name of the verifier or verifying body */
  verifierDisplayName: string;
}

/** Stages in the donation impact lifecycle */
export type MilestoneStage =
  | "verified"
  | "funds_allocated"
  | "procurement"
  | "in_progress"
  | "completed";

/** A single milestone update in the impact timeline */
export interface MilestoneUpdate {
  stage: MilestoneStage;
  date: string;
  summary: string;
  /** IDs of EvidenceItems linked to this milestone */
  evidenceIds: string[];
}

/** Computed verification level based on evidence completeness */
export type VerificationLevel = "verified" | "pending" | "enhanced";

/**
 * Compute verification level from a checklist.
 * - "enhanced": all required + extra evidence beyond minimum
 * - "verified": all required evidence approved
 * - "pending": missing required evidence
 */
export function computeVerificationLevel(
  checklist: VerificationChecklist,
  totalEvidenceCount: number
): VerificationLevel {
  const allRequired = checklist.requiredEvidenceTypes.every((type) =>
    checklist.approvedEvidenceTypes.includes(type)
  );

  if (allRequired && totalEvidenceCount > checklist.requiredEvidenceTypes.length) {
    return "enhanced";
  }
  if (allRequired) {
    return "verified";
  }
  return "pending";
}
