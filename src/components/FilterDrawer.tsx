import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ["Food", "Shelter", "Medical", "Education", "Masjid"];

export function FilterDrawer({ isOpen, onClose }: FilterDrawerProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [urgency, setUrgency] = useState(50);
  const [distance, setDistance] = useState(100);
  const [zakatOnly, setZakatOnly] = useState(false);
  const [sortBy, setSortBy] = useState("urgency");

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setUrgency(50);
    setDistance(100);
    setZakatOnly(false);
    setSortBy("urgency");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-prominent animate-scale-in overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedCategories.includes(cat)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground">Minimum Urgency</label>
              <span className="text-sm text-muted-foreground">{urgency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={urgency}
              onChange={(e) => setUrgency(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Distance Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground">Max Distance</label>
              <span className="text-sm text-muted-foreground">{distance} km</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Zakat Toggle */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Zakat eligible only</span>
              <button
                onClick={() => setZakatOnly(!zakatOnly)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  zakatOnly ? "bg-primary" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-transform",
                  zakatOnly ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </label>
          </div>

          {/* Sort By */}
          <div className="mb-8">
            <label className="text-sm font-medium text-foreground mb-3 block">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="urgency">Urgency</option>
              <option value="funded">Most funded</option>
              <option value="closest">Closest</option>
              <option value="recent">Recently updated</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Apply filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
