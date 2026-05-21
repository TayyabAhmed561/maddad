import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";
import { AnimatedDonateButton } from "@/components/AnimatedDonateButton";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { ProofPack } from "@/components/verification/ProofPack";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { useOrganization } from "@/hooks/queries/useOrganization";
import { useEvidence } from "@/hooks/queries/useEvidence";
import { orgChecklist } from "@/data/verificationRules";
import type { TrustScore } from "@/types/platform";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  CheckCircle,
  Award,
  Share2,
  Globe,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const donationAmounts = [25, 50, 100, 250, 500, 1000];

function toTrustScore(overall: number): TrustScore {
  return {
    overall,
    verificationLevel: overall,
    evidenceCompleteness: overall,
    projectCompletionRate: overall,
    financialClarity: overall,
  };
}

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: org, isLoading } = useOrganization(id);
  const { data: evidenceItems } = useEvidence({ orgId: id });

  useEffect(() => {
    if (location.hash === "#donate") {
      const donateSection = document.getElementById("donate-panel");
      if (donateSection) {
        donateSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const currentAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
              Organization Not Found
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This organization page doesn't exist or may have been removed.
              Explore other verified needs on the map.
            </p>
            <Button onClick={() => navigate("/explore")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const trustScore = org.trust_score != null ? toTrustScore(org.trust_score) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  {org.verification_status === "verified" && (
                    <VerificationBadge status="verified" />
                  )}
                  {org.ontario_charity_registration_number && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent-foreground">
                      <Award className="w-3 h-3" />
                      Registered Charity
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {org.display_name}
                </h1>

                {/* Legal name (when different) */}
                {org.legal_name !== org.display_name && (
                  <p className="text-sm text-muted-foreground">
                    Registered as: {org.legal_name}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {org.ontario_charity_registration_number && (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      CRA #{org.ontario_charity_registration_number}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Member since {new Date(org.created_at).getFullYear()}
                  </span>
                </div>

                {/* Description */}
                {org.description && (
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-foreground/80 text-lg leading-relaxed">
                      {org.description}
                    </p>
                  </div>
                )}

                {/* About Section */}
                <div className="space-y-6 pt-4">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                      About {org.display_name}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {org.description ||
                        `${org.display_name} is a verified partner on the Maddad platform, working to support communities in need through transparent, accountable giving programs.`}
                    </p>
                    {org.website_url && (
                      <a
                        href={org.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        Learn more on their website
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Trust Score */}
                  {trustScore && <TrustScoreBadge score={trustScore} />}

                  {/* Organization Proof & Verification */}
                  {org.verification_status === "verified" && (
                    <ProofPack
                      evidenceIds={[]}
                      evidence={evidenceItems.length > 0 ? evidenceItems : undefined}
                      checklist={orgChecklist}
                    />
                  )}

                  {/* Impact Section */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                      Your Impact
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">$25</p>
                        <p className="text-xs text-muted-foreground mt-1">Provides 5 meals</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">$100</p>
                        <p className="text-xs text-muted-foreground mt-1">Provides a week of support</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">$500</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports a family for a month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Sticky Donation Panel */}
              <div className="lg:col-span-1">
                <div
                  id="donate-panel"
                  className="bg-card rounded-2xl border border-border p-6 shadow-card lg:sticky lg:top-24 scroll-mt-24"
                >
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
                    Make a Donation
                  </h3>

                  {/* Amount Picker */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {donationAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={cn(
                          "py-3 px-4 rounded-lg text-sm font-medium transition-all border",
                          selectedAmount === amount
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-foreground hover:bg-muted/80 border-transparent"
                        )}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-6">
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <AnimatedDonateButton
                    className="w-full py-6 text-base mb-3"
                    size="lg"
                    variant="default"
                    disabled={currentAmount <= 0}
                    label={
                      currentAmount > 0
                        ? `Donate $${currentAmount.toLocaleString()} on Maddad`
                        : "Select an Amount"
                    }
                    showToast={false}
                    navigateAfter={false}
                    onComplete={() => {
                      if (!org || currentAmount <= 0) return;
                      const receipt = createReceipt({
                        amount: currentAmount,
                        campaignId: org.id,
                        campaignTitle: org.display_name,
                        organizationName: org.display_name,
                        donationType: "sadaqah",
                        frequency: "one-time",
                        isAnonymous: false,
                        hideAmount: false,
                      });
                      setLastReceipt(receipt);
                      setShowConfirmDialog(true);
                    }}
                  />

                  {org.website_url && (
                    <a
                      href={org.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full">
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    </a>
                  )}

                  <Button variant="ghost" className="w-full mt-2">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Secure payment powered by Stripe. Tax receipt available.
                  </p>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Trust & Verification
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {org.verification_status === "verified" && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Identity verified by Maddad
                        </li>
                      )}
                      {org.ontario_charity_registration_number && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Registered Canadian charity
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Member since {new Date(org.created_at).getFullYear()}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <DonationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        receipt={lastReceipt}
        trackingPath={`/charity/${id}`}
      />
    </div>
  );
}
