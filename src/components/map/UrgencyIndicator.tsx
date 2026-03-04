import { cn } from "@/lib/utils";
import type { UrgencyLevel } from "@/types/platform";

interface UrgencyIndicatorProps {
  level: UrgencyLevel;
  size?: "sm" | "md";
  className?: string;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; dotClass: string; textClass: string }> = {
  low: { label: "Low", dotClass: "bg-muted-foreground/50", textClass: "text-muted-foreground" },
  medium: { label: "Medium", dotClass: "bg-accent", textClass: "text-accent-foreground" },
  critical: { label: "Critical", dotClass: "bg-destructive animate-pulse", textClass: "text-destructive" },
};

export function UrgencyIndicator({ level, size = "sm", className }: UrgencyIndicatorProps) {
  const config = urgencyConfig[level];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5",
      size === "sm" ? "text-[10px]" : "text-xs",
      config.textClass,
      className
    )}>
      <span className={cn(
        "rounded-full shrink-0",
        size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
        config.dotClass
      )} />
      {config.label} urgency
    </span>
  );
}
