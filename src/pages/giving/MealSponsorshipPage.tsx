import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PartnerCard } from "@/components/giving/PartnerCard";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { ImpactLog } from "@/components/giving/ImpactLog";
import { 
  Utensils, 
  Heart,
  Loader2,
  Check,
  ArrowLeft,
  Users,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { GivingPartner, MealImpactLog, DonationFrequency } from "@/types/giving";

const MEAL_COST = 8;

const presetMeals = [10, 25, 50, 100, 250];

const samplePartners: GivingPartner[] = [
  {
    id: "1",
    name: "Community Iftar Network",
    region: "USA Nationwide",
    verified: true,
    taxDeductible: true,
    description: "Provides hot meals at community centers and masjids across 40+ cities."
  },
  {
    id: "2",
    name: "Mercy Kitchen International",
    region: "Middle East & Africa",
    verified: true,
    taxDeductible: true,
    description: "Operates feeding centers in refugee camps and underserved communities."
  },
  {
    id: "3",
    name: "Local Masjid Food Program",
    region: "Your City",
    verified: true,
    taxDeductible: true,
    description: "Support your local masjid's weekly food distribution program."
  }
];

const sampleImpactLogs: MealImpactLog[] = [
  { id: "1", date: "January 23, 2024", mealsDelivered: 2100, location: "Houston, TX", partner: "Community Iftar Network" },
  { id: "2", date: "January 21, 2024", mealsDelivered: 5600, location: "Lebanon", partner: "Mercy Kitchen International" },
  { id: "3", date: "January 19, 2024", mealsDelivered: 340, location: "Dallas, TX", partner: "Irving Islamic Center" }
];

export default function MealSponsorshipPage() {
  const [meals, setMeals] = useState<number>(25);
  const [customMeals, setCustomMeals] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<GivingPartner | null>(null);
  const [frequency, setFrequency] = useState<DonationFrequency>("one-time");
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedMeals = customMeals ? parseInt(customMeals) || 0 : meals;
  const totalAmount = selectedMeals * MEAL_COST;

  const handleDonate = () => {
    if (!selectedPartner || selectedMeals <= 0) return;
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
                <Utensils size={28} className="text-primary" />
              </div>
              
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                Meal Sponsorship Program
              </h1>
              
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Sponsor nutritious meals for those in need. Beneficiaries are verified through partner 
                organizations—you see aggregate impact, never individual data, preserving dignity for all.
              </p>

              <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>Verified beneficiaries only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span>Anonymous distribution</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Meal Selection */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  How many meals would you like to sponsor?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Each meal costs ${MEAL_COST} and provides a nutritious, hot meal to someone in need.
                </p>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {presetMeals.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setMeals(preset);
                        setCustomMeals("");
                      }}
                      className={cn(
                        "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                        meals === preset && !customMeals
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customMeals}
                    onChange={(e) => setCustomMeals(e.target.value)}
                    className={cn(
                      "py-3 px-4 rounded-lg text-sm font-medium transition-all text-center",
                      "bg-secondary text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20",
                      customMeals && "ring-2 ring-primary"
                    )}
                  />
                </div>

                <div className="bg-primary-light rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Total Sponsorship</span>
                    <span className="text-2xl font-serif font-semibold text-primary">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-foreground mt-1">
                    {selectedMeals.toLocaleString()} meals × ${MEAL_COST} each
                  </p>
                </div>
              </div>

              {/* Frequency */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <RecurringDonationToggle
                  value={frequency}
                  onChange={setFrequency}
                  showWeekly={true}
                  showYearly={true}
                />
                
                {frequency !== "one-time" && (
                  <p className="text-sm text-muted-foreground mt-4 p-3 bg-accent-light rounded-lg">
                    You can pause or cancel your recurring sponsorship at any time from your donor dashboard.
                  </p>
                )}
              </div>

              {/* Partner Selection */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Choose a Distribution Partner
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select where you'd like your meals to be distributed.
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
                  Sponsorship Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meals</span>
                    <span className="font-medium text-foreground">{selectedMeals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium text-foreground capitalize">{frequency.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Partner</span>
                    <span className="font-medium text-foreground text-right max-w-[140px] truncate">
                      {selectedPartner?.name || "Not selected"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">
                        {frequency === "one-time" ? "Total" : `Per ${frequency.replace("ly", "")}`}
                      </span>
                      <span className="text-xl font-serif font-semibold text-primary">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <AllocationBreakdown
                  items={[
                    { label: "Food & preparation", percentage: 88 },
                    { label: "Distribution", percentage: 8 },
                    { label: "Admin & platform", percentage: 4 }
                  ]}
                  className="mb-6"
                />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDonate}
                  disabled={!selectedPartner || selectedMeals <= 0 || isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check size={18} />
                      Sponsorship Complete
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      Sponsor {selectedMeals.toLocaleString()} Meals
                    </>
                  )}
                </Button>

                {isSuccess && (
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    JazakAllah Khair. A confirmation has been sent to your email.
                  </p>
                )}
              </div>

              {/* Impact Log */}
              <ImpactLog 
                logs={sampleImpactLogs} 
                title="Recent Distributions"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
