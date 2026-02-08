import type { EvidenceType, VerificationChecklist, MilestoneUpdate } from "@/types/verification";

// ============================================
// Verification Rules
// Defines required evidence for each verification scope.
// This drives logic — not hardcoded in UI.
// ============================================

/** Required evidence for an organization to be "Verified" */
export const orgVerifiedRequirements: EvidenceType[] = [
  "org_registration",
  "org_financial_audit",
  "org_board_resolution",
  "org_tax_status",
];

/** Required evidence for a campaign to be "Verified" */
export const campaignVerifiedRequirements: EvidenceType[] = [
  "campaign_need_photo",
  "campaign_budget_breakdown",
  "campaign_endorsement_letter",
];

/** Required evidence for a campaign to be marked "Completed" */
export const campaignCompletedRequirements: EvidenceType[] = [
  "milestone_progress_photo",
  "milestone_delivery_confirmation",
  "milestone_completion_report",
];

// ============================================
// Mock Verification Checklists
// Prebuilt checklists tied to specific campaigns/orgs
// ============================================

/** Fully verified organization checklist */
export const orgChecklist: VerificationChecklist = {
  requiredEvidenceTypes: orgVerifiedRequirements,
  approvedEvidenceTypes: [
    "org_registration",
    "org_financial_audit",
    "org_board_resolution",
    "org_tax_status",
  ],
  completionPercent: 100,
  lastVerifiedDate: "2025-11-15",
  verifierDisplayName: "Maddad Verification Team",
};

/** Fully verified campaign checklist (appeal #1) */
export const campaignChecklist1: VerificationChecklist = {
  requiredEvidenceTypes: campaignVerifiedRequirements,
  approvedEvidenceTypes: [
    "campaign_need_photo",
    "campaign_need_video",
    "campaign_budget_breakdown",
    "campaign_endorsement_letter",
    "campaign_beneficiary_consent",
  ],
  completionPercent: 100,
  lastVerifiedDate: "2026-01-05",
  verifierDisplayName: "Community Verification Panel",
};

/** Partially verified campaign checklist (appeal #5 — pending) */
export const campaignChecklist5: VerificationChecklist = {
  requiredEvidenceTypes: campaignVerifiedRequirements,
  approvedEvidenceTypes: [
    "campaign_need_photo",
    "campaign_budget_breakdown",
  ],
  completionPercent: 67,
  lastVerifiedDate: "2026-01-22",
  verifierDisplayName: "Maddad Review Queue",
};

// ============================================
// Mock Milestone Timelines
// Tied to specific campaign IDs
// ============================================

/** Full milestone timeline for a well-progressed campaign */
export const milestoneTimeline1: MilestoneUpdate[] = [
  {
    stage: "verified",
    date: "2025-12-10",
    summary: "Campaign verified by Community Verification Panel. All required evidence reviewed and approved.",
    evidenceIds: ["ev-camp-photo-001", "ev-camp-budget-001", "ev-camp-endorse-001"],
  },
  {
    stage: "funds_allocated",
    date: "2025-12-18",
    summary: "Funds released from escrow to partner organization. $12,000 allocated for Phase 1.",
    evidenceIds: ["ev-mile-receipt-001"],
  },
  {
    stage: "procurement",
    date: "2026-01-05",
    summary: "Building materials and supplies procured from verified suppliers. All receipts documented.",
    evidenceIds: ["ev-mile-receipt-001"],
  },
  {
    stage: "in_progress",
    date: "2026-01-15",
    summary: "Construction underway. Foundation complete, walls raised. On track for February completion.",
    evidenceIds: ["ev-mile-photo-001", "ev-mile-video-001"],
  },
  {
    stage: "completed",
    date: "2026-02-01",
    summary: "Project completed. 200 families served. Final report and beneficiary feedback collected.",
    evidenceIds: ["ev-mile-completion-001", "ev-mile-feedback-001", "ev-mile-delivery-001"],
  },
];

/** Partial milestone timeline — campaign in progress */
export const milestoneTimeline2: MilestoneUpdate[] = [
  {
    stage: "verified",
    date: "2026-01-08",
    summary: "Campaign verified by partner mosque. Beneficiary need confirmed through on-ground assessment.",
    evidenceIds: ["ev-camp-photo-001", "ev-camp-endorse-001"],
  },
  {
    stage: "funds_allocated",
    date: "2026-01-12",
    summary: "Initial funds of $4,000 released for emergency supplies and temporary housing.",
    evidenceIds: [],
  },
  {
    stage: "in_progress",
    date: "2026-01-20",
    summary: "Aid distribution ongoing. 100 packages delivered so far. Additional supplies being sourced.",
    evidenceIds: ["ev-mile-photo-001"],
  },
];

/** Early-stage milestone timeline — just verified */
export const milestoneTimeline3: MilestoneUpdate[] = [
  {
    stage: "verified",
    date: "2026-01-22",
    summary: "Campaign verified. Awaiting funds allocation from donor pool.",
    evidenceIds: ["ev-camp-photo-001"],
  },
];

// ============================================
// Campaign-to-data mapping helpers
// ============================================

/** Map appeal IDs to their verification checklists */
export const appealChecklists: Record<string, VerificationChecklist> = {
  "1": campaignChecklist1,
  "2": campaignChecklist1,
  "3": campaignChecklist5,
  "4": campaignChecklist1,
  "5": campaignChecklist1,
  "6": campaignChecklist5,
};

/** Map appeal IDs to their milestone timelines */
export const appealTimelines: Record<string, MilestoneUpdate[]> = {
  "1": milestoneTimeline1,
  "2": milestoneTimeline2,
  "3": milestoneTimeline3,
  "4": milestoneTimeline2,
  "5": milestoneTimeline1,
  "6": milestoneTimeline3,
};

/** Map appeal IDs to their evidence item IDs */
export const appealEvidenceIds: Record<string, string[]> = {
  "1": [
    "ev-org-reg-001", "ev-org-audit-001", "ev-org-board-001",
    "ev-camp-photo-001", "ev-camp-video-001", "ev-camp-budget-001",
    "ev-camp-endorse-001",
    "ev-mile-photo-001", "ev-mile-video-001", "ev-mile-receipt-001",
    "ev-mile-delivery-001", "ev-mile-completion-001", "ev-mile-feedback-001",
  ],
  "2": [
    "ev-org-reg-001", "ev-org-audit-001",
    "ev-camp-photo-001", "ev-camp-budget-001", "ev-camp-endorse-001",
    "ev-mile-photo-001",
  ],
  "3": [
    "ev-org-reg-001",
    "ev-camp-photo-001", "ev-camp-budget-001",
  ],
  "4": [
    "ev-org-reg-001", "ev-org-audit-001",
    "ev-camp-photo-001", "ev-camp-endorse-001",
    "ev-mile-photo-001",
  ],
  "5": [
    "ev-org-reg-001", "ev-org-audit-001", "ev-org-board-001", "ev-org-tax-001",
    "ev-camp-photo-001", "ev-camp-video-001", "ev-camp-budget-001",
    "ev-camp-endorse-001",
    "ev-mile-photo-001", "ev-mile-video-001", "ev-mile-receipt-001",
    "ev-mile-delivery-001", "ev-mile-completion-001",
  ],
  "6": [
    "ev-org-reg-001",
    "ev-camp-photo-001",
  ],
};

/** Organization-level evidence IDs (for charity detail pages) */
export const orgEvidenceIds: string[] = [
  "ev-org-reg-001",
  "ev-org-audit-001",
  "ev-org-board-001",
  "ev-org-tax-001",
];
