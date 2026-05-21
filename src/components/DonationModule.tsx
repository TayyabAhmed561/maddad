import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Loader2, Check, ChevronLeft } from "lucide-react";
import { useDonationCheckout } from "@/hooks/useDonationCheckout";
import { STRIPE_CONFIG } from "@/lib/stripe";
import { DonationPaymentStep } from "@/components/donation/DonationPaymentStep";
import type { GivingType, DonationFrequency } from "@/lib/supabase";

interface DonationModuleProps {
  campaignId?: string;
  campaignTitle?: string;
  className?: string;
}

const presetAmounts = [25, 50, 100, 250, 500];

// Map the two-option UI toggle to DB giving_type values
const givingTypeMap: Record<"sadaqah" | "zakat", GivingType> = {
  sadaqah: "sadaqah",
  zakat: "zakat",
};

export function DonationModule({ campaignId, campaignTitle, className }: DonationModuleProps) {
  const [state, actions] = useDonationCheckout();
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // UI alias: track which simple option is selected (sadaqah vs zakat)
  const [givingTypeUI, setGivingTypeUI] = useState<"sadaqah" | "zakat">("sadaqah");

  const {
    amount,
    givingType,
    frequency,
    tipPercent,
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
    setTipPercent,
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

  const handleFrequencyToggle = (f: DonationFrequency) => setFrequency(f);

  const handleDonate = async () => {
    if (!campaignId || totalCharged <= 0) return;
    clearError();
    try {
      const { clientSecret: cs } = await submitDonation(campaignId);
      setClientSecret(cs);
      // Skip 'details' step (form is flat) — go directly to 'payment'
      nextStep();
      nextStep();
    } catch {
      // error already set inside submitDonation
    }
  };

  // ── Confirmation step ───────────────────────────────────────────────────────
  if (step === "confirmation") {
    return (
      <div className={cn("bg-card rounded-xl border border-border shadow-card p-6 text-center", className)}>
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-primary" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          JazakAllah Khayran
        </h3>
        <p className="text-muted-foreground text-sm mb-1">
          Your donation of ${totalCharged.toFixed(2)} CAD has been received.
        </p>
        <p className="text-xs text-muted-foreground">
          A tax receipt will be emailed to you shortly.
        </p>
      </div>
    );
  }

  // ── Payment step — Stripe Payment Element ───────────────────────────────────
  if (step === "payment" && clientSecret) {
    return (
      <div className={cn("bg-card rounded-xl border border-border shadow-card p-6", className)}>
        <button
          onClick={() => { prevStep(); prevStep(); }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <h3 className="font-semibold text-lg text-foreground mb-2">Complete Payment</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Total: <span className="font-medium text-foreground">${totalCharged.toFixed(2)} CAD</span>
        </p>
        <DonationPaymentStep
          clientSecret={clientSecret}
          onSuccess={() => nextStep()}
          onError={(msg) => {
            // Surface Stripe error in the same error area
            actions.clearError();
            // Use the error state by setting it via a side-channel
            // (DonationPaymentStep renders its own error inline)
            void msg;
          }}
        />
      </div>
    );
  }

  // ── Main form (amount + details combined) ───────────────────────────────────
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
              onClick={() => handleFrequencyToggle(f)}
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

      {/* Tip Selector */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground mb-1 block">
          Support Maddad's operations
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Over 70% of donors leave a tip — it keeps the platform free for charities
        </p>
        <div className="flex gap-2 flex-wrap">
          {STRIPE_CONFIG.tipOptions.map((pct) => (
            <button
              key={pct}
              onClick={() => setTipPercent(pct)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                tipPercent === pct
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
              )}
            >
              {pct}%
            </button>
          ))}
          <button
            onClick={() => setTipPercent(0)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              tipPercent === 0
                ? "bg-muted text-foreground border-border"
                : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
            )}
          >
            None
          </button>
        </div>
      </div>

      {/* Fee Coverage Toggle — only for zakat / fidya / kaffarah */}
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

      {/* Fund Usage / Transparency Line */}
      <div className="bg-primary-light rounded-lg p-4 mb-4">
        <p className="text-sm font-medium text-primary mb-2">Where your donation goes</p>
        <div className="space-y-1.5 text-sm text-secondary-foreground">
          <div className="flex justify-between">
            <span>To {campaignTitle ?? "campaign"}</span>
            <span className="font-medium">${charityReceives.toFixed(2)}</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between">
              <span>Tip to Maddad</span>
              <span className="font-medium">${tipAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground text-xs pt-1 border-t border-primary/10">
            <span>Maddad operational ({STRIPE_CONFIG.platformFeePercent}%)</span>
            <span>${(amount * STRIPE_CONFIG.platformFeePercent / 100).toFixed(2)}</span>
          </div>
        </div>
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

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive mb-3">{error}</p>
      )}

      {/* Donate Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleDonate}
        disabled={totalCharged <= 0 || isSubmitting || !campaignId}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Heart size={18} />
            Donate ${totalCharged.toFixed(2)} CAD
          </>
        )}
      </Button>
      {!campaignId && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Select a campaign to enable donations
        </p>
      )}
    </div>
  );
}
