import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { MaddadMap } from "@/components/map/MaddadMap";
import { ResultsPanel } from "@/components/map/ResultsPanel";
import "@/components/map/MapPopupStyles.css";
import { mapItems, ScopeLevel } from "@/data/mapData";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Explore() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedMapItemId, setSelectedMapItemId] = useState<string | null>(null);
  const [scopeLevel, setScopeLevel] = useState<ScopeLevel>("provincial");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const mapFocusRef = useRef<((itemId: string) => void) | null>(null);

  const handleView = useCallback((id: string) => {
    navigate(`/need/${id}`);
  }, [navigate]);

  const handleDonate = useCallback((id: string) => {
    navigate(`/need/${id}#donate`);
  }, [navigate]);

  const handleMapItemSelect = useCallback((item: { id: string }) => {
    setSelectedMapItemId(item.id);
    if (!isPanelOpen) setIsPanelOpen(true);
  }, [isPanelOpen]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedMapItemId(id);
  }, []);

  const handleScopeChange = useCallback((scope: ScopeLevel) => {
    setScopeLevel(scope);
  }, []);

  const handleUserLocationChange = useCallback((location: { lat: number; lng: number } | null) => {
    setUserLocation(location);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <main className="flex-1 relative">
        <MaddadMap
          className="absolute inset-0"
          onItemSelect={handleMapItemSelect}
          selectedItemId={selectedMapItemId}
          isPanelOpen={isPanelOpen}
        />

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
