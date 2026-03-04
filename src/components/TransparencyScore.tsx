import { ShieldCheck, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransparencyScoreProps {
  evidenceComplete: number; // 0-100
  milestonesUpdated: number; // 0-100
  financialClarity: number; // 0-100
  size?: "sm" | "md";
  className?: string;
}

export function TransparencyScore({
  evidenceComplete,
  milestonesUpdated,
  financialClarity,
  size = "md",
  className,
}: TransparencyScoreProps) {
  const overall = Math.round((evidenceComplete + milestonesUpdated + financialClarity) / 3);

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border",
      size === "sm" ? "p-3" : "p-5",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Eye className={cn("text-primary", size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
        <h3 className={cn(
          "font-serif font-semibold text-foreground",
          size === "sm" ? "text-sm" : "text-base"
        )}>
          Transparency Score
        </h3>
      </div>

      {/* Overall score */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "flex items-center justify-center rounded-full bg-primary/10",
          size === "sm" ? "w-10 h-10" : "w-14 h-14"
        )}>
          <span className={cn(
            "font-serif font-bold text-primary",
            size === "sm" ? "text-base" : "text-xl"
          )}>
            {overall}
          </span>
        </div>
        <div>
          <p className={cn("font-medium text-foreground", size === "sm" ? "text-xs" : "text-sm")}>
            {overall >= 90 ? "Excellent" : overall >= 75 ? "Good" : overall >= 60 ? "Fair" : "Developing"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Out of 100
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2">
        {[
          { label: "Evidence completeness", value: evidenceComplete },
          { label: "Milestone updates", value: milestonesUpdated },
          { label: "Financial clarity", value: financialClarity },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
              <span className="text-[10px] font-medium text-foreground">{item.value}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
