import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppealCard } from "@/components/AppealCard";
import { AppealCardSkeleton } from "@/components/skeletons/CardSkeleton";
import { Button } from "@/components/ui/button";
import { categoryLabels } from "@/data/appealsData";
import { useAppeals } from "@/hooks/queries/useAppeals";
import type { CampaignCategory } from "@/lib/supabase";
import {
  Shield,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  Heart,
  FileText,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Appeals() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const { data: appeals, isLoading } = useAppeals();

  const filteredAppeals = filter === "all"
    ? appeals
    : appeals.filter(appeal => appeal.category === filter);

  const handleView = (id: string) => {
    navigate(`/appeals/${id}`);
  };

  const handleSupport = (id: string) => {
    navigate(`/appeals/${id}#donate`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-warm py-16 md:py-20 pattern-subtle">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
                Community Appeals
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Support members of our community facing urgent hardships. Every appeal is endorsed by a verified masjid or trusted organization to ensure legitimacy and accountability.
              </p>

              <div className="endorsement-badge inline-flex">
                <Shield size={16} className="gold-icon" />
                <span>All appeals require masjid or organization endorsement</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Notice */}
        <section className="py-8 border-b border-border">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <CheckCircle size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Verified Appeals Only</h3>
                    <p className="text-sm text-muted-foreground">
                      Every appeal is reviewed and endorsed by a trusted community institution.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:ml-auto">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 size={16} className="gold-icon" />
                    <span>{appeals.filter(a => a.endorsedBy.type === "masjid").length} Masjid Endorsed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield size={16} className="gold-icon" />
                    <span>{appeals.filter(a => a.endorsedBy.type === "organization").length} Org Endorsed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-6 border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                )}
              >
                All Appeals
              </button>
              {(Object.entries(categoryLabels) as [CampaignCategory, { label: string; color: string }][]).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    filter === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  )}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Appeals Grid */}
        <section className="py-12 md:py-16">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <AppealCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredAppeals.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredAppeals.map((appeal, index) => (
                  <div
                    key={appeal.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AppealCard
                      {...appeal}
                      onView={handleView}
                      onSupport={handleSupport}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <AlertTriangle size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No appeals found
                </h3>
                <p className="text-muted-foreground mb-6">
                  There are no appeals in this category at the moment.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilter("all")}
                >
                  View All Appeals
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* How it Works */}
        <section className="section-cream py-16 md:py-20">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-10 text-center">
              How Community Appeals Work
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                  <FileText size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">1. Submit Request</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Community members facing hardship submit their appeal with supporting documentation.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                  <Building2 size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">2. Masjid Verification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A local masjid or trusted organization reviews and endorses the appeal after verification.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                  <Heart size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3">3. Community Support</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The community rallies to support their fellow Muslims with transparent fund tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section className="py-16 md:py-20">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">
                Appeal Guidelines
              </h2>

              <div className="bg-card rounded-xl border border-border p-8">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Masjid or Organization Endorsement Required</p>
                      <p className="text-sm text-muted-foreground mt-1">All appeals must be verified by a recognized community institution.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Eligible Categories Only</p>
                      <p className="text-sm text-muted-foreground mt-1">Medical emergencies, disaster relief, education, and housing assistance.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Transparent Fund Usage</p>
                      <p className="text-sm text-muted-foreground mt-1">All fund releases are logged and visible to donors.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Zakat Eligibility Verified</p>
                      <p className="text-sm text-muted-foreground mt-1">Appeals marked as Zakat-eligible are reviewed according to Islamic guidelines.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-warm py-16 md:py-20 border-t border-border">
          <div className="container max-w-6xl mx-auto px-4 md:px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Want to Submit an Appeal?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              If you or someone you know is facing hardship, reach out to your local masjid to begin the verification process.
            </p>
            <Link to="/verification">
              <Button size="lg">
                Learn About Verification
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
