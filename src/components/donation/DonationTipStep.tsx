import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronLeft, Loader2, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const TIP_PERCENTS = [5, 10, 15] as const;

interface DonationTipStepProps {
  donationAmount: number;
  campaignTitle: string;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: (tipAmount: number) => void;
  onBack: () => void;
}

export function DonationTipStep({
  donationAmount,
  campaignTitle,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: DonationTipStepProps) {
  const [selectedPercent, setSelectedPercent] = useState<number | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const computedTip = isCustom
    ? parseFloat(customInput) || 0
    : selectedPercent !== null
    ? Math.round(donationAmount * (selectedPercent / 100) * 100) / 100
    : 0;

  const canContinue = selectedPercent !== null || isCustom;
  const total = Math.round((donationAmount + computedTip) * 100) / 100;

  const handleSelectPercent = (pct: number) => {
    setSelectedPercent(pct);
    setIsCustom(false);
    setCustomInput("");
  };

  const handleSelectCustom = () => {
    setSelectedPercent(null);
    setIsCustom(true);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Donation confirmation */}
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-lg px-4 py-3 mb-6">
        <Check size={16} className="text-primary shrink-0" />
        <p className="text-sm text-foreground">
          <span className="font-medium">${donationAmount.toFixed(2)} CAD</span>
          {" "}going to{" "}
          <span className="font-medium">{campaignTitle}</span>
        </p>
      </div>

      <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
        Would you like to support Maddad?
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Maddad is free because donors like you chip in.
      </p>

      {/* Tip pill buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TIP_PERCENTS.map((pct) => {
          const tipAmt = Math.round(donationAmount * (pct / 100) * 100) / 100;
          const isSelected = selectedPercent === pct && !isCustom;
          return (
            <button
              key={pct}
              onClick={() => handleSelectPercent(pct)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/40"
              )}
            >
              {pct}%{" "}
              <span className={cn("text-xs", isSelected ? "opacity-80" : "text-muted-foreground")}>
                (${tipAmt.toFixed(2)})
              </span>
            </button>
          );
        })}
        <button
          onClick={handleSelectCustom}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
            isCustom
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/40"
          )}
        >
          Other
        </button>
      </div>

      {/* Custom amount input */}
      {isCustom && (
        <div className="relative max-w-xs mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            min={0.5}
            step="0.01"
            placeholder="Enter amount"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="pl-7"
            autoFocus
          />
        </div>
      )}

      {/* Skip link */}
      <div className="mb-6">
        <button
          onClick={() => onConfirm(0)}
          disabled={isSubmitting}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline disabled:opacity-50"
        >
          Skip — no tip this time
        </button>
      </div>

      {/* Total breakdown */}
      <div className="bg-secondary rounded-lg p-4 mb-4 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">To {campaignTitle}</span>
          <span className="font-medium text-foreground">${donationAmount.toFixed(2)}</span>
        </div>
        {computedTip > 0 && (
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Tip to Maddad</span>
            <span className="font-medium text-foreground">+ ${computedTip.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="font-medium text-foreground">Total today</span>
          <span className="font-semibold text-foreground">${total.toFixed(2)} CAD</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        <Link
          to="/support-maddad"
          className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          Learn how Maddad sustains itself →
        </Link>
      </p>

      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={() => onConfirm(computedTip)}
        disabled={!canContinue || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            Continue to payment
            <ArrowRight size={18} />
          </>
        )}
      </Button>
    </div>
  );
}
