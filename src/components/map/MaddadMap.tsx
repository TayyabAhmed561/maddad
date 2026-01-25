import { useState, useCallback, useMemo } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, CheckCircle, Clock, Award, List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  mapItems,
  MapItem,
  MapCategory,
  categoryColors,
  ONTARIO_CENTER,
  ONTARIO_ZOOM,
  GLOBAL_CENTER,
  GLOBAL_ZOOM,
} from "@/data/mapData";

const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined)?.trim();
console.log("VITE_MAPBOX_TOKEN:", import.meta.env.VITE_MAPBOX_TOKEN);

// Ontario bounds to restrict panning in Ontario mode (optional but recommended)
const ONTARIO_BOUNDS: [[number, number], [number, number]] = [
  [-95.2, 41.7], // SW [lng, lat]
  [-74.3, 56.9], // NE [lng, lat]
];

const allCategories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];

interface MaddadMapProps {
  className?: string;
  onItemSelect?: (item: MapItem) => void;
  showListToggle?: boolean;
  onToggleView?: () => void;
  isListView?: boolean;
}

export function MaddadMap({
  className,
  onItemSelect,
  showListToggle = false,
  onToggleView,
  isListView = false,
}: MaddadMapProps) {
  const navigate = useNavigate();

  const [viewState, setViewState] = useState({
    latitude: ONTARIO_CENTER.lat,
    longitude: ONTARIO_CENTER.lng,
    zoom: ONTARIO_ZOOM,
  });

  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [regionView, setRegionView] = useState<"ontario" | "global">("ontario");
  const [activeCategory, setActiveCategory] = useState<MapCategory | "All">("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filter items based on region, category, and verification
  const filteredItems = useMemo(() => {
    return mapItems.filter((item) => {
      // Region filter
      const isOntario = item.locationLabel.includes("ON");
      if (regionView === "ontario" && !isOntario) return false;

      // Category filter
      if (activeCategory !== "All" && item.category !== activeCategory) return false;

      // Verification filter
      if (verifiedOnly && item.verifiedStatus !== "verified") return false;

      return true;
    });
  }, [regionView, activeCategory, verifiedOnly]);

  // Handle region change
  const handleRegionChange = useCallback((region: "ontario" | "global") => {
    setRegionView(region);
    setSelectedItem(null);

    if (region === "ontario") {
      setViewState((prev) => ({
        ...prev,
        latitude: ONTARIO_CENTER.lat,
        longitude: ONTARIO_CENTER.lng,
        zoom: ONTARIO_ZOOM,
      }));
    } else {
      setViewState((prev) => ({
        ...prev,
        latitude: GLOBAL_CENTER.lat,
        longitude: GLOBAL_CENTER.lng,
        zoom: GLOBAL_ZOOM,
      }));
    }
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (item: MapItem) => {
      setSelectedItem(item);
      onItemSelect?.(item);
    },
    [onItemSelect],
  );

  // Handle view details click
  const handleViewDetails = useCallback(
    (item: MapItem) => {
      if (item.type === "appeal") {
        navigate(`/appeals/${item.id}`);
      } else if (item.type === "need") {
        navigate(`/need/${item.id}`);
      } else {
        navigate(`/need/${item.id}`);
      }
    },
    [navigate],
  );

  // If token missing or invalid, show placeholder + log
  if (!MAPBOX_TOKEN || !MAPBOX_TOKEN.startsWith("pk.")) {
    // This makes the reason obvious in DevTools
    console.error("Missing/invalid Mapbox token:", MAPBOX_TOKEN);

    return (
      <div
        className={cn(
          "relative w-full h-full min-h-[400px] bg-card rounded-2xl border border-border overflow-hidden flex items-center justify-center",
          className,
        )}
      >
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Map Temporarily Unavailable</h3>
          <p className="text-muted-foreground mb-3">
            Mapbox token not detected. Make sure <span className="font-mono">VITE_MAPBOX_TOKEN</span> is set (no
            spaces/newlines), then restart the dev server / preview.
          </p>
          <Button variant="outline" onClick={() => navigate("/explore")}>
            <List className="w-4 h-4 mr-2" />
            View List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[400px] bg-background-warm rounded-2xl border border-border overflow-hidden",
        "shadow-[0_6px_24px_-6px_hsl(35_30%_25%_/_0.08)]",
        className,
      )}
    >
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-3">
        {/* Region Toggle + View Toggle Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Region Toggle */}
          <div className="flex items-center gap-1 p-1 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card">
            <button
              onClick={() => handleRegionChange("ontario")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all duration-300",
                regionView === "ontario"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Ontario
            </button>
            <button
              onClick={() => handleRegionChange("global")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all duration-300",
                regionView === "global"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Global
            </button>
          </div>

          {/* View Toggle */}
          {showListToggle && (
            <button
              onClick={onToggleView}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-card text-foreground hover:bg-muted transition-all duration-300"
            >
              {isListView ? (
                <>
                  <MapIcon className="w-4 h-4" />
                  Map View
                </>
              ) : (
                <>
                  <List className="w-4 h-4" />
                  List View
                </>
              )}
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("All")}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
              activeCategory === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Verified Filter */}
        <div className="flex items-center">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300",
              verifiedOnly
                ? "bg-primary text-primary-foreground"
                : "bg-card/95 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Verified Only
          </button>
        </div>
      </div>

      {/* Map */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
        // Restrict panning/zoom in Ontario view
        maxBounds={regionView === "ontario" ? ONTARIO_BOUNDS : undefined}
        minZoom={regionView === "ontario" ? 4 : 1}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Markers */}
        {filteredItems.map((item) => (
          <Marker
            key={item.id}
            latitude={item.lat}
            longitude={item.lng}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(item);
            }}
          >
            <button className="relative group transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer">
              {/* Outer ring for endorsed/zakat eligible */}
              {(item.endorsedBy || item.zakatEligible) && (
                <div
                  className="absolute inset-[-3px] rounded-full opacity-60"
                  style={{
                    background: "linear-gradient(135deg, hsl(38, 62%, 42%) 0%, hsl(40, 50%, 55%) 100%)",
                    boxShadow: "0 0 8px hsl(38 62% 42% / 0.3)",
                  }}
                />
              )}

              {/* Main marker */}
              <div
                className={cn(
                  "relative w-6 h-6 rounded-full flex items-center justify-center",
                  "border-2 border-white shadow-md",
                  item.verifiedStatus === "verified" && "ring-1 ring-white/50",
                )}
                style={{
                  backgroundColor: categoryColors[item.category]?.marker || "hsl(160, 45%, 32%)",
                }}
              >
                <MapPin className="w-3 h-3 text-white" />
              </div>
            </button>
          </Marker>
        ))}

        {/* Popup */}
        {selectedItem && (
          <Popup
            latitude={selectedItem.lat}
            longitude={selectedItem.lng}
            onClose={() => setSelectedItem(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={15}
            className="maddad-popup"
          >
            <div className="min-w-[260px] max-w-[300px] p-1">
              <h3 className="font-serif text-base font-semibold text-foreground mb-1 pr-4">{selectedItem.title}</h3>

              {selectedItem.orgName && <p className="text-xs text-muted-foreground mb-2">{selectedItem.orgName}</p>}

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full",
                    selectedItem.verifiedStatus === "verified" && "bg-primary/10 text-primary",
                    selectedItem.verifiedStatus === "pending" && "bg-accent/10 text-accent-foreground",
                    selectedItem.verifiedStatus === "unverified" && "bg-muted text-muted-foreground",
                  )}
                >
                  {selectedItem.verifiedStatus === "verified" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {selectedItem.verifiedStatus === "verified"
                    ? "Verified"
                    : selectedItem.verifiedStatus === "pending"
                      ? "Pending"
                      : "Unverified"}
                </span>

                {selectedItem.zakatEligible && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent-foreground">
                    Zakat Eligible
                  </span>
                )}

                {selectedItem.endorsedBy && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-light text-accent-foreground">
                    <Award className="w-3 h-3" />
                    Endorsed
                  </span>
                )}
              </div>

              {selectedItem.goal && selectedItem.fundingRaised !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">${selectedItem.fundingRaised.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${selectedItem.goal.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((selectedItem.fundingRaised / selectedItem.goal) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedItem.privacyLevel === "local_private"
                    ? selectedItem.locationLabel.split(",")[0] + " Area"
                    : selectedItem.locationLabel}
                </span>
                <span>Updated {selectedItem.lastUpdated}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => handleViewDetails(selectedItem)}>
                  View Details
                </Button>

                {(selectedItem.type === "need" || selectedItem.type === "appeal") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => navigate(`/need/${selectedItem.id}#donate`)}
                  >
                    Donate
                  </Button>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-card border border-border">
        <div className="flex flex-wrap gap-3 text-xs">
          {allCategories.slice(0, 5).map((category) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[category]?.marker }} />
              <span className="text-muted-foreground">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="absolute bottom-4 right-16 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-card border border-border">
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filteredItems.length}</span> locations
        </span>
      </div>
    </div>
  );
}
