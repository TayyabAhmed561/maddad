import { MapPin, Building, Flag, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScopeLevel } from "@/data/mapData";

interface ScopeLevelControlProps {
  currentScope: ScopeLevel;
  onScopeChange: (scope: ScopeLevel) => void;
  isLocating?: boolean;
  className?: string;
}

const scopeOptions: { value: ScopeLevel; label: string; icon: React.ReactNode }[] = [
  { value: "local", label: "Local", icon: <MapPin className="w-3.5 h-3.5" /> },
  { value: "provincial", label: "Provincial", icon: <Building className="w-3.5 h-3.5" /> },
  { value: "canada", label: "Canada", icon: <Flag className="w-3.5 h-3.5" /> },
  { value: "global", label: "Global", icon: <Globe className="w-3.5 h-3.5" /> },
];

export function ScopeLevelControl({ currentScope, onScopeChange, isLocating, className }: ScopeLevelControlProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card",
        className
      )}
    >
      {scopeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onScopeChange(option.value)}
          disabled={isLocating && option.value === "local"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300",
            currentScope === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
            isLocating && option.value === "local" && "opacity-50 cursor-wait"
          )}
        >
          {isLocating && option.value === "local" ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            option.icon
          )}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
