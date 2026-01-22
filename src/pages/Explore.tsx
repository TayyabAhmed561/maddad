import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NeedCard } from "@/components/NeedCard";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/components/CategoryTag";

interface Need {
  id: string;
  title: string;
  organization: string;
  isVerified: boolean;
  category: Category;
  location: string;
  raised: number;
  goal: number;
  lastUpdated: string;
}

const sampleNeeds: Need[] = [
  {
    id: "1",
    title: "Emergency Food Distribution in Gaza",
    organization: "Palestine Relief Network",
    isVerified: true,
    category: "food",
    location: "Gaza, Palestine",
    raised: 45000,
    goal: 75000,
    lastUpdated: "2 hours ago"
  },
  {
    id: "2",
    title: "Shelter Rebuilding After Earthquake",
    organization: "Turkish Red Crescent",
    isVerified: true,
    category: "shelter",
    location: "Hatay, Turkey",
    raised: 128000,
    goal: 200000,
    lastUpdated: "1 day ago"
  },
  {
    id: "3",
    title: "Medical Supplies for Rural Clinic",
    organization: "Health Without Borders",
    isVerified: true,
    category: "medical",
    location: "Dhaka, Bangladesh",
    raised: 8500,
    goal: 15000,
    lastUpdated: "5 hours ago"
  },
  {
    id: "4",
    title: "Masjid Construction Project",
    organization: "Al-Noor Foundation",
    isVerified: true,
    category: "masjid",
    location: "Lagos, Nigeria",
    raised: 67000,
    goal: 120000,
    lastUpdated: "3 days ago"
  },
  {
    id: "5",
    title: "School Supplies for Orphans",
    organization: "Yemen Education Trust",
    isVerified: false,
    category: "education",
    location: "Sana'a, Yemen",
    raised: 3200,
    goal: 10000,
    lastUpdated: "12 hours ago"
  },
  {
    id: "6",
    title: "Winter Food Packages",
    organization: "Syrian Relief Initiative",
    isVerified: true,
    category: "food",
    location: "Aleppo, Syria",
    raised: 22000,
    goal: 40000,
    lastUpdated: "6 hours ago"
  }
];

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filteredNeeds = sampleNeeds.filter(need => {
    if (verifiedOnly && !need.isVerified) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        need.title.toLowerCase().includes(query) ||
        need.organization.toLowerCase().includes(query) ||
        need.location.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleView = (id: string) => {
    navigate(`/need/${id}`);
  };

  const handleDonate = (id: string) => {
    navigate(`/need/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Top Bar */}
      <div className="sticky top-18 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by city, crisis, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow duration-200"
              />
            </div>
            
            {/* Verified Toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={cn(
                "hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                verifiedOnly
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <CheckCircle size={16} />
              Verified only
            </button>
            
            {/* Filters Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setFilterDrawerOpen(true)}
              className="gap-2"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8.5rem)]">
          {/* Map Section */}
          <div className="w-full lg:w-[60%] xl:w-[65%] h-64 lg:h-full p-4 lg:pr-2">
            <MapPlaceholder 
              className="h-full"
              onMarkerClick={(id) => handleView(id)}
            />
          </div>
          
          {/* List Section */}
          <div className="w-full lg:w-[40%] xl:w-[35%] h-full overflow-y-auto border-t lg:border-t-0 lg:border-l border-border section-warm">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-semibold text-foreground text-lg">
                  {filteredNeeds.length} needs found
                </h2>
                
                {/* Mobile verified toggle */}
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={cn(
                    "sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    verifiedOnly
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <CheckCircle size={14} />
                  Verified
                </button>
              </div>
              
              {filteredNeeds.map((need, index) => (
                <div 
                  key={need.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <NeedCard
                    {...need}
                    onView={handleView}
                    onDonate={handleDonate}
                  />
                </div>
              ))}

              {filteredNeeds.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No needs found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FilterDrawer 
        isOpen={filterDrawerOpen} 
        onClose={() => setFilterDrawerOpen(false)} 
      />
    </div>
  );
}