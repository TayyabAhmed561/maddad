import { MapPin, Clock, Heart, Building2, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import { categoryLabels, type AppealCategory } from "@/data/appealsData";

interface AppealCardProps {
  id: string;
  title: string;
  beneficiary: string;
  category: AppealCategory;
  location: string;
  raised: number;
  goal: number;
  endorsedBy: {
    type: "masjid" | "organization";
    name: string;
  };
  lastUpdated: string;
  description: string;
  zakatEligible: boolean;
  onView: (id: string) => void;
  onSupport: (id: string) => void;
  className?: string;
}

export function AppealCard({
  id,
  title,
  beneficiary,
  category,
  location,
  raised,
  goal,
  endorsedBy,
  lastUpdated,
  description,
  zakatEligible,
  onView,
  onSupport,
  className,
}: AppealCardProps) {
  const categoryStyle = categoryLabels[category];

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border border-border p-7 card-interactive",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1">
          <span className={cn("inline-flex px-3 py-1.5 rounded-full text-xs font-medium border mb-4", categoryStyle.color)}>
            {categoryStyle.label}
          </span>
          <h3 
            className="font-serif font-semibold text-foreground text-lg leading-tight mb-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onView(id)}
          >
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{beneficiary}</p>
        </div>
      </div>

      {/* Endorsement Badge */}
      <div className="endorsement-badge mb-5">
        {endorsedBy.type === "masjid" ? (
          <Building2 size={14} className="gold-icon" />
        ) : (
          <Shield size={14} className="gold-icon" />
        )}
        <span>Endorsed by {endorsedBy.name}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Location & Zakat */}
      <div className="flex items-center gap-5 text-sm text-muted-foreground mb-5">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0" />
          <span>{location}</span>
        </div>
        {zakatEligible && (
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle size={14} />
            <span className="font-medium">Zakat Eligible</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <ProgressBar current={raised} goal={goal} size="sm" className="mb-5" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{lastUpdated}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView(id)}
          >
            View
          </Button>
          <Button 
            size="sm"
            onClick={() => onSupport(id)}
          >
            <Heart size={16} />
            Support
          </Button>
        </div>
      </div>
    </div>
  );
}
