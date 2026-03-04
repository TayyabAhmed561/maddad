import mapboxgl from "mapbox-gl";
import { generateArcCoordinates } from "./DonationArc";

/**
 * Ambient connection signals shown on map load.
 * Subtle animated arcs across the globe representing global compassion.
 * Fades out when user interacts with the map.
 */

interface SignalRoute {
  from: [number, number]; // [lng, lat]
  to: [number, number];
}

// Predefined routes representing global humanitarian connections
const SIGNAL_ROUTES: SignalRoute[] = [
  { from: [-79.38, 43.65], to: [35.23, 31.95] },   // Toronto → Palestine
  { from: [-0.12, 51.51], to: [36.82, -1.29] },     // London → Nairobi
  { from: [2.35, 48.86], to: [36.29, 33.51] },      // Paris → Damascus
  { from: [-73.99, 40.71], to: [44.37, 33.31] },    // New York → Baghdad
  { from: [103.85, 1.29], to: [90.41, 23.81] },     // Singapore → Dhaka
  { from: [55.27, 25.20], to: [45.04, 12.78] },     // Dubai → Aden
  { from: [-79.38, 43.65], to: [67.01, 24.86] },    // Toronto → Karachi
  { from: [13.40, 52.52], to: [36.72, 34.73] },     // Berlin → Homs
];

const SOURCE_PREFIX = "signal-arc-";
const LAYER_PREFIX = "signal-arc-layer-";
const MARKER_PREFIX = "signal-marker-";
const MARKER_LAYER_PREFIX = "signal-marker-layer-";

export function startConnectionSignals(map: mapboxgl.Map): () => void {
  let cleaned = false;
  const animationIds: number[] = [];
  const activeSignals = new Set<number>();

  // Stagger signal launches
  const launchSignal = (index: number) => {
    if (cleaned) return;

    const route = SIGNAL_ROUTES[index];
    const sourceId = SOURCE_PREFIX + index;
    const layerId = LAYER_PREFIX + index;
    const markerSourceId = MARKER_PREFIX + index;
    const markerLayerId = MARKER_LAYER_PREFIX + index;

    // Clean previous if exists
    [layerId, markerLayerId].forEach(id => {
      try { if (map.getLayer(id)) map.removeLayer(id); } catch {}
    });
    [sourceId, markerSourceId].forEach(id => {
      try { if (map.getSource(id)) map.removeSource(id); } catch {}
    });

    const allPoints = generateArcCoordinates(route.from, route.to, 60);

    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [route.from, route.from] }, properties: {} },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "hsla(38, 55%, 65%, 0.3)",
        "line-width": 1.5,
        "line-blur": 1,
        "line-opacity": 0.4,
      },
    });

    map.addSource(markerSourceId, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "Point", coordinates: route.from }, properties: {} },
    });

    map.addLayer({
      id: markerLayerId,
      type: "circle",
      source: markerSourceId,
      paint: {
        "circle-radius": 3,
        "circle-color": "hsla(38, 60%, 65%, 0.7)",
        "circle-blur": 0.4,
        "circle-opacity": 0.7,
      },
    });

    activeSignals.add(index);

    const duration = 3000 + Math.random() * 2000;
    const startTime = performance.now();

    const animate = (now: number) => {
      if (cleaned) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const idx = Math.floor(progress * (allPoints.length - 1));

      try {
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
        const markerSource = map.getSource(markerSourceId) as mapboxgl.GeoJSONSource | undefined;

        if (source) {
          source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: allPoints.slice(0, idx + 1) },
            properties: {},
          });
        }
        if (markerSource) {
          markerSource.setData({
            type: "Feature",
            geometry: { type: "Point", coordinates: allPoints[idx] },
            properties: {},
          });
        }
      } catch {}

      if (progress < 1) {
        animationIds.push(requestAnimationFrame(animate));
      } else {
        // Fade out this signal, then restart after delay
        fadeSignal(index, () => {
          if (!cleaned) {
            setTimeout(() => launchSignal(index), 1000 + Math.random() * 3000);
          }
        });
      }
    };

    animationIds.push(requestAnimationFrame(animate));
  };

  const fadeSignal = (index: number, onDone: () => void) => {
    const layerId = LAYER_PREFIX + index;
    const markerLayerId = MARKER_LAYER_PREFIX + index;
    const fadeStart = performance.now();
    const fadeDuration = 800;

    const fade = (now: number) => {
      if (cleaned) return;
      const p = Math.min((now - fadeStart) / fadeDuration, 1);
      try {
        if (map.getLayer(layerId)) map.setPaintProperty(layerId, "line-opacity", 0.4 * (1 - p));
        if (map.getLayer(markerLayerId)) map.setPaintProperty(markerLayerId, "circle-opacity", 0.7 * (1 - p));
      } catch {}

      if (p < 1) {
        animationIds.push(requestAnimationFrame(fade));
      } else {
        activeSignals.delete(index);
        onDone();
      }
    };
    animationIds.push(requestAnimationFrame(fade));
  };

  // Stagger initial launches
  SIGNAL_ROUTES.forEach((_, i) => {
    setTimeout(() => {
      if (!cleaned) launchSignal(i);
    }, i * 600);
  });

  // Cleanup function — fades all signals then removes sources/layers
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    animationIds.forEach(id => cancelAnimationFrame(id));

    // Fade all out
    const fadeStart = performance.now();
    const fadeDuration = 600;
    const fadeAll = (now: number) => {
      const p = Math.min((now - fadeStart) / fadeDuration, 1);
      SIGNAL_ROUTES.forEach((_, i) => {
        try {
          if (map.getLayer(LAYER_PREFIX + i)) map.setPaintProperty(LAYER_PREFIX + i, "line-opacity", 0.4 * (1 - p));
          if (map.getLayer(MARKER_LAYER_PREFIX + i)) map.setPaintProperty(MARKER_LAYER_PREFIX + i, "circle-opacity", 0.7 * (1 - p));
        } catch {}
      });

      if (p < 1) {
        requestAnimationFrame(fadeAll);
      } else {
        // Remove all
        SIGNAL_ROUTES.forEach((_, i) => {
          [LAYER_PREFIX + i, MARKER_LAYER_PREFIX + i].forEach(id => {
            try { if (map.getLayer(id)) map.removeLayer(id); } catch {}
          });
          [SOURCE_PREFIX + i, MARKER_PREFIX + i].forEach(id => {
            try { if (map.getSource(id)) map.removeSource(id); } catch {}
          });
        });
      }
    };
    requestAnimationFrame(fadeAll);
  };

  return cleanup;
}
