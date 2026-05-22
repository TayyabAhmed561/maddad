import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { ZakatCalculator } from "@/components/giving/ZakatCalculator";
import { GivingProofSection } from "@/components/giving/GivingProofSection";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { Coins, Heart, Loader2, Check, ArrowLeft, ShieldCheck, Users, FileCheck, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { zakatConfig, zakatCases, allocationRules, zakatTransparencyLog } from "@/data/givingData";
import type { DonationFrequency } from "@/types/giving";

export default function ZakatPage() {
  const [amount, setAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<DonationFrequency>("one-time");
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(true);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const allocation = allocationRules.zakat;
  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleDonate = async () => {
    if (selectedAmount <= 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    const receipt = createReceipt({
      amount: selectedAmount,
      campaignTitle: "Zakat Distribution",
      organizationName: "Verified Masjid & Scholar Network",
      donationType: "zakat",
      frequency,
      isAnonymous: anonymous,
      hideAmount,
      duaIntention: duaIntention || undefined,
      givingCategory: "zakat",
    });
    setLastReceipt(receipt);
    setShowConfirmDialog(true);
  };

  const handleCalculatorResult = (calculatedAmount: number) => {
    setCustomAmount(calculatedAmount.toFixed(2));
    setAmount(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/giving" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={16} />Back to Giving</Link>
          </div>
        </div>

        <section className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6"><Coins size={28} className="text-primary" /></div>
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">Zakat Distribution</h1>
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Your Zakat reaches only eligible recipients, verified by local masjids and trusted scholars. We show anonymized categories and aggregate impact—never individual identities.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /><span>Scholar-verified eligibility</span></div>
                <div className="flex items-center gap-2"><Users size={16} className="text-primary" /><span>Anonymized recipients</span></div>
                <div className="flex items-center gap-2"><Eye size={16} className="text-primary" /><span>Full transparency</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ZakatCalculator onCalculate={handleCalculatorResult} />

              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Zakat Amount</h2>
                <p className="text-sm text-muted-foreground mb-6">Enter your Zakat amount directly, or use the calculator above.</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {zakatConfig.presetAmounts.map((preset) => (
                    <button key={preset} onClick={() => { setAmount(preset); setCustomAmount(""); }}
                      className={cn("py-3 px-4 rounded-lg text-sm font-medium transition-all", amount === preset && !customAmount ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
                      ${preset}
                    </button>
                  ))}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input type="number" placeholder="Other" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)}
                      className={cn("w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20", customAmount && "ring-2 ring-primary")} />
                  </div>
                </div>
                <RecurringDonationToggle value={frequency} onChange={setFrequency} showYearly={true} className="mt-6" />
              </div>

              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Allocation Preference (Optional)</h2>
                <p className="text-sm text-muted-foreground mb-6">Optionally guide your Zakat to a specific category.</p>
                <div className="space-y-2">
                  {zakatConfig.categories.map((cat) => (
                    <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={cn("w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300", selectedCategory === cat.id ? "border-primary bg-primary-light" : "border-border bg-secondary hover:border-primary/40")}>
                      <span className="font-medium text-foreground">{cat.label}</span>
                      <span className="text-sm text-muted-foreground">{cat.count} active cases</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Verified Cases (Anonymized)</h2>
                <div className="space-y-4">
                  {zakatCases.map((c) => (
                    <div key={c.id} className="p-4 rounded-lg bg-secondary border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-light text-primary">{c.category}</span>
                        <span className="text-xs text-muted-foreground">{c.region}</span>
                      </div>
                      <p className="text-sm text-foreground mb-3">{c.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(c.allocated / c.needed) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{Math.round((c.allocated / c.needed) * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><FileCheck size={12} /><span>Verified by {c.verifiedBy}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
                <AnonymousDonationToggle anonymous={anonymous} hideAmount={hideAmount} onAnonymousChange={setAnonymous} onHideAmountChange={setHideAmount} />
                <div className="divider-subtle" />
                <DuaIntentionField value={duaIntention} onChange={setDuaIntention} />
              </div>

              <GivingProofSection givingCategory="zakat" />
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Zakat Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-medium text-foreground">${selectedAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frequency</span><span className="font-medium text-foreground capitalize">{frequency.replace("-", " ")}</span></div>
                  <div className="border-t border-border pt-3"><div className="flex justify-between"><span className="font-medium text-foreground">Total</span><span className="text-xl font-serif font-semibold text-primary">${selectedAmount.toLocaleString()}</span></div></div>
                </div>
                <AllocationBreakdown items={allocation} title="Zakat allocation" className="mb-6" />
                <p className="text-xs text-muted-foreground mb-4 p-3 bg-accent-light rounded-lg">100% of your Zakat reaches eligible recipients. Platform costs are covered separately.</p>
                <Button className="w-full" size="lg" onClick={handleDonate} disabled={selectedAmount <= 0 || isLoading || isSuccess}>
                  {isLoading ? (<><Loader2 size={18} className="animate-spin" />Processing...</>) : isSuccess ? (<><Check size={18} />Zakat Submitted</>) : (<><Heart size={18} />Submit Zakat</>)}
                </Button>
                {isSuccess && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-center text-muted-foreground">May Allah accept your Zakat.</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setShowConfirmDialog(true)}>View Receipt & Track Impact</Button>
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Transparency Log</h3>
                <div className="space-y-4">
                  {zakatTransparencyLog.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-primary/30 pl-4 py-1">
                      <p className="text-xs text-muted-foreground mb-1">{entry.date}</p>
                      <p className="text-sm text-foreground">{entry.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">Via {entry.verifier}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <DonationConfirmDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog} receipt={lastReceipt} trackingPath="/giving/zakat" />
    </div>
  );
}
