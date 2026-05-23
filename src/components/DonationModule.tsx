import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Loader2, Check, ChevronLeft, ArrowRight } from "lucide-react";
import { useDonationCheckout } from "@/hooks/useDonationCheckout";
import { STRIPE_CONFIG } from "@/lib/stripe";
import { DonationPaymentStep } from "@/components/donation/DonationPaymentStep";
import { DonationTipStep } from "@/components/donation/DonationTipStep";
import type { GivingType, DonationFrequency } from "@/lib/supabase";

interface DonationModuleProps {
  campaignId?: string;
  campaignTitle?: string;
  className?: string;
}

const presetAmounts = [25, 50, 100, 250, 500];

const givingTypeMap: Record<"sadaqah" | "zakat", GivingType> = {
  sadaqah: "sadaqah",
  zakat: "zakat",
};

export function DonationModule({ campaignId, campaignTitle, className }: DonationModuleProps) {
  const [state, actions] = useDonationCheckout();
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [givingTypeUI, setGivingTypeUI] = useState<"sadaqah" | "zakat">("sadaqah");

  const {
    amount,
    givingType,
    frequency,
    coverFees,
    duaIntention,
    processingFee,
    tipAmount,
    totalCharged,
    charityReceives,
    step,
    isSubmitting,
    error,
  } = state;

  const {
    setAmount,
    setGivingType,
    setFrequency,
    setCoverFees,
    setDuaIntention,
    nextStep,
    prevStep,
    submitDonation,
    clearError,
  } = actions;

  const showFeeCoverage = STRIPE_CONFIG.feeCoverableGivingTypes.includes(givingType);
  const feeCoverageLabel =
    givingType === "zakat" ? "Zakat" : givingType === "fidya" ? "Fidya" : "Kaffarah";

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) setAmount(num);
  };

  const handleGivingTypeToggle = (key: "sadaqah" | "zakat") => {
    setGivingTypeUI(key);
    setGivingType(givingTypeMap[key]);
  };

  // Amount step "Continue" — skip 'details', land on 'tip'
  const handleAmountContinue = () => {
    if (!campaignId || amount <= 0) return;
    nextStep();
    nextStep();
  };

  // Tip step "Continue" or "Skip" — submit payment intent then go to payment
  const handleTipConfirm = async (confirmedTipAmount: number) => {
    if (!campaignId || amount <= 0) return;
    clearError();
    try {
      const { clientSecret: cs } = await submitDonation(campaignId, confirmedTipAmount);
      setClientSecret(cs);
      nextStep();
    } catch {
      // error set inside submitDonation
    }
  };

  // ── Confirmation ────────────────────────────────────────────────────────────
  if (step === "confirmation") {
    return (
      <div className={cn("bg-card rounded-xl border border-border shadow-card p-6 text-center", className)}>
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-primary" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
          JazakAllah Khayran
        </h3>
        <div className="bg-secondary rounded-lg p-4 text-sm text-left space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sent to</span>
            <span className="font-medium text-foreground">{campaignTitle ?? "campaign"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Donation</span>
            <span className="font-medium text-foreground">${charityReceives.toFixed(2)} CAD</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">+ ${tipAmount.toFixed(2)} to keep Maddad free</span>
              <span className="text-primary font-medium">Thank you</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          A tax receipt will be emailed to you shortly.
        </p>
      </div>
    );
  }

  // ── Tip step ─────────────────────────────────────────────────────────────────
  if (step === "tip") {
    return (
      <div className={cn(className)}>
        <DonationTipStep
          donationAmount={amount}
          campaignTitle={campaignTitle ?? "this cause"}
          isSubmitting={isSubmitting}
          error={error}
          onConfirm={handleTipConfirm}
          onBack={() => { prevStep(); prevStep(); }}
        />
      </div>
    );
  }

  // ── Payment step ─────────────────────────────────────────────────────────────
  if (step === "payment" && clientSecret) {
    return (
      <div className={cn("bg-card rounded-xl border border-border shadow-card p-6", className)}>
        <button
          onClick={() => prevStep()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <h3 className="font-semibold text-lg text-foreground mb-1">Complete Payment</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Total:{" "}
          <span className="font-medium text-foreground">${totalCharged.toFixed(2)} CAD</span>
        </p>
        <DonationPaymentStep
          clientSecret={clientSecret}
          onSuccess={() => nextStep()}
          onError={(msg) => { void msg; }}
        />
      </div>
    );
  }

  // ── Amount + details form ────────────────────────────────────────────────────
  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card p-6", className)}>
      <h3 className="font-semibold text-lg text-foreground mb-5">Make a Donation</h3>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={cn(
              "py-3 px-4 rounded-lg text-sm font-medium transition-all",
              amount === preset && !customAmount
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            ${preset}
          </button>
        ))}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <input
            type="number"
            placeholder="Other"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            className={cn(
              "w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all",
              "bg-secondary text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              customAmount && "ring-2 ring-primary"
            )}
          />
        </div>
      </div>

      {/* Frequency Toggle */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
        <div className="flex rounded-lg bg-secondary p-1">
          {(["one-time", "monthly"] as DonationFrequency[]).map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                frequency === f
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "one-time" ? "One-time" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Type Toggle */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground mb-2 block">Donation Type</label>
        <div className="flex rounded-lg bg-secondary p-1">
          {(["sadaqah", "zakat"] as const).map((key) => (
            <button
              key={key}
              onClick={() => handleGivingTypeToggle(key)}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all",
                givingTypeUI === key
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Coverage Toggle — Zakat / Fidya / Kaffarah only */}
      {showFeeCoverage && (
        <div className="mb-4 bg-primary/5 rounded-lg p-3 border border-primary/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Cover processing fees so 100% of your {feeCoverageLabel} reaches this campaign
              </p>
              {coverFees && (
                <p className="text-xs text-muted-foreground mt-1">
                  Adding ${processingFee.toFixed(2)} to cover fees — your {feeCoverageLabel} of $
                  {amount.toFixed(2)} arrives in full
                </p>
              )}
            </div>
            <button
              role="switch"
              aria-checked={coverFees}
              onClick={() => setCoverFees(!coverFees)}
              className={cn(
                "relative w-10 h-6 rounded-full shrink-0 transition-colors",
                coverFees ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  coverFees ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      )}

      {/* 100% transparency line */}
      <div className="bg-primary-light rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary">100% to {campaignTitle ?? "campaign"}</span>
          <span className="font-medium text-foreground">${charityReceives.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Maddad adds nothing — your full donation reaches the cause.
        </p>
      </div>

      {/* Dua Intention */}
      <div className="mb-5">
        <label className="text-sm font-medium text-foreground mb-1 block">
          Your intention{" "}
          <span className="text-muted-foreground font-normal">(private — never shared publicly)</span>
        </label>
        <textarea
          value={duaIntention}
          onChange={(e) => setDuaIntention(e.target.value)}
          placeholder="E.g. For the wellbeing of my family…"
          rows={2}
          className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Continue button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleAmountContinue}
        disabled={amount <= 0 || !campaignId}
      >
        <Heart size={18} />
        Continue
        <ArrowRight size={16} />
      </Button>
      {!campaignId && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Select a campaign to enable donations
        </p>
      )}
    </div>
  );
}
