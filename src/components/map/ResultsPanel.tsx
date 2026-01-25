import { useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronUp, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapItemCard } from "./MapItemCard";
import { NeedCardSkeleton } from "@/components/skeletons/CardSkeleton";
import { realMapItems, MapItem, isKWItem, isOntarioItem, isCanadaItem, ScopeLevel, getDistanceKm } from "@/data/mapData";

interface ResultsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedItemId: string | null;
  onView: (id: string) => void;
  onDonate: (id: string) => void;
  onCardClick?: (id: string) => void;
  filteredCount: number;
  isLoading?: boolean;
  className?: string;
  variant?: "side-panel" | "bottom-sheet";
  scopeLevel?: ScopeLevel;
  userLocation?: { lat: number; lng: number } | null;
}

export function ResultsPanel({
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  selectedItemId,
  onView,
  onDonate,
  onCardClick,
  filteredCount,
  isLoading = false,
  className,
  variant = "side-panel",
  scopeLevel = "provincial",
  userLocation,
}: ResultsPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get map items for card display (only real items, filtered by scope and search)
  const filteredItems = realMapItems.filter((item) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.orgName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      item.locationLabel.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Scope filter
    if (scopeLevel === "local") {
      if (userLocation) {
        const distance = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
        return distance <= 50; // 50km radius
      }
      return isKWItem(item); // Fallback to KW area
    } else if (scopeLevel === "provincial") {
      return isOntarioItem(item);
    } else if (scopeLevel === "canada") {
      return isCanadaItem(item);
    }
    // global shows all
    return true;
  });

  // Handle card click to focus on map (without navigation)
  const handleCardClick = useCallback((itemId: string, e: React.MouseEvent) => {
    // Check if the click originated from a button - don't trigger card focus
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onCardClick?.(itemId);
  }, [onCardClick]);

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedItemId && cardRefs.current[selectedItemId] && scrollContainerRef.current) {
      const card = cardRefs.current[selectedItemId];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedItemId]);

  // ========== BOTTOM SHEET VARIANT (Mobile) ==========
  if (variant === "bottom-sheet") {
    // Collapsed state - show pill
    if (!isOpen) {
      return (
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-4 bg-card/95 backdrop-blur-md border-t border-border shadow-card",
            "text-sm font-medium text-foreground",
            className
          )}
        >
          <ChevronUp className="w-5 h-5" />
          <span>Show {filteredItems.length} Needs</span>
        </button>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col bg-card/95 backdrop-blur-md border-t border-border shadow-card overflow-hidden",
          "w-full max-h-[60vh]",
          className
        )}
      >
        {/* Drag Handle + Header */}
        <button
          onClick={onToggle}
          className="flex flex-col items-center py-3 border-b border-border"
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronDown className="w-4 h-4" />
            <span>Hide List</span>
          </div>
        </button>

        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search needs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Results List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <NeedCardSkeleton key={i} />
              ))}
            </>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[item.id] = el;
                }}
                onClick={(e) => handleCardClick(item.id, e)}
                className={cn(
                  "animate-fade-in-up transition-all duration-300 cursor-pointer rounded-xl",
                  selectedItemId === item.id && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <MapItemCard
                  item={item}
                  onView={onView}
                  onDonate={onDonate}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No needs match your search.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== SIDE PANEL VARIANT (Desktop) ==========
  // Collapsed state - show pill button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 px-4 py-3 bg-card/95 backdrop-blur-md rounded-l-2xl border border-r-0 border-border shadow-card",
          "text-sm font-medium text-foreground hover:bg-muted transition-all duration-300",
          "h-auto self-center mr-0",
          className
        )}
      >
        <span>Show List</span>
        <span className="text-xs text-muted-foreground">({filteredItems.length})</span>
        <ChevronRight className="w-4 h-4 rotate-180" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-card/95 backdrop-blur-md rounded-l-2xl border border-r-0 border-border shadow-card overflow-hidden",
        "w-[380px] lg:w-[420px] xl:w-[440px] h-full",
        className
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">Verified Needs</h2>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredItems.length}</span> needs found
          </p>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
          title="Collapse panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search needs, organizations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Results List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <NeedCardSkeleton key={i} />
            ))}
          </>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[item.id] = el;
              }}
              onClick={(e) => handleCardClick(item.id, e)}
              className={cn(
                "animate-fade-in-up transition-all duration-300 cursor-pointer rounded-xl",
                selectedItemId === item.id && "ring-2 ring-primary ring-offset-2 ring-offset-card"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <MapItemCard
                item={item}
                onView={onView}
                onDonate={onDonate}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No needs match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
