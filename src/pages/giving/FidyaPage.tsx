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
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { GivingPartner, MealImpactLog } from "@/types/giving";

const FIDYA_AMOUNT_PER_DAY = 15; // Example amount

const samplePartners: GivingPartner[] = [
  {
    id: "1",
    name: "Al-Khair Kitchen Network",
    region: "Local (USA)",
    verified: true,
    taxDeductible: true,
    description: "Community kitchens providing hot meals across 12 cities in the United States."
  },
  {
    id: "2",
    name: "Global Feeding Initiative",
    region: "International",
    verified: true,
    taxDeductible: true,
    description: "Provides meals in Yemen, Syria, and Gaza through trusted local partners."
  },
  {
    id: "3",
    name: "Masjid Al-Rahman Food Bank",
    region: "Chicago, IL",
    verified: true,
    taxDeductible: true,
    description: "Local masjid-operated food bank serving 500+ families monthly."
  }
];

const sampleImpactLogs: MealImpactLog[] = [
  { id: "1", date: "January 22, 2024", mealsDelivered: 1250, location: "Chicago, IL", partner: "Masjid Al-Rahman" },
  { id: "2", date: "January 20, 2024", mealsDelivered: 3400, location: "Gaza Strip", partner: "Global Feeding Initiative" },
  { id: "3", date: "January 18, 2024", mealsDelivered: 890, location: "Detroit, MI", partner: "Al-Khair Kitchen" }
];

export default function FidyaPage() {
  const [missedDays, setMissedDays] = useState<number>(1);
  const [selectedPartner, setSelectedPartner] = useState<GivingPartner | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalAmount = missedDays * FIDYA_AMOUNT_PER_DAY;

  const handleDonate = () => {
    if (!selectedPartner) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
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
                    <span>Amount per day: ${FIDYA_AMOUNT_PER_DAY} (cost of one meal)</span>
                  </div>
                  
                  <div className="bg-primary-light rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">Total Fidya Amount</span>
                      <span className="text-2xl font-serif font-semibold text-primary">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-foreground mt-1">
                      {missedDays} day{missedDays > 1 ? 's' : ''} × ${FIDYA_AMOUNT_PER_DAY} per meal
                    </p>
                  </div>
                </div>
              </div>

              {/* Partner Selection */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Select a Feeding Partner
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  All partners are verified and provide meal distribution confirmations.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {samplePartners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      partner={partner}
                      selected={selectedPartner?.id === partner.id}
                      onSelect={setSelectedPartner}
                    />
                  ))}
                </div>
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
              <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
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
                  items={[
                    { label: "Meal delivery", percentage: 92 },
                    { label: "Logistics", percentage: 6 },
                    { label: "Platform", percentage: 2 }
                  ]}
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
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    May Allah accept your Fidya. A receipt has been sent to your email.
                  </p>
                )}
              </div>

              {/* Impact Log */}
              <ImpactLog 
                logs={sampleImpactLogs} 
                title="Recent Meal Distributions"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
