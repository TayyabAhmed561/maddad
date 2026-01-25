import { useEffect, useRef } from "react";
import { X, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NeedCard } from "@/components/NeedCard";
import { NeedCardSkeleton } from "@/components/skeletons/CardSkeleton";
import { MapItem } from "@/data/mapData";
import { needsData } from "@/data/needsData";

interface ResultsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedItemId: string | null;
  onView: (id: string) => void;
  onDonate: (id: string) => void;
  filteredCount: number;
  isLoading?: boolean;
  className?: string;
}

export function ResultsPanel({
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  selectedItemId,
  onView,
  onDonate,
  filteredCount,
  isLoading = false,
  className,
}: ResultsPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter needs based on search
  const filteredNeeds = needsData.filter((need) => {
    const matchesSearch =
      need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      need.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      need.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Auto-scroll to selected item
  useEffect(() => {
    if (selectedItemId && cardRefs.current[selectedItemId] && scrollContainerRef.current) {
      const card = cardRefs.current[selectedItemId];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect
        card.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          card.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 2000);
      }
    }
  }, [selectedItemId]);

  // Collapsed state - show pill button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 px-4 py-3 bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-card",
          "text-sm font-medium text-foreground hover:bg-muted transition-all duration-300",
          className
        )}
      >
        <span>Show List</span>
        <span className="text-xs text-muted-foreground">({filteredCount})</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-card overflow-hidden",
        "w-full md:w-[440px] lg:w-[480px] max-h-full",
        className
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">Verified Needs</h2>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredNeeds.length}</span> needs found
          </p>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
        >
          <X className="w-5 h-5" />
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
        ) : filteredNeeds.length > 0 ? (
          filteredNeeds.map((need, index) => (
            <div
              key={need.id}
              ref={(el) => {
                cardRefs.current[need.id] = el;
              }}
              className="animate-fade-in-up transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NeedCard
                {...need}
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
