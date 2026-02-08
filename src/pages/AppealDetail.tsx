import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { DetailPageSkeleton } from "@/components/skeletons/CardSkeleton";
import { VerificationBadge } from "@/components/VerificationBadge";
import { ProofPack } from "@/components/verification/ProofPack";
import { ImpactTimeline } from "@/components/verification/ImpactTimeline";
import { UpdatesSubscriptionDialog } from "@/components/verification/UpdatesSubscriptionDialog";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { useDonation, getEffectiveAmount } from "@/hooks/useDonation";
import { getAppealById, categoryLabels } from "@/data/appealsData";
import { allocationRules } from "@/data/givingData";
import { appealChecklists, appealTimelines, appealEvidenceIds } from "@/data/verificationRules";
import { computeVerificationLevel } from "@/types/verification";
import { getPublicEvidenceByIds } from "@/data/evidenceData";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Building2, 
  Shield, 
  CheckCircle,
  Heart,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  useScrollToHash();
  const appeal = id ? getAppealById(id) : undefined;
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  
  const effectiveAmountRef = { current: 0 };

  const [donationState, donationActions] = useDonation({
    defaultAmount: 50,
    defaultAnonymous: true,
    onSuccess: (data) => {
      if (!appeal) return;
      const receipt = createReceipt({
        amount: data.amount,
        campaignId: appeal.id,
        campaignTitle: appeal.title,
        organizationName: appeal.endorsedBy.name,
        donationType: appeal.zakatEligible ? "zakat" : "sadaqah",
        frequency: data.frequency,
        isAnonymous: data.anonymous,
        hideAmount: data.hideAmount,
        duaIntention: data.duaIntention,
      });
      setLastReceipt(receipt);
      setShowConfirmDialog(true);
    }
  });

  // Show 404 if appeal not found
  if (!appeal) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle size={64} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Appeal Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The community appeal you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/appeals")}>
              <ArrowLeft size={16} />
              Back to Appeals
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryStyle = categoryLabels[appeal.category];
  const presetAmounts = [25, 50, 100, 250, 500];
  const effectiveAmount = getEffectiveAmount(donationState);

  // Verification data for this appeal
  const checklist = appealChecklists[appeal.id];
  const milestones = appealTimelines[appeal.id] || [];
  const evidenceIds = appealEvidenceIds[appeal.id] || [];
  const publicEvidence = getPublicEvidenceByIds(evidenceIds);
  const approvedCount = publicEvidence.filter((e) => e.status === "approved").length;
  const verificationLevel = checklist
    ? computeVerificationLevel(checklist, evidenceIds.length)
    : "pending";
  const trackingId = `MDD-${appeal.category.toUpperCase().slice(0, 4)}-2026-${appeal.id.padStart(4, "0")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-warm py-12 md:py-16 pattern-subtle">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Link 
              to="/appeals" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Community Appeals
            </Link>

            {/* Title & Badges */}
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-tight">
              {appeal.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={cn("inline-flex px-3 py-1.5 rounded-full text-xs font-medium border", categoryStyle.color)}>
                {categoryStyle.label}
              </span>
              <div className="endorsement-badge">
                {appeal.endorsedBy.type === "masjid" ? (
                  <Building2 size={14} className="gold-icon" />
                ) : (
                  <Shield size={14} className="gold-icon" />
                )}
                <span>Endorsed by {appeal.endorsedBy.name}</span>
              </div>
              {appeal.zakatEligible && (
                <span className="badge-verified">
                  <CheckCircle size={14} />
                  Zakat Eligible
                </span>
              )}
              <VerificationBadge status={verificationLevel === "enhanced" ? "verified" : verificationLevel} />
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{appeal.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{appeal.lastUpdated}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="max-w-md">
              <ProgressBar current={appeal.raised} goal={appeal.goal} showLabels className="mb-2" />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-10">
                {/* About */}
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                    About This Appeal
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {appeal.description}
                  </p>
                  
                  {/* Coverage Items */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-medium text-foreground mb-4">What Your Support Covers</h3>
                    <ul className="space-y-3">
                      {appeal.coverageItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Updates Timeline */}
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    Updates
                  </h2>
                  <div className="space-y-4">
                    {appeal.updates.map((update) => (
                      <div 
                        key={update.id}
                        className="bg-card rounded-xl border border-border p-5"
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock size={14} />
                          <span>{update.date}</span>
                          <span className="text-border">•</span>
                          <span>{update.author}</span>
                        </div>
                        <p className="text-foreground">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ProofPack - Evidence & Verification */}
                {checklist && (
                  <ProofPack
                    evidenceIds={evidenceIds}
                    checklist={checklist}
                  />
                )}

                {/* Impact Timeline */}
                {milestones.length > 0 && (
                  <ImpactTimeline
                    milestones={milestones}
                    trackingId={trackingId}
                    approvedEvidenceCount={approvedCount}
                    totalEvidenceCount={publicEvidence.length}
                    nextUpdateDue="2026-02-10"
                    onSubscribeUpdates={() => setShowSubscribeDialog(true)}
                  />
                )}

                {/* Verification & Transparency (legacy) */}
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    Verification & Transparency
                  </h2>
                  
                  {/* Verification Checks */}
                  <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h3 className="font-medium text-foreground mb-4">Verification Status</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {appeal.verificationChecks.map((check, index) => (
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

                  {/* Transparency Log */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText size={18} className="text-primary" />
                      <h3 className="font-medium text-foreground">Fund Transparency Log</h3>
                    </div>
                    <div className="space-y-3">
                      {appeal.transparencyLog.map((entry) => (
                        <div 
                          key={entry.id}
                          className="flex items-start gap-3 text-sm"
                        >
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
              </div>

              {/* Right Column - Donate Section */}
              <div className="lg:col-span-1">
                <div 
                  id="donate" 
                  className="bg-card rounded-xl border border-border p-6 sticky top-24"
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
                        Your support of ${effectiveAmount.toLocaleString()} has been processed.
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
                          Make Another Contribution
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Donation Form */
                    <>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                        Support This Appeal
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
                      {appeal.zakatEligible && (
                        <div className="bg-primary-light rounded-lg p-4 mb-6">
                          <div className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Zakat Eligible</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                This appeal qualifies for Zakat funds as verified by {appeal.endorsedBy.name}.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Allocation Breakdown */}
                      <AllocationBreakdown
                        items={allocationRules["general"]}
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
                            Support with ${effectiveAmount.toLocaleString()}
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
          </div>
        </section>
      </main>

      <Footer />

      {/* Donation Confirmation Dialog */}
      <DonationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        receipt={lastReceipt}
        trackingPath={`/appeals/${appeal.id}`}
      />

      {/* Updates Subscription Dialog */}
      <UpdatesSubscriptionDialog
        open={showSubscribeDialog}
        onOpenChange={setShowSubscribeDialog}
        campaignId={appeal.id}
        campaignTitle={appeal.title}
      />
    </div>
  );
}
