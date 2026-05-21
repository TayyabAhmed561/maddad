import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  FileText,
  DollarSign,
  Search,
  Loader2,
} from "lucide-react";
import {
  useSubmissionsQueue,
  useAllOrganizations,
  useAllCampaigns,
  useRecentDonations,
} from "@/hooks/queries/useAdmin";
import { updateSubmissionStatus, toggleCampaignActive } from "@/lib/queries/admin";
import type { SubmissionRow } from "@/lib/queries/verification";
import type { VerificationStatus } from "@/lib/supabase";

// ── StatusBadge ───────────────────────────────────────────────────────────────

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

// ── Action dialog state ───────────────────────────────────────────────────────

interface ActionState {
  submission: Pick<SubmissionRow, "id" | "organizationId" | "campaignId">;
  decision: "under_review" | "approved" | "rejected";
  displayName: string;
}

// ── AdminDashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: submissions, isLoading: subLoading, refetch: refetchSubs } = useSubmissionsQueue();
  const { data: orgs,        isLoading: orgsLoading }                      = useAllOrganizations();
  const { data: campaigns,   isLoading: campLoading, refetch: refetchCamps } = useAllCampaigns();
  const { data: donations,   isLoading: donLoading }                        = useRecentDonations();

  const [orgSearch,    setOrgSearch]    = useState("");
  const [campStatus,   setCampStatus]   = useState<VerificationStatus | "all">("all");
  const [actionState,  setActionState]  = useState<ActionState | null>(null);
  const [actionNotes,  setActionNotes]  = useState("");
  const [isActioning,  setActioning]    = useState(false);
  const [togglingId,   setTogglingId]   = useState<string | null>(null);

  // ── handlers ────────────────────────────────────────────────────────────────

  function openAction(sub: SubmissionRow, decision: ActionState["decision"]) {
    const name = sub.organizationName ?? sub.campaignTitle ?? sub.id;
    setActionState({ submission: { id: sub.id, organizationId: sub.organizationId, campaignId: sub.campaignId }, decision, displayName: name });
    setActionNotes("");
  }

  async function confirmAction() {
    if (!actionState) return;
    setActioning(true);

    const ok = await updateSubmissionStatus(
      actionState.submission,
      actionState.decision,
      actionNotes.trim() || null,
    );

    setActioning(false);
    setActionState(null);

    if (ok) refetchSubs();
  }

  async function handleToggleActive(campaignId: string, current: boolean) {
    setTogglingId(campaignId);
    await toggleCampaignActive(campaignId, !current);
    setTogglingId(null);
    refetchCamps();
  }

  // ── filtered lists ────────────────────────────────────────────────────────

  const filteredOrgs = orgs.filter(o =>
    o.legalName.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const filteredCamps = campaigns.filter(c =>
    campStatus === "all" || c.verificationStatus === campStatus
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-1">
              Platform Admin
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage submissions, organizations, campaigns, and donations.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Queue",         value: submissions.length, icon: Clock },
              { label: "Organizations", value: orgs.length,        icon: Building },
              { label: "Campaigns",     value: campaigns.length,   icon: FileText },
              { label: "Donations",     value: donations.length,   icon: DollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-5 text-center">
                <Icon size={18} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="submissions">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            {/* ── Submissions Tab ─────────────────────────────────────── */}
            <TabsContent value="submissions" className="space-y-4">
              {subLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-muted-foreground" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No pending submissions.
                </div>
              ) : (
                submissions.map(sub => (
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
                    <div className="flex gap-2 flex-wrap">
                      {sub.status === "submitted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAction(sub, "under_review")}
                        >
                          <Clock size={14} />
                          Start Review
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openAction(sub, "approved")}
                      >
                        <CheckCircle size={14} />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openAction(sub, "rejected")}
                      >
                        <XCircle size={14} />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* ── Organizations Tab ──────────────────────────────────── */}
            <TabsContent value="organizations" className="space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={orgSearch}
                  onChange={e => setOrgSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {orgsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-muted-foreground" />
                </div>
              ) : filteredOrgs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No organizations found.</div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrgs.map((org, i) => (
                        <tr key={org.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-4 py-3 font-medium text-foreground">{org.legalName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{org.contactEmail ?? "—"}</td>
                          <td className="px-4 py-3"><StatusBadge status={org.verificationStatus} /></td>
                          <td className="px-4 py-3 text-muted-foreground">{org.trustScore ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ── Campaigns Tab ─────────────────────────────────────── */}
            <TabsContent value="campaigns" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(["all", "draft", "submitted", "under_review", "approved", "rejected"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setCampStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      campStatus === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {s === "all" ? "All" : s.replace("_", " ")}
                  </button>
                ))}
              </div>
              {campLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-muted-foreground" />
                </div>
              ) : filteredCamps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No campaigns found.</div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Goal</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCamps.map((camp, i) => (
                        <tr key={camp.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{camp.title}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{camp.category}</td>
                          <td className="px-4 py-3"><StatusBadge status={camp.verificationStatus} /></td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {camp.goalAmount != null ? `$${camp.goalAmount.toLocaleString()}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {togglingId === camp.id ? (
                              <Loader2 size={16} className="animate-spin text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={camp.isActive}
                                onCheckedChange={() => handleToggleActive(camp.id, camp.isActive)}
                                disabled={camp.verificationStatus !== "approved"}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ── Donations Tab ─────────────────────────────────────── */}
            <TabsContent value="donations">
              {donLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-muted-foreground" />
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No donations yet.</div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Campaign</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((don, i) => (
                        <tr key={don.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                            {don.campaignTitle ?? don.campaignId.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">
                            {don.givingType.replace("_", " ")}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            ${don.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              don.status === "succeeded"
                                ? "bg-primary/10 text-primary"
                                : don.status === "failed"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                            }`}>
                              {don.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(don.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* ── Confirm action dialog ──────────────────────────────────── */}
      <AlertDialog open={!!actionState} onOpenChange={open => !open && setActionState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionState?.decision === "approved"
                ? "Approve Submission"
                : actionState?.decision === "rejected"
                  ? "Reject Submission"
                  : "Start Review"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionState?.decision === "approved"
                ? `Approve "${actionState.displayName}"? This will set it live once active.`
                : actionState?.decision === "rejected"
                  ? `Reject "${actionState?.displayName}"? The submitter will be notified.`
                  : `Mark "${actionState?.displayName}" as under review.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-2">
            <Textarea
              placeholder="Review notes (optional — sent to the submitter)"
              value={actionNotes}
              onChange={e => setActionNotes(e.target.value)}
              className="text-sm"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={isActioning}
              className={actionState?.decision === "rejected" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isActioning ? (
                <><Loader2 size={14} className="animate-spin" /> Processing…</>
              ) : (
                actionState?.decision === "approved" ? "Approve" : actionState?.decision === "rejected" ? "Reject" : "Start Review"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
