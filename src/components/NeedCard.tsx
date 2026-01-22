import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CategoryTag, type Category } from "@/components/CategoryTag";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";

interface NeedCardProps {
  id: string;
  title: string;
  organization: string;
  isVerified: boolean;
  category: Category;
  location: string;
  raised: number;
  goal: number;
  lastUpdated: string;
  onView: (id: string) => void;
  onDonate: (id: string) => void;
  className?: string;
}

export function NeedCard({
  id,
  title,
  organization,
  isVerified,
  category,
  location,
  raised,
  goal,
  lastUpdated,
  onView,
  onDonate,
  className,
}: NeedCardProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-6 border border-border card-interactive",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-foreground text-base leading-tight mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground truncate">
              {organization}
            </span>
            {isVerified && <VerificationBadge status="verified" size="sm" />}
          </div>
        </div>
        <CategoryTag category={category} size="sm" />
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
        <MapPin size={14} className="shrink-0" />
        <span className="truncate">{location}</span>
      </div>

      {/* Progress */}
      <ProgressBar current={raised} goal={goal} size="sm" className="mb-5" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>Updated {lastUpdated}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="card-secondary" 
            size="sm"
            onClick={() => onView(id)}
          >
            View
          </Button>
          <Button 
            variant="card" 
            size="sm"
            onClick={() => onDonate(id)}
          >
            Donate
          </Button>
        </div>
      </div>
    </div>
  );
}