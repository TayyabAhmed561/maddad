import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceConfidenceIndicatorProps {
  status: "approved" | "pending" | "rejected";
  size?: "sm" | "md";
  className?: string;
}

const statusConfig = {
  approved: {
    icon: CheckCircle,
    label: "Approved",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  pending: {
    icon: Clock,
    label: "Pending Review",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export function EvidenceConfidenceIndicator({ status, size = "sm", className }: EvidenceConfidenceIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      config.color,
      config.bg,
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      className
    )}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {config.label}
    </span>
  );
}
