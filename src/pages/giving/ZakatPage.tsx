import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { 
  Coins, 
  Heart,
  Loader2,
  Check,
  ArrowLeft,
  ShieldCheck,
  Users,
  FileCheck,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ZakatCase, DonationFrequency } from "@/types/giving";

const presetAmounts = [100, 250, 500, 1000, 2500];

const zakatCategories = [
  { id: "poor", label: "The Poor (Al-Fuqara)", count: 234 },
  { id: "needy", label: "The Needy (Al-Masakin)", count: 189 },
  { id: "debt", label: "Those in Debt (Al-Gharimin)", count: 67 },
  { id: "wayfarer", label: "The Wayfarer (Ibn Al-Sabil)", count: 45 },
  { id: "convert", label: "New Muslims (Al-Mu'allafah)", count: 23 }
];

const sampleCases: ZakatCase[] = [
  {
    id: "1",
    category: "The Poor",
    description: "Family of 5 requiring monthly support for basic necessities",
    needed: 1200,
    allocated: 800,
    verifiedBy: "Masjid Al-Taqwa",
    region: "Chicago, IL"
  },
  {
    id: "2",
    category: "Those in Debt",
    description: "Medical debt relief for chronic illness treatment",
    needed: 3500,
    allocated: 2100,
    verifiedBy: "Islamic Center of Detroit",
    region: "Detroit, MI"
  },
  {
    id: "3",
    category: "The Needy",
    description: "Housing assistance for family facing eviction",
    needed: 2000,
    allocated: 1400,
    verifiedBy: "Muslim Community Center",
    region: "Houston, TX"
  }
];

const transparencyLog = [
  { date: "Jan 22", action: "Distributed $4,500 to 3 verified families", verifier: "Masjid Al-Noor" },
  { date: "Jan 20", action: "Allocated $2,800 for medical debt relief", verifier: "ICNA Relief" },
  { date: "Jan 18", action: "Disbursed $6,200 across 5 eligible recipients", verifier: "Islamic Relief USA" }
];

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

  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleDonate = () => {
    if (selectedAmount <= 0) return;
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
                <Coins size={28} className="text-primary" />
              </div>
              
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                Zakat Distribution
              </h1>
              
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Your Zakat reaches only eligible recipients, verified by local masjids and trusted scholars. 
                We show you anonymized categories and aggregate impact—never individual identities.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>Scholar-verified eligibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span>Anonymized recipients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-primary" />
                  <span>Full transparency</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Amount Selection */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Zakat Amount
                </h2>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount("");
                      }}
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Other"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={cn(
                        "w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all",
                        "bg-secondary text-foreground placeholder:text-muted-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                        customAmount && "ring-2 ring-primary"
                      )}
                    />
                  </div>
                </div>

                <RecurringDonationToggle
                  value={frequency}
                  onChange={setFrequency}
                  showYearly={true}
                  className="mt-6"
                />
              </div>

              {/* Category Preference */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Allocation Preference (Optional)
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Optionally guide your Zakat to a specific category. If unselected, 
                  distribution will prioritize based on current need.
                </p>
                
                <div className="space-y-2">
                  {zakatCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                        selectedCategory === cat.id
                          ? "border-primary bg-primary-light"
                          : "border-border bg-secondary hover:border-primary/40"
                      )}
                    >
                      <span className="font-medium text-foreground">{cat.label}</span>
                      <span className="text-sm text-muted-foreground">{cat.count} active cases</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Anonymized Cases Preview */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Current Verified Cases
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Anonymized examples of verified Zakat-eligible cases.
                </p>
                
                <div className="space-y-4">
                  {sampleCases.map((zakatCase) => (
                    <div 
                      key={zakatCase.id}
                      className="p-4 rounded-lg bg-secondary border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-light text-primary">
                          {zakatCase.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{zakatCase.region}</span>
                      </div>
                      <p className="text-sm text-foreground mb-3">{zakatCase.description}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${(zakatCase.allocated / zakatCase.needed) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((zakatCase.allocated / zakatCase.needed) * 100)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileCheck size={12} />
                        <span>Verified by {zakatCase.verifiedBy}</span>
                      </div>
                    </div>
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
                  Zakat Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">${selectedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium text-foreground capitalize">{frequency.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">
                      {selectedCategory 
                        ? zakatCategories.find(c => c.id === selectedCategory)?.label.split(" ")[0] 
                        : "Most needed"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-xl font-serif font-semibold text-primary">
                        ${selectedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <AllocationBreakdown
                  items={[
                    { label: "Direct to recipients", percentage: 100 }
                  ]}
                  title="Zakat allocation"
                  className="mb-6"
                />

                <p className="text-xs text-muted-foreground mb-4 p-3 bg-accent-light rounded-lg">
                  100% of your Zakat reaches eligible recipients. Platform costs are covered separately.
                </p>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDonate}
                  disabled={selectedAmount <= 0 || isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check size={18} />
                      Zakat Submitted
                    </>
                  ) : (
                    <>
                      <Heart size={18} />
                      Submit Zakat
                    </>
                  )}
                </Button>

                {isSuccess && (
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    May Allah accept your Zakat. A receipt has been sent to your email.
                  </p>
                )}
              </div>

              {/* Transparency Log */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Transparency Log
                </h3>
                
                <div className="space-y-4">
                  {transparencyLog.map((entry, index) => (
                    <div key={index} className="border-l-2 border-primary/30 pl-4 py-1">
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
    </div>
  );
}
