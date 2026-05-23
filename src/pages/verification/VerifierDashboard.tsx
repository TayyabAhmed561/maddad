import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Building2,
  Users,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubmissionsQueue } from "@/hooks/queries/useAdmin";
import { updateSubmissionStatus } from "@/lib/queries/admin";
import type { SubmissionRow } from "@/lib/queries/verification";
import type { VerificationStatus } from "@/lib/supabase";

function StatusBadge({ status }: { status: VerificationStatus | string }) {
  const map: Record<string, { label: string; className: string }> = {
    approved:     { label: "Approved",     className: "bg-primary/10 text-primary" },
    rejected:     { label: "Rejected",     className: "bg-destructive/10 text-destructive" },
    under_review: { label: "Under Review", className: "bg-amber-500/10 text-amber-700" },
    submitted:    { label: "Submitted",    className: "bg-blue-500/10 text-blue-700" },
    draft:        { label: "Draft",        className: "bg-muted text-muted-foreground" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function VerifierDashboard() {
  const navigate = useNavigate();
  const { user, role, isLoading: authLoading } = useAuth();

  const { data: queue, isLoading, refetch } = useSubmissionsQueue();
  const [reviewNotes, setReviewNotes]       = useState<Record<string, string>>({});
  const [actioning, setActioning]           = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "verifier" && role !== "platform_admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/5">
            <div className="container mx-auto px-4 max-w-3xl text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                How to get on Maddad
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Every campaign on Maddad is reviewed and verified before donors can give. Choose the path that fits your need.
              </p>
            </div>
          </section>

          <section className="py-16 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Card 1 */}
                <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Building2 size={22} className="text-primary" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit mb-3">
                    Full verification
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Organizations & Masjids
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Registered charities, masjids, MSAs, and community organizations can apply to host campaigns with 0% platform fees and CRA-compliant tax receipts.
                  </p>
                  <Link to="/apply" className="mt-5">
                    <Button className="w-full" size="sm">Apply to join</Button>
                  </Link>
                </div>

                {/* Card 2 */}
                <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Users size={22} className="text-primary" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit mb-3">
                    Masjid-endorsed
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Personal & Community Appeals
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Individuals or informal groups with a genuine need can submit an appeal. We require an endorsement from a local masjid or community leader before listing.
                  </p>
                  <Link to="/appeals/submit" className="mt-5">
                    <Button className="w-full" size="sm" variant="outline">Submit an appeal</Button>
                  </Link>
                </div>

                {/* Card 3 */}
                <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Star size={22} className="text-primary" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit mb-3">
                    Scholar-verified
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Zakat, Fidya & Qurbani
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Obligatory giving types follow strict scholarly guidelines. Campaigns eligible for Zakat are individually reviewed and tagged — donors can give with confidence.
                  </p>
                  <Link to="/giving" className="mt-5">
                    <Button className="w-full" size="sm" variant="outline">Explore giving types</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleAction(
    sub: SubmissionRow,
    decision: "under_review" | "approved" | "rejected",
  ) {
    setActioning(sub.id + decision);
    const notes = reviewNotes[sub.id] || null;
    await updateSubmissionStatus(
      { id: sub.id, organizationId: sub.organizationId, campaignId: sub.campaignId },
      decision,
      notes,
    );
    setActioning(null);
    refetch();
  }

  const pending    = queue.filter(s => s.status === "submitted");
  const inReview   = queue.filter(s => s.status === "under_review");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate("/verification")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Verification Hub
          </button>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
              Verifier Dashboard
            </h1>
            <p className="text-muted-foreground">
              Review and approve pending verification submissions.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{pending.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting Review</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{inReview.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Under Review</p>
            </div>
          </div>

          {/* Queue */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle size={40} className="mx-auto mb-4 text-primary/40" />
              <p>No pending submissions. All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map(sub => (
                <div key={sub.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                          {sub.submissionType}
                        </span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <h3 className="font-medium text-foreground">
                        {sub.organizationName ?? sub.campaignTitle ?? sub.id}
                      </h3>
                      {sub.submittedAt && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {sub.submitterNotes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-3">
                      {sub.submitterNotes}
                    </p>
                  )}

                  <div className="space-y-3">
                    <Textarea
                      placeholder="Review notes (optional)..."
                      value={reviewNotes[sub.id] || ""}
                      onChange={e =>
                        setReviewNotes(prev => ({ ...prev, [sub.id]: e.target.value }))
                      }
                      className="text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {sub.status === "submitted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(sub, "under_review")}
                          disabled={!!actioning}
                        >
                          {actioning === sub.id + "under_review" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Clock size={14} />
                          )}
                          Start Review
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleAction(sub, "approved")}
                        disabled={!!actioning}
                        className="flex-1 sm:flex-none"
                      >
                        {actioning === sub.id + "approved" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(sub, "rejected")}
                        disabled={!!actioning}
                        className="flex-1 sm:flex-none"
                      >
                        {actioning === sub.id + "rejected" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
