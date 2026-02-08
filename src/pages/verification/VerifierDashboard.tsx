import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { VerificationBadge } from "@/components/VerificationBadge";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useVerificationStore } from "@/hooks/useVerificationStore";
import { getVerifierMode } from "@/hooks/useVerificationStore";
import type { EvidenceItem } from "@/types/verification";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  if (status === "verified" || status === "approved") {
    return (
      <span className="badge-verified text-[10px]">
        <CheckCircle size={10} />
        {status === "verified" ? "Verified" : "Approved"}
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-destructive/10 text-destructive">
        <XCircle size={10} />
        Rejected
      </span>
    );
  }
  return (
    <span className="badge-pending text-[10px]">
      <AlertCircle size={10} />
      Pending
    </span>
  );
}

export default function VerifierDashboard() {
  const navigate = useNavigate();
  const store = useVerificationStore();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  if (!getVerifierMode()) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center px-4">
            <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-6">
              Enable Verifier Mode on the Verification Hub to access this dashboard.
            </p>
            <Button onClick={() => navigate("/verification")}>
              Go to Verification Hub
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApproveEvidence = (id: string) => {
    store.updateEvidence(id, { status: "approved" });

    // Check if all evidence for any org is now approved
    store.orgSubmissions.forEach((org) => {
      if (org.status !== "pending_verification") return;
      const orgEvidence = store.evidenceOverrides.filter((e) =>
        org.evidenceIds.includes(e.id)
      );
      const allApproved = orgEvidence.every(
        (e) => e.id === id || e.status === "approved"
      );
      if (allApproved && orgEvidence.length > 0) {
        store.updateOrg(org.id, {
          status: "verified",
          reviewNotes: reviewNotes[org.id] || "All evidence approved.",
        });
      }
    });

    // Same for campaigns
    store.campaignSubmissions.forEach((camp) => {
      if (camp.status !== "pending_verification") return;
      const campEvidence = store.evidenceOverrides.filter((e) =>
        camp.evidenceIds.includes(e.id)
      );
      const allApproved = campEvidence.every(
        (e) => e.id === id || e.status === "approved"
      );
      if (allApproved && campEvidence.length > 0) {
        store.updateCampaign(camp.id, {
          status: "verified",
          reviewNotes: reviewNotes[camp.id] || "All evidence approved.",
        });
      }
    });
  };

  const handleRejectEvidence = (id: string) => {
    const notes = reviewNotes[id] || "Evidence does not meet requirements.";
    store.updateEvidence(id, { status: "rejected" });

    // Mark parent as rejected too
    store.orgSubmissions.forEach((org) => {
      if (org.evidenceIds.includes(id)) {
        store.updateOrg(org.id, {
          status: "rejected",
          reviewNotes: notes,
        });
      }
    });
    store.campaignSubmissions.forEach((camp) => {
      if (camp.evidenceIds.includes(id)) {
        store.updateCampaign(camp.id, {
          status: "rejected",
          reviewNotes: notes,
        });
      }
    });
  };

  const handleApproveOrg = (orgId: string) => {
    const org = store.orgSubmissions.find((o) => o.id === orgId);
    if (!org) return;
    // Approve all pending evidence
    org.evidenceIds.forEach((eId) => {
      const ev = store.evidenceOverrides.find((e) => e.id === eId);
      if (ev && ev.status === "pending") {
        store.updateEvidence(eId, { status: "approved" });
      }
    });
    store.updateOrg(orgId, {
      status: "verified",
      reviewNotes: reviewNotes[orgId] || "Organization verified.",
    });
  };

  const handleRejectOrg = (orgId: string) => {
    store.updateOrg(orgId, {
      status: "rejected",
      reviewNotes: reviewNotes[orgId] || "Organization did not meet requirements.",
    });
  };

  const handleApproveCampaign = (campId: string) => {
    const camp = store.campaignSubmissions.find((c) => c.id === campId);
    if (!camp) return;
    camp.evidenceIds.forEach((eId) => {
      const ev = store.evidenceOverrides.find((e) => e.id === eId);
      if (ev && ev.status === "pending") {
        store.updateEvidence(eId, { status: "approved" });
      }
    });
    store.updateCampaign(campId, {
      status: "verified",
      reviewNotes: reviewNotes[campId] || "Campaign verified.",
    });
  };

  const handleRejectCampaign = (campId: string) => {
    store.updateCampaign(campId, {
      status: "rejected",
      reviewNotes: reviewNotes[campId] || "Campaign did not meet requirements.",
    });
  };

  const pendingOrgs = store.orgSubmissions.filter(
    (o) => o.status === "pending_verification"
  );
  const pendingCampaigns = store.campaignSubmissions.filter(
    (c) => c.status === "pending_verification"
  );
  const pendingEvidence = store.evidenceOverrides.filter(
    (e) => e.status === "pending"
  );

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
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{pendingOrgs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending Orgs</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{pendingCampaigns.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending Campaigns</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-2xl font-bold text-foreground">{pendingEvidence.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Evidence Items</p>
            </div>
          </div>

          <Tabs defaultValue="orgs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orgs">
                Organizations ({pendingOrgs.length})
              </TabsTrigger>
              <TabsTrigger value="campaigns">
                Campaigns ({pendingCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="evidence">
                Evidence ({pendingEvidence.length})
              </TabsTrigger>
            </TabsList>

            {/* Organizations Tab */}
            <TabsContent value="orgs" className="space-y-4">
              {store.orgSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No organization submissions yet.
                </div>
              ) : (
                store.orgSubmissions.map((org) => (
                  <div
                    key={org.id}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building size={16} className="text-primary" />
                          <h3 className="font-medium text-foreground">{org.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {org.location} · {org.contactEmail}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {new Date(org.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={org.status === "pending_verification" ? "pending" : org.status} />
                    </div>

                    <div className="text-xs text-muted-foreground mb-3">
                      {org.evidenceIds.length} evidence items attached
                    </div>

                    {org.reviewNotes && (
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-3">
                        <strong>Review notes:</strong> {org.reviewNotes}
                      </div>
                    )}

                    {org.status === "pending_verification" && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add review notes..."
                          value={reviewNotes[org.id] || ""}
                          onChange={(e) =>
                            setReviewNotes({ ...reviewNotes, [org.id]: e.target.value })
                          }
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveOrg(org.id)}
                            className="flex-1"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectOrg(org.id)}
                            className="flex-1"
                          >
                            <XCircle size={14} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-4">
              {store.campaignSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No campaign submissions yet.
                </div>
              ) : (
                store.campaignSubmissions.map((camp) => (
                  <div
                    key={camp.id}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-foreground mb-1">{camp.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {camp.organizationName} · {camp.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Goal: ${camp.goal.toLocaleString()} · Category: {camp.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {new Date(camp.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={camp.status === "pending_verification" ? "pending" : camp.status} />
                    </div>

                    {camp.useOfFunds.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-foreground mb-1">Use of Funds:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {camp.useOfFunds.map((f, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{f.item}</span>
                              <span>${f.amount.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {camp.reviewNotes && (
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-3">
                        <strong>Review notes:</strong> {camp.reviewNotes}
                      </div>
                    )}

                    {camp.status === "pending_verification" && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add review notes..."
                          value={reviewNotes[camp.id] || ""}
                          onChange={(e) =>
                            setReviewNotes({ ...reviewNotes, [camp.id]: e.target.value })
                          }
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveCampaign(camp.id)}
                            className="flex-1"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectCampaign(camp.id)}
                            className="flex-1"
                          >
                            <XCircle size={14} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Evidence Tab */}
            <TabsContent value="evidence" className="space-y-4">
              {store.evidenceOverrides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No evidence items to review.
                </div>
              ) : (
                store.evidenceOverrides.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-card rounded-xl border border-border p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={14} className="text-primary" />
                          <h4 className="text-sm font-medium text-foreground">{ev.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{ev.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {ev.type} · Visibility: {ev.visibility} · Date: {ev.date}
                        </p>
                      </div>
                      <StatusBadge status={ev.status} />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-primary mb-3">
                      <Eye size={12} />
                      <a href={ev.media.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View document ({ev.media.kind})
                      </a>
                    </div>

                    {ev.status === "pending" && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Review notes for this evidence..."
                          value={reviewNotes[ev.id] || ""}
                          onChange={(e) =>
                            setReviewNotes({ ...reviewNotes, [ev.id]: e.target.value })
                          }
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveEvidence(ev.id)}
                            className="flex-1"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectEvidence(ev.id)}
                            className="flex-1"
                          >
                            <XCircle size={14} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
