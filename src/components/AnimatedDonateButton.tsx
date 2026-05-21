import { useState, useCallback } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type ButtonState = "idle" | "pressing" | "loading" | "success";

interface AnimatedDonateButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  onComplete?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "card" | "outline";
  label?: string;
  showToast?: boolean;
  toastMessage?: string;
  navigateAfter?: boolean;
  disabled?: boolean;
}

export function AnimatedDonateButton({
  onClick,
  onComplete,
  className,
  size = "sm",
  variant = "card",
  label = "Donate",
  showToast = false,
  toastMessage = "",
  navigateAfter = true,
  disabled = false,
}: AnimatedDonateButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (state !== "idle" || disabled) return;

      // Start press animation
      setState("pressing");

      // After press animation, go to loading
      setTimeout(() => {
        setState("loading");

        if (showToast && toastMessage) {
          toast({ title: toastMessage, duration: 3000 });
        }

        // Simulate loading for 800-1200ms
        const loadingDuration = 800 + Math.random() * 400;

        setTimeout(() => {
          setState("success");

          // Show success for 600ms then revert
          setTimeout(() => {
            setState("idle");

            // Execute callback or navigation after animation completes
            if (navigateAfter && onClick) {
              onClick(e);
            }
            onComplete?.();
          }, 600);
        }, loadingDuration);
      }, 150);

      // If not navigating after, call onClick immediately for ripple effect
      if (!navigateAfter && onClick) {
        onClick(e);
      }
    },
    [state, disabled, showToast, toastMessage, navigateAfter, onClick, onComplete]
  );

  const isDisabled = state !== "idle" || disabled;

  const getButtonContent = () => {
    switch (state) {
      case "loading":
        return (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="ml-1.5">Processing…</span>
          </>
        );
      case "success":
        return (
          <>
            <Check className="w-3.5 h-3.5" />
            <span className="ml-1.5">Done</span>
          </>
        );
      default:
        return (
          <>
            <Heart className="w-3.5 h-3.5" />
            <span className="ml-1.5">{label}</span>
          </>
        );
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        // Press animation
        state === "pressing" && "scale-[0.96] opacity-90",
        // Loading state
        state === "loading" && "bg-primary/80 cursor-wait",
        // Success state
        state === "success" && "bg-primary text-primary-foreground",
        // Ripple/glow effect on press
        state === "pressing" && "shadow-[0_0_0_4px_rgba(34,95,74,0.2)]",
        // Idle hover glow
        state === "idle" && "hover:shadow-[0_0_12px_rgba(34,95,74,0.25)]",
        className
      )}
    >
      {/* Ripple overlay */}
      {state === "pressing" && (
        <span className="absolute inset-0 bg-white/20 animate-ping rounded-lg" />
      )}
      
      {/* Button content */}
      <span className="relative flex items-center justify-center">
        {getButtonContent()}
      </span>
    </Button>
  );
}

// Hook for popup buttons that need inline HTML rendering
export function useAnimatedDonateState() {
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({});

  const getState = (id: string): ButtonState => buttonStates[id] || "idle";

  const triggerAnimation = useCallback((id: string, callback?: () => void) => {
    if (buttonStates[id] && buttonStates[id] !== "idle") return;

    setButtonStates((prev) => ({ ...prev, [id]: "pressing" }));

    setTimeout(() => {
      setButtonStates((prev) => ({ ...prev, [id]: "loading" }));

      const loadingDuration = 800 + Math.random() * 400;

      setTimeout(() => {
        setButtonStates((prev) => ({ ...prev, [id]: "success" }));

        setTimeout(() => {
          setButtonStates((prev) => ({ ...prev, [id]: "idle" }));
          callback?.();
        }, 600);
      }, loadingDuration);
    }, 150);
  }, [buttonStates]);

  return { getState, triggerAnimation };
}
