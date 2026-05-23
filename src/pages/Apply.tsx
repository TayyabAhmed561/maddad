import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitApplication, uploadApplicationDocument } from "@/lib/queries/applications";
import type { OrgType, ApplicationInsert } from "@/lib/queries/applications";
import { supabase } from "@/lib/supabase";
import maddadLogo from "@/assets/maddad-logo.png";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  Info,
  Upload,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Step1Data {
  orgName: string;
  orgType: OrgType | "";
  websiteUrl: string;
  orgDescription: string;
}

interface Step2Data {
  campaignTitle: string;
  campaignType: string;
  campaignCategory: string;
  campaignGoal: string;
  campaignDescription: string;
  zakatEligible: boolean;
}

interface Step3Data {
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  craNumber: string;
  howHeard: string;
  files: File[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ORG_TYPES: { id: OrgType; label: string; description: string; Icon: typeof Building2 }[] = [
  {
    id: "registered_charity",
    label: "Registered Canadian charity",
    description: "Has a CRA registration number",
    Icon: Building2,
  },
  {
    id: "masjid",
    label: "Masjid or Islamic centre",
    description: "A local mosque or Islamic community centre",
    Icon: BookOpen,
  },
  {
    id: "university_msa",
    label: "University MSA or student club",
    description: "Muslim Students' Association or campus group",
    Icon: GraduationCap,
  },
  {
    id: "community_group",
    label: "Community group or informal organization",
    description: "Informal or unregistered community initiative",
    Icon: Users,
  },
];

const CAMPAIGN_TYPES = [
  { id: "need", label: "Need", description: "Ongoing organizational campaign" },
  { id: "community_appeal", label: "Community appeal", description: "Individual or family appeal" },
  { id: "appeal", label: "Humanitarian appeal", description: "Platform-curated cause" },
];

const CATEGORIES = [
  { id: "food",      label: "Food" },
  { id: "shelter",   label: "Shelter" },
  { id: "medical",   label: "Medical" },
  { id: "education", label: "Education" },
  { id: "masjid",    label: "Masjid" },
  { id: "zakat",     label: "Zakat" },
  { id: "fidya",     label: "Fidya" },
  { id: "qurbani",   label: "Qurbani" },
];

const HOW_HEARD_OPTIONS = [
  "Friend or word of mouth",
  "Social media",
  "Masjid announcement",
  "Google search",
  "Other",
];

const STEPS = ["Your organization", "Your campaign", "Contact & documents", "Review & submit"];

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep1(d: Step1Data): string | null {
  if (!d.orgName.trim()) return "Organization name is required.";
  if (!d.orgType) return "Please select an organization type.";
  if (d.orgDescription.trim().length < 50) return "Description must be at least 50 characters.";
  if (d.orgDescription.trim().length > 300) return "Description must be under 300 characters.";
  return null;
}

function validateStep2(d: Step2Data): string | null {
  if (!d.campaignTitle.trim()) return "Campaign title is required.";
  if (!d.campaignType) return "Please select a campaign type.";
  if (!d.campaignCategory) return "Please select a category.";
  if (!d.campaignDescription.trim()) return "Campaign description is required.";
  return null;
}

function validateStep3(d: Step3Data): string | null {
  if (!d.contactName.trim()) return "Your name is required.";
  if (!d.contactRole.trim()) return "Your role is required.";
  if (!d.contactEmail.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contactEmail)) return "Please enter a valid email address.";
  if (d.files.length > 3) return "You can upload up to 3 documents.";
  const tooLarge = d.files.find(f => f.size > 10 * 1024 * 1024);
  if (tooLarge) return `${tooLarge.name} exceeds the 10 MB limit.`;
  return null;
}

// ── Progress indicator ────────────────────────────────────────────────────────

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, idx) => {
        const n = idx + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                done   ? "bg-primary text-primary-foreground" :
                active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                         "bg-secondary text-muted-foreground"
              )}>
                {done ? <Check size={14} /> : n}
              </div>
              <span className={cn(
                "text-[10px] mt-1 text-center max-w-[64px] leading-tight",
                active ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
            {idx < total - 1 && (
              <div className={cn(
                "w-12 sm:w-20 h-px mb-5 mx-1 transition-colors",
                done ? "bg-primary/40" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── FieldError ────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-sm text-destructive mt-1">{msg}</p>;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function ZakatTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="What is Zakat eligibility?"
      >
        <Info size={14} />
      </button>
      {open && (
        <div className="absolute left-0 bottom-6 w-64 bg-card border border-border rounded-lg p-3 shadow-card z-10 text-xs text-muted-foreground leading-relaxed">
          Zakat-eligible campaigns serve one of the eight Quranic categories
          (e.g. the poor, the needy, those in debt). Zakat and Sadaqah funds
          are kept strictly separate. If unsure, leave this unchecked — you
          can update it later.
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"><X size={12} /></button>
        </div>
      )}
    </span>
  );
}

// ── FileDropZone ──────────────────────────────────────────────────────────────

function FileDropZone({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const valid = arr.filter(f => {
      const ok = ["application/pdf", "image/jpeg", "image/png"].includes(f.type);
      return ok && f.size <= 10 * 1024 * 1024;
    });
    onChange([...files, ...valid].slice(0, 3));
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
      >
        <Upload size={24} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — max 10 MB each, up to 3 files</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-sm">
              <span className="text-foreground truncate max-w-[260px]">{f.name}</span>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Apply() {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [s1, setS1] = useState<Step1Data>({
    orgName: "", orgType: "", websiteUrl: "", orgDescription: "",
  });
  const [s2, setS2] = useState<Step2Data>({
    campaignTitle: "", campaignType: "", campaignCategory: "",
    campaignGoal: "", campaignDescription: "", zakatEligible: false,
  });
  const [s3, setS3] = useState<Step3Data>({
    contactName: "", contactRole: "", contactEmail: "",
    contactPhone: "", craNumber: "", howHeard: "", files: [],
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  function next() {
    let err: string | null = null;
    if (step === 1) err = validateStep1(s1);
    if (step === 2) err = validateStep2(s2);
    if (step === 3) err = validateStep3(s3);
    if (err) { setStepError(err); return; }
    setStepError(null);
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStepError(null);
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!confirmed) { setStepError("Please confirm the accuracy of your information."); return; }
    setStepError(null);
    setIsSubmitting(true);

    try {
      // Generate a placeholder UUID for document paths before insert
      const tempId = crypto.randomUUID();

      // Upload documents first (if any)
      const docPaths: string[] = [];
      for (const file of s3.files) {
        const path = await uploadApplicationDocument(tempId, file);
        if (path) docPaths.push(path);
      }

      const payload: ApplicationInsert = {
        orgName:             s1.orgName.trim(),
        orgType:             s1.orgType as OrgType,
        province:            "ON",
        websiteUrl:          s1.websiteUrl.trim() || null,
        orgDescription:      s1.orgDescription.trim(),
        campaignTitle:       s2.campaignTitle.trim(),
        campaignType:        s2.campaignType,
        campaignCategory:    s2.campaignCategory,
        campaignGoalCad:     s2.campaignGoal ? parseFloat(s2.campaignGoal) : null,
        campaignDescription: s2.campaignDescription.trim(),
        zakatEligible:       s2.zakatEligible,
        contactName:         s3.contactName.trim(),
        contactRole:         s3.contactRole.trim(),
        contactEmail:        s3.contactEmail.trim().toLowerCase(),
        contactPhone:        s3.contactPhone.trim() || null,
        craNumber:           s3.craNumber.trim() || null,
        howHeard:            s3.howHeard || null,
        documentPaths:       docPaths,
      };

      const result = await submitApplication(payload);
      if (!result) {
        setStepError("Something went wrong. Please try again or email hello@maddad.ca.");
        setIsSubmitting(false);
        return;
      }

      // Fire confirmation + admin notification emails (fire-and-forget)
      supabase.functions.invoke("send-application-email", {
        body: { type: "application_received", applicationId: result.id, adminNotes: null },
      }).catch(() => undefined);

      setSubmitted(true);
    } catch {
      setStepError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
            Application submitted
          </h1>
          <p className="text-muted-foreground mb-2">
            JazakAllah Khayran. We&apos;ll review your application within{" "}
            <strong className="text-foreground">3 business days</strong> and will be in touch
            at <strong className="text-foreground">{s3.contactEmail}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Check your inbox for a confirmation email.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/">
              <Button variant="outline">Back to Maddad</Button>
            </Link>
            <Link to="/explore">
              <Button>Explore campaigns</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Page layout ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={maddadLogo} alt="Maddad" className="h-full w-full object-cover scale-[1.35] origin-center" />
            </div>
            <span className="font-serif font-semibold text-foreground">Maddad</span>
          </Link>
          <span className="text-sm text-muted-foreground">Organization application</span>
        </div>
      </header>

      <main className="flex-1 py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
                Apply to join Maddad
              </h1>
              <p className="text-muted-foreground">
                Takes about 10 minutes. We review all applications within 3 business days.
              </p>
            </div>

            <Progress step={step} total={STEPS.length} />

            {/* ── Step 1: Organization ───────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    About your organization
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Organization name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={s1.orgName}
                        onChange={e => setS1(d => ({ ...d, orgName: e.target.value }))}
                        placeholder="e.g. Waterloo Islamic Charitable Society"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Organization type <span className="text-destructive">*</span>
                      </label>
                      <div className="space-y-2.5">
                        {ORG_TYPES.map(({ id, label, description, Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setS1(d => ({ ...d, orgType: id }))}
                            className={cn(
                              "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                              s1.orgType === id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border bg-secondary/50 hover:border-primary/40"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                              s1.orgType === id ? "bg-primary/10" : "bg-muted"
                            )}>
                              <Icon size={16} className={s1.orgType === id ? "text-primary" : "text-muted-foreground"} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                            </div>
                            {s1.orgType === id && (
                              <Check size={16} className="text-primary ml-auto shrink-0 mt-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Province</label>
                      <div className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-3">
                        <span className="text-sm font-medium text-foreground">Ontario (ON)</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          Maddad currently serves Ontario-based organizations
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Website URL <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                      </label>
                      <Input
                        value={s1.websiteUrl}
                        onChange={e => setS1(d => ({ ...d, websiteUrl: e.target.value }))}
                        placeholder="https://yourorg.ca"
                        type="url"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        What does your organization do? <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={s1.orgDescription}
                        onChange={e => setS1(d => ({ ...d, orgDescription: e.target.value }))}
                        placeholder="Briefly describe your organization's mission and activities…"
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <p className={cn(
                        "text-xs mt-1",
                        s1.orgDescription.length > 300 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {s1.orgDescription.length}/300 characters (min 50)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Campaign ───────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Tell us about your campaign
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    This will be your first campaign on Maddad. You can refine it after approval.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Campaign title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={s2.campaignTitle}
                        onChange={e => setS2(d => ({ ...d, campaignTitle: e.target.value }))}
                        placeholder="e.g. Monthly Food Bank — Waterloo Region"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Campaign type <span className="text-destructive">*</span>
                      </label>
                      <div className="space-y-2">
                        {CAMPAIGN_TYPES.map(ct => (
                          <button
                            key={ct.id}
                            type="button"
                            onClick={() => setS2(d => ({ ...d, campaignType: ct.id }))}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all",
                              s2.campaignType === ct.id
                                ? "border-primary bg-primary/5"
                                : "border-border bg-secondary/50 hover:border-primary/40"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{ct.label}</p>
                              <p className="text-xs text-muted-foreground">{ct.description}</p>
                            </div>
                            {s2.campaignType === ct.id && <Check size={16} className="text-primary shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Category <span className="text-destructive">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setS2(d => ({ ...d, campaignCategory: cat.id }))}
                            className={cn(
                              "py-2 px-3 rounded-lg text-sm font-medium text-center transition-all border",
                              s2.campaignCategory === cat.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary text-foreground border-border hover:border-primary/40"
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Goal amount (CAD){" "}
                        <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min={0}
                          value={s2.campaignGoal}
                          onChange={e => setS2(d => ({ ...d, campaignGoal: e.target.value }))}
                          className="pl-7"
                          placeholder="5,000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Campaign description <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={s2.campaignDescription}
                        onChange={e => setS2(d => ({ ...d, campaignDescription: e.target.value }))}
                        placeholder="Describe what this campaign is for and how donations will be used…"
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>

                    <div className="flex items-start justify-between bg-secondary rounded-lg px-4 py-3.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground">Zakat-eligible campaign</p>
                          <ZakatTooltip />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Does this campaign serve one of the eight Quranic Zakat categories?
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s2.zakatEligible}
                        onClick={() => setS2(d => ({ ...d, zakatEligible: !d.zakatEligible }))}
                        className={cn(
                          "relative w-10 h-6 rounded-full shrink-0 ml-4 mt-0.5 transition-colors",
                          s2.zakatEligible ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                          s2.zakatEligible ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Contact + documents ────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                    Contact details
                  </h2>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Your name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={s3.contactName}
                          onChange={e => setS3(d => ({ ...d, contactName: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Your role <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={s3.contactRole}
                          onChange={e => setS3(d => ({ ...d, contactRole: e.target.value }))}
                          placeholder="e.g. President, Treasurer, Imam"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Email address <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="email"
                          value={s3.contactEmail}
                          onChange={e => setS3(d => ({ ...d, contactEmail: e.target.value }))}
                          placeholder="you@yourorg.ca"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Phone <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                        </label>
                        <Input
                          type="tel"
                          value={s3.contactPhone}
                          onChange={e => setS3(d => ({ ...d, contactPhone: e.target.value }))}
                          placeholder="+1 (519) 555-0100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        CRA registration number{" "}
                        <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                      </label>
                      <Input
                        value={s3.craNumber}
                        onChange={e => setS3(d => ({ ...d, craNumber: e.target.value }))}
                        placeholder="123456789 RR 0001"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for CRA-compliant tax receipts. Format: 123456789 RR 0001
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        How did you hear about Maddad?{" "}
                        <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                      </label>
                      <select
                        value={s3.howHeard}
                        onChange={e => setS3(d => ({ ...d, howHeard: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select…</option>
                        {HOW_HEARD_OPTIONS.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Supporting documents
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Optional but recommended. Upload anything that helps verify your organization:
                    registration certificate, masjid letterhead, university club constitution, etc.
                  </p>
                  <FileDropZone files={s3.files} onChange={files => setS3(d => ({ ...d, files }))} />
                </div>
              </div>
            )}

            {/* ── Step 4: Review ─────────────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                {/* Organization */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-semibold text-foreground">Organization</h3>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setStepError(null); }}
                      className="text-xs text-primary hover:underline"
                    >Edit</button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    {[
                      ["Name", s1.orgName],
                      ["Type", ORG_TYPES.find(t => t.id === s1.orgType)?.label ?? s1.orgType],
                      ["Province", "Ontario, Canada"],
                      ["Website", s1.websiteUrl || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4">
                        <dt className="w-24 text-muted-foreground shrink-0">{k}</dt>
                        <dd className="text-foreground">{v}</dd>
                      </div>
                    ))}
                    <div className="flex gap-4">
                      <dt className="w-24 text-muted-foreground shrink-0">Description</dt>
                      <dd className="text-foreground">{s1.orgDescription}</dd>
                    </div>
                  </dl>
                </div>

                {/* Campaign */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-semibold text-foreground">Campaign</h3>
                    <button
                      type="button"
                      onClick={() => { setStep(2); setStepError(null); }}
                      className="text-xs text-primary hover:underline"
                    >Edit</button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    {[
                      ["Title", s2.campaignTitle],
                      ["Type", CAMPAIGN_TYPES.find(t => t.id === s2.campaignType)?.label ?? s2.campaignType],
                      ["Category", CATEGORIES.find(c => c.id === s2.campaignCategory)?.label ?? s2.campaignCategory],
                      ["Goal", s2.campaignGoal ? `$${parseFloat(s2.campaignGoal).toLocaleString()} CAD` : "No goal set"],
                      ["Zakat-eligible", s2.zakatEligible ? "Yes" : "No"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4">
                        <dt className="w-24 text-muted-foreground shrink-0">{k}</dt>
                        <dd className="text-foreground">{v}</dd>
                      </div>
                    ))}
                    <div className="flex gap-4">
                      <dt className="w-24 text-muted-foreground shrink-0">Description</dt>
                      <dd className="text-foreground">{s2.campaignDescription}</dd>
                    </div>
                  </dl>
                </div>

                {/* Contact */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-semibold text-foreground">Contact</h3>
                    <button
                      type="button"
                      onClick={() => { setStep(3); setStepError(null); }}
                      className="text-xs text-primary hover:underline"
                    >Edit</button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    {[
                      ["Name", s3.contactName],
                      ["Role", s3.contactRole],
                      ["Email", s3.contactEmail],
                      ["Phone", s3.contactPhone || "—"],
                      ["CRA #", s3.craNumber || "—"],
                      ["How heard", s3.howHeard || "—"],
                      ["Documents", s3.files.length > 0 ? `${s3.files.length} file(s)` : "None"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4">
                        <dt className="w-24 text-muted-foreground shrink-0">{k}</dt>
                        <dd className="text-foreground">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Confirmation checkbox */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={e => setConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary/20 shrink-0"
                    />
                    <span className="text-sm text-foreground leading-relaxed">
                      I confirm the information above is accurate and I am authorized to submit
                      on behalf of this organization.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ── Error message ──────────────────────────────────────────── */}
            {stepError && (
              <div className="mt-5 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                <FieldError msg={stepError} />
              </div>
            )}

            {/* ── Navigation buttons ─────────────────────────────────────── */}
            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button onClick={next} size="lg">
                  Continue
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={handleSubmit} size="lg" disabled={isSubmitting || !confirmed}>
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                  ) : (
                    <>Submit application</>
                  )}
                </Button>
              )}
            </div>

            {/* Bottom reassurance */}
            {step === 1 && (
              <p className="text-center text-xs text-muted-foreground mt-8">
                Free to apply. Zero platform fees.{" "}
                <Link to="/partners" className="text-primary hover:underline">Learn more</Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
