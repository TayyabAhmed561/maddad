import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapCategory, ScopeLevel } from "@/data/mapData";
import { ScopeLevelControl } from "./ScopeLevelControl";

const allCategories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];

interface MapFiltersOverlayProps {
  scopeLevel: ScopeLevel;
  onScopeChange: (scope: ScopeLevel) => void;
  isLocating: boolean;
  activeCategory: MapCategory | "All";
  onCategoryChange: (category: MapCategory | "All") => void;
  verifiedOnly: boolean;
  onVerifiedChange: (verified: boolean) => void;
  className?: string;
  isPanelOpen?: boolean;
}

export function MapFiltersOverlay({
  scopeLevel,
  onScopeChange,
  isLocating,
  activeCategory,
  onCategoryChange,
  verifiedOnly,
  onVerifiedChange,
  className,
  isPanelOpen = true,
}: MapFiltersOverlayProps) {
  const maxWidthClass = isPanelOpen 
    ? "max-w-[calc(100vw-480px)]" 
    : "max-w-[calc(100vw-80px)]";

  return (
    <div className={cn("flex flex-col gap-3", maxWidthClass, className)}>
      <ScopeLevelControl
        currentScope={scopeLevel}
        onScopeChange={onScopeChange}
        isLocating={isLocating}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onCategoryChange("All")}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
            activeCategory === "All"
              ? "bg-primary text-primary-foreground"
              : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
              activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onVerifiedChange(!verifiedOnly)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
            verifiedOnly
              ? "bg-primary text-primary-foreground"
              : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Verified Only
        </button>
      </div>
    </div>
  );
}
