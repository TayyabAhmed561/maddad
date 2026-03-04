import { cn } from "@/lib/utils";
import { categoryColors, MapCategory } from "@/data/mapData";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const allCategories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-card p-3",
      className
    )}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
        Map Legend
      </p>
      
      {/* Categories */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        {allCategories.map((category) => (
          <div key={category} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: categoryColors[category]?.marker }}
            />
            <span className="text-[10px] text-muted-foreground">{category}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 space-y-1.5">
        {/* Verification signals */}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
          <span className="text-[10px] text-muted-foreground">Verified organization</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-accent shrink-0" />
          <span className="text-[10px] text-muted-foreground">Endorsed / Zakat eligible</span>
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
          <span className="text-[10px] text-muted-foreground">Critical urgency (pulsing)</span>
        </div>
      </div>
    </div>
  );
}
