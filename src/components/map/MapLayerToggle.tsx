import { cn } from "@/lib/utils";
import { MapPin, Flame } from "lucide-react";

export type MapLayerMode = "pins" | "heatmap";

interface MapLayerToggleProps {
  mode: MapLayerMode;
  onChange: (mode: MapLayerMode) => void;
  className?: string;
}

const options: { value: MapLayerMode; label: string; icon: React.ElementType }[] = [
  { value: "pins", label: "Pins", icon: MapPin },
  { value: "heatmap", label: "Heatmap", icon: Flame },
];

export function MapLayerToggle({ mode, onChange, className }: MapLayerToggleProps) {
  return (
    <div className={cn("flex items-center bg-card/95 backdrop-blur-md rounded-lg border border-border shadow-card overflow-hidden", className)}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium px-2.5 hidden sm:block">
        Map View
      </span>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-300",
            mode === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
