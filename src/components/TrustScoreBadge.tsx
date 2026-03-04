import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import type { TrustScore } from "@/types/platform";

interface TrustScoreBadgeProps {
  score: TrustScore;
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-primary";
  if (score >= 75) return "text-accent";
  return "text-muted-foreground";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  return "Developing";
}

export function TrustScoreBadge({ score, size = "md", showBreakdown = false, className }: TrustScoreBadgeProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border", className)}>
      {/* Main score */}
      <div className={cn(
        "flex items-center gap-3",
        size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4"
      )}>
        <div className={cn(
          "relative flex items-center justify-center rounded-full bg-primary/10",
          size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12"
        )}>
          <span className={cn(
            "font-serif font-bold",
            size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg",
            getScoreColor(score.overall)
          )}>
            {score.overall}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className={cn(
              "text-primary",
              size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
            )} />
            <span className={cn(
              "font-medium text-foreground",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              Trust Score
            </span>
          </div>
          <p className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-[10px]" : "text-xs"
          )}>
            {getScoreLabel(score.overall)} — Based on verification and track record
          </p>
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="border-t border-border px-4 py-3 space-y-2.5">
          {[
            { label: "Verification Level", value: score.verificationLevel },
            { label: "Evidence Completeness", value: score.evidenceCompleteness },
            { label: "Project Completion", value: score.projectCompletionRate },
            { label: "Financial Clarity", value: score.financialClarity },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className={cn("text-xs font-medium", getScoreColor(item.value))}>
                  {item.value}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
