import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PartnerCard } from "@/components/giving/PartnerCard";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { ImpactLog } from "@/components/giving/ImpactLog";
import { 
  Moon, 
  Calculator, 
  Heart,
  Loader2,
  Check,
  ArrowLeft,
  Info,
  ShieldCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  fidyaConfig, 
  verifiedPartners, 
  allocationRules, 
  fidyaImpactLogs 
} from "@/data/givingData";
import type { GivingPartner } from "@/types/giving";

export default function FidyaPage() {
  const navigate = useNavigate();
  const [missedDays, setMissedDays] = useState<number>(1);
  const [selectedPartner, setSelectedPartner] = useState<GivingPartner | null>(null);
  const [anonymous, setAnonymous] = useState(true); // Anonymous by default for Fidya
  const [hideAmount, setHideAmount] = useState(true); // Hide amount by default for privacy
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const partners = verifiedPartners.fidya || [];
  const allocation = allocationRules.fidya;
  const totalAmount = missedDays * fidyaConfig.amountPerDay;

  const handleDonate = async () => {
    if (!selectedPartner) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // Store donation intent privately (in production, this goes to backend)
    console.log("Fidya donation processed:", {
      days: missedDays,
      amount: totalAmount,
      partner: selectedPartner.id, // Only store ID, not name for privacy
      anonymous,
      hideAmount,
      // Dua intention is stored privately, never displayed publicly
      duaIntention: duaIntention ? "[PRIVATE]" : undefined
    });
  };

  const handleViewImpact = () => {
    navigate("/impact");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Back navigation */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/giving" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Giving
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6">
                <Moon size={28} className="text-primary" />
              </div>
              
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                Fidya — Feeding for Missed Fasts
              </h1>
              
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                For those unable to fast due to chronic illness, old age, or other valid reasons, 
                Fidya provides a way to fulfill your obligation by feeding those in need.
              </p>

              {/* Privacy assurance */}
              <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                <ShieldCheck size={16} className="text-primary" />
                <span>Your donation and recipient information remain completely private</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Calculator */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Calculator size={20} className="text-primary" />
                  <h2 className="font-serif text-xl font-semibold text-foreground">Calculate Your Fidya</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Number of missed fast days
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={missedDays}
                      onChange={(e) => setMissedDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className={cn(
                        "w-full max-w-xs px-4 py-3 rounded-lg text-lg font-medium transition-all",
                        "bg-secondary text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20"
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info size={14} />
                    <span>Amount per day: ${fidyaConfig.amountPerDay} (cost of one meal)</span>
                  </div>
                  
                  <div className="bg-primary-light rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">Total Fidya Amount</span>
                      <span className="text-2xl font-serif font-semibold text-primary">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-foreground mt-1">
                      {missedDays} day{missedDays > 1 ? 's' : ''} × ${fidyaConfig.amountPerDay} per meal
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Selection - Privacy-focused display */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Select a Feeding Partner
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  All partners are verified. Distribution details remain private to protect beneficiary dignity.
                </p>
                
                {partners.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {partners.map((partner) => (
                      <PartnerCard
                        key={partner.id}
                        partner={partner}
                        selected={selectedPartner?.id === partner.id}
                        onSelect={setSelectedPartner}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No partners available at this time. Please check back later.</p>
                  </div>
                )}
              </div>

              {/* Privacy & Intention */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
                <AnonymousDonationToggle
                  anonymous={anonymous}
                  hideAmount={hideAmount}
                  onAnonymousChange={setAnonymous}
                  onHideAmountChange={setHideAmount}
                />
                
                <div className="divider-subtle" />
                
                <DuaIntentionField
                  value={duaIntention}
                  onChange={setDuaIntention}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Summary */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Donation Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Missed fasts</span>
                    <span className="font-medium text-foreground">{missedDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Partner</span>
                    <span className="font-medium text-foreground">
                      {selectedPartner?.name || "Not selected"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-xl font-serif font-semibold text-primary">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <AllocationBreakdown
                  items={allocation}
                  className="mb-6"
                />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDonate}
                  disabled={!selectedPartner || isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check size={18} />
                      Fidya Complete
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      Complete Fidya
                    </>
                  )}
                </Button>

                {isSuccess && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-center text-muted-foreground">
                      May Allah accept your Fidya. A private receipt has been sent to your email.
                    </p>
                    <p className="text-xs text-center text-muted-foreground italic">
                      Fidya fulfilled through verified partners. No recipient details are shared publicly.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleViewImpact}
                    >
                      View Aggregate Impact
                    </Button>
                  </div>
                )}
              </div>

              {/* Impact Log - Anonymized aggregate data only */}
              <ImpactLog 
                logs={fidyaImpactLogs} 
                title="Recent Distributions (Aggregate)"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
