import { ProofPack } from "@/components/verification/ProofPack";
import { ImpactTimeline } from "@/components/verification/ImpactTimeline";
import { useEvidence } from "@/hooks/queries/useEvidence";
import {
  givingProgramChecklists,
  givingProgramTrackingIds,
  milestoneTemplates,
} from "@/data/verificationRules";
import { ShieldCheck } from "lucide-react";

interface GivingProofSectionProps {
  givingCategory: string;
  campaignId?: string;
  orgId?: string;
  className?: string;
}

export function GivingProofSection({ givingCategory, campaignId, orgId, className }: GivingProofSectionProps) {
  const checklist = givingProgramChecklists[givingCategory];
  if (!checklist) return null;

  const { data: evidenceItems } = useEvidence({ campaignId, orgId });
  const trackingPlan = milestoneTemplates[givingCategory] || milestoneTemplates.default;
  const trackingId = givingProgramTrackingIds[givingCategory] ?? `MDD-${givingCategory.toUpperCase().slice(0, 4)}-2026-XXXX`;

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
          evidenceIds={[]}
          evidence={evidenceItems.length > 0 ? evidenceItems : undefined}
          checklist={checklist}
          trackingPlan={trackingPlan}
        />

        <ImpactTimeline
          milestones={[]}
          trackingId={trackingId}
          approvedEvidenceCount={evidenceItems.filter(e => e.status === 'approved').length}
          totalEvidenceCount={evidenceItems.length}
        />
      </div>
    </div>
  );
}
