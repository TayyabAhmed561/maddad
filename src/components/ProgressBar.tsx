import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  goal: number;
  showLabels?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({ 
  current, 
  goal, 
  showLabels = true, 
  size = "md",
  className 
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("progress-bar", size === "sm" ? "h-1.5" : "h-2")}>
        <div 
          className="progress-fill animate-progress-fill"
          style={{ 
            "--progress-width": `${percentage}%`,
            width: `${percentage}%`
          } as React.CSSProperties}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between items-center mt-1.5">
          <span className={cn(
            "font-medium text-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {formatCurrency(current)} raised
          </span>
          <span className={cn(
            "text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {formatCurrency(goal)} goal
          </span>
        </div>
      )}
    </div>
  );
}
