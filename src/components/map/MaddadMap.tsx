import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, CheckCircle, Clock, Award, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { MapControls } from "./MapControls";
import { MapFiltersOverlay } from "./MapFiltersOverlay";
import {
  mapItems,
  MapItem,
  MapCategory,
  categoryColors,
  ONTARIO_CENTER,
  ONTARIO_ZOOM,
  ONTARIO_BOUNDS,
  ONTARIO_MAX_ZOOM,
  CANADA_CENTER,
  CANADA_ZOOM,
  CANADA_BOUNDS,
  GLOBAL_CENTER,
  GLOBAL_ZOOM,
  LOCAL_ZOOM,
  LOCAL_RADIUS_KM,
  ScopeLevel,
  getDistanceKm,
} from "@/data/mapData";

mapboxgl.accessToken = "pk.eyJ1IjoibWluaW9uc2EwMCIsImEiOiJjbWt0eTF1MzUxa3dxM3FwcHJuYjhiNXlvIn0.U9u4rqrM2m5yWiqYE5bv2Q";

const allCategories: MapCategory[] = ["Food", "Shelter", "Medical", "Education", "Masjid", "Fidya", "Qurbani", "Zakat"];

// Panel width for offset calculations (in pixels)
const PANEL_WIDTH = 420;
const PANEL_MARGIN = 24;

function isOntarioItem(item: MapItem) {
  return item.locationLabel.includes("ON");
}

function isCanadaItem(item: MapItem) {
  return item.countryCode === "CA";
}

function getVerifiedLabel(status: MapItem["verifiedStatus"]) {
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
}

interface MaddadMapProps {
  className?: string;
  onItemSelect?: (item: MapItem) => void;
  selectedItemId?: string | null;
  isPanelOpen?: boolean;
  onFocusItem?: (itemId: string) => void;
}

export function MaddadMap({ className, onItemSelect, selectedItemId, isPanelOpen = true, onFocusItem }: MaddadMapProps) {
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [scopeLevel, setScopeLevel] = useState<ScopeLevel>("provincial");
  const [activeCategory, setActiveCategory] = useState<MapCategory | "All">("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Calculate padding for camera to account for right panel
  const getCameraPadding = useCallback(() => {
    if (!isPanelOpen) {
      return { top: 80, bottom: 60, left: 24, right: 24 };
    }
    return { 
      top: 80, 
      bottom: 60, 
      left: 24, 
      right: PANEL_WIDTH + PANEL_MARGIN + 24 
    };
  }, [isPanelOpen]);

  // Filter items based on scope, category, verified, and user location
  const filteredItems = useMemo(() => {
    return mapItems.filter((item) => {
      // Scope filtering
      if (scopeLevel === "local" && userLocation) {
        const distance = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
        if (distance > LOCAL_RADIUS_KM) return false;
      } else if (scopeLevel === "provincial" && !isOntarioItem(item)) {
        return false;
      } else if (scopeLevel === "canada" && !isCanadaItem(item)) {
        return false;
      }
      // Global shows all

      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (verifiedOnly && item.verifiedStatus !== "verified") return false;
      return true;
    });
  }, [scopeLevel, activeCategory, verifiedOnly, userLocation]);

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
        offset: [0, -14],
        maxWidth: "320px",
        className: "maddad-popup",
      })
        .setLngLat(lngLat)
        .setDOMContent(popupContentRef.current)
        .addTo(mapRef.current!);

      popupRef.current.on("close", () => {
        setSelectedItem(null);
        popupRef.current = null;
      });
    },
    [onItemSelect]
  );

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const initialCenter: [number, number] = [ONTARIO_CENTER.lng, ONTARIO_CENTER.lat];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: initialCenter,
      zoom: ONTARIO_ZOOM,
      minZoom: 1.5,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // Fit to Ontario bounds on initial load with padding
      const padding = getCameraPadding();
      map.fitBounds(ONTARIO_BOUNDS, {
        padding: { ...padding, top: 120, bottom: 90 },
        maxZoom: ONTARIO_MAX_ZOOM,
        duration: 0,
      });

      if (!map.getSource("maddad-items")) {
        map.addSource("maddad-items", { type: "geojson", data: geojson });
      }

      if (map.getLayer("maddad-items-selected-ring")) map.removeLayer("maddad-items-selected-ring");
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

      // Selected marker highlight ring (pulsing effect via CSS animation)
      map.addLayer({
        id: "maddad-items-selected-ring",
        type: "circle",
        source: "maddad-items",
        paint: {
          "circle-radius": 18,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": "hsl(160, 45%, 32%)",
          "circle-stroke-width": 3,
          "circle-stroke-opacity": 0.8,
        },
        filter: ["==", ["get", "id"], ""], // Initially no selection
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

  // Update camera padding when panel state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const padding = getCameraPadding();
    map.easeTo({
      padding,
      duration: 300,
    });
  }, [isPanelOpen, getCameraPadding]);

  // Update GeoJSON data when filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("maddad-items") as mapboxgl.GeoJSONSource | undefined;
    if (source) source.setData(geojson);

    if (selectedItem && !filteredItems.some((x) => x.id === selectedItem.id)) {
      closePopup();
    }
  }, [geojson, filteredItems, selectedItem, closePopup]);

  // Helper function to fly to a location with panel offset - smooth Apple Maps style
  const flyToWithOffset = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    const map = mapRef.current;
    if (!map) return;

    const padding = getCameraPadding();
    
    map.flyTo({
      center: [center.lng, center.lat],
      zoom,
      padding,
      essential: true,
      duration: 1500, // Smooth 1.5s transition
      curve: 1.42, // Ease-in-out curve for smooth animation
      easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // Cubic ease-in-out
    });
  }, [getCameraPadding]);

  // Fit bounds with padding (for Provincial and Canada views) - smooth transitions
  const fitBoundsWithPadding = useCallback((bounds: [[number, number], [number, number]], maxZoom?: number) => {
    const map = mapRef.current;
    if (!map) return;

    const padding = getCameraPadding();
    // Add extra top padding to account for controls overlay
    const adjustedPadding = { ...padding, top: 120, bottom: 90 };
    
    map.fitBounds(bounds, {
      padding: adjustedPadding,
      maxZoom: maxZoom || 10,
      duration: 1400, // Smooth 1.4s transition
      essential: true,
    });
  }, [getCameraPadding]);

  // Handle scope level change
  const handleScopeChange = useCallback(
    (scope: ScopeLevel) => {
      const map = mapRef.current;
      if (!map) return;

      if (scope === "local") {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setScopeLevel("local");
            setIsLocating(false);

            flyToWithOffset({ lat: latitude, lng: longitude }, LOCAL_ZOOM);

            toast({
              title: "Location found",
              description: `Showing needs within ${LOCAL_RADIUS_KM}km of your location.`,
            });
          },
          (error) => {
            setIsLocating(false);
            toast({
              title: "Location access denied",
              description: "Showing Ontario view instead. Please enable location access in your browser settings.",
              variant: "destructive",
            });
            // Fallback to provincial
            setScopeLevel("provincial");
            fitBoundsWithPadding(ONTARIO_BOUNDS, ONTARIO_MAX_ZOOM);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setScopeLevel(scope);
        closePopup();

        if (scope === "provincial") {
          fitBoundsWithPadding(ONTARIO_BOUNDS, ONTARIO_MAX_ZOOM);
        } else if (scope === "canada") {
          fitBoundsWithPadding(CANADA_BOUNDS, CANADA_ZOOM + 0.5);
        } else if (scope === "global") {
          flyToWithOffset(GLOBAL_CENTER, GLOBAL_ZOOM);
        }
      }
    },
    [closePopup, flyToWithOffset, fitBoundsWithPadding]
  );

  // Get scope label for tooltip
  const getScopeLabel = useCallback(() => {
    switch (scopeLevel) {
      case "local": return "Local";
      case "provincial": return "Ontario";
      case "canada": return "Canada";
      case "global": return "Global";
      default: return "default";
    }
  }, [scopeLevel]);

  // Reset view to current scope's default (context-aware single button)
  const handleResetView = useCallback(() => {
    if (scopeLevel === "local" && userLocation) {
      flyToWithOffset(userLocation, LOCAL_ZOOM);
    } else if (scopeLevel === "provincial") {
      fitBoundsWithPadding(ONTARIO_BOUNDS, ONTARIO_MAX_ZOOM);
    } else if (scopeLevel === "canada") {
      fitBoundsWithPadding(CANADA_BOUNDS, CANADA_ZOOM + 0.5);
    } else if (scopeLevel === "global") {
      flyToWithOffset(GLOBAL_CENTER, GLOBAL_ZOOM);
    }
  }, [scopeLevel, userLocation, flyToWithOffset, fitBoundsWithPadding]);

  const handleViewDetails = useCallback(
    (item: MapItem) => {
      if (item.type === "appeal") navigate(`/appeals/${item.id}`);
      else if (item.type === "need") navigate(`/need/${item.id}`);
      else navigate(`/need/${item.id}`);
    },
    [navigate]
  );

  // Focus on selected item from external selection + update selected ring
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Update the selected ring filter to highlight the selected marker
    if (map.getLayer("maddad-items-selected-ring")) {
      map.setFilter("maddad-items-selected-ring", 
        selectedItemId 
          ? ["==", ["get", "id"], selectedItemId]
          : ["==", ["get", "id"], ""]
      );
    }

    // Fly to item and open popup with smooth animation
    if (selectedItemId) {
      const item = mapItems.find((x) => x.id === selectedItemId);
      if (item) {
        const padding = getCameraPadding();
        const targetZoom = Math.max(map.getZoom(), 11); // Zoom in slightly more for clarity
        
        map.flyTo({
          center: [item.lng, item.lat],
          zoom: targetZoom,
          padding,
          essential: true,
          duration: 1200, // Smooth 1.2s transition
          curve: 1.42,
          easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        });
        
        // Open popup after a brief delay to sync with animation
        setTimeout(() => {
          openPopupForItem(item, [item.lng, item.lat]);
        }, 400);
      }
    }
  }, [selectedItemId, openPopupForItem, getCameraPadding]);

  // Token check
  if (!mapboxgl.accessToken || !mapboxgl.accessToken.startsWith("pk.")) {
    return (
      <div
        className={cn(
          "relative w-full h-full min-h-[400px] bg-card rounded-2xl border border-border overflow-hidden flex items-center justify-center",
          className
        )}
      >
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Map Temporarily Unavailable</h3>
          <p className="text-muted-foreground mb-3">
            The map is temporarily unavailable. Please try again later.
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
    <div className={cn("relative w-full h-full", className)}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top-Left Filters Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <MapFiltersOverlay
          scopeLevel={scopeLevel}
          onScopeChange={handleScopeChange}
          isLocating={isLocating}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
          isPanelOpen={isPanelOpen}
        />
      </div>

      {/* Top-Right Map Controls - positioned left of the panel */}
      <div 
        className={cn(
          "absolute top-4 z-10 transition-all duration-300",
          isPanelOpen ? "right-[460px] lg:right-[480px] xl:right-[500px]" : "right-4"
        )}
      >
        <MapControls
          onResetView={handleResetView}
          scopeLabel={getScopeLabel()}
        />
      </div>

      {/* Popup content renderer */}
      {selectedItem && popupContentRef.current && (
        <div
          style={{ display: "none" }}
          ref={(node) => {
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
                  selectedItem.verifiedStatus === "unverified" && "bg-muted text-muted-foreground"
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

      {/* Legend - positioned above Mapbox attribution */}
      <div className="absolute bottom-10 left-4 z-10 bg-card/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-card border border-border">
        <div className="flex flex-wrap gap-3 text-xs">
          {allCategories.slice(0, 5).map((category) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[category]?.marker }} />
              <span className="text-muted-foreground">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results count - positioned above navigation controls, left of panel */}
      <div 
        className={cn(
          "absolute bottom-4 z-10 bg-card/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-card border border-border transition-all duration-300",
          isPanelOpen ? "right-[460px] lg:right-[480px] xl:right-[500px]" : "right-16"
        )}
      >
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filteredItems.length}</span> locations
        </span>
      </div>
    </div>
  );
}
