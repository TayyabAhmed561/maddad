import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import { AlertCircle, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { MapControls } from "./MapControls";
import { MapFiltersOverlay } from "./MapFiltersOverlay";
import { renderPopupHTML } from "./MapPopup";
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


interface MaddadMapProps {
  className?: string;
  onItemSelect?: (item: MapItem) => void;
  selectedItemId?: string | null;
  isPanelOpen?: boolean;
  onFocusItem?: (itemId: string) => void;
  onScopeChange?: (scope: ScopeLevel) => void;
  onUserLocationChange?: (location: { lat: number; lng: number } | null) => void;
}

export function MaddadMap({ className, onItemSelect, selectedItemId, isPanelOpen = true, onFocusItem, onScopeChange, onUserLocationChange }: MaddadMapProps) {
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const popupRef = useRef<mapboxgl.Popup | null>(null);

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

      // Remove existing popup
      if (popupRef.current) popupRef.current.remove();

      // Create popup element with unique content for this item
      const popupElement = document.createElement("div");
      popupElement.innerHTML = renderPopupHTML(item);
      
      popupRef.current = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        anchor: "bottom",
        offset: [0, -14],
        maxWidth: "320px",
        className: "maddad-popup",
      })
        .setLngLat(lngLat)
        .setDOMContent(popupElement)
        .addTo(mapRef.current!);

      // Attach event listeners to buttons in popup
      const viewButton = popupElement.querySelector(`#popup-view-${item.id}`);
      const donateButton = popupElement.querySelector(`#popup-donate-${item.id}`);
      
      if (viewButton) {
        viewButton.addEventListener("click", () => {
          navigate(`/charity/${item.id}`);
        });
      }
      
      if (donateButton) {
        donateButton.addEventListener("click", () => {
          navigate(`/charity/${item.id}#donate`);
        });
      }

      popupRef.current.on("close", () => {
        setSelectedItem(null);
        popupRef.current = null;
      });
    },
    [onItemSelect, navigate]
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

        // Use mapItems (full dataset) to avoid stale closure issues with filtered array
        const item = mapItems.find((x) => x.id === clickedId);
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
            const location = { lat: latitude, lng: longitude };
            setUserLocation(location);
            setScopeLevel("local");
            setIsLocating(false);
            
            // Notify parent of scope and location change
            onScopeChange?.("local");
            onUserLocationChange?.(location);

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
            onScopeChange?.("provincial");
            fitBoundsWithPadding(ONTARIO_BOUNDS, ONTARIO_MAX_ZOOM);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setScopeLevel(scope);
        onScopeChange?.(scope);
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
    [closePopup, flyToWithOffset, fitBoundsWithPadding, onScopeChange, onUserLocationChange]
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
