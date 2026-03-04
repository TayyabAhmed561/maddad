import { Calendar, Image as ImageIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignUpdate } from "@/types/platform";

interface CampaignUpdatesProps {
  updates: CampaignUpdate[];
  className?: string;
}

export function CampaignUpdates({ updates, className }: CampaignUpdatesProps) {
  if (!updates || updates.length === 0) return null;

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="heading-section text-xl text-foreground">Campaign Updates</h2>
      
      <div className="space-y-6">
        {updates.map((update, index) => (
          <div
            key={update.id}
            className="relative pl-7 border-l-2 border-border pb-6 last:pb-0"
          >
            <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-primary shadow-soft" />
            
            <div className="bg-card rounded-xl border border-border p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-medium text-foreground text-sm leading-snug">
                  {update.title}
                </h3>
                {update.progressPercent !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                    <TrendingUp className="w-3 h-3" />
                    {update.progressPercent}%
                  </span>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Calendar className="w-3 h-3" />
                <span>{update.date}</span>
              </div>

              {/* Content */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {update.content}
              </p>

              {/* Images */}
              {update.images && update.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {update.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted"
                    >
                      <img
                        src={img}
                        alt={`Update photo ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
