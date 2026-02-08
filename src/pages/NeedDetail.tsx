import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CategoryTag } from "@/components/CategoryTag";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { GivingProofSection } from "@/components/giving/GivingProofSection";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { useDonation, getEffectiveAmount } from "@/hooks/useDonation";
import { getNeedById } from "@/data/needsData";
import { allocationRules } from "@/data/givingData";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  FileText,
  ArrowLeft,
  Calendar,
  Heart,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map need IDs to giving campaign keys for After You Give integration
const needCampaignMap: Record<string, string> = {
  "kw-17": "ibtikar-iftaar",
};

export default function NeedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const need = id ? getNeedById(id) : undefined;
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [donationState, donationActions] = useDonation({
    defaultAmount: 50,
    defaultAnonymous: true,
    onSuccess: (data) => {
      if (!need) return;
      const receipt = createReceipt({
        amount: data.amount,
        needId: id,
        campaignTitle: need.title,
        organizationName: need.organization,
        donationType: need.zakatEligible ? "zakat" : "sadaqah",
        frequency: data.frequency,
        isAnonymous: data.anonymous,
        hideAmount: data.hideAmount,
        duaIntention: data.duaIntention,
      });
      setLastReceipt(receipt);
      setShowConfirmDialog(true);
    }
  });

  // Show 404 if need not found
  if (!need) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle size={64} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Need Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The need you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/explore")}>
              <ArrowLeft size={16} />
              Back to Explore
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const presetAmounts = [25, 50, 100, 250, 500];
  const effectiveAmount = getEffectiveAmount(donationState);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-card border-b border-border pattern-subtle">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <Link 
              to="/explore" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8"
            >
              <ArrowLeft size={16} />
              Back to Explore
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <CategoryTag category={need.category} />
                  {need.isVerified && <VerificationBadge status="verified" />}
                  {need.zakatEligible && (
                    <span className="badge-verified">
                      <CheckCircle size={14} />
                      Zakat Eligible
                    </span>
                  )}
                </div>
                
                <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                  {need.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-5">
                  by <span className="text-foreground font-medium">{need.organization}</span>
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} />
                    <span>{need.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} />
                    <span>Updated {need.lastUpdated}</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-80">
                <ProgressBar current={need.raised} goal={need.goal} showLabels />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column - Details */}
            <div className="flex-1 space-y-12">
              {/* Why This Matters */}
              <div>
                <h2 className="heading-section text-xl text-foreground mb-5">Why this need matters</h2>
                <p className="text-muted-foreground text-body">
                  {need.description}
                </p>
              </div>

              <div className="divider-subtle" />

              {/* What Your Donation Covers */}
              <div>
                <h2 className="heading-section text-xl text-foreground mb-5">What your donation covers</h2>
                <ul className="space-y-4">
                  {need.coverageItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="divider-subtle" />

              {/* Updates Timeline */}
              <div>
                <h2 className="heading-section text-xl text-foreground mb-6">Updates</h2>
                <div className="space-y-8">
                  {need.updates.map((update) => (
                    <div key={update.id} className="relative pl-7 border-l-2 border-border pb-8 last:pb-0">
                      <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-primary shadow-soft" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar size={14} />
                        <span>{update.date}</span>
                        <span className="text-border">•</span>
                        <span>{update.author}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transparency Section */}
              <div className="bg-card rounded-xl border border-border p-8 shadow-card">
                <h2 className="heading-section text-xl text-foreground mb-8">Transparency & Verification</h2>
                
                {/* Verification Checklist */}
                <div className="mb-8">
                  <h3 className="font-semibold text-foreground mb-4">Verification Checklist</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {need.verificationChecks.map((check, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg",
                          check.verified ? "bg-primary-light" : "bg-muted"
                        )}
                      >
                        {check.verified ? (
                          <CheckCircle size={16} className="text-primary shrink-0" />
                        ) : (
                          <Clock size={16} className="text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{check.label}</p>
                          {check.verifier && (
                            <p className="text-xs text-muted-foreground truncate">{check.verifier}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider-subtle mb-8" />

                {/* Fund Release Log */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-primary" />
                    <h3 className="font-semibold text-foreground">Fund Release Log</h3>
                  </div>
                  <div className="space-y-3">
                    {need.transparencyLog.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 text-sm">
                        <span className="text-muted-foreground shrink-0 w-16">{entry.date}</span>
                        <div className="flex-1">
                          <p className="text-foreground">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">{entry.verifier}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* After You Give – Proof & Impact Tracking */}
              {id && needCampaignMap[id] && (
                <div className="space-y-8">
                  <div className="divider-subtle" />

                  {/* Expense Breakdown */}
                  {allocationRules[needCampaignMap[id]] && (
                    <div>
                      <h2 className="heading-section text-xl text-foreground mb-5">Expense Breakdown</h2>
                      <AllocationBreakdown
                        items={allocationRules[needCampaignMap[id]]}
                      />
                    </div>
                  )}

                  <div className="divider-subtle" />

                  {/* Impact Summary */}
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Impact Summary</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Funds supported community iftaar meals for local students and families.
                      This demo shows how Maddad helps local organizations promote their initiatives 
                      with full transparency and tracked impact.
                    </p>
                  </div>

                  {/* Proof & Timeline Section */}
                  <GivingProofSection
                    givingCategory={needCampaignMap[id]}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Donation Module (Sticky) */}
            <div className="lg:w-96">
              <div 
                id="donate"
                className="lg:sticky lg:top-24 bg-card rounded-xl border border-border p-6 shadow-card"
              >
                {donationState.isSuccess ? (
                  /* Success State */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Heart size={32} className="text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      JazakAllah Khair
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Your donation of ${effectiveAmount.toLocaleString()} has been processed.
                      {donationState.anonymous && " Your donation will remain anonymous."}
                    </p>
                    {lastReceipt && (
                      <p className="text-xs text-muted-foreground font-mono mb-6">
                        Receipt: {lastReceipt.receiptId}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        onClick={() => setShowConfirmDialog(true)}
                        className="w-full"
                      >
                        View Receipt & Track
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          donationActions.reset();
                          setLastReceipt(null);
                        }}
                        className="w-full"
                      >
                        Make Another Donation
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Donation Form */
                  <>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                      Support This Need
                    </h3>

                    {/* Preset Amounts */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {presetAmounts.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            donationActions.setAmount(preset);
                            donationActions.setCustomAmount("");
                          }}
                          className={cn(
                            "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                            donationState.amount === preset && !donationState.customAmount
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          )}
                        >
                          ${preset}
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
                          type="text"
                          value={donationState.customAmount}
                          onChange={(e) => donationActions.setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Recurring Toggle */}
                    <RecurringDonationToggle
                      value={donationState.frequency}
                      onChange={donationActions.setFrequency}
                      className="mb-6"
                    />

                    {/* Privacy Options */}
                    <AnonymousDonationToggle
                      anonymous={donationState.anonymous}
                      hideAmount={donationState.hideAmount}
                      onAnonymousChange={donationActions.setAnonymous}
                      onHideAmountChange={donationActions.setHideAmount}
                      className="mb-6"
                    />

                    {/* Zakat Eligibility Notice */}
                    {need.zakatEligible && (
                      <div className="bg-primary-light rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Zakat Eligible</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              This need qualifies for Zakat funds as verified by {need.organization}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Allocation Breakdown */}
                    <AllocationBreakdown
                      items={id && needCampaignMap[id] && allocationRules[needCampaignMap[id]] 
                        ? allocationRules[needCampaignMap[id]] 
                        : allocationRules["general"]}
                      className="mb-6"
                    />

                    {/* Dua Intention */}
                    <DuaIntentionField
                      value={donationState.duaIntention}
                      onChange={donationActions.setDuaIntention}
                      className="mb-6"
                    />

                    {/* Donate Button */}
                    <Button 
                      className="w-full py-6 text-base"
                      onClick={donationActions.processDonation}
                      disabled={donationState.isLoading || effectiveAmount <= 0}
                    >
                      {donationState.isLoading ? (
                        "Processing..."
                      ) : (
                        <>
                          <Heart size={18} />
                          Donate ${effectiveAmount.toLocaleString()}
                          {donationState.frequency !== "one-time" && `/${donationState.frequency.slice(0, 2)}`}
                        </>
                      )}
                    </Button>

                    {donationState.error && (
                      <p className="text-sm text-destructive mt-3 text-center">
                        {donationState.error}
                      </p>
                    )}
                  </>
                )}
              </div>
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
        trackingPath={id ? `/need/${id}` : undefined}
      />
    </div>
  );
}
