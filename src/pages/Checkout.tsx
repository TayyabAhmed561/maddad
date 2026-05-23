import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDonationCheckout } from "@/hooks/useDonationCheckout";
import { useCampaign } from "@/hooks/queries/useCampaigns";
import { DonationTipStep } from "@/components/donation/DonationTipStep";
import { DonationPaymentStep } from "@/components/donation/DonationPaymentStep";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { STRIPE_CONFIG } from "@/lib/stripe";
import type { GivingType, DonationFrequency } from "@/lib/supabase";
import maddadLogo from "@/assets/maddad-logo.png";
import {
  ArrowLeft, Heart, Loader2, ArrowRight, Lock, Check, ChevronLeft,
} from "lucide-react";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

interface DonorInfo {
  fullName: string;
  email: string;
  addressStreet: string;
  addressCity: string;
  addressProvince: string;
  addressPostalCode: string;
}

const VISUAL_STEPS = ["Your giving", "Support Maddad", "Payment"] as const;

function stepToVisual(step: string): number {
  if (step === "amount" || step === "details") return 1;
  if (step === "tip") return 2;
  return 3;
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const campaignId   = searchParams.get("campaignId") ?? "";
  const campaignName = decodeURIComponent(searchParams.get("campaignName") ?? "");
  const initialGT    = (searchParams.get("givingType") ?? "sadaqah") as GivingType;
  const initialAmt   = parseFloat(searchParams.get("amount") ?? "50") || 50;

  const { data: campaign } = useCampaign(campaignId || undefined);
  const displayName = campaign?.title ?? (campaignName || "this cause");

  const [state, actions] = useDonationCheckout();
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    fullName: "", email: "", addressStreet: "", addressCity: "",
    addressProvince: "ON", addressPostalCode: "",
  });

  // Pre-fill from URL params
  useEffect(() => {
    actions.setAmount(initialAmt);
    actions.setGivingType(initialGT);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill donor info from profile
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    supabase.from("donors")
      .select("full_name, email, address_street, address_city, address_province, address_postal_code")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setDonorInfo({
          fullName:        data.full_name ?? "",
          email:           data.email ?? "",
          addressStreet:   data.address_street ?? "",
          addressCity:     data.address_city ?? "",
          addressProvince: data.address_province ?? "ON",
          addressPostalCode: data.address_postal_code ?? "",
        });
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  const { amount, givingType, frequency, coverFees, duaIntention, isAnonymous,
    processingFee, step, isSubmitting, error } = state;
  const { setAmount, setGivingType, setFrequency, setCoverFees,
    setDuaIntention, setIsAnonymous, nextStep, prevStep, submitDonation, clearError } = actions;

  const showFeeCoverage = STRIPE_CONFIG.feeCoverableGivingTypes.includes(givingType);

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setAmount(n);
  };

  const handleAmountContinue = () => {
    if (amount <= 0 || !campaignId) return;
    nextStep(); nextStep(); // skip 'details' → land on 'tip'
  };

  const handleTipConfirm = async (confirmedTip: number) => {
    if (!campaignId || amount <= 0) return;
    clearError();
    try {
      const { clientSecret: cs } = await submitDonation(campaignId, confirmedTip);
      setClientSecret(cs);
      nextStep();
    } catch {
      // error set in hook
    }
  };

  const visualStep = stepToVisual(step);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={maddadLogo} alt="Maddad" className="h-full w-full object-cover scale-[1.35] origin-center" />
              </div>
              <span className="font-serif font-semibold text-foreground">Maddad</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock size={14} />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center max-w-2xl mx-auto">
            {VISUAL_STEPS.map((label, idx) => {
              const n = idx + 1;
              const active = n === visualStep;
              const done = n < visualStep;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 py-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                      done ? "bg-primary text-primary-foreground" :
                      active ? "bg-primary text-primary-foreground" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      {done ? <Check size={12} /> : n}
                    </div>
                    <span className={cn(
                      "text-sm hidden sm:inline transition-colors",
                      active ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </div>
                  {idx < VISUAL_STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-px mx-3 transition-colors",
                      done ? "bg-primary/40" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">

            {/* Campaign name at top */}
            {displayName && (
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Donating to <span className="font-medium text-foreground">{displayName}</span>
              </p>
            )}

            {/* ── Step 1: Amount + details ─────────────────────────────── */}
            {step === "amount" || step === "details" ? (
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
                {/* Preset amounts */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Amount (CAD)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((p) => (
                      <button key={p} onClick={() => { setAmount(p); setCustomAmount(""); }}
                        className={cn(
                          "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                          amount === p && !customAmount
                            ? "bg-primary text-primary-foreground shadow-soft"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}>
                        ${p}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input type="number" placeholder="Other amount" value={customAmount}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className={cn(
                        "w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all",
                        "bg-secondary text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                        customAmount && "ring-2 ring-primary"
                      )} />
                  </div>
                </div>

                {/* Giving type */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Donation type</label>
                  <div className="flex rounded-lg bg-secondary p-1">
                    {(["sadaqah", "zakat"] as const).map((gt) => (
                      <button key={gt} onClick={() => setGivingType(gt)}
                        className={cn(
                          "flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all",
                          givingType === gt
                            ? "bg-card text-foreground shadow-soft"
                            : "text-muted-foreground hover:text-foreground"
                        )}>
                        {gt === "sadaqah" ? "Sadaqah" : "Zakat"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
                  <div className="flex rounded-lg bg-secondary p-1">
                    {(["one-time", "monthly"] as DonationFrequency[]).map((f) => (
                      <button key={f} onClick={() => setFrequency(f)}
                        className={cn(
                          "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                          frequency === f
                            ? "bg-card text-foreground shadow-soft"
                            : "text-muted-foreground hover:text-foreground"
                        )}>
                        {f === "one-time" ? "One-time" : "Monthly"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee coverage toggle */}
                {showFeeCoverage && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Cover processing fees so 100% of your donation reaches this campaign
                        </p>
                        {coverFees && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Adding ${processingFee.toFixed(2)} to cover fees
                          </p>
                        )}
                      </div>
                      <button role="switch" aria-checked={coverFees} onClick={() => setCoverFees(!coverFees)}
                        className={cn("relative w-10 h-6 rounded-full shrink-0 transition-colors",
                          coverFees ? "bg-primary" : "bg-muted")}>
                        <span className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                          coverFees ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Anonymous toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Anonymous donation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your name won't be shown publicly</p>
                  </div>
                  <button role="switch" aria-checked={isAnonymous} onClick={() => setIsAnonymous(!isAnonymous)}
                    className={cn("relative w-10 h-6 rounded-full shrink-0 transition-colors",
                      isAnonymous ? "bg-primary" : "bg-muted")}>
                    <span className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                      isAnonymous ? "translate-x-5" : "translate-x-1"
                    )} />
                  </button>
                </div>

                {/* Dua intention */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Intention{" "}
                    <span className="text-muted-foreground font-normal text-xs">(private — never shared)</span>
                  </label>
                  <textarea value={duaIntention} onChange={(e) => setDuaIntention(e.target.value)}
                    placeholder="E.g. For the wellbeing of my family…" rows={2}
                    className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>

                {/* 100% transparency */}
                <div className="bg-primary-light rounded-lg p-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-primary">100% to {displayName}</span>
                  <span className="font-medium text-foreground">${amount.toFixed(2)} CAD</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleAmountContinue}
                  disabled={amount <= 0 || !campaignId}>
                  <Heart size={18} />
                  Continue
                  <ArrowRight size={16} />
                </Button>
                {!campaignId && (
                  <p className="text-xs text-destructive text-center -mt-4">
                    No campaign selected — return to the campaign page and try again.
                  </p>
                )}
              </div>
            ) : null}

            {/* ── Step 2: Tip ──────────────────────────────────────────── */}
            {step === "tip" && (
              <DonationTipStep
                donationAmount={amount}
                campaignTitle={displayName}
                isSubmitting={isSubmitting}
                error={error}
                onConfirm={handleTipConfirm}
                onBack={() => { prevStep(); prevStep(); }}
              />
            )}

            {/* ── Step 3: Payment ──────────────────────────────────────── */}
            {step === "payment" && clientSecret && (
              <div className="space-y-4">
                {/* Summary card */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-serif text-base font-semibold text-foreground mb-3">
                    {displayName}
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Donation</span>
                      <span className="font-medium text-foreground">${amount.toFixed(2)} CAD</span>
                    </div>
                    {state.tipAmount > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tip to Maddad</span>
                        <span className="font-medium text-foreground">${state.tipAmount.toFixed(2)} CAD</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tip to Maddad</span>
                        <span className="text-muted-foreground">No tip</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-semibold text-foreground">${state.totalCharged.toFixed(2)} CAD</span>
                    </div>
                  </div>
                </div>

                {/* Donor info (pre-filled, informational) */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-medium text-foreground mb-1">Your details</h3>
                  <p className="text-xs text-muted-foreground mb-4">Required for your official tax receipt</p>
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
                        <Input value={donorInfo.fullName}
                          onChange={(e) => setDonorInfo(d => ({ ...d, fullName: e.target.value }))}
                          placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                        <Input value={donorInfo.email}
                          onChange={(e) => setDonorInfo(d => ({ ...d, email: e.target.value }))}
                          placeholder="your@email.com" type="email" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Street address</label>
                      <Input value={donorInfo.addressStreet}
                        onChange={(e) => setDonorInfo(d => ({ ...d, addressStreet: e.target.value }))}
                        placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="col-span-1 sm:col-span-1">
                        <label className="text-xs text-muted-foreground mb-1 block">City</label>
                        <Input value={donorInfo.addressCity}
                          onChange={(e) => setDonorInfo(d => ({ ...d, addressCity: e.target.value }))}
                          placeholder="Kitchener" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Province</label>
                        <Input value={donorInfo.addressProvince}
                          onChange={(e) => setDonorInfo(d => ({ ...d, addressProvince: e.target.value }))}
                          placeholder="ON" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Postal code</label>
                        <Input value={donorInfo.addressPostalCode}
                          onChange={(e) => setDonorInfo(d => ({ ...d, addressPostalCode: e.target.value }))}
                          placeholder="N2G 1A1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back + Stripe */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <button onClick={() => prevStep()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ChevronLeft size={16} />
                    Back to tip
                  </button>
                  <DonationPaymentStep
                    clientSecret={clientSecret}
                    onSuccess={() =>
                      navigate("/checkout/confirmation", {
                        state: {
                          campaignTitle: displayName,
                          donationAmount: amount,
                          tipAmount: state.tipAmount,
                          totalCharged: state.totalCharged,
                          email: donorInfo.email,
                        },
                      })
                    }
                    onError={(msg) => { void msg; }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
