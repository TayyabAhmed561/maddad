import { Crosshair, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onRecenterOntario: () => void;
  onResetZoom: () => void;
  onResetView: () => void;
  className?: string;
}

export function MapControls({ onRecenterOntario, onResetZoom, onResetView, className }: MapControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-card/95 backdrop-blur-md rounded-lg border border-border shadow-card overflow-hidden",
        className
      )}
    >
      <button
        onClick={onResetView}
        className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
        title="Reset View"
      >
        <Home className="w-4 h-4" />
      </button>
      <div className="h-px bg-border" />
      <button
        onClick={onRecenterOntario}
        className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
        title="Recenter Ontario"
      >
        <Crosshair className="w-4 h-4" />
      </button>
      <div className="h-px bg-border" />
      <button
        onClick={onResetZoom}
        className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
        title="Reset Zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
