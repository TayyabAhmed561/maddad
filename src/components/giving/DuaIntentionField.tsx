import { cn } from "@/lib/utils";
import { Heart, Lock } from "lucide-react";

interface DuaIntentionFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DuaIntentionField({ value, onChange, className }: DuaIntentionFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Heart size={14} className="text-primary" />
          Make an intention (optional)
        </label>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock size={10} />
          Private
        </span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your dua or intention..."
        rows={2}
        className={cn(
          "w-full px-4 py-3 rounded-lg text-sm transition-all",
          "bg-secondary text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "resize-none"
        )}
      />
      
      <p className="text-xs text-muted-foreground italic">
        Your intention is private and will not be shared publicly.
      </p>
    </div>
  );
}
