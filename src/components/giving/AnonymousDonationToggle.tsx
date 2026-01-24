import { cn } from "@/lib/utils";
import { EyeOff, Check } from "lucide-react";

interface AnonymousDonationToggleProps {
  anonymous: boolean;
  hideAmount: boolean;
  onAnonymousChange: (value: boolean) => void;
  onHideAmountChange: (value: boolean) => void;
  className?: string;
}

export function AnonymousDonationToggle({
  anonymous,
  hideAmount,
  onAnonymousChange,
  onHideAmountChange,
  className
}: AnonymousDonationToggleProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
        <EyeOff size={14} className="text-muted-foreground" />
        <span>Privacy Options</span>
      </div>
      
      <button
        onClick={() => onAnonymousChange(!anonymous)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
          anonymous 
            ? "border-primary bg-primary-light" 
            : "border-border bg-secondary hover:border-primary/40"
        )}
      >
        <div className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
          anonymous ? "border-primary bg-primary" : "border-muted-foreground"
        )}>
          {anonymous && <Check size={12} className="text-primary-foreground" />}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Donate anonymously</p>
          <p className="text-xs text-muted-foreground">Your name will not appear publicly</p>
        </div>
      </button>
      
      <button
        onClick={() => onHideAmountChange(!hideAmount)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
          hideAmount 
            ? "border-primary bg-primary-light" 
            : "border-border bg-secondary hover:border-primary/40"
        )}
      >
        <div className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
          hideAmount ? "border-primary bg-primary" : "border-muted-foreground"
        )}>
          {hideAmount && <Check size={12} className="text-primary-foreground" />}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Hide donation amount</p>
          <p className="text-xs text-muted-foreground">Amount will not be shown publicly</p>
        </div>
      </button>
      
      <p className="text-xs text-muted-foreground italic">
        You will still receive a private receipt and confirmation.
      </p>
    </div>
  );
}
