import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
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

/**
 * Hardcode Mapbox token like your ESV project.
 * Paste your token here (must start with "pk.").
 */
mapboxgl.accessToken = "pk.eyJ1IjoibWluaW9uc2EwMCIsImEiOiJjbWt0eTF1MzUxa3dxM3FwcHJuYjhiNXlvIn0.U9u4rqrM2m5yWiqYE5bv2Q";

// Ontario bounds: [west, south, east, north]
const ONTARIO_BOUNDS_LNG_LAT: [number, number, number, number] = [-95.2, 41.7, -74.3, 56.9];

const allCategories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];

type RegionView = "ontario" | "global";

interface MaddadMapProps {
  className?: string;
  onItemSelect?: (item: MapItem) => void;
  showListToggle?: boolean;
  onToggleView?: () => void;
  isListView?: boolean;
}

function isOntarioItem(item: MapItem) {
  return item.locationLabel.includes("ON");
}

function getVerifiedLabel(status: MapItem["verifiedStatus"]) {
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
}

export function MaddadMap({
  className,
  onItemSelect,
  showListToggle = false,
  onToggleView,
  isListView = false,
}: MaddadMapProps) {
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [regionView, setRegionView] = useState<RegionView>("ontario");
  const [activeCategory, setActiveCategory] = useState<MapCategory | "All">("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return mapItems.filter((item) => {
      if (regionView === "ontario" && !isOntarioItem(item)) return false;
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (verifiedOnly && item.verifiedStatus !== "verified") return false;
      return true;
    });
  }, [regionView, activeCategory, verifiedOnly]);

  const geojson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: filteredItems.map((item) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [item.lng, item.lat] },
        properties: {
          id: item.id,
          category: item.category,
          verifiedStatus: item.verifiedStatus,
          endorsed: Boolean(item.endorsedBy),
          zakatEligible: Boolean(item.zakatEligible),
        },
      })),
    } as GeoJSON.FeatureCollection<GeoJSON.Point>;
  }, [filteredItems]);

  const closePopup = useCallback(() => {
    setSelectedItem(null);
    if (popupRef.current) popupRef.current.remove();
    popupRef.current = null;
  }, []);

  const openPopupForItem = useCallback(
    (item: MapItem, lngLat: mapboxgl.LngLatLike) => {
      setSelectedItem(item);
      onItemSelect?.(item);

      if (!popupContentRef.current) popupContentRef.current = document.createElement("div");

      if (popupRef.current) popupRef.current.remove();

      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        anchor: "bottom",
        offset: 14,
        maxWidth: "320px",
      })
        .setLngLat(lngLat)
        .setDOMContent(popupContentRef.current)
        .addTo(mapRef.current!);

      // If user closes popup using the X button
      popupRef.current.on("close", () => {
        setSelectedItem(null);
        popupRef.current = null;
      });
    },
    [onItemSelect],
  );

  // Initialize map once (ESV-style)
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const initialCenter: [number, number] = [ONTARIO_CENTER.lng, ONTARIO_CENTER.lat];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: initialCenter,
      zoom: ONTARIO_ZOOM,
      minZoom: 4,
      maxBounds: ONTARIO_BOUNDS_LNG_LAT,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // Source
      if (!map.getSource("maddad-items")) {
        map.addSource("maddad-items", { type: "geojson", data: geojson });
      }

      // Cleanup layers if hot reloading
      if (map.getLayer("maddad-items-ring")) map.removeLayer("maddad-items-ring");
      if (map.getLayer("maddad-items-layer")) map.removeLayer("maddad-items-layer");

      // Ring for endorsed or zakat eligible
      map.addLayer({
        id: "maddad-items-ring",
        type: "circle",
        source: "maddad-items",
        paint: {
          "circle-radius": 13,
          "circle-color": [
            "case",
            ["any", ["==", ["get", "endorsed"], true], ["==", ["get", "zakatEligible"], true]],
            "rgba(186, 140, 44, 0.45)",
            "rgba(0,0,0,0)",
          ],
          "circle-blur": 0.2,
        },
      });

      // Main markers
      map.addLayer({
        id: "maddad-items-layer",
        type: "circle",
        source: "maddad-items",
        paint: {
          "circle-radius": 9,
          "circle-color": [
            "match",
            ["get", "category"],
            "Food",
            categoryColors.Food?.marker ?? "hsl(160, 45%, 32%)",
            "Shelter",
            categoryColors.Shelter?.marker ?? "hsl(160, 45%, 32%)",
            "Medical",
            categoryColors.Medical?.marker ?? "hsl(160, 45%, 32%)",
            "Education",
            categoryColors.Education?.marker ?? "hsl(160, 45%, 32%)",
            "Masjid",
            categoryColors.Masjid?.marker ?? "hsl(160, 45%, 32%)",
            "Fidya",
            categoryColors.Fidya?.marker ?? "hsl(160, 45%, 32%)",
            "Qurbani",
            categoryColors.Qurbani?.marker ?? "hsl(160, 45%, 32%)",
            "Zakat",
            categoryColors.Zakat?.marker ?? "hsl(160, 45%, 32%)",
            "hsl(160, 45%, 32%)",
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 2,
        },
      });

      map.on("mouseenter", "maddad-items-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "maddad-items-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "maddad-items-layer", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const clickedId = feature.properties?.id as string | undefined;
        if (!clickedId) return;

        const item = filteredItems.find((x) => x.id === clickedId);
        if (!item) return;

        openPopupForItem(item, e.lngLat);
      });

      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ["maddad-items-layer"] });
        if (hits.length === 0) closePopup();
      });
    });

    mapRef.current = map;

    return () => {
      if (popupRef.current) popupRef.current.remove();
      popupRef.current = null;

      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update GeoJSON data when filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("maddad-items") as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(geojson);

    // If the selected item got filtered out, close popup
    if (selectedItem && !filteredItems.some((x) => x.id === selectedItem.id)) {
      closePopup();
    }
  }, [geojson, filteredItems, selectedItem, closePopup]);

  // Re-render popup React UI whenever selectedItem changes
  useEffect(() => {
    if (!selectedItem) return;
    if (!popupContentRef.current) return;

    // We render the popup UI below in JSX into this div via React using a portal approach.
    // Easiest approach here: just let React render it in the normal tree (below) and we mount it into the div using a ref.
    // So this effect does nothing, but we keep the ref target alive.
  }, [selectedItem]);

  const handleRegionChange = useCallback(
    (region: RegionView) => {
      setRegionView(region);
      closePopup();

      const map = mapRef.current;
      if (!map) return;

      if (region === "ontario") {
        map.setMinZoom(4);
        map.setMaxBounds(ONTARIO_BOUNDS_LNG_LAT);
        map.flyTo({
          center: [ONTARIO_CENTER.lng, ONTARIO_CENTER.lat],
          zoom: ONTARIO_ZOOM,
          essential: true,
        });
      } else {
        map.setMinZoom(1);
        map.setMaxBounds(null);
        map.flyTo({
          center: [GLOBAL_CENTER.lng, GLOBAL_CENTER.lat],
          zoom: GLOBAL_ZOOM,
          essential: true,
        });
      }
    },
    [closePopup],
  );

  const handleViewDetails = useCallback(
    (item: MapItem) => {
      if (item.type === "appeal") navigate(`/appeals/${item.id}`);
      else if (item.type === "need") navigate(`/need/${item.id}`);
      else navigate(`/need/${item.id}`);
    },
    [navigate],
  );

  // If token not pasted, show placeholder
  if (!mapboxgl.accessToken || !mapboxgl.accessToken.startsWith("pk.")) {
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
            Paste your Mapbox token into <span className="font-mono">mapboxgl.accessToken</span> in{" "}
            <span className="font-mono">MaddadMap.tsx</span>, then refresh.
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
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

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Popup content renderer into the Mapbox popup div */}
      {selectedItem && popupContentRef.current && (
        <div
          style={{ display: "none" }}
          ref={(node) => {
            // Render JSX into the popup div by replacing its contents
            // Simple approach without portals: manually mount HTML via innerHTML is messy,
            // so we use this trick: we keep React rendering hidden, then copy the HTML.
            // If you want a cleaner version, tell me and I’ll convert it to a React portal.
            if (!node) return;

            const html = node.innerHTML;
            popupContentRef.current!.innerHTML = html;
          }}
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
                {getVerifiedLabel(selectedItem.verifiedStatus)}
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
        </div>
      )}

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
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-card border border-border">
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filteredItems.length}</span> locations
        </span>
      </div>
    </div>
  );
}
