import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { MaddadMap } from "@/components/map/MaddadMap";
import { ResultsPanel } from "@/components/map/ResultsPanel";
import "@/components/map/MapPopupStyles.css";
import { MapItem, mapItems } from "@/data/mapData";
import { useIsMobile } from "@/hooks/use-mobile";

// Map reference type for controlling map externally
interface MapRef {
  focusOnItem: (itemId: string) => void;
}

export default function Explore() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedMapItemId, setSelectedMapItemId] = useState<string | null>(null);
  
  // Reference to programmatically control the map
  const mapFocusRef = useRef<((itemId: string) => void) | null>(null);

  // Navigate to detail page
  const handleView = useCallback((id: string) => {
    navigate(`/need/${id}`);
  }, [navigate]);

  // Navigate to detail page with donate anchor
  const handleDonate = useCallback((id: string) => {
    navigate(`/need/${id}#donate`);
  }, [navigate]);

  // Handle map item selection - highlight in panel (from map marker click)
  const handleMapItemSelect = useCallback((item: MapItem) => {
    setSelectedMapItemId(item.id);
    // Ensure panel is open when marker is clicked
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
  }, [isPanelOpen]);

  // Handle card click - focus map on item (from panel card click)
  const handleCardClick = useCallback((id: string) => {
    setSelectedMapItemId(id);
    // Trigger map focus via the callback stored in ref
    if (mapFocusRef.current) {
      mapFocusRef.current(id);
    }
  }, []);

  // Store the focus function from MaddadMap
  const handleFocusItem = useCallback((focusFn: (itemId: string) => void) => {
    mapFocusRef.current = focusFn;
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      {/* Main content area - full height minus header */}
      <main className="flex-1 relative">
        {/* Full-screen Map - passes panel state for camera offset */}
        <MaddadMap
          className="absolute inset-0"
          onItemSelect={handleMapItemSelect}
          selectedItemId={selectedMapItemId}
          isPanelOpen={isPanelOpen}
        />

        {/* Right Overlay Panel - Results List (Desktop) */}
        {/* On mobile, this becomes a bottom sheet */}
        {isMobile ? (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ResultsPanel
              isOpen={isPanelOpen}
              onToggle={() => setIsPanelOpen(!isPanelOpen)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedItemId={selectedMapItemId}
              onView={handleView}
              onDonate={handleDonate}
              onCardClick={handleCardClick}
              filteredCount={mapItems.length}
              variant="bottom-sheet"
            />
          </div>
        ) : (
          <div className="absolute top-0 right-0 bottom-0 z-20 flex items-stretch pointer-events-none">
            <div className="pointer-events-auto">
              <ResultsPanel
                isOpen={isPanelOpen}
                onToggle={() => setIsPanelOpen(!isPanelOpen)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedItemId={selectedMapItemId}
                onView={handleView}
                onDonate={handleDonate}
                onCardClick={handleCardClick}
                filteredCount={mapItems.length}
                variant="side-panel"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
