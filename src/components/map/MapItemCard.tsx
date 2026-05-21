import { useNavigate } from "react-router-dom";
import { MapPin, Clock, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { AnimatedDonateButton } from "@/components/AnimatedDonateButton";
import { cn } from "@/lib/utils";
import { MapItem, categoryColors } from "@/data/mapData";
import { toast } from "@/hooks/use-toast";

interface MapItemCardProps {
  item: MapItem;
  onView: (id: string) => void;
  onDonate: (id: string) => void;
  className?: string;
  isSelected?: boolean;
}

export function MapItemCard({ item, onView, onDonate, className, isSelected }: MapItemCardProps) {
  const navigate = useNavigate();
  const categoryStyle = categoryColors[item.category];
  const hasProgress = item.goal && item.fundingRaised !== undefined;
  const isPlaceholder = item.isPlaceholder;
  
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaceholder) {
      toast({
        title: "Coming soon",
        description: "More details for this need will be available soon.",
      });
    } else {
      navigate(`/charity/${item.id}`);
    }
  };

  const handleDonate = () => {
    if (isPlaceholder) {
      toast({
        title: "Coming soon",
        description: "Donations for this need will be available soon.",
      });
    } else {
      navigate(`/charity/${item.id}#donate`);
    }
  };
  
  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-5 border border-border card-interactive transition-all duration-300",
        isSelected && "border-primary shadow-md",
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
            onClick={handleView}
          >
            View
          </Button>
          {(item.type === "need" || item.type === "appeal") && (
            <AnimatedDonateButton
              size="sm"
              variant="card"
              onComplete={handleDonate}
              showToast={false}
              navigateAfter={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
