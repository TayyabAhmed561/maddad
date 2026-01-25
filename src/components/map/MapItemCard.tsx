import { MapPin, Clock, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import { MapItem, categoryColors } from "@/data/mapData";

interface MapItemCardProps {
  item: MapItem;
  onView: (id: string) => void;
  onDonate: (id: string) => void;
  className?: string;
}

export function MapItemCard({ item, onView, onDonate, className }: MapItemCardProps) {
  const categoryStyle = categoryColors[item.category];
  const hasProgress = item.goal && item.fundingRaised !== undefined;
  
  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-5 border border-border card-interactive",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-foreground text-base leading-tight mb-2 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {item.orgName && (
              <span className="text-sm text-muted-foreground truncate">
                {item.orgName}
              </span>
            )}
            {item.verifiedStatus === "verified" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>
        
        {/* Category Tag */}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full shrink-0"
          style={{ 
            backgroundColor: categoryStyle.bg, 
            color: categoryStyle.text 
          }}
        >
          {item.category}
        </span>
      </div>

      {/* Badges Row */}
      {(item.zakatEligible || item.endorsedBy) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.zakatEligible && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent-foreground">
              Zakat Eligible
            </span>
          )}
          {item.endorsedBy && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-light text-accent-foreground">
              <Award className="w-3 h-3" />
              Endorsed
            </span>
          )}
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <MapPin size={14} className="shrink-0" />
        <span className="truncate">
          {item.privacyLevel === "local_private" 
            ? item.locationLabel.split(",")[0] + " Area"
            : item.locationLabel
          }
        </span>
      </div>

      {/* Progress Bar (if applicable) */}
      {hasProgress && (
        <div className="mb-4">
          <ProgressBar 
            current={item.fundingRaised!} 
            goal={item.goal!} 
            size="sm" 
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>Updated {item.lastUpdated}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="card-secondary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(item.id);
            }}
          >
            View
          </Button>
          {(item.type === "need" || item.type === "appeal") && (
            <Button 
              variant="card" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDonate(item.id);
              }}
            >
              Donate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
