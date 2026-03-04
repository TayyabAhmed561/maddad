import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface MapLayerToggleProps {
  heatmapEnabled: boolean;
  onHeatmapToggle: (enabled: boolean) => void;
  className?: string;
}

export function MapLayerToggle({ heatmapEnabled, onHeatmapToggle, className }: MapLayerToggleProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 bg-card/95 backdrop-blur-md rounded-lg border border-border shadow-card px-3 py-2",
      className
    )}>
      <Flame className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[11px] font-medium text-muted-foreground hidden sm:block">
        Live Crisis Heatmap
      </span>
      <Switch
        checked={heatmapEnabled}
        onCheckedChange={onHeatmapToggle}
        className="scale-75 origin-center"
      />
    </div>
  );
}
