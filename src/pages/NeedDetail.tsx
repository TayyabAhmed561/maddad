import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CategoryTag } from "@/components/CategoryTag";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { GivingProofSection } from "@/components/giving/GivingProofSection";
import { CampaignUpdates } from "@/components/CampaignUpdates";
import { TransparencyScore } from "@/components/TransparencyScore";
import { UrgencyIndicator } from "@/components/map/UrgencyIndicator";
import { useCampaign } from "@/hooks/queries/useCampaigns";
import { useEvidence } from "@/hooks/queries/useEvidence";
import { allocationRules } from "@/data/givingData";
import type { UrgencyLevel } from "@/types/platform";
import {
  MapPin, CheckCircle, Clock, FileText, ArrowLeft, Calendar, Heart, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const needCampaignMap: Record<string, string> = {
  "kw-17": "msa-iftaar",
};

function toUrgencyLevel(n: number | undefined): UrgencyLevel | undefined {
  if (n === undefined) return undefined
  return n >= 8 ? 'critical' : n >= 5 ? 'medium' : 'low'
}

export default function NeedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: need, isLoading } = useCampaign(id);
  const { data: evidenceItems } = useEvidence({ campaignId: id });

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

  if (!need) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle size={64} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">Need Not Found</h1>
            <p className="text-muted-foreground mb-6">The need you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/explore")}><ArrowLeft size={16} />Back to Explore</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const urgency = toUrgencyLevel(need.urgency);
  const checkoutUrl = `/checkout?campaignId=${encodeURIComponent(need.id)}&campaignName=${encodeURIComponent(need.title)}&givingType=${need.zakatEligible ? "zakat" : "sadaqah"}&amount=50`;

  // Verification checklist: prefer live evidence items, fall back to need.verificationChecks
  const verificationChecks = evidenceItems.length > 0
    ? evidenceItems.map(e => ({
        label: e.title,
        verified: e.status === 'approved',
        verifier: e.verifierDisplayName,
      }))
    : need.verificationChecks

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-card border-b border-border pattern-subtle">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8">
              <ArrowLeft size={16} />Back to Explore
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <CategoryTag category={need.category} />
                  {need.isVerified && <VerificationBadge status="verified" />}
                  {need.zakatEligible && (
                    <span className="badge-verified"><CheckCircle size={14} />Zakat Eligible</span>
                  )}
                  {urgency && <UrgencyIndicator level={urgency} size="md" />}
                </div>

                <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">{need.title}</h1>
                <p className="text-lg text-muted-foreground mb-5">
                  by <span className="text-foreground font-medium">{need.organization}</span>
                </p>

                <div className="flex flex-wrap gap-5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} /><span>{need.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} /><span>Updated {need.lastUpdated}</span>
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
            {/* Left Column */}
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="heading-section text-xl text-foreground mb-5">Why this need matters</h2>
                <p className="text-muted-foreground text-body">{need.description}</p>
              </div>

              <div className="divider-subtle" />

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

              {/* Campaign Updates */}
              {need.updates.length > 0 && (
                <>
                  <CampaignUpdates updates={need.updates} />
                  <div className="divider-subtle" />
                </>
              )}

              {/* Updates Timeline */}
              {need.updates.length > 0 && (
                <div>
                  <h2 className="heading-section text-xl text-foreground mb-6">Updates</h2>
                  <div className="space-y-8">
                    {need.updates.map((update) => (
                      <div key={update.id} className="relative pl-7 border-l-2 border-border pb-8 last:pb-0">
                        <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-primary shadow-soft" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar size={14} /><span>{update.date}</span>
                          <span className="text-border">•</span><span>{update.author}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transparency Section */}
              <div className="bg-card rounded-xl border border-border p-8 shadow-card">
                <h2 className="heading-section text-xl text-foreground mb-8">Transparency & Verification</h2>

                <TransparencyScore
                  evidenceComplete={need.isVerified ? 85 : 45}
                  milestonesUpdated={need.updates.length >= 3 ? 90 : 60}
                  financialClarity={need.transparencyLog.length >= 3 ? 88 : 65}
                  size="sm"
                  className="mb-6"
                />

                <div className="mb-8">
                  <h3 className="font-semibold text-foreground mb-4">Verification Checklist</h3>
                  {verificationChecks.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {verificationChecks.map((check, index) => (
                        <div key={index} className={cn("flex items-center gap-3 p-3 rounded-lg", check.verified ? "bg-primary-light" : "bg-muted")}>
                          {check.verified ? (
                            <CheckCircle size={16} className="text-primary shrink-0" />
                          ) : (
                            <Clock size={16} className="text-muted-foreground shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{check.label}</p>
                            {check.verifier && <p className="text-xs text-muted-foreground truncate">{check.verifier}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No verification checks recorded yet.</p>
                  )}
                </div>

                <div className="divider-subtle mb-8" />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-primary" />
                    <h3 className="font-semibold text-foreground">Fund Release Log</h3>
                  </div>
                  {need.transparencyLog.length > 0 ? (
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
                  ) : (
                    <p className="text-sm text-muted-foreground">No fund releases recorded yet.</p>
                  )}
                </div>
              </div>

              {/* After You Give */}
              {id && needCampaignMap[id] && (
                <div className="space-y-8">
                  <div className="divider-subtle" />
                  {allocationRules[needCampaignMap[id]] && (
                    <div>
                      <h2 className="heading-section text-xl text-foreground mb-5">Expense Breakdown</h2>
                      <AllocationBreakdown items={allocationRules[needCampaignMap[id]]} />
                    </div>
                  )}
                  <div className="divider-subtle" />
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Impact Summary</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Funds supported community iftaar meals for local students and families.
                      This demo shows how Maddad helps local organizations promote their initiatives
                      with full transparency and tracked impact.
                    </p>
                  </div>
                  <GivingProofSection givingCategory={needCampaignMap[id]} />
                </div>
              )}
            </div>

            {/* Right Column - Donate CTA */}
            <div className="lg:w-96">
              <div id="donate" className="bg-card rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Support This Need</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  100% of your donation goes directly to {need.title}.
                </p>
                {need.zakatEligible && (
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
