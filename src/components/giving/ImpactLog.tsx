import { cn } from "@/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";
import type { MealImpactLog } from "@/types/giving";

interface ImpactLogProps {
  logs: MealImpactLog[];
  title?: string;
  className?: string;
}

export function ImpactLog({ logs, title = "Impact Log", className }: ImpactLogProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-6", className)}>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      <div className="space-y-4">
        {logs.map((log) => (
          <div 
            key={log.id}
            className="border-l-2 border-primary/30 pl-4 py-2"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar size={12} />
              <span>{log.date}</span>
            </div>
            
            <p className="text-sm text-foreground font-medium mb-2">
              {log.mealsDelivered.toLocaleString()} meals distributed
            </p>
            
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{log.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} />
                <span>{log.partner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
