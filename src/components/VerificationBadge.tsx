import { CheckCircle, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationChecklist, VerificationLevel } from "@/types/verification";
import { computeVerificationLevel } from "@/types/verification";

type VerificationStatus = "verified" | "pending" | "unverified" | "enhanced";

interface VerificationBadgeProps {
  /** Direct status override */
  status?: VerificationStatus;
  /** Or compute from a checklist + evidence count */
  checklist?: VerificationChecklist;
  totalEvidenceCount?: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function VerificationBadge({ 
  status, 
  checklist,
  totalEvidenceCount = 0,
  showLabel = true, 
  size = "md" 
}: VerificationBadgeProps) {
  // Compute status from checklist if provided, otherwise use direct status
  const resolvedStatus: VerificationStatus = checklist
    ? computeVerificationLevel(checklist, totalEvidenceCount)
    : status ?? "unverified";

  const iconSize = size === "sm" ? 12 : 14;
  
  const config: Record<VerificationStatus, {
    icon: typeof CheckCircle;
    label: string;
    className: string;
  }> = {
    verified: {
      icon: CheckCircle,
      label: "Verified",
      className: "badge-verified",
    },
    enhanced: {
      icon: ShieldCheck,
      label: "Enhanced Verified",
      className: "badge-verified",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      className: "badge-pending",
    },
    unverified: {
      icon: AlertCircle,
      label: "Unverified",
      className: "badge-unverified",
    },
  };

  const { icon: Icon, label, className } = config[resolvedStatus];

  return (
    <span className={cn(className, size === "sm" && "text-[10px] px-1.5")}>
      <Icon size={iconSize} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
