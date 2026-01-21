import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatCard({ icon: Icon, label, value, subtext, className, ...props }: StatCardProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-5 border border-border shadow-card",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      {subtext && (
        <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
}
