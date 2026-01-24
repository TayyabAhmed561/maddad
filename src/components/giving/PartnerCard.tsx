import { cn } from "@/lib/utils";
import { CheckCircle, MapPin, FileText } from "lucide-react";
import type { GivingPartner } from "@/types/giving";

interface PartnerCardProps {
  partner: GivingPartner;
  selected?: boolean;
  onSelect: (partner: GivingPartner) => void;
  className?: string;
}

export function PartnerCard({ partner, selected = false, onSelect, className }: PartnerCardProps) {
  return (
    <button
      onClick={() => onSelect(partner)}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all duration-300",
        selected 
          ? "border-primary bg-primary-light ring-2 ring-primary/20" 
          : "border-border bg-card hover:border-primary/40",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground">{partner.name}</h4>
        {partner.verified && (
          <CheckCircle size={16} className="text-primary flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <MapPin size={12} />
        <span>{partner.region}</span>
      </div>
      
      {partner.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {partner.description}
        </p>
      )}
      
      {partner.taxDeductible && (
        <div className="flex items-center gap-1 text-xs text-accent">
          <FileText size={12} />
          <span>Tax receipt available</span>
        </div>
      )}
    </button>
  );
}
