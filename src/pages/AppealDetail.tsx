import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { DetailPageSkeleton } from "@/components/skeletons/CardSkeleton";
import { VerificationBadge } from "@/components/VerificationBadge";
import { ProofPack } from "@/components/verification/ProofPack";
import { ImpactTimeline } from "@/components/verification/ImpactTimeline";
import { UpdatesSubscriptionDialog } from "@/components/verification/UpdatesSubscriptionDialog";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { useAppeal } from "@/hooks/queries/useAppeals";
import { useEvidence } from "@/hooks/queries/useEvidence";
import { categoryLabels } from "@/data/appealsData";
import { appealChecklists, appealTimelines, appealEvidenceIds } from "@/data/verificationRules";
import { computeVerificationLevel } from "@/types/verification";
import { Loader2 } from "lucide-react";
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
  const { data: appeal, isLoading } = useAppeal(id);
  const { data: evidenceItems } = useEvidence({ campaignId: id });
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

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
  const checkoutUrl = `/checkout?campaignId=${encodeURIComponent(appeal.id)}&campaignName=${encodeURIComponent(appeal.title)}&givingType=${appeal.zakatEligible ? "zakat" : "sadaqah"}&amount=50`;

  // Verification data for this appeal
  const checklist = appealChecklists[appeal.id];
  const milestones = appealTimelines[appeal.id] || [];
  // Use live evidence items from useEvidence; fall back to the static ID list for
  // the checklist count when live data hasn't loaded yet.
  const evidenceIds = appealEvidenceIds[appeal.id] || [];
  const approvedCount = evidenceItems.filter(e => e.status === 'approved').length;
  const verificationLevel = checklist
    ? computeVerificationLevel(checklist, evidenceItems.length || evidenceIds.length)
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
                    evidence={evidenceItems.length > 0 ? evidenceItems : undefined}
                    checklist={checklist}
                  />
                )}

                {/* Impact Timeline */}
                {milestones.length > 0 && (
                  <ImpactTimeline
                    milestones={milestones}
                    trackingId={trackingId}
                    approvedEvidenceCount={approvedCount}
                    totalEvidenceCount={evidenceItems.length}
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

              {/* Right Column - Donate CTA */}
              <div className="lg:col-span-1">
                <div id="donate" className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Support This Appeal
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    100% of your donation goes directly to {appeal.title}.
                  </p>
                  {appeal.zakatEligible && (
                    <div className="bg-primary-light rounded-lg p-3 mb-5 flex items-center gap-2">
                      <CheckCircle size={16} className="text-primary shrink-0" />
                      <p className="text-sm font-medium text-foreground">Zakat Eligible</p>
                    </div>
                  )}
                  <Button asChild className="w-full py-6 text-base">
                    <Link to={checkoutUrl}>
                      <Heart size={18} />
                      Donate Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

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
