import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type TimePreset = "7d" | "30d" | "12m" | "all";

interface MapTimeSliderProps {
  /** Called with the cutoff date — only items created on/after this date should show */
  onTimeChange: (cutoffDate: Date | null) => void;
  className?: string;
  isPanelOpen?: boolean;
}

const presets: { value: TimePreset; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
];

function getDateFromPreset(preset: TimePreset): Date | null {
  const now = new Date();
  switch (preset) {
    case "7d": return new Date(now.getTime() - 7 * 86400000);
    case "30d": return new Date(now.getTime() - 30 * 86400000);
    case "12m": return new Date(now.getTime() - 365 * 86400000);
    case "all": return null;
  }
}

/** Lerp between a date 12 months ago and now based on 0–100 slider value */
function getDateFromSlider(value: number): Date | null {
  if (value >= 100) return null;
  const now = Date.now();
  const yearAgo = now - 365 * 86400000;
  return new Date(yearAgo + (value / 100) * (now - yearAgo));
}

function formatSliderDate(value: number): string {
  if (value >= 100) return "All time";
  const d = getDateFromSlider(value);
  if (!d) return "All time";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export function MapTimeSlider({ onTimeChange, className, isPanelOpen }: MapTimeSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState<TimePreset>("all");
  const [sliderValue, setSliderValue] = useState([100]);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef<number | null>(null);

  const handlePreset = useCallback((preset: TimePreset) => {
    setActivePreset(preset);
    const cutoff = getDateFromPreset(preset);
    onTimeChange(cutoff);
    // Sync slider
    if (preset === "all") setSliderValue([100]);
    else if (preset === "7d") setSliderValue([98]);
    else if (preset === "30d") setSliderValue([92]);
    else if (preset === "12m") setSliderValue([0]);
  }, [onTimeChange]);

  const handleSliderChange = useCallback((val: number[]) => {
    setSliderValue(val);
    setActivePreset("all"); // Clear preset when manually sliding
    const cutoff = getDateFromSlider(val[0]);
    onTimeChange(cutoff);
  }, [onTimeChange]);

  // Play animation
  useEffect(() => {
    if (!isPlaying) {
      if (playRef.current) cancelAnimationFrame(playRef.current);
      return;
    }

    let current = 0;
    const step = () => {
      current += 0.3;
      if (current >= 100) {
        current = 100;
        setIsPlaying(false);
      }
      setSliderValue([current]);
      onTimeChange(getDateFromSlider(current));
      if (current < 100) {
        playRef.current = requestAnimationFrame(step);
      }
    };
    playRef.current = requestAnimationFrame(step);

    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    };
  }, [isPlaying, onTimeChange]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-md rounded-lg border border-border shadow-card",
          "text-muted-foreground hover:text-foreground transition-all duration-300",
          className
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Timeline</span>
      </button>
    );
  }

  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-elevated p-3 animate-scale-in",
      isPanelOpen ? "max-w-[calc(100vw-520px)]" : "max-w-[calc(100vw-100px)]",
      "min-w-[320px]",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Campaign Timeline
          </span>
        </div>
        <button
          onClick={() => { setIsExpanded(false); setIsPlaying(false); }}
          className="text-muted-foreground hover:text-foreground text-xs px-1.5"
        >
          ✕
        </button>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-1.5 mb-3">
        {presets.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handlePreset(value)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-300",
              activePreset === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Slider + Play */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            if (!isPlaying) setSliderValue([0]);
            setIsPlaying(!isPlaying);
          }}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300",
            isPlaying
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <div className="flex-1">
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <span className="text-[11px] text-muted-foreground font-medium min-w-[70px] text-right">
          {formatSliderDate(sliderValue[0])}
        </span>
      </div>
    </div>
  );
}
