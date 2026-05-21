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

/** Required evidence for an organization campaign to be "Verified" */
export const campaignVerifiedRequirements: EvidenceType[] = [
  "campaign_need_photo",
  "campaign_budget_breakdown",
  "campaign_endorsement_letter",
];

/** Required evidence for a private/individual campaign to be "Verified" */
export const privateCampaignVerifiedRequirements: EvidenceType[] = [
  "campaign_referral_attestation",
  "campaign_document_proof",
];

/** All possible private campaign verification supports (need ≥ 2) */
export const privateCampaignSupportOptions: EvidenceType[] = [
  "campaign_referral_attestation",
  "campaign_document_proof",
  "campaign_budget_quote",
  "campaign_verifier_interview",
];

/** Required evidence for a campaign to be marked "Completed" */
export const campaignCompletedRequirements: EvidenceType[] = [
  "milestone_progress_photo",
  "milestone_delivery_confirmation",
  "milestone_completion_report",
];

/** Default milestone templates for common campaign types (for tracking plan display) */
export const milestoneTemplates: Record<string, { stage: string; description: string }[]> = {
  default: [
    { stage: "verified", description: "Campaign and organization verified by review panel" },
    { stage: "funds_allocated", description: "Funds released from escrow to implementing partner" },
    { stage: "procurement", description: "Materials and supplies procured from verified suppliers" },
    { stage: "in_progress", description: "Implementation underway with progress documentation" },
    { stage: "completed", description: "Project completed with final report and beneficiary confirmation" },
  ],
  fidya: [
    { stage: "verified", description: "Feeding partner verified and meal program audited" },
    { stage: "funds_allocated", description: "Funds released to verified feeding partner" },
    { stage: "in_progress", description: "Meals prepared and distribution begins" },
    { stage: "completed", description: "Distribution complete, aggregate impact report published" },
  ],
  "meal-sponsorship": [
    { stage: "verified", description: "Distribution partner and beneficiary eligibility verified" },
    { stage: "funds_allocated", description: "Sponsorship funds allocated to partner kitchen" },
    { stage: "in_progress", description: "Meal preparation and delivery ongoing" },
    { stage: "completed", description: "All sponsored meals delivered, impact summary available" },
  ],
  zakat: [
    { stage: "verified", description: "Recipient eligibility verified by scholar and local masjid" },
    { stage: "funds_allocated", description: "Zakat funds allocated to verified eligible recipients" },
    { stage: "completed", description: "Distribution confirmed, anonymized impact report available" },
  ],
  qurbani: [
    { stage: "verified", description: "Animal inspected and partner verified for Islamic compliance" },
    { stage: "procurement", description: "Animal procured from certified supplier" },
    { stage: "in_progress", description: "Sacrifice performed on Eid days following guidelines" },
    { stage: "completed", description: "Fresh meat distributed to families, confirmation report sent" },
  ],
  "sadaqah-jariyah": [
    { stage: "verified", description: "Project plan and implementing partner verified" },
    { stage: "funds_allocated", description: "Endowment funds released for project implementation" },
    { stage: "procurement", description: "Materials and labor contracted for construction/setup" },
    { stage: "in_progress", description: "Project construction/implementation underway" },
    { stage: "completed", description: "Project operational, long-term impact tracking begins" },
  ],
  kaffarah: [
    { stage: "verified", description: "Feeding partner verified for Kaffarah-compliant distribution" },
    { stage: "funds_allocated", description: "Kaffarah funds released to feeding partner" },
    { stage: "in_progress", description: "Meals being prepared and distributed to eligible recipients" },
    { stage: "completed", description: "Kaffarah obligation fulfilled, confirmation report available" },
  ],
};

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

/** Verification checklists for each giving program (keyed by givingCategory string) */
export const givingProgramChecklists: Record<string, VerificationChecklist> = {
  fidya: {
    requiredEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
    approvedEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
    completionPercent: 100,
    lastVerifiedDate: "2026-01-15",
    verifierDisplayName: "Maddad Giving Verification",
  },
  "meal-sponsorship": {
    requiredEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
    approvedEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
    completionPercent: 100,
    lastVerifiedDate: "2026-01-18",
    verifierDisplayName: "Maddad Giving Verification",
  },
  zakat: {
    requiredEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo"],
    approvedEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo"],
    completionPercent: 100,
    lastVerifiedDate: "2026-01-20",
    verifierDisplayName: "Scholar Verification Panel",
  },
  qurbani: {
    requiredEvidenceTypes: ["org_registration", "milestone_delivery_confirmation", "campaign_need_photo", "milestone_progress_photo"],
    approvedEvidenceTypes: ["org_registration", "milestone_delivery_confirmation", "campaign_need_photo", "milestone_progress_photo"],
    completionPercent: 100,
    lastVerifiedDate: "2026-01-12",
    verifierDisplayName: "Maddad Seasonal Verification",
  },
  "sadaqah-jariyah": {
    requiredEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo", "milestone_progress_video"],
    approvedEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo", "milestone_progress_video"],
    completionPercent: 100,
    lastVerifiedDate: "2026-01-25",
    verifierDisplayName: "Maddad Project Verification",
  },
  "msa-iftaar": {
    requiredEvidenceTypes: ["org_registration", "campaign_need_photo", "milestone_progress_photo", "milestone_receipt", "milestone_completion_report"],
    approvedEvidenceTypes: ["org_registration", "campaign_need_photo", "milestone_progress_photo", "milestone_receipt", "milestone_completion_report"],
    completionPercent: 38,
    lastVerifiedDate: "2026-02-06",
    verifierDisplayName: "Maddad Community Verification",
  },
  kaffarah: {
    requiredEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
    approvedEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
    completionPercent: 100,
    lastVerifiedDate: "2026-01-14",
    verifierDisplayName: "Maddad Giving Verification",
  },
};

/** Tracking IDs for each giving program */
export const givingProgramTrackingIds: Record<string, string> = {
  fidya: "MDD-FDYA-2026-0001",
  "meal-sponsorship": "MDD-MEAL-2026-0001",
  zakat: "MDD-ZKAT-2026-0001",
  qurbani: "MDD-QRBN-2026-0001",
  "sadaqah-jariyah": "MDD-WELL-2026-3807",
  "msa-iftaar": "MDD-IFTR-2026-0017",
  kaffarah: "MDD-KFFR-2026-0001",
};
