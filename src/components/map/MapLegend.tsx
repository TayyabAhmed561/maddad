import { useState } from "react";
import { cn } from "@/lib/utils";
import { categoryColors, MapCategory } from "@/data/mapData";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

const allCategories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];

interface MapLegendProps {
  className?: string;
  heatmapEnabled?: boolean;
}

export function MapLegend({ className, heatmapEnabled = false }: MapLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-card overflow-hidden transition-all duration-300",
      className
    )}>
      {/* Header — always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/30 transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Map Legend
        </span>
        {isCollapsed ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {!isCollapsed && (
        <div className="px-3 pb-3 space-y-3">
          {/* Category markers */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {allCategories.map((category) => (
              <div key={category} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-background"
                  style={{ backgroundColor: categoryColors[category]?.marker }}
                />
                <span className="text-[10px] text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>

          {/* Verification signals */}
          <div className="border-t border-border pt-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[10px] text-muted-foreground">Verified organization</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-accent shrink-0" />
              <span className="text-[10px] text-muted-foreground">Endorsed / Zakat eligible</span>
            </div>
          </div>

          {/* Heatmap gradient legend */}
          {heatmapEnabled && (
            <div className="border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground mb-1.5">Crisis Density</p>
              <div className="flex items-center gap-1">
                <div
                  className="h-2 flex-1 rounded-full"
                  style={{
                    background: "linear-gradient(to right, hsl(120, 35%, 45%), hsl(48, 75%, 55%), hsl(32, 70%, 50%), hsl(0, 60%, 45%), hsl(340, 50%, 28%))"
                  }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-muted-foreground">Low</span>
                <span className="text-[9px] text-muted-foreground">Critical</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
