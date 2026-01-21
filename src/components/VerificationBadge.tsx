import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type VerificationStatus = "verified" | "pending" | "unverified";

interface VerificationBadgeProps {
  status: VerificationStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function VerificationBadge({ 
  status, 
  showLabel = true, 
  size = "md" 
}: VerificationBadgeProps) {
  const iconSize = size === "sm" ? 12 : 14;
  
  const config = {
    verified: {
      icon: CheckCircle,
      label: "Verified",
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

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={cn(className, size === "sm" && "text-[10px] px-1.5")}>
      <Icon size={iconSize} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
