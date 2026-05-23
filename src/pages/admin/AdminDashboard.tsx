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
  Inbox,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import {
  useSubmissionsQueue,
  useAllOrganizations,
  useAllCampaigns,
  useRecentDonations,
} from "@/hooks/queries/useAdmin";
import { useApplications } from "@/hooks/queries/useApplications";
import { useAppealIntakes } from "@/hooks/queries/useAppealIntakes";
import { updateSubmissionStatus, toggleCampaignActive } from "@/lib/queries/admin";
import { updateApplicationStatus, approveApplication } from "@/lib/queries/applications";
import { updateAppealIntakeStatus } from "@/lib/queries/appealIntakes";
import type { OrgApplication, ApplicationStatus } from "@/lib/queries/applications";
import type { AppealIntakeRow } from "@/lib/queries/appealIntakes";
import type { SubmissionRow } from "@/lib/queries/verification";
import type { VerificationStatus } from "@/lib/supabase";

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VerificationStatus | string }) {
  const map: Record<string, { label: string; className: string }> = {
    approved:          { label: "Approved",          className: "bg-primary/10 text-primary" },
    rejected:          { label: "Rejected",          className: "bg-destructive/10 text-destructive" },
    under_review:      { label: "Under Review",      className: "bg-amber-500/10 text-amber-700" },
    submitted:         { label: "Submitted",         className: "bg-blue-500/10 text-blue-700" },
    draft:             { label: "Draft",             className: "bg-muted text-muted-foreground" },
    pending:           { label: "Pending",           className: "bg-yellow-500/10 text-yellow-700" },
    more_info_needed:  { label: "More Info Needed",  className: "bg-orange-500/10 text-orange-700" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ── Org type labels ───────────────────────────────────────────────────────────

const ORG_TYPE_LABELS: Record<string, string> = {
  registered_charity: "Registered charity",
  masjid:             "Masjid / Islamic centre",
  university_msa:     "University MSA",
  community_group:    "Community group",
};

// ── ApplicationDetail side panel ──────────────────────────────────────────────

interface ApplicationDetailProps {
  app: OrgApplication;
  onClose: () => void;
  onRefresh: () => void;
}

function ApplicationDetail({ app, onClose, onRefresh }: ApplicationDetailProps) {
  const [notes, setNotes] = useState(app.adminNotes ?? "");
  const [isActioning, setIsActioning] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  async function handleStatus(status: ApplicationStatus) {
    setIsActioning(true);
    setActionErr(null);
    const ok = await updateApplicationStatus(app.id, status, notes.trim() || null);
    setIsActioning(false);
    if (ok) { onRefresh(); onClose(); }
    else setActionErr("Action failed. Please try again.");
  }

  async function handleApprove() {
    setIsActioning(true);
    setActionErr(null);
    const ok = await approveApplication(app);
    setIsActioning(false);
    if (ok) { onRefresh(); onClose(); }
    else setActionErr("Approval failed. Check console for details.");
  }

  const detail = (label: string, value: string | null | undefined) => (
    value ? (
      <div className="flex gap-3 text-sm py-1.5 border-b border-border last:border-0">
        <span className="w-32 text-muted-foreground shrink-0">{label}</span>
        <span className="text-foreground">{value}</span>
      </div>
    ) : null
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-background border-l border-border overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">{app.orgName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={app.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(app.createdAt).toLocaleDateString("en-CA")}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-6">
          {/* Organization */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Organization
            </h3>
            <div className="bg-card border border-border rounded-xl px-4 py-1">
              {detail("Name", app.orgName)}
              {detail("Type", ORG_TYPE_LABELS[app.orgType] ?? app.orgType)}
              {detail("Province", app.province)}
              {detail("CRA #", app.craNumber)}
              {app.websiteUrl && (
                <div className="flex gap-3 text-sm py-1.5 border-b border-border last:border-0">
                  <span className="w-32 text-muted-foreground shrink-0">Website</span>
                  <a
                    href={app.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {app.websiteUrl}
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {detail("Description", app.orgDescription)}
            </div>
          </div>

          {/* Campaign */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Campaign
            </h3>
            <div className="bg-card border border-border rounded-xl px-4 py-1">
              {detail("Title", app.campaignTitle)}
              {detail("Type", app.campaignType)}
              {detail("Category", app.campaignCategory)}
              {detail("Goal", app.campaignGoalCad != null ? `$${app.campaignGoalCad.toLocaleString()} CAD` : null)}
              {detail("Zakat-eligible", app.zakatEligible ? "Yes" : "No")}
              {detail("Description", app.campaignDescription)}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Contact
            </h3>
            <div className="bg-card border border-border rounded-xl px-4 py-1">
              {detail("Name", app.contactName)}
              {detail("Role", app.contactRole)}
              {detail("Email", app.contactEmail)}
              {detail("Phone", app.contactPhone)}
              {detail("How heard", app.howHeard)}
            </div>
          </div>

          {/* Documents */}
          {app.documentPaths.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Documents ({app.documentPaths.length})
              </h3>
              <div className="space-y-1.5">
                {app.documentPaths.map((path, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground truncate">
                    {path.split("/").pop() ?? path}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Download via Supabase dashboard → Storage → evidence-docs
              </p>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Admin notes
            </label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes (sent to applicant when you take action)…"
              rows={3}
              className="text-sm"
            />
          </div>

          {actionErr && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{actionErr}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-5 border-t border-border space-y-2 sticky bottom-0 bg-background">
          {app.status !== "approved" && app.status !== "rejected" && (
            <>
              {app.status === "pending" && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isActioning}
                  onClick={() => handleStatus("under_review")}
                >
                  <Clock size={14} />
                  Mark Under Review
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={isActioning}
                onClick={() => handleStatus("more_info_needed")}
              >
                Request More Info
              </Button>
              <Button
                className="w-full gap-2"
                disabled={isActioning}
                onClick={() => setConfirmApprove(true)}
              >
                {isActioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Approve — Create Org & Campaign
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2"
                disabled={isActioning}
                onClick={() => handleStatus("rejected")}
              >
                <XCircle size={14} />
                Reject
              </Button>
            </>
          )}
          {(app.status === "approved" || app.status === "rejected") && (
            <p className="text-sm text-center text-muted-foreground py-2">
              Application is {app.status}. No further actions available.
            </p>
          )}
        </div>
      </div>

      {/* Approve confirmation */}
      <AlertDialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve and create organization?</AlertDialogTitle>
            <AlertDialogDescription>
              This will:
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                <li>Create an approved organization record for <strong>{app.orgName}</strong></li>
                <li>Create a draft campaign <strong>&ldquo;{app.campaignTitle}&rdquo;</strong></li>
                <li>Send a welcome email to <strong>{app.contactEmail}</strong> with a signup link</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isActioning}>
              {isActioning ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
  const { data: applications, isLoading: appsLoading, refetch: refetchApps } = useApplications();
  const { data: appealIntakes, isLoading: intakesLoading, refetch: refetchIntakes } = useAppealIntakes();

  const [orgSearch,      setOrgSearch]      = useState("");
  const [campStatus,     setCampStatus]     = useState<VerificationStatus | "all">("all");
  const [actionState,    setActionState]    = useState<ActionState | null>(null);
  const [actionNotes,    setActionNotes]    = useState("");
  const [isActioning,    setActioning]      = useState(false);
  const [togglingId,     setTogglingId]     = useState<string | null>(null);
  const [selectedApp,    setSelectedApp]    = useState<OrgApplication | null>(null);
  const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatus | "all">("all");

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

  const filteredApps = appStatusFilter === "all"
    ? applications
    : applications.filter(a => a.status === appStatusFilter);

  const pendingAppsCount = applications.filter(a => a.status === "pending").length;

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
              Manage applications, submissions, organizations, campaigns, and donations.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Applications", value: applications.length, icon: Inbox,      badge: pendingAppsCount > 0 ? pendingAppsCount : null },
              { label: "Queue",        value: submissions.length,  icon: Clock,      badge: null },
              { label: "Orgs",         value: orgs.length,         icon: Building,   badge: null },
              { label: "Campaigns",    value: campaigns.length,    icon: FileText,   badge: null },
              { label: "Donations",    value: donations.length,    icon: DollarSign, badge: null },
            ].map(({ label, value, icon: Icon, badge }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-5 text-center relative">
                {badge !== null && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
                <Icon size={18} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="applications">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="applications" className="relative">
                Applications
                {pendingAppsCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">
                    {pendingAppsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            {/* ── Applications Tab ────────────────────────────────────── */}
            <TabsContent value="applications" className="space-y-4">
              {/* Status filter */}
              <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "under_review", "more_info_needed", "approved", "rejected"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setAppStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      appStatusFilter === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {s === "all" ? "All" : s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              {appsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-muted-foreground" />
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {appStatusFilter === "all" ? "No applications yet." : `No ${appStatusFilter.replace(/_/g, " ")} applications.`}
                </div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Organization</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Submitted</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((app, i) => (
                        <tr
                          key={app.id}
                          className={`cursor-pointer hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          onClick={() => setSelectedApp(app)}
                        >
                          <td className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate">{app.orgName}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{ORG_TYPE_LABELS[app.orgType] ?? app.orgType}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[140px] truncate">{app.contactEmail}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                            {new Date(app.createdAt).toLocaleDateString("en-CA")}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight size={14} className="text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* ── Community Appeal Intakes ───────────────────────────── */}
              <div className="mt-10">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Community Appeal Intakes
                </h3>
                {intakesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  </div>
                ) : appealIntakes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No community appeal submissions yet.
                  </div>
                ) : (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border">
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Email</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Submitted</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appealIntakes.map((intake: AppealIntakeRow, i: number) => (
                          <tr
                            key={intake.id}
                            className={`${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                          >
                            <td className="px-4 py-3 font-medium text-foreground max-w-[120px] truncate">{intake.name}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell capitalize">{intake.need_type.replace(/_/g, " ")}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[160px] truncate">{intake.email}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                              {new Date(intake.created_at).toLocaleDateString("en-CA")}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                intake.status === "approved"   ? "bg-primary/10 text-primary"
                                : intake.status === "rejected"  ? "bg-destructive/10 text-destructive"
                                : intake.status === "reviewing" ? "bg-amber-500/10 text-amber-700"
                                : "bg-muted text-muted-foreground"
                              }`}>
                                {intake.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-1 justify-end">
                                {intake.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2"
                                    onClick={async () => {
                                      await updateAppealIntakeStatus(intake.id, "reviewing");
                                      refetchIntakes();
                                    }}
                                  >
                                    Review
                                  </Button>
                                )}
                                {intake.status !== "approved" && (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs px-2"
                                    onClick={async () => {
                                      await updateAppealIntakeStatus(intake.id, "approved");
                                      refetchIntakes();
                                    }}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {intake.status !== "rejected" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 text-xs px-2"
                                    onClick={async () => {
                                      await updateAppealIntakeStatus(intake.id, "rejected");
                                      refetchIntakes();
                                    }}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

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
                        <Button size="sm" variant="outline" onClick={() => openAction(sub, "under_review")}>
                          <Clock size={14} />Start Review
                        </Button>
                      )}
                      <Button size="sm" onClick={() => openAction(sub, "approved")}>
                        <CheckCircle size={14} />Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openAction(sub, "rejected")}>
                        <XCircle size={14} />Reject
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
                <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
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
                <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
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
                <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
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

      {/* ── Confirm submission action dialog ──────────────────────────── */}
      <AlertDialog open={!!actionState} onOpenChange={open => !open && setActionState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionState?.decision === "approved" ? "Approve Submission" :
               actionState?.decision === "rejected" ? "Reject Submission" : "Start Review"}
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
                actionState?.decision === "approved" ? "Approve" :
                actionState?.decision === "rejected" ? "Reject" : "Start Review"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Application detail panel ──────────────────────────────────── */}
      {selectedApp && (
        <ApplicationDetail
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRefresh={refetchApps}
        />
      )}
    </div>
  );
}
