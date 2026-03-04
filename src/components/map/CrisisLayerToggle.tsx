import { useState } from "react";
import { cn } from "@/lib/utils";
import { Layers, AlertTriangle, Users, Utensils, Stethoscope, GraduationCap } from "lucide-react";
import type { CrisisLayer } from "@/types/platform";
import { crisisLayerConfig } from "@/types/platform";

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Users,
  Utensils,
  Stethoscope,
  GraduationCap,
};

interface CrisisLayerToggleProps {
  activeLayers: CrisisLayer[];
  onToggle: (layer: CrisisLayer) => void;
  className?: string;
}

export function CrisisLayerToggle({ activeLayers, onToggle, className }: CrisisLayerToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const layers = Object.entries(crisisLayerConfig) as [CrisisLayer, typeof crisisLayerConfig[CrisisLayer]][];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
          activeLayers.length > 0
            ? "bg-primary text-primary-foreground"
            : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <Layers className="w-3.5 h-3.5" />
        Crisis Layers
        {activeLayers.length > 0 && (
          <span className="bg-primary-foreground/20 text-primary-foreground rounded-full px-1.5 text-[10px]">
            {activeLayers.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="absolute top-full mt-2 left-0 bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-elevated p-3 min-w-[220px] animate-scale-in z-50">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2 px-1">
            Map Layers
          </p>
          <div className="space-y-1">
            {layers.map(([key, config]) => {
              const Icon = iconMap[config.icon] || AlertTriangle;
              const isActive = activeLayers.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => onToggle(key)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: config.color, opacity: isActive ? 1 : 0.4 }}
                  />
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
