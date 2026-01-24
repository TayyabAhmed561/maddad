import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { 
  Heart,
  Loader2,
  Check,
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  Info,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { QurbaniPackage } from "@/types/giving";

const qurbaniPackages: QurbaniPackage[] = [
  {
    id: "1",
    animal: "sheep",
    price: 150,
    region: "Pakistan",
    partner: "Islamic Relief",
    description: "One sheep provides meat for approximately 15-20 families"
  },
  {
    id: "2",
    animal: "goat",
    price: 120,
    region: "Bangladesh",
    partner: "Muslim Aid",
    description: "One goat provides meat for approximately 12-15 families"
  },
  {
    id: "3",
    animal: "cow-share",
    price: 180,
    region: "India",
    partner: "Helping Hand",
    description: "1/7 share of a cow, provides for approximately 8-10 families"
  },
  {
    id: "4",
    animal: "sheep",
    price: 200,
    region: "Palestine",
    partner: "PCRF",
    description: "One sheep distributed to families in Gaza and West Bank"
  },
  {
    id: "5",
    animal: "cow-full",
    price: 950,
    region: "Somalia",
    partner: "Islamic Relief",
    description: "Full cow provides meat for approximately 70+ families"
  },
  {
    id: "6",
    animal: "sheep",
    price: 175,
    region: "Yemen",
    partner: "Mercy Corps",
    description: "One sheep for families affected by ongoing crisis"
  }
];

const processSteps = [
  { step: 1, title: "Selection", description: "Choose your Qurbani animal and region" },
  { step: 2, title: "Verification", description: "Animal is inspected for health and eligibility" },
  { step: 3, title: "Sacrifice", description: "Performed on Eid days following Islamic guidelines" },
  { step: 4, title: "Distribution", description: "Fresh meat distributed to verified families" },
  { step: 5, title: "Confirmation", description: "You receive a report with distribution details" }
];

const animalLabels: Record<string, string> = {
  "sheep": "Sheep",
  "goat": "Goat",
  "cow-share": "Cow Share (1/7)",
  "cow-full": "Full Cow"
};

export default function QurbaniPage() {
  const [selectedPackage, setSelectedPackage] = useState<QurbaniPackage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalAmount = selectedPackage ? selectedPackage.price * quantity : 0;

  const handleDonate = () => {
    if (!selectedPackage) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  // Mock: Check if we're in Qurbani season (Dhul Hijjah)
  const isQurbaniSeason = true; // In production, calculate from Islamic calendar

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
              {isQurbaniSeason && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-highlight text-sm font-medium mb-6">
                  <Calendar size={14} className="gold-icon" />
                  <span className="text-accent-foreground">Dhul Hijjah — Qurbani Season Open</span>
                </div>
              )}
              
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6">
                <Heart size={28} className="text-primary" />
              </div>
              
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                Qurbani / Udhiyah
              </h1>
              
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Fulfill your Qurbani obligation during Eid al-Adha. Select a region and partner, 
                and receive confirmation of sacrifice and distribution to families in need.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Process Steps */}
          <div className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
              How It Works
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {processSteps.map((step, index) => (
                <div key={step.step} className="flex items-center gap-3">
                  <div className="flex flex-col items-center text-center max-w-[120px]">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold mb-2">
                      {step.step}
                    </div>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block w-8 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Selection */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Selection */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Select Your Qurbani
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose a region and animal type. All partners are verified and follow Islamic slaughter guidelines.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {qurbaniPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all duration-300",
                        selectedPackage?.id === pkg.id
                          ? "border-primary bg-primary-light ring-2 ring-primary/20"
                          : "border-border bg-secondary hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{animalLabels[pkg.animal]}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin size={12} />
                            <span>{pkg.region}</span>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-primary">${pkg.price}</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{pkg.description}</p>
                      
                      <div className="flex items-center gap-1 text-xs text-accent">
                        <CheckCircle size={12} />
                        <span>{pkg.partner}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              {selectedPackage && (
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Number of Qurbani
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-2xl font-semibold text-foreground w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                    <Info size={14} />
                    You can perform multiple Qurbani on behalf of yourself and others.
                  </p>
                </div>
              )}

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
              {/* Summary */}
              <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Qurbani Summary
                </h3>
                
                {selectedPackage ? (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Animal</span>
                        <span className="font-medium text-foreground">{animalLabels[selectedPackage.animal]}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Region</span>
                        <span className="font-medium text-foreground">{selectedPackage.region}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Partner</span>
                        <span className="font-medium text-foreground">{selectedPackage.partner}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium text-foreground">{quantity}</span>
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
                        { label: "Animal & slaughter", percentage: 85 },
                        { label: "Distribution", percentage: 12 },
                        { label: "Admin", percentage: 3 }
                      ]}
                      className="mb-6"
                    />

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleDonate}
                      disabled={isLoading || isSuccess}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : isSuccess ? (
                        <>
                          <Check size={18} />
                          Qurbani Booked
                        </>
                      ) : (
                        <>
                          <Heart size={18} />
                          Complete Qurbani
                        </>
                      )}
                    </Button>

                    {isSuccess && (
                      <p className="text-sm text-center text-muted-foreground mt-4">
                        Eid Mubarak! You will receive a confirmation report after distribution.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a Qurbani package to continue
                  </p>
                )}
              </div>

              {/* Timing Info */}
              <div className="bg-accent-light rounded-xl p-6 border border-accent-muted/20">
                <div className="flex items-center gap-2 text-accent-foreground mb-2">
                  <Clock size={16} />
                  <span className="font-medium">Important Dates</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Booking deadline: 8th Dhul Hijjah</li>
                  <li>• Sacrifice: 10-12th Dhul Hijjah</li>
                  <li>• Report sent within 7 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
