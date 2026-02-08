import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { VerificationBadge } from "@/components/VerificationBadge";
import { AnimatedDonateButton } from "@/components/AnimatedDonateButton";
import { ProofPack } from "@/components/verification/ProofPack";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle, 
  Award,
  Share2,
  Globe,
  Info
} from "lucide-react";
import { realMapItems, MapItem, categoryColors } from "@/data/mapData";
import { orgChecklist, orgEvidenceIds } from "@/data/verificationRules";
import { cn } from "@/lib/utils";

// External URLs for known organizations
const organizationUrls: Record<string, string> = {
  "Islamic Relief Canada": "https://islamicreliefcanada.org",
  "Human Concern International": "https://humanconcern.org",
  "Penny Appeal Canada": "https://pennyappeal.ca",
  "Islamic Society of North America": "https://isna.ca",
  "National Zakat Foundation Canada": "https://nzfcanada.com",
  "Muslim Welfare Centre of Toronto": "https://muslimwelfarecentre.com",
  "Muslim Welfare Centre": "https://muslimwelfarecentre.com",
  "Muslim Association of Canada": "https://macnet.ca",
};

// Donation amount presets
const donationAmounts = [25, 50, 100, 250, 500, 1000];

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Find the charity by ID from the real items
  const charity = realMapItems.find(item => item.id === id);
  
  // Get external URL for the organization
  const externalUrl = charity?.orgName ? organizationUrls[charity.orgName] : undefined;
  
  // Scroll to donate section if hash present
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
  
  if (!charity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
              Charity Not Found
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This charity page doesn't exist or may have been removed. 
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
  
  const categoryStyle = categoryColors[charity.category];
  const hasProgress = charity.goal && charity.fundingRaised !== undefined;
  const progressPercent = hasProgress 
    ? Math.min((charity.fundingRaised! / charity.goal!) * 100, 100) 
    : 0;

  // Determine if this is a Palestine-related charity
  const isPalestineRelief = charity.locationLabel.includes("Palestine") || 
    charity.id.startsWith("ps-gl-") || 
    charity.id.startsWith("gl-ps-");
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Two-Column Layout */}
        <div className="bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            {/* Back Button */}
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </button>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Category & Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full"
                    style={{ 
                      backgroundColor: categoryStyle.bg, 
                      color: categoryStyle.text 
                    }}
                  >
                    {charity.category}
                  </span>
                  
                  {charity.verifiedStatus === "verified" && (
                    <VerificationBadge status="verified" />
                  )}
                  
                  {charity.zakatEligible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent-foreground">
                      Zakat Eligible
                    </span>
                  )}
                  
                  {charity.endorsedBy && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-accent-light text-accent-foreground">
                      <Award className="w-3 h-3" />
                      {charity.endorsedBy}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {charity.title}
                </h1>
                
                {/* Organization */}
                {charity.orgName && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-muted-foreground">by</span>
                    {externalUrl ? (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-lg font-medium text-primary hover:underline"
                      >
                        {charity.orgName}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-lg font-medium text-foreground">
                        {charity.orgName}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Location & Updated */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {charity.privacyLevel === "local_private" 
                      ? charity.locationLabel.split(",")[0] + " Area"
                      : charity.locationLabel
                    }
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Updated {charity.lastUpdated}
                  </span>
                </div>

                {/* Palestine Relief Notice */}
                {isPalestineRelief && (
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Canadian Organization Supporting Palestine Relief</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This campaign is organized by a registered Canadian charity providing humanitarian aid to communities in {charity.locationLabel.split(",")[0]}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Description */}
                {charity.description && (
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-foreground/80 text-lg leading-relaxed">
                      {charity.description}
                    </p>
                  </div>
                )}

                {/* Progress Bar - Full Width on Left Column */}
                {hasProgress && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-2xl font-bold text-foreground">
                        ${charity.fundingRaised!.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        raised of ${charity.goal!.toLocaleString()} goal
                      </span>
                    </div>
                    <ProgressBar 
                      current={charity.fundingRaised!} 
                      goal={charity.goal!} 
                      size="md"
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                      {Math.round(progressPercent)}% of goal reached
                    </p>
                  </div>
                )}

                {/* About Section */}
                <div className="space-y-6 pt-4">
                  {/* About the Campaign */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                      About This Campaign
                    </h3>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        This {charity.category.toLowerCase()} initiative is organized by {charity.orgName || "a verified community organization"} to serve communities in the {charity.locationLabel} area.
                      </p>
                      {charity.zakatEligible && (
                        <p>
                          This campaign has been verified as Zakat-eligible, meaning your Zakat contributions will be directed to those who meet the criteria as defined by Islamic jurisprudence.
                        </p>
                      )}
                      <p>
                        All donations are processed securely through the Maddad platform. Tax receipts are issued by the partner charity organization.
                      </p>
                    </div>
                  </div>

                  {/* About the Organization */}
                  {charity.orgName && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                        About {charity.orgName}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {charity.orgName} is a verified partner on the Maddad platform, 
                        working to support communities in need through transparent, 
                        accountable giving programs.
                      </p>
                      {externalUrl && (
                        <a
                          href={externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          Learn more on their website
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Organization Proof & Verification */}
                  {charity.verifiedStatus === "verified" && (
                    <ProofPack
                      evidenceIds={orgEvidenceIds}
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
              
              {/* Right Column - Sticky Donation Panel (1/3 width) */}
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  
                  {/* Zakat Eligibility Notice */}
                  {charity.zakatEligible && (
                    <div className="bg-primary/5 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Zakat Eligible</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This cause qualifies for Zakat funds.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Primary CTA - Donate on Maddad */}
                  <AnimatedDonateButton 
                    className="w-full py-6 text-base mb-3" 
                    size="lg"
                    variant="default"
                    disabled={currentAmount <= 0}
                    label={currentAmount > 0 
                      ? `Donate $${currentAmount.toLocaleString()} on Maddad`
                      : "Select an Amount"
                    }
                    showToast={false}
                    navigateAfter={false}
                    onComplete={() => {
                      if (!charity || currentAmount <= 0) return;
                      const receipt = createReceipt({
                        amount: currentAmount,
                        campaignId: charity.id,
                        campaignTitle: charity.title,
                        organizationName: charity.orgName || "Maddad Partner",
                        donationType: charity.zakatEligible ? "zakat" : "sadaqah",
                        frequency: "one-time",
                        isAnonymous: false,
                        hideAmount: false,
                      });
                      setLastReceipt(receipt);
                      setShowConfirmDialog(true);
                    }}
                  />
                  
                  {/* Secondary CTA - Visit Website */}
                  {externalUrl && (
                    <a
                      href={externalUrl}
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
                  
                  <Button 
                    variant="ghost" 
                    className="w-full mt-2"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Secure payment powered by Stripe. Tax receipt available.
                  </p>
                  
                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">Trust & Verification</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {charity.verifiedStatus === "verified" && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Identity verified by Maddad
                        </li>
                      )}
                      {charity.zakatEligible && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Zakat-eligible verified
                        </li>
                      )}
                      {charity.endorsedBy && (
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-accent-foreground" />
                          {charity.endorsedBy}
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last verified {charity.lastUpdated}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Section */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                Location
              </h3>
              <p className="text-muted-foreground mb-4">
                This {charity.category.toLowerCase()} initiative serves the 
                {" "}{charity.locationLabel} area.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/explore`)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Donation Confirmation Dialog */}
      <DonationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        receipt={lastReceipt}
        trackingPath={`/charity/${id}`}
      />
    </div>
  );
}
