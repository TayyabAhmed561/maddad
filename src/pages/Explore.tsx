import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { MaddadMap } from "@/components/map/MaddadMap";
import { ResultsPanel } from "@/components/map/ResultsPanel";
import "@/components/map/MapPopupStyles.css";
import { MapItem } from "@/data/mapData";

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedMapItemId, setSelectedMapItemId] = useState<string | null>(null);

  // Navigate to detail page
  const handleView = useCallback((id: string) => {
    navigate(`/need/${id}`);
  }, [navigate]);

  // Navigate to detail page with donate anchor
  const handleDonate = useCallback((id: string) => {
    navigate(`/need/${id}#donate`);
  }, [navigate]);

  // Handle map item selection - highlight in panel
  const handleMapItemSelect = useCallback((item: MapItem) => {
    setSelectedMapItemId(item.id);
    // Ensure panel is open when marker is clicked
    if (!isPanelOpen) {
      setIsPanelOpen(true);
    }
  }, [isPanelOpen]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      {/* Main content area - full height minus header */}
      <main className="flex-1 relative">
        {/* Full-screen Map */}
        <MaddadMap
          className="absolute inset-0"
          onItemSelect={handleMapItemSelect}
          selectedItemId={selectedMapItemId}
        />

        {/* Right Overlay Panel - Results List */}
        <div className="absolute top-4 right-4 bottom-4 z-10 flex items-start">
          <ResultsPanel
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(!isPanelOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedItemId={selectedMapItemId}
            onView={handleView}
            onDonate={handleDonate}
            filteredCount={15} // This could be dynamic based on actual filtered items
          />
        </div>
      </main>
    </div>
  );
}
