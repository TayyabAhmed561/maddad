import { cn } from "@/lib/utils";

interface AllocationItem {
  label: string;
  percentage: number;
  description?: string;
}

interface AllocationBreakdownProps {
  items: AllocationItem[];
  title?: string;
  className?: string;
}

export function AllocationBreakdown({ 
  items, 
  title = "Where your donation goes",
  className 
}: AllocationBreakdownProps) {
  return (
    <div className={cn("bg-primary-light rounded-lg p-4", className)}>
      <p className="text-sm font-medium text-primary mb-3">{title}</p>
      
      {/* Visual bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "h-full transition-all duration-500",
              index === 0 && "bg-primary",
              index === 1 && "bg-primary/70",
              index === 2 && "bg-primary/40"
            )}
            style={{ width: `${item.percentage}%` }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  index === 0 && "bg-primary",
                  index === 1 && "bg-primary/70",
                  index === 2 && "bg-primary/40"
                )}
              />
              <span className="text-secondary-foreground">{item.label}</span>
            </div>
            <span className="font-medium text-foreground">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
