import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MapControlsProps {
  onResetView: () => void;
  scopeLabel?: string;
  className?: string;
}

export function MapControls({ onResetView, scopeLabel = "default", className }: MapControlsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onResetView}
            className={cn(
              "flex items-center justify-center w-10 h-10 bg-card/95 backdrop-blur-md rounded-lg border border-border shadow-card",
              "text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300",
              className
            )}
            aria-label="Reset View"
          >
            <Home className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card border-border">
          <p className="text-xs">Reset to {scopeLabel} view</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
