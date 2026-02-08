import type { VerificationChecklist, MilestoneUpdate } from "@/types/verification";

// ============================================
// Giving Campaign Data
// Pre-built verification + tracking entities
// for each giving category's distribution program
// ============================================

export interface GivingCampaignData {
  id: string;
  givingCategory: string;
  title: string;
  partner: string;
  checklist: VerificationChecklist;
  milestones: MilestoneUpdate[];
  evidenceIds: string[];
  trackingId: string;
}

// Shared evidence IDs used across giving programs
const sharedOrgEvidence = [
  "ev-giving-partner-verify",
  "ev-giving-audit-001",
];

const sharedMilestoneEvidence = [
  "ev-giving-impact-photo",
  "ev-giving-distribution-001",
  "ev-giving-completion-001",
];

export const givingCampaigns: Record<string, GivingCampaignData> = {
  fidya: {
    id: "giving-fidya",
    givingCategory: "fidya",
    title: "Fidya Meal Distribution Program",
    partner: "Verified Partner Network",
    checklist: {
      requiredEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
      approvedEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
      completionPercent: 100,
      lastVerifiedDate: "2026-01-15",
      verifierDisplayName: "Maddad Giving Verification",
    },
    milestones: [
      {
        stage: "verified",
        date: "2025-11-01",
        summary: "Feeding partners verified and meal program audited. All partners meet Maddad standards.",
        evidenceIds: ["ev-giving-partner-verify"],
      },
      {
        stage: "funds_allocated",
        date: "2025-12-15",
        summary: "Funds released to verified feeding partners for meal preparation and distribution.",
        evidenceIds: ["ev-giving-audit-001"],
      },
      {
        stage: "in_progress",
        date: "2026-01-10",
        summary: "Meals being prepared and distributed through partner kitchens across multiple regions.",
        evidenceIds: ["ev-giving-impact-photo"],
      },
      {
        stage: "completed",
        date: "2026-02-01",
        summary: "Distribution cycle complete. Aggregate impact report published with meal counts.",
        evidenceIds: ["ev-giving-distribution-001", "ev-giving-completion-001"],
      },
    ],
    evidenceIds: [...sharedOrgEvidence, ...sharedMilestoneEvidence],
    trackingId: "MDD-FDYA-2026-0001",
  },

  "meal-sponsorship": {
    id: "giving-meals",
    givingCategory: "meal-sponsorship",
    title: "Meal Sponsorship Distribution Program",
    partner: "Community Iftar Network",
    checklist: {
      requiredEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
      approvedEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
      completionPercent: 100,
      lastVerifiedDate: "2026-01-18",
      verifierDisplayName: "Maddad Giving Verification",
    },
    milestones: [
      {
        stage: "verified",
        date: "2025-10-20",
        summary: "Distribution partners verified. Beneficiary eligibility confirmed through partner orgs.",
        evidenceIds: ["ev-giving-partner-verify"],
      },
      {
        stage: "funds_allocated",
        date: "2025-12-01",
        summary: "Sponsorship funds allocated to partner kitchens for meal preparation.",
        evidenceIds: ["ev-giving-audit-001"],
      },
      {
        stage: "in_progress",
        date: "2026-01-05",
        summary: "Meals being prepared and delivered through partner locations in 40+ cities.",
        evidenceIds: ["ev-giving-impact-photo"],
      },
    ],
    evidenceIds: [...sharedOrgEvidence, "ev-giving-impact-photo", "ev-giving-distribution-001"],
    trackingId: "MDD-MEAL-2026-0001",
  },

  zakat: {
    id: "giving-zakat",
    givingCategory: "zakat",
    title: "Zakat Distribution Program",
    partner: "Verified Masjid & Scholar Network",
    checklist: {
      requiredEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo"],
      approvedEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo"],
      completionPercent: 100,
      lastVerifiedDate: "2026-01-20",
      verifierDisplayName: "Scholar Verification Panel",
    },
    milestones: [
      {
        stage: "verified",
        date: "2025-09-15",
        summary: "Recipient eligibility verified by scholars and local masjids. 100% allocation confirmed.",
        evidenceIds: ["ev-giving-partner-verify", "ev-zakat-before-photo"],
      },
      {
        stage: "funds_allocated",
        date: "2025-12-10",
        summary: "Zakat funds allocated directly to verified eligible recipients.",
        evidenceIds: ["ev-giving-audit-001"],
      },
      {
        stage: "completed",
        date: "2026-01-25",
        summary: "Distribution confirmed. Anonymized impact report available.",
        evidenceIds: ["ev-zakat-completion-photo", "ev-giving-distribution-001", "ev-giving-completion-001"],
      },
    ],
    evidenceIds: [
      ...sharedOrgEvidence,
      "ev-zakat-before-photo",
      "ev-zakat-completion-photo",
      ...sharedMilestoneEvidence,
    ],
    trackingId: "MDD-ZKAT-2026-0001",
  },

  qurbani: {
    id: "giving-qurbani",
    givingCategory: "qurbani",
    title: "Qurbani Distribution Program",
    partner: "Islamic Relief & Partners",
    checklist: {
      requiredEvidenceTypes: ["org_registration", "milestone_delivery_confirmation", "campaign_need_photo", "milestone_progress_photo"],
      approvedEvidenceTypes: ["org_registration", "milestone_delivery_confirmation", "campaign_need_photo", "milestone_progress_photo"],
      completionPercent: 100,
      lastVerifiedDate: "2026-01-12",
      verifierDisplayName: "Maddad Seasonal Verification",
    },
    milestones: [
      {
        stage: "verified",
        date: "2025-11-15",
        summary: "Partner organizations verified for Islamic slaughter compliance and distribution capacity.",
        evidenceIds: ["ev-giving-partner-verify", "ev-qurbani-before-photo"],
      },
      {
        stage: "procurement",
        date: "2025-12-20",
        summary: "Animals procured from certified suppliers and inspected for health and eligibility.",
        evidenceIds: ["ev-giving-audit-001"],
      },
      {
        stage: "in_progress",
        date: "2026-01-06",
        summary: "Sacrifice performed on Eid days following Islamic guidelines. Distribution underway.",
        evidenceIds: ["ev-giving-impact-photo"],
      },
      {
        stage: "completed",
        date: "2026-01-15",
        summary: "Fresh meat distributed to families across all regions. Confirmation reports sent.",
        evidenceIds: ["ev-qurbani-completion-photo", "ev-giving-distribution-001", "ev-giving-completion-001"],
      },
    ],
    evidenceIds: [
      ...sharedOrgEvidence,
      "ev-qurbani-before-photo",
      "ev-qurbani-completion-photo",
      ...sharedMilestoneEvidence,
    ],
    trackingId: "MDD-QRBN-2026-0001",
  },

  "sadaqah-jariyah": {
    id: "giving-jariyah",
    givingCategory: "sadaqah-jariyah",
    title: "Sadaqah Jariyah – Build a Well",
    partner: "Fatima Zahra Helping Hand",
    checklist: {
      requiredEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo", "milestone_progress_video"],
      approvedEvidenceTypes: ["org_registration", "org_financial_audit", "campaign_need_photo", "milestone_progress_photo", "milestone_progress_video"],
      completionPercent: 100,
      lastVerifiedDate: "2026-01-25",
      verifierDisplayName: "Maddad Project Verification",
    },
    milestones: [
      {
        stage: "verified",
        date: "2025-08-01",
        summary: "Project plans verified and implementing partners audited for capacity and compliance.",
        evidenceIds: ["ev-giving-partner-verify", "ev-well-before-photo"],
      },
      {
        stage: "funds_allocated",
        date: "2025-10-15",
        summary: "Endowment funds released for well construction in Punjab, Pakistan.",
        evidenceIds: ["ev-giving-audit-001"],
      },
      {
        stage: "in_progress",
        date: "2026-01-10",
        summary: "Well construction underway at Village Arainwala, Minchanabad. Foundation laid and hand-pump installed.",
        evidenceIds: ["ev-well-completion-photo"],
      },
      {
        stage: "completed",
        date: "2026-01-22",
        summary: "Well No. 3807 completed and operational. Families now have daily access to clean water. Isaal-e-Sawab dedication: Hasnah Mahmud Baker.",
        evidenceIds: ["ev-well-completion-photo", "ev-well-completion-video", "ev-giving-completion-001"],
      },
    ],
    evidenceIds: [
      ...sharedOrgEvidence,
      "ev-well-before-photo",
      "ev-well-completion-photo",
      "ev-well-completion-video",
      "ev-giving-impact-photo",
      "ev-giving-distribution-001",
      "ev-giving-completion-001",
    ],
    trackingId: "MDD-WELL-2026-3807",
  },

  kaffarah: {
    id: "giving-kaffarah",
    givingCategory: "kaffarah",
    title: "Kaffarah Feeding Program",
    partner: "Verified Feeding Partners",
    checklist: {
      requiredEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
      approvedEvidenceTypes: ["org_registration", "org_financial_audit", "milestone_delivery_confirmation"],
      completionPercent: 100,
      lastVerifiedDate: "2026-01-14",
      verifierDisplayName: "Maddad Giving Verification",
    },
    milestones: [
      {
        stage: "verified",
        date: "2025-11-01",
        summary: "Feeding partners verified for Kaffarah-compliant distribution following scholarly guidelines.",
        evidenceIds: ["ev-giving-partner-verify"],
      },
      {
        stage: "funds_allocated",
        date: "2025-12-18",
        summary: "Kaffarah funds released to verified feeding partners for meal preparation.",
        evidenceIds: ["ev-giving-audit-001"],
      },
      {
        stage: "in_progress",
        date: "2026-01-08",
        summary: "Meals being distributed to eligible recipients through partner organizations.",
        evidenceIds: ["ev-giving-impact-photo"],
      },
      {
        stage: "completed",
        date: "2026-01-30",
        summary: "Kaffarah obligations fulfilled. Confirmation reports sent to donors.",
        evidenceIds: ["ev-giving-distribution-001", "ev-giving-completion-001"],
      },
    ],
    evidenceIds: [...sharedOrgEvidence, ...sharedMilestoneEvidence],
    trackingId: "MDD-KFFR-2026-0001",
  },
};
