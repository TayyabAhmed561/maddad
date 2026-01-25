import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NeedCard } from "@/components/NeedCard";
import { NeedCardSkeleton } from "@/components/skeletons/CardSkeleton";
import { MaddadMap } from "@/components/map/MaddadMap";
import "@/components/map/MapPopupStyles.css";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Button } from "@/components/ui/button";
import { needsData } from "@/data/needsData";
import { mapItems, MapItem } from "@/data/mapData";
import { Search, SlidersHorizontal, CheckCircle, MapPin, Map as MapIcon, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedMapItem, setSelectedMapItem] = useState<MapItem | null>(null);

  // Filter needs based on search and verified filter
  const filteredNeeds = needsData.filter((need) => {
    const matchesSearch = 
      need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      need.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      need.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVerified = !verifiedOnly || need.isVerified;
    
    return matchesSearch && matchesVerified;
  });

  // Navigate to detail page
  const handleView = (id: string) => {
    navigate(`/need/${id}`);
  };

  // Navigate to detail page with donate anchor
  const handleDonate = (id: string) => {
    navigate(`/need/${id}#donate`);
  };

  // Handle map item selection
  const handleMapItemSelect = (item: MapItem) => {
    setSelectedMapItem(item);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === "map" ? "list" : "map");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-warm py-10 md:py-14 border-b border-border">
          <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Explore Verified Needs
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover verified humanitarian needs from trusted organizations. Every cause is carefully reviewed for transparency and impact.
            </p>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border py-4">
          <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search needs, organizations, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Filter Toggles */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    verifiedOnly
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  )}
                >
                  <CheckCircle size={16} />
                  Verified Only
                </button>
                
                <Button 
                  variant="outline" 
                  size="default"
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - Map + List */}
        <section className="py-8 md:py-12">
          <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map */}
              <div className="order-2 lg:order-1">
                <div className="h-[400px] lg:h-[600px]">
                  <MaddadMap 
                    className="h-full"
                    onItemSelect={handleMapItemSelect}
                    showListToggle={true}
                    onToggleView={toggleViewMode}
                    isListView={viewMode === "list"}
                  />
                </div>
              </div>

              {/* Needs List */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{filteredNeeds.length}</span> needs found
                  </p>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((i) => (
                      <NeedCardSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredNeeds.length > 0 ? (
                  <div className="space-y-5">
                    {filteredNeeds.map((need, index) => (
                      <div 
                        key={need.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <NeedCard
                          {...need}
                          onView={handleView}
                          onDonate={handleDonate}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-16 bg-card rounded-xl border border-border">
                    <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      No needs found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search or filters to find more needs.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setVerifiedOnly(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Filter Drawer */}
      <FilterDrawer 
        isOpen={filterDrawerOpen} 
        onClose={() => setFilterDrawerOpen(false)} 
      />
    </div>
  );
}
