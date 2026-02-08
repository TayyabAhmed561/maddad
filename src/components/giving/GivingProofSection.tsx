import { ProofPack } from "@/components/verification/ProofPack";
import { ImpactTimeline } from "@/components/verification/ImpactTimeline";
import { givingCampaigns } from "@/data/givingCampaignsData";
import { milestoneTemplates } from "@/data/verificationRules";
import { getPublicEvidenceByIds } from "@/data/evidenceData";
import { ShieldCheck } from "lucide-react";

interface GivingProofSectionProps {
  givingCategory: string;
  className?: string;
}

export function GivingProofSection({ givingCategory, className }: GivingProofSectionProps) {
  const campaign = givingCampaigns[givingCategory];
  if (!campaign) return null;

  const publicEvidence = getPublicEvidenceByIds(campaign.evidenceIds);
  const approvedCount = publicEvidence.filter((e) => e.status === "approved").length;
  const trackingPlan = milestoneTemplates[givingCategory] || milestoneTemplates.default;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck size={20} className="text-primary" />
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Verified Distribution & Proof
        </h2>
      </div>

      <div className="space-y-8">
        <ProofPack
          evidenceIds={campaign.evidenceIds}
          checklist={campaign.checklist}
          trackingPlan={trackingPlan}
        />

        <ImpactTimeline
          milestones={campaign.milestones}
          trackingId={campaign.trackingId}
          approvedEvidenceCount={approvedCount}
          totalEvidenceCount={publicEvidence.length}
        />
      </div>
    </div>
  );
}
