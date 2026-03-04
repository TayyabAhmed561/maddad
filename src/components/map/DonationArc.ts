import mapboxgl from "mapbox-gl";

/**
 * Generate a smooth curved arc between two coordinates (great-circle bezier approximation).
 * Returns an array of [lng, lat] points.
 */
export function generateArcCoordinates(
  from: [number, number], // [lng, lat]
  to: [number, number],
  numPoints: number = 80
): [number, number][] {
  const points: [number, number][] = [];

  // Compute a control point above the midpoint for the curve
  const midLng = (from[0] + to[0]) / 2;
  const midLat = (from[1] + to[1]) / 2;

  // Distance-based arc height
  const dLng = to[0] - from[0];
  const dLat = to[1] - from[1];
  const dist = Math.sqrt(dLng * dLng + dLat * dLat);
  const arcHeight = Math.min(dist * 0.35, 25); // Cap at 25 degrees

  const controlLng = midLng;
  const controlLat = midLat + arcHeight;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic bezier
    const lng = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * controlLng + t * t * to[0];
    const lat = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * controlLat + t * t * to[1];
    points.push([lng, lat]);
  }

  return points;
}

/**
 * Add and animate a donation arc on the map.
 * Returns a cleanup function.
 */
export function animateDonationArc(
  map: mapboxgl.Map,
  from: [number, number],
  to: [number, number],
  onComplete?: () => void
): () => void {
  const sourceId = "donation-arc-source";
  const layerId = "donation-arc-layer";
  const glowLayerId = "donation-arc-glow";
  const markerSourceId = "donation-arc-marker-source";
  const markerLayerId = "donation-arc-marker-layer";

  // Clean up any existing
  [layerId, glowLayerId, markerLayerId].forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  [sourceId, markerSourceId].forEach(id => {
    if (map.getSource(id)) map.removeSource(id);
  });

  const allPoints = generateArcCoordinates(from, to, 80);

  // Add empty line source
  map.addSource(sourceId, {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
  });

  // Glow layer (wider, more transparent)
  map.addLayer({
    id: glowLayerId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "hsl(38, 62%, 55%)",
      "line-width": 6,
      "line-opacity": 0.25,
      "line-blur": 4,
    },
  });

  // Main arc line
  map.addLayer({
    id: layerId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "hsl(38, 62%, 48%)",
      "line-width": 2,
      "line-opacity": 0.8,
    },
  });

  // Traveling marker source
  map.addSource(markerSourceId, {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "Point", coordinates: from }, properties: {} },
  });

  map.addLayer({
    id: markerLayerId,
    type: "circle",
    source: markerSourceId,
    paint: {
      "circle-radius": 5,
      "circle-color": "hsl(38, 70%, 58%)",
      "circle-opacity": 0.9,
      "circle-blur": 0.3,
    },
  });

  let frame = 0;
  const totalFrames = allPoints.length;
  const duration = 1500; // ms
  const startTime = performance.now();
  let animationId: number;
  let cleaned = false;

  const animate = (now: number) => {
    if (cleaned) return;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const idx = Math.floor(progress * (totalFrames - 1));

    // Update line to show progress
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

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Pulse destination and show message
      pulseDestination(map, to, () => {
        onComplete?.();
        // Fade out after a pause
        setTimeout(() => cleanup(), 2500);
      });
    }
  };

  animationId = requestAnimationFrame(animate);

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    cancelAnimationFrame(animationId);

    // Fade out
    const fadeStart = performance.now();
    const fadeDuration = 600;
    const fadeOut = (now: number) => {
      const p = Math.min((now - fadeStart) / fadeDuration, 1);
      const opacity = 1 - p;
      try {
        if (map.getLayer(layerId)) map.setPaintProperty(layerId, "line-opacity", 0.8 * opacity);
        if (map.getLayer(glowLayerId)) map.setPaintProperty(glowLayerId, "line-opacity", 0.25 * opacity);
        if (map.getLayer(markerLayerId)) map.setPaintProperty(markerLayerId, "circle-opacity", 0.9 * opacity);
      } catch { /* map may be removed */ }

      if (p < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        [layerId, glowLayerId, markerLayerId].forEach(id => {
          try { if (map.getLayer(id)) map.removeLayer(id); } catch {}
        });
        [sourceId, markerSourceId].forEach(id => {
          try { if (map.getSource(id)) map.removeSource(id); } catch {}
        });
        // Clean up pulse elements
        removePulseElements(map);
      }
    };
    requestAnimationFrame(fadeOut);
  };

  return cleanup;
}

// Destination pulse + "You helped someone here" message
function pulseDestination(map: mapboxgl.Map, coords: [number, number], onDone: () => void) {
  const pulseSourceId = "donation-pulse-source";
  const pulseLayerId = "donation-pulse-layer";

  try { if (map.getLayer(pulseLayerId)) map.removeLayer(pulseLayerId); } catch {}
  try { if (map.getSource(pulseSourceId)) map.removeSource(pulseSourceId); } catch {}

  map.addSource(pulseSourceId, {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} },
  });

  map.addLayer({
    id: pulseLayerId,
    type: "circle",
    source: pulseSourceId,
    paint: {
      "circle-radius": 8,
      "circle-color": "hsl(38, 62%, 48%)",
      "circle-opacity": 0.6,
      "circle-stroke-color": "hsl(38, 62%, 55%)",
      "circle-stroke-width": 3,
      "circle-stroke-opacity": 0.4,
    },
  });

  // Show popup message
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    anchor: "bottom",
    offset: [0, -18],
    className: "donation-arc-popup",
  })
    .setLngLat(coords)
    .setHTML(`
      <div style="
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 13px;
        font-weight: 500;
        color: hsl(28, 25%, 12%);
        padding: 6px 12px;
        text-align: center;
        line-height: 1.4;
      ">
        You helped someone here.
      </div>
    `)
    .addTo(map);

  // Animate pulse
  const start = performance.now();
  const pulseDuration = 1200;
  let animId: number;

  const pulse = (now: number) => {
    const p = ((now - start) % pulseDuration) / pulseDuration;
    const radius = 8 + p * 20;
    const opacity = 0.6 * (1 - p);
    try {
      if (map.getLayer(pulseLayerId)) {
        map.setPaintProperty(pulseLayerId, "circle-radius", radius);
        map.setPaintProperty(pulseLayerId, "circle-stroke-opacity", opacity);
        map.setPaintProperty(pulseLayerId, "circle-opacity", opacity * 0.5);
      }
    } catch {}

    if (now - start < 2400) {
      animId = requestAnimationFrame(pulse);
    } else {
      popup.remove();
      onDone();
    }
  };
  animId = requestAnimationFrame(pulse);
}

function removePulseElements(map: mapboxgl.Map) {
  try { if (map.getLayer("donation-pulse-layer")) map.removeLayer("donation-pulse-layer"); } catch {}
  try { if (map.getSource("donation-pulse-source")) map.removeSource("donation-pulse-source"); } catch {}
}
