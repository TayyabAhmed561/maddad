import { useState, useCallback } from "react";
import type { EvidenceItem, MilestoneUpdate } from "@/types/verification";

// ============================================
// Verification Store — localStorage CRUD
// ============================================

const KEYS = {
  EVIDENCE_OVERRIDES: "maddad_evidence_overrides",
  ORG_SUBMISSIONS: "maddad_org_submissions",
  CAMPAIGN_SUBMISSIONS: "maddad_campaign_submissions",
  VERIFIER_MODE: "maddad_verifier_mode",
  UPDATE_SUBSCRIPTIONS: "maddad_update_subscriptions",
} as const;

// ---------- Submission Types ----------

export interface OrgSubmission {
  id: string;
  name: string;
  location: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  status: "pending_verification" | "verified" | "rejected";
  evidenceIds: string[];
  submittedAt: string;
  reviewNotes?: string;
}

export interface UseOfFundsItem {
  item: string;
  amount: number;
}

export interface CampaignSubmission {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  category: string;
  categoryLabel?: string;
  goal: number;
  location: string;
  description?: string;
  useOfFunds: UseOfFundsItem[];
  status: "pending_verification" | "verified" | "rejected";
  evidenceIds: string[];
  milestones: MilestoneUpdate[];
  submittedAt: string;
  reviewNotes?: string;
  submitterType: "organization" | "private";
  visibility: "public" | "private";
  contactInfo?: { name: string; email: string; phone: string };
}

export interface UpdateSubscription {
  id: string;
  campaignId: string;
  email?: string;
  whatsapp?: string;
  subscribedAt: string;
}

// ---------- Generic helpers ----------

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------- Evidence Overrides ----------

export function getEvidenceOverrides(): EvidenceItem[] {
  return readJSON<EvidenceItem[]>(KEYS.EVIDENCE_OVERRIDES, []);
}

export function addEvidenceOverride(item: EvidenceItem): void {
  const items = getEvidenceOverrides();
  items.push(item);
  writeJSON(KEYS.EVIDENCE_OVERRIDES, items);
}

export function updateEvidenceOverride(
  id: string,
  updates: Partial<EvidenceItem>
): void {
  const items = getEvidenceOverrides();
  const idx = items.findIndex((e) => e.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates };
    writeJSON(KEYS.EVIDENCE_OVERRIDES, items);
  }
}

// ---------- Org Submissions ----------

export function getOrgSubmissions(): OrgSubmission[] {
  return readJSON<OrgSubmission[]>(KEYS.ORG_SUBMISSIONS, []);
}

export function addOrgSubmission(sub: OrgSubmission): void {
  const subs = getOrgSubmissions();
  subs.push(sub);
  writeJSON(KEYS.ORG_SUBMISSIONS, subs);
}

export function updateOrgSubmission(
  id: string,
  updates: Partial<OrgSubmission>
): void {
  const subs = getOrgSubmissions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], ...updates };
    writeJSON(KEYS.ORG_SUBMISSIONS, subs);
  }
}

// ---------- Campaign Submissions ----------

export function getCampaignSubmissions(): CampaignSubmission[] {
  return readJSON<CampaignSubmission[]>(KEYS.CAMPAIGN_SUBMISSIONS, []);
}

export function addCampaignSubmission(sub: CampaignSubmission): void {
  const subs = getCampaignSubmissions();
  subs.push(sub);
  writeJSON(KEYS.CAMPAIGN_SUBMISSIONS, subs);
}

export function updateCampaignSubmission(
  id: string,
  updates: Partial<CampaignSubmission>
): void {
  const subs = getCampaignSubmissions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx >= 0) {
    subs[idx] = { ...subs[idx], ...updates };
    writeJSON(KEYS.CAMPAIGN_SUBMISSIONS, subs);
  }
}

// ---------- Verifier Mode ----------

export function getVerifierMode(): boolean {
  return localStorage.getItem(KEYS.VERIFIER_MODE) === "true";
}

export function setVerifierMode(enabled: boolean): void {
  localStorage.setItem(KEYS.VERIFIER_MODE, String(enabled));
}

// ---------- Update Subscriptions ----------

export function getUpdateSubscriptions(): UpdateSubscription[] {
  return readJSON<UpdateSubscription[]>(KEYS.UPDATE_SUBSCRIPTIONS, []);
}

export function addUpdateSubscription(sub: UpdateSubscription): void {
  const subs = getUpdateSubscriptions();
  subs.push(sub);
  writeJSON(KEYS.UPDATE_SUBSCRIPTIONS, subs);
}

// ---------- React Hook ----------

/**
 * React hook that provides reactive access to the verification store.
 * Triggers re-renders when data changes.
 */
export function useVerificationStore() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return {
    // Evidence
    evidenceOverrides: getEvidenceOverrides(),
    addEvidence: (item: EvidenceItem) => {
      addEvidenceOverride(item);
      refresh();
    },
    updateEvidence: (id: string, updates: Partial<EvidenceItem>) => {
      updateEvidenceOverride(id, updates);
      refresh();
    },

    // Orgs
    orgSubmissions: getOrgSubmissions(),
    addOrg: (sub: OrgSubmission) => {
      addOrgSubmission(sub);
      refresh();
    },
    updateOrg: (id: string, updates: Partial<OrgSubmission>) => {
      updateOrgSubmission(id, updates);
      refresh();
    },

    // Campaigns
    campaignSubmissions: getCampaignSubmissions(),
    addCampaign: (sub: CampaignSubmission) => {
      addCampaignSubmission(sub);
      refresh();
    },
    updateCampaign: (id: string, updates: Partial<CampaignSubmission>) => {
      updateCampaignSubmission(id, updates);
      refresh();
    },

    // Verifier mode
    verifierMode: getVerifierMode(),
    setVerifierMode: (enabled: boolean) => {
      setVerifierMode(enabled);
      refresh();
    },

    // Subscriptions
    subscriptions: getUpdateSubscriptions(),
    addSubscription: (sub: UpdateSubscription) => {
      addUpdateSubscription(sub);
      refresh();
    },

    refresh,
  };
}
