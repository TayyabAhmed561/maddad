import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  category: string;
  label: string;
}

interface MapPlaceholderProps {
  markers?: MarkerData[];
  className?: string;
  onMarkerClick?: (id: string) => void;
}

// Sample markers for demonstration
const sampleMarkers: MarkerData[] = [
  { id: "1", lat: 35, lng: -40, category: "food", label: "Morocco" },
  { id: "2", lat: 28, lng: 10, category: "shelter", label: "Libya" },
  { id: "3", lat: 33, lng: 44, category: "medical", label: "Iraq" },
  { id: "4", lat: 24, lng: 45, category: "masjid", label: "Saudi Arabia" },
  { id: "5", lat: 31, lng: 35, category: "shelter", label: "Palestine" },
  { id: "6", lat: 36, lng: 53, category: "food", label: "Iran" },
  { id: "7", lat: 41, lng: 29, category: "education", label: "Turkey" },
  { id: "8", lat: 6, lng: 4, category: "food", label: "Nigeria" },
];

const categoryColors: Record<string, string> = {
  food: "bg-amber-500",
  shelter: "bg-sky-500",
  medical: "bg-rose-500",
  education: "bg-violet-500",
  masjid: "bg-emerald-500",
};

export function MapPlaceholder({ 
  markers = sampleMarkers, 
  className,
  onMarkerClick 
}: MapPlaceholderProps) {
  return (
    <div className={cn(
      "relative w-full h-full min-h-[400px] bg-gradient-to-br from-trust-light to-secondary rounded-xl overflow-hidden",
      className
    )}>
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Simplified world map shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[90%] h-[70%] relative">
          {/* Continents as simple shapes */}
          <div className="absolute w-16 h-20 bg-muted rounded-lg left-[8%] top-[15%] opacity-40" /> {/* N. America */}
          <div className="absolute w-10 h-16 bg-muted rounded-lg left-[12%] top-[50%] opacity-40" /> {/* S. America */}
          <div className="absolute w-12 h-14 bg-muted rounded-lg left-[35%] top-[20%] opacity-40" /> {/* Europe */}
          <div className="absolute w-20 h-24 bg-muted rounded-lg left-[38%] top-[30%] opacity-40" /> {/* Africa */}
          <div className="absolute w-24 h-20 bg-muted rounded-lg left-[50%] top-[15%] opacity-40" /> {/* Asia */}
          <div className="absolute w-14 h-10 bg-muted rounded-lg left-[75%] top-[55%] opacity-40" /> {/* Australia */}

          {/* Markers */}
          {markers.map((marker, index) => (
            <button
              key={marker.id}
              onClick={() => onMarkerClick?.(marker.id)}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 group",
                "transition-all duration-200 hover:scale-125 hover:z-10"
              )}
              style={{
                left: `${40 + marker.lng * 0.5}%`,
                top: `${50 - marker.lat * 0.8}%`,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={cn(
                "w-4 h-4 rounded-full shadow-elevated flex items-center justify-center",
                "ring-2 ring-white",
                categoryColors[marker.category] || "bg-primary"
              )}>
                <MapPin size={10} className="text-white" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs font-medium rounded shadow-elevated opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {marker.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-card">
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
              <span className="text-muted-foreground capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
