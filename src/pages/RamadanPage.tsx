import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NeedCard } from "@/components/NeedCard";
import { needsData, getNeedById } from "@/data/needsData";
import { 
  generateRamadanNightPlan, 
  ramadanFeaturedNeeds, 
  ramadanGivingTracker 
} from "@/data/platformData";
import { cn } from "@/lib/utils";
import { 
  Moon, 
  Calendar, 
  CheckCircle, 
  Star, 
  ArrowLeft,
  TrendingUp,
  Heart,
  Sparkles
} from "lucide-react";

export default function RamadanPage() {
  const navigate = useNavigate();
  const [nightlyAmount, setNightlyAmount] = useState(15);
  const nightPlan = generateRamadanNightPlan(nightlyAmount);
  const tracker = ramadanGivingTracker;

  const presetAmounts = [10, 15, 25, 50];

  const featuredNeeds = ramadanFeaturedNeeds
    .map(fn => {
      const need = getNeedById(fn.id);
      return need ? { ...need, reason: fn.reason } : null;
    })
    .filter(Boolean) as (typeof needsData[0] & { reason: string })[];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-20 pattern-arch">
          <div className="container mx-auto px-4 relative">
            <Link 
              to="/giving" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Giving
            </Link>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-highlight text-sm font-medium mb-6">
                <Moon size={14} className="gold-icon" />
                <span className="text-accent-foreground">Ramadan 2026</span>
              </div>
              <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
                Ramadan Giving Mode
              </h1>
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Maximize your reward during the blessed month. Plan your Last 10 Nights giving, 
                track your impact, and support verified needs — all in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Giving Tracker */}
        <section className="py-10 border-b border-border section-cream">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-4 gap-5">
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <p className="text-2xl font-serif font-bold text-primary">${tracker.totalDonated}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Donated</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <p className="text-2xl font-serif font-bold text-foreground">
                  {tracker.nightsCompleted}/{tracker.totalNights}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Nights Completed</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <p className="text-2xl font-serif font-bold text-accent">
                  {Math.round((tracker.nightsCompleted / tracker.totalNights) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Plan Progress</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tracker.impactSummary}
                </p>
              </div>
            </div>
            {/* Daily Reminder */}
            <div className="mt-5 bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{tracker.dailyReminder}</p>
            </div>
          </div>
        </section>

        {/* Last 10 Nights Planner */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-accent" />
                <h2 className="heading-section text-2xl text-foreground">
                  Last 10 Nights Planner
                </h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Schedule your giving for Nights 21–30. Automatically increase on Laylatul Qadr (Night 27).
              </p>

              {/* Amount selector */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Nightly amount:</span>
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setNightlyAmount(amt)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      nightlyAmount === amt
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Night cards */}
              <div className="grid sm:grid-cols-2 gap-3">
                {nightPlan.map((night) => (
                  <div
                    key={night.night}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      night.allocated
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border",
                      night.night === 27 && "ring-2 ring-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {night.allocated ? (
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Night {night.night}
                          {night.night === 27 && (
                            <span className="ml-2 text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                              Laylatul Qadr
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{night.date}</p>
                      </div>
                    </div>
                    <p className={cn(
                      "font-serif font-semibold",
                      night.night === 27 ? "text-accent text-lg" : "text-foreground"
                    )}>
                      ${night.amount}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-5 bg-secondary rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Last 10 Nights</p>
                  <p className="text-2xl font-serif font-bold text-primary">
                    ${nightPlan.reduce((sum, n) => sum + n.amount, 0)}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/checkout", {
                    state: {
                      campaignName: "Ramadan Last 10 Nights",
                      givingType: "sadaqah",
                      amount: nightlyAmount,
                      campaignId: null,
                    },
                  })}
                >
                  <Heart className="w-4 h-4" />
                  Activate Plan
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Ramadan Needs */}
        <section className="section-spacing-sm section-warm">
          <div className="container mx-auto px-4">
            <h2 className="heading-section text-2xl text-foreground mb-2">
              Ramadan Featured Needs
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Curated verified causes where your Ramadan giving makes the most impact.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredNeeds.map((need) => (
                <div key={need.id}>
                  <NeedCard
                    id={need.id}
                    title={need.title}
                    organization={need.organization}
                    isVerified={need.isVerified}
                    category={need.category}
                    location={need.location}
                    raised={need.raised}
                    goal={need.goal}
                    lastUpdated={need.lastUpdated}
                    onView={(id) => navigate(`/need/${id}`)}
                    onDonate={(id) => navigate(`/need/${id}#donate`)}
                  />
                  <p className="text-xs text-muted-foreground mt-2 px-1 italic">
                    {need.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
