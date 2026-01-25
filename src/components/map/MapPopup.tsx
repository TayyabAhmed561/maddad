import { MapPin, Clock, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapItem, categoryColors } from "@/data/mapData";
import { cn } from "@/lib/utils";

interface MapPopupProps {
  item: MapItem;
  onViewDetails: (item: MapItem) => void;
  onDonate: (item: MapItem) => void;
}

function getVerifiedLabel(status: MapItem["verifiedStatus"]) {
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
}

export function MapPopup({ item, onViewDetails, onDonate }: MapPopupProps) {
  const isPlaceholder = item.isPlaceholder;
  
  return (
    <div className="min-w-[260px] max-w-[300px] p-1">
      <h3 className="font-serif text-base font-semibold text-foreground mb-1 pr-4">
        {item.title}
      </h3>

      {item.orgName && !isPlaceholder && (
        <p className="text-xs text-muted-foreground mb-2">{item.orgName}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full",
            item.verifiedStatus === "verified" && "bg-primary/10 text-primary",
            item.verifiedStatus === "pending" && "bg-accent/10 text-accent-foreground",
            item.verifiedStatus === "unverified" && "bg-muted text-muted-foreground"
          )}
        >
          {item.verifiedStatus === "verified" ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {getVerifiedLabel(item.verifiedStatus)}
        </span>

        {item.zakatEligible && !isPlaceholder && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent-foreground">
            Zakat Eligible
          </span>
        )}

        {item.endorsedBy && !isPlaceholder && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-light text-accent-foreground">
            <Award className="w-3 h-3" />
            Endorsed
          </span>
        )}
      </div>

      {/* Progress bar for real items */}
      {!isPlaceholder && item.goal && item.fundingRaised !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-foreground font-medium">
              ${item.fundingRaised.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              of ${item.goal.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((item.fundingRaised / item.goal) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {item.privacyLevel === "local_private"
            ? item.locationLabel.split(",")[0] + " Area"
            : item.locationLabel}
        </span>
        {!isPlaceholder && <span>Updated {item.lastUpdated}</span>}
      </div>

      {/* Placeholder message */}
      {isPlaceholder ? (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground italic">
            More details coming soon
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 h-8 text-xs" 
            onClick={() => onViewDetails(item)}
          >
            View Details
          </Button>

          {(item.type === "need" || item.type === "appeal") && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => onDonate(item)}
            >
              Donate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to render popup content as HTML string
export function renderPopupHTML(item: MapItem): string {
  const isPlaceholder = item.isPlaceholder;
  const verifiedLabel = getVerifiedLabel(item.verifiedStatus);
  const categoryStyle = categoryColors[item.category];
  
  const verifiedClass = item.verifiedStatus === "verified" 
    ? "background-color: rgba(34, 95, 74, 0.1); color: hsl(160, 45%, 32%)"
    : item.verifiedStatus === "pending"
    ? "background-color: rgba(186, 140, 44, 0.1); color: hsl(38, 62%, 45%)"
    : "background-color: rgba(0,0,0,0.05); color: rgba(0,0,0,0.5)";
  
  const progressWidth = item.goal && item.fundingRaised !== undefined
    ? Math.min((item.fundingRaised / item.goal) * 100, 100)
    : 0;
  
  const locationDisplay = item.privacyLevel === "local_private"
    ? item.locationLabel.split(",")[0] + " Area"
    : item.locationLabel;

  return `
    <div style="min-width: 260px; max-width: 300px; padding: 4px; font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 4px 0; padding-right: 16px; line-height: 1.3;">
        ${item.title}
      </h3>
      
      ${item.orgName && !isPlaceholder ? `
        <p style="font-size: 12px; color: #666; margin: 0 0 8px 0;">${item.orgName}</p>
      ` : ''}
      
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; font-size: 10px; font-weight: 500; border-radius: 9999px; ${verifiedClass}">
          ${verifiedLabel}
        </span>
        
        ${item.zakatEligible && !isPlaceholder ? `
          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; font-size: 10px; font-weight: 500; border-radius: 9999px; background-color: rgba(186, 140, 44, 0.1); color: hsl(38, 62%, 45%);">
            Zakat Eligible
          </span>
        ` : ''}
        
        ${item.endorsedBy && !isPlaceholder ? `
          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; font-size: 10px; font-weight: 500; border-radius: 9999px; background-color: rgba(186, 140, 44, 0.15); color: hsl(38, 62%, 35%);">
            Endorsed
          </span>
        ` : ''}
      </div>
      
      ${!isPlaceholder && item.goal && item.fundingRaised !== undefined ? `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #1a1a1a; font-weight: 500;">$${item.fundingRaised.toLocaleString()}</span>
            <span style="color: #666;">of $${item.goal.toLocaleString()}</span>
          </div>
          <div style="height: 6px; background-color: #e5e5e5; border-radius: 9999px; overflow: hidden;">
            <div style="height: 100%; background-color: hsl(160, 45%, 32%); border-radius: 9999px; width: ${progressWidth}%;"></div>
          </div>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666; margin-bottom: 12px;">
        <span style="display: flex; align-items: center; gap: 4px;">
          📍 ${locationDisplay}
        </span>
        ${!isPlaceholder ? `<span>Updated ${item.lastUpdated}</span>` : ''}
      </div>
      
      ${isPlaceholder ? `
        <div style="text-align: center; padding: 8px 0;">
          <p style="font-size: 12px; color: #666; font-style: italic; margin: 0;">More details coming soon</p>
        </div>
      ` : `
        <div style="display: flex; gap: 8px;">
          <button 
            id="popup-view-${item.id}"
            style="flex: 1; height: 32px; font-size: 12px; font-weight: 500; color: white; background-color: hsl(160, 45%, 32%); border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s;"
            onmouseover="this.style.opacity='0.9'"
            onmouseout="this.style.opacity='1'"
          >
            View Details
          </button>
          ${item.type === "need" || item.type === "appeal" ? `
            <button 
              id="popup-donate-${item.id}"
              style="height: 32px; padding: 0 12px; font-size: 12px; font-weight: 500; color: hsl(160, 45%, 32%); background-color: transparent; border: 1px solid hsl(160, 45%, 32%); border-radius: 8px; cursor: pointer; transition: background-color 0.2s;"
              onmouseover="this.style.backgroundColor='hsl(160, 45%, 95%)'"
              onmouseout="this.style.backgroundColor='transparent'"
            >
              Donate
            </button>
          ` : ''}
        </div>
      `}
    </div>
  `;
}
