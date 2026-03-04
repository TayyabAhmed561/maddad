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
import { MapLegend } from "./MapLegend";
import { MapLayerToggle, type MapLayerMode } from "./MapLayerToggle";
import { renderPopupHTML } from "./MapPopup";
import { animateDonationArc } from "./DonationArc";
import type { CrisisLayer } from "@/types/platform";
import { needUrgencyMap } from "@/data/platformData";
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

const PANEL_WIDTH = 420;
const PANEL_MARGIN = 24;

const crisisLayerCategories: Record<CrisisLayer, MapCategory[]> = {
  emergency_relief: ["Shelter", "Medical"],
  refugee_support: ["Shelter", "Education"],
  food_security: ["Food", "Fidya"],
  medical_aid: ["Medical"],
  education_projects: ["Education"],
};

function isOntarioItem(item: MapItem) {
  return item.locationLabel.includes("ON");
}

function isCanadaItem(item: MapItem) {
  return item.countryCode === "CA";
}

// City centroids for privacy-safe donor location
const DONOR_CITY_CENTROIDS: Record<string, [number, number]> = {
  CA: [-79.3832, 43.6532],
  default: [-80.4925, 43.4516],
};

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
  const arcCleanupRef = useRef<(() => void) | null>(null);

  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [scopeLevel, setScopeLevel] = useState<ScopeLevel>("provincial");
  const [activeCategory, setActiveCategory] = useState<MapCategory | "All">("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activeCrisisLayers, setActiveCrisisLayers] = useState<CrisisLayer[]>([]);
  const [showImpactMode, setShowImpactMode] = useState(false);
  const [layerMode, setLayerMode] = useState<MapLayerMode>("pins");

  const getCameraPadding = useCallback(() => {
    if (!isPanelOpen) return { top: 80, bottom: 60, left: 24, right: 24 };
    return { top: 80, bottom: 60, left: 24, right: PANEL_WIDTH + PANEL_MARGIN + 24 };
  }, [isPanelOpen]);

  const handleCrisisLayerToggle = useCallback((layer: CrisisLayer) => {
    setActiveCrisisLayers(prev =>
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  }, []);

  const filteredItems = useMemo(() => {
    return mapItems.filter((item) => {
      if (scopeLevel === "local" && userLocation) {
        const distance = getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
        if (distance > LOCAL_RADIUS_KM) return false;
      } else if (scopeLevel === "provincial" && !isOntarioItem(item)) {
        return false;
      } else if (scopeLevel === "canada" && !isCanadaItem(item)) {
        return false;
      }

      if (activeCrisisLayers.length > 0) {
        const allowedCategories = activeCrisisLayers.flatMap(l => crisisLayerCategories[l]);
        if (!allowedCategories.includes(item.category)) return false;
      }

      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (verifiedOnly && item.verifiedStatus !== "verified") return false;

      if (showImpactMode) {
        if (!item.fundingRaised || !item.goal) return false;
        if ((item.fundingRaised / item.goal) < 0.5) return false;
      }

      return true;
    });
  }, [scopeLevel, activeCategory, verifiedOnly, userLocation, activeCrisisLayers, showImpactMode]);

  const geojson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: filteredItems.map((item) => {
        const urgency = needUrgencyMap[item.id] || "low";
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [item.lng, item.lat] },
          properties: {
            id: item.id,
            category: item.category,
            verifiedStatus: item.verifiedStatus,
            endorsed: Boolean(item.endorsedBy),
            zakatEligible: Boolean(item.zakatEligible),
            urgency,
            urgencyWeight: urgency === "critical" ? 1.0 : urgency === "medium" ? 0.6 : 0.3,
          },
        };
      }),
    } as GeoJSON.FeatureCollection<GeoJSON.Point>;
  }, [filteredItems]);

  const closePopup = useCallback(() => {
    setSelectedItem(null);
    if (popupRef.current) popupRef.current.remove();
    popupRef.current = null;
  }, []);

  // Trigger donation arc animation
  const triggerDonationArc = useCallback((item: MapItem) => {
    const map = mapRef.current;
    if (!map) return;

    if (arcCleanupRef.current) arcCleanupRef.current();

    const donorCoords: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : DONOR_CITY_CENTROIDS.default;

    const destCoords: [number, number] = [item.lng, item.lat];

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(donorCoords);
    bounds.extend(destCoords);
    map.fitBounds(bounds, {
      padding: { top: 120, bottom: 120, left: 80, right: isPanelOpen ? PANEL_WIDTH + 80 : 80 },
      maxZoom: 8,
      duration: 800,
    });

    setTimeout(() => {
      arcCleanupRef.current = animateDonationArc(map, donorCoords, destCoords);
    }, 900);
  }, [userLocation, isPanelOpen]);

  const openPopupForItem = useCallback(
    (item: MapItem, lngLat: mapboxgl.LngLatLike) => {
      setSelectedItem(item);
      onItemSelect?.(item);

      if (popupRef.current) popupRef.current.remove();

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

      const viewButton = popupElement.querySelector(`#popup-view-${item.id}`);
      const donateButton = popupElement.querySelector(`#popup-donate-${item.id}`);

      if (viewButton) {
        viewButton.addEventListener("click", () => {
          navigate(`/charity/${item.id}`);
        });
      }

      if (donateButton) {
        donateButton.addEventListener("click", (e) => {
          const btn = e.target as HTMLButtonElement;
          if (btn.dataset.animating === "true") return;
          btn.dataset.animating = "true";
          btn.style.transform = "scale(0.96)";
          btn.style.boxShadow = "0 0 0 4px rgba(34, 95, 74, 0.2)";

          triggerDonationArc(item);

          setTimeout(() => {
            btn.style.transform = "scale(1)";
            btn.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Processing…
            </span>`;
            btn.style.opacity = "0.8";
            btn.style.cursor = "wait";

            toast({ title: "Coming soon", description: "Demo mode: donation simulated", duration: 3000 });

            setTimeout(() => {
              btn.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                Done
              </span>`;
              btn.style.backgroundColor = "hsl(160, 45%, 32%)";
              btn.style.color = "white";
              btn.style.opacity = "1";
              setTimeout(() => navigate(`/charity/${item.id}#donate`), 600);
            }, 800 + Math.random() * 400);
          }, 150);
        });
      }

      popupRef.current.on("close", () => {
        setSelectedItem(null);
        popupRef.current = null;
      });
    },
    [onItemSelect, navigate, triggerDonationArc]
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
      const padding = getCameraPadding();
      map.fitBounds(ONTARIO_BOUNDS, {
        padding: { ...padding, top: 120, bottom: 90 },
        maxZoom: ONTARIO_MAX_ZOOM,
        duration: 0,
      });

      if (!map.getSource("maddad-items")) {
        map.addSource("maddad-items", { type: "geojson", data: geojson });
      }

      // ========= HEATMAP LAYER =========
      map.addLayer({
        id: "maddad-heatmap",
        type: "heatmap",
        source: "maddad-items",
        layout: {
          visibility: "none", // Default to pins mode
        },
        paint: {
          "heatmap-weight": ["get", "urgencyWeight"],
          "heatmap-intensity": [
            "interpolate", ["linear"], ["zoom"],
            0, 0.6,
            5, 1.2,
            8, 1.5,
          ],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.15, "hsla(48, 80%, 70%, 0.4)",
            0.35, "hsla(40, 75%, 58%, 0.55)",
            0.55, "hsla(32, 70%, 48%, 0.65)",
            0.75, "hsla(15, 65%, 45%, 0.75)",
            1, "hsla(0, 55%, 42%, 0.8)",
          ],
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, 20,
            4, 35,
            8, 50,
          ],
          "heatmap-opacity": [
            "interpolate", ["linear"], ["zoom"],
            6, 0.6,
            8, 0.3,
            10, 0,
          ],
        },
      });

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
            "rgba(186, 140, 44, 0.35)",
            "rgba(0,0,0,0)",
          ],
          "circle-blur": 0.2,
        },
      });

      // Main static markers — clean, minimal circles
      map.addLayer({
        id: "maddad-items-layer",
        type: "circle",
        source: "maddad-items",
        paint: {
          "circle-radius": 8,
          "circle-color": [
            "match",
            ["get", "category"],
            "Food", categoryColors.Food?.marker ?? "hsl(160, 45%, 32%)",
            "Shelter", categoryColors.Shelter?.marker ?? "hsl(160, 45%, 32%)",
            "Medical", categoryColors.Medical?.marker ?? "hsl(160, 45%, 32%)",
            "Education", categoryColors.Education?.marker ?? "hsl(160, 45%, 32%)",
            "Masjid", categoryColors.Masjid?.marker ?? "hsl(160, 45%, 32%)",
            "Fidya", categoryColors.Fidya?.marker ?? "hsl(160, 45%, 32%)",
            "Qurbani", categoryColors.Qurbani?.marker ?? "hsl(160, 45%, 32%)",
            "Zakat", categoryColors.Zakat?.marker ?? "hsl(160, 45%, 32%)",
            "hsl(160, 45%, 32%)",
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9,
        },
      });

      // Selected marker highlight ring
      map.addLayer({
        id: "maddad-items-selected-ring",
        type: "circle",
        source: "maddad-items",
        paint: {
          "circle-radius": 14,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": "hsl(160, 45%, 32%)",
          "circle-stroke-width": 3,
          "circle-stroke-opacity": 0.8,
        },
        filter: ["==", ["get", "id"], ""],
      });

      // Hover highlight ring
      map.addLayer({
        id: "maddad-items-hover-ring",
        type: "circle",
        source: "maddad-items",
        paint: {
          "circle-radius": 12,
          "circle-color": "rgba(0,0,0,0)",
          "circle-stroke-color": "hsl(160, 45%, 32%)",
          "circle-stroke-width": 2,
          "circle-stroke-opacity": 0.4,
        },
        filter: ["==", ["get", "id"], ""],
      });

      map.on("mouseenter", "maddad-items-layer", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features?.[0]?.properties?.id;
        if (id) {
          map.setFilter("maddad-items-hover-ring", ["==", ["get", "id"], id]);
        }
      });
      map.on("mouseleave", "maddad-items-layer", () => {
        map.getCanvas().style.cursor = "";
        map.setFilter("maddad-items-hover-ring", ["==", ["get", "id"], ""]);
      });

      map.on("click", "maddad-items-layer", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const clickedId = feature.properties?.id as string | undefined;
        if (!clickedId) return;
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
      if (arcCleanupRef.current) arcCleanupRef.current();
      if (popupRef.current) popupRef.current.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update layer visibility based on layerMode (mutually exclusive)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const showPins = layerMode === "pins";
    const showHeatmap = layerMode === "heatmap";

    try {
      if (map.getLayer("maddad-heatmap")) {
        map.setLayoutProperty("maddad-heatmap", "visibility", showHeatmap ? "visible" : "none");
      }
      ["maddad-items-layer", "maddad-items-ring", "maddad-items-selected-ring", "maddad-items-hover-ring"].forEach(id => {
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, "visibility", showPins ? "visible" : "none");
        }
      });
    } catch {}
  }, [layerMode]);

  // Update camera padding when panel state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const padding = getCameraPadding();
    map.easeTo({ padding, duration: 300 });
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

  const flyToWithOffset = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    const map = mapRef.current;
    if (!map) return;
    const padding = getCameraPadding();
    map.flyTo({
      center: [center.lng, center.lat],
      zoom,
      padding,
      essential: true,
      duration: 1500,
      curve: 1.42,
      easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
  }, [getCameraPadding]);

  const fitBoundsWithPadding = useCallback((bounds: [[number, number], [number, number]], maxZoom?: number) => {
    const map = mapRef.current;
    if (!map) return;
    const padding = getCameraPadding();
    const adjustedPadding = { ...padding, top: 120, bottom: 90 };
    map.fitBounds(bounds, {
      padding: adjustedPadding,
      maxZoom: maxZoom || 10,
      duration: 1400,
      essential: true,
    });
  }, [getCameraPadding]);

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
            onScopeChange?.("local");
            onUserLocationChange?.(location);
            flyToWithOffset({ lat: latitude, lng: longitude }, LOCAL_ZOOM);
            toast({ title: "Location found", description: `Showing needs within ${LOCAL_RADIUS_KM}km of your location.` });
          },
          () => {
            setIsLocating(false);
            toast({ title: "Location access denied", description: "Showing Ontario view instead.", variant: "destructive" });
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
        if (scope === "provincial") fitBoundsWithPadding(ONTARIO_BOUNDS, ONTARIO_MAX_ZOOM);
        else if (scope === "canada") fitBoundsWithPadding(CANADA_BOUNDS, CANADA_ZOOM + 0.5);
        else if (scope === "global") flyToWithOffset(GLOBAL_CENTER, GLOBAL_ZOOM);
      }
    },
    [closePopup, flyToWithOffset, fitBoundsWithPadding, onScopeChange, onUserLocationChange]
  );

  const getScopeLabel = useCallback(() => {
    switch (scopeLevel) {
      case "local": return "Local";
      case "provincial": return "Ontario";
      case "canada": return "Canada";
      case "global": return "Global";
      default: return "default";
    }
  }, [scopeLevel]);

  const handleResetView = useCallback(() => {
    if (scopeLevel === "local" && userLocation) flyToWithOffset(userLocation, LOCAL_ZOOM);
    else if (scopeLevel === "provincial") fitBoundsWithPadding(ONTARIO_BOUNDS, ONTARIO_MAX_ZOOM);
    else if (scopeLevel === "canada") fitBoundsWithPadding(CANADA_BOUNDS, CANADA_ZOOM + 0.5);
    else if (scopeLevel === "global") flyToWithOffset(GLOBAL_CENTER, GLOBAL_ZOOM);
  }, [scopeLevel, userLocation, flyToWithOffset, fitBoundsWithPadding]);

  // Focus on selected item from external selection + update selected ring
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("maddad-items-selected-ring")) {
      map.setFilter("maddad-items-selected-ring",
        selectedItemId ? ["==", ["get", "id"], selectedItemId] : ["==", ["get", "id"], ""]
      );
    }
    if (selectedItemId) {
      const item = mapItems.find((x) => x.id === selectedItemId);
      if (item) {
        const padding = getCameraPadding();
        const targetZoom = Math.max(map.getZoom(), 11);
        map.flyTo({
          center: [item.lng, item.lat],
          zoom: targetZoom,
          padding,
          essential: true,
          duration: 1200,
          curve: 1.42,
          easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        });
        setTimeout(() => openPopupForItem(item, [item.lng, item.lat]), 400);
      }
    }
  }, [selectedItemId, openPopupForItem, getCameraPadding]);

  if (!mapboxgl.accessToken || !mapboxgl.accessToken.startsWith("pk.")) {
    return (
      <div className={cn("relative w-full h-full min-h-[400px] bg-card rounded-2xl border border-border overflow-hidden flex items-center justify-center", className)}>
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Map Temporarily Unavailable</h3>
          <p className="text-muted-foreground mb-3">The map is temporarily unavailable. Please try again later.</p>
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
          activeCrisisLayers={activeCrisisLayers}
          onCrisisLayerToggle={handleCrisisLayerToggle}
          showImpactMode={showImpactMode}
          onImpactModeToggle={() => setShowImpactMode(!showImpactMode)}
        />
      </div>

      {/* Top-Right Map Controls — spaced from panel */}
      <div className={cn(
        "absolute top-4 z-10 flex items-start gap-2 transition-all duration-300",
        isPanelOpen ? "right-[460px] lg:right-[480px] xl:right-[500px]" : "right-4"
      )}>
        <MapLayerToggle mode={layerMode} onChange={setLayerMode} />
        <MapControls onResetView={handleResetView} scopeLabel={getScopeLabel()} />
      </div>

      {/* Legend — bottom left, above attribution */}
      <div className="absolute bottom-10 left-4 z-10">
        <MapLegend />
      </div>

      {/* Results count — bottom right */}
      <div className={cn(
        "absolute bottom-4 z-10 bg-card/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-card border border-border transition-all duration-300",
        isPanelOpen ? "right-[460px] lg:right-[480px] xl:right-[500px]" : "right-16"
      )}>
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filteredItems.length}</span> locations
          {showImpactMode && <span className="ml-1 text-primary">(impact view)</span>}
        </span>
      </div>
    </div>
  );
}
