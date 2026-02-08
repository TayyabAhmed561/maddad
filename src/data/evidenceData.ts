import type { EvidenceItem } from "@/types/verification";

/**
 * Mock evidence items for the Maddad platform.
 * These are referenced by ID from appeals, needs, and charity detail pages.
 */
export const evidenceItems: EvidenceItem[] = [
  // ========== Organization-Level Evidence ==========
  {
    id: "ev-org-reg-001",
    type: "org_registration",
    title: "Charity Registration Certificate",
    description: "Official registration with the Canadian Revenue Agency as a registered charity. CRA Business Number: 123456789RR0001.",
    media: { kind: "pdf", url: "/docs/registration-cert.pdf" },
    date: "2023-06-15",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-org-audit-001",
    type: "org_financial_audit",
    title: "2024 Annual Financial Audit",
    description: "Independent audit conducted by Deloitte confirming proper use of funds and financial compliance.",
    media: { kind: "pdf", url: "/docs/financial-audit-2024.pdf" },
    date: "2025-03-01",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-org-board-001",
    type: "org_board_resolution",
    title: "Board Resolution – Campaign Authorization",
    description: "Board resolution authorizing the organization to launch and manage donation campaigns through the Maddad platform.",
    media: { kind: "pdf", url: "/docs/board-resolution.pdf" },
    date: "2024-11-20",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-org-tax-001",
    type: "org_tax_status",
    title: "Tax-Exempt Status Confirmation",
    description: "Letter from CRA confirming tax-exempt status under section 149.1 of the Income Tax Act.",
    media: { kind: "pdf", url: "/docs/tax-exempt-letter.pdf" },
    date: "2024-01-10",
    visibility: "public",
    status: "approved",
  },

  // ========== Campaign-Level Evidence ==========
  {
    id: "ev-camp-photo-001",
    type: "campaign_need_photo",
    title: "Community Need Assessment – Photos",
    description: "On-ground photographs documenting current conditions and the families who will benefit from the campaign.",
    media: { kind: "image", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800" },
    date: "2025-12-10",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-camp-video-001",
    type: "campaign_need_video",
    title: "Field Assessment Video",
    description: "Video walkthrough of the affected area by our on-ground coordinator, showing the scope of need.",
    media: { kind: "video", url: "https://example.com/field-assessment.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400" },
    date: "2025-12-12",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-camp-budget-001",
    type: "campaign_budget_breakdown",
    title: "Campaign Budget Breakdown",
    description: "Detailed budget showing allocation: 92% direct program costs, 6% logistics, 2% platform overhead.",
    media: { kind: "pdf", url: "/docs/budget-breakdown.pdf" },
    date: "2025-12-08",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-camp-endorse-001",
    type: "campaign_endorsement_letter",
    title: "Masjid Endorsement Letter",
    description: "Official endorsement from the local masjid confirming the legitimacy and urgency of this campaign.",
    media: { kind: "pdf", url: "/docs/endorsement-letter.pdf" },
    date: "2025-12-05",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-camp-consent-001",
    type: "campaign_beneficiary_consent",
    title: "Beneficiary Consent Form",
    description: "Signed consent form from the beneficiary family authorizing the campaign on their behalf.",
    media: { kind: "pdf", url: "/docs/consent-form.pdf" },
    date: "2025-12-06",
    visibility: "private",
    status: "approved",
  },

  // ========== Milestone / Progress Evidence ==========
  {
    id: "ev-mile-photo-001",
    type: "milestone_progress_photo",
    title: "Construction Progress – Week 4",
    description: "Photos showing foundation work completed and walls being raised at the project site.",
    media: { kind: "image", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800" },
    date: "2026-01-15",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-mile-video-001",
    type: "milestone_progress_video",
    title: "Distribution Day – Video Report",
    description: "Video documenting the distribution of aid packages to 200 families in the target community.",
    media: { kind: "video", url: "https://example.com/distribution-day.mp4", thumbnailUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400" },
    date: "2026-01-20",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-mile-receipt-001",
    type: "milestone_receipt",
    title: "Procurement Receipts – Building Materials",
    description: "Itemized receipts from verified suppliers for construction materials purchased for the project.",
    media: { kind: "pdf", url: "/docs/procurement-receipts.pdf" },
    date: "2026-01-10",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-mile-delivery-001",
    type: "milestone_delivery_confirmation",
    title: "Delivery Confirmation – Aid Packages",
    description: "Signed confirmation from on-ground partner verifying delivery of 200 aid packages to beneficiary families.",
    media: { kind: "pdf", url: "/docs/delivery-confirmation.pdf" },
    date: "2026-01-22",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-mile-completion-001",
    type: "milestone_completion_report",
    title: "Project Completion Report",
    description: "Final report summarizing project outcomes, total beneficiaries served, and remaining fund allocation.",
    media: { kind: "pdf", url: "/docs/completion-report.pdf" },
    date: "2026-02-01",
    visibility: "public",
    status: "approved",
  },
  {
    id: "ev-mile-feedback-001",
    type: "milestone_beneficiary_feedback",
    title: "Beneficiary Feedback – Community Voices",
    description: "Anonymized feedback from 50 beneficiary families expressing gratitude and confirming impact.",
    media: { kind: "link", url: "https://example.com/community-feedback" },
    date: "2026-02-03",
    visibility: "public",
    status: "approved",
  },

  // ========== Pending / In-Review Evidence ==========
  {
    id: "ev-camp-photo-002",
    type: "campaign_need_photo",
    title: "Updated Site Conditions – January 2026",
    description: "Recent photographs showing changes in conditions since the campaign launched.",
    media: { kind: "image", url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800" },
    date: "2026-01-28",
    visibility: "public",
    status: "pending",
  },
  {
    id: "ev-mile-photo-002",
    type: "milestone_progress_photo",
    title: "Final Construction Photos",
    description: "Photos of the completed structure awaiting final inspection.",
    media: { kind: "image", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800" },
    date: "2026-02-05",
    visibility: "public",
    status: "pending",
  },
];

/**
 * Get evidence items by their IDs, filtered to public-only visibility.
 */
export function getPublicEvidenceByIds(ids: string[]): EvidenceItem[] {
  return evidenceItems.filter(
    (item) => ids.includes(item.id) && item.visibility === "public"
  );
}

/**
 * Get all evidence items for a given type.
 */
export function getEvidenceByType(type: EvidenceItem["type"]): EvidenceItem[] {
  return evidenceItems.filter((item) => item.type === type);
}
