import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  DollarSign,
  Upload,
  CheckCircle,
  Plus,
  Trash2,
  Shield,
  User,
  Building,
  UserCheck,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  createCampaignSubmission,
  type EvidenceUpload,
} from "@/lib/queries/verification";
import { supabase } from "@/lib/supabase";
import type { EvidenceTypeEnum } from "@/lib/supabase";
import type { UseOfFundsItem } from "@/hooks/useVerificationStore";

// ---------- Schemas ----------

const campaignBasicsSchema = z
  .object({
    submitterType: z.enum(["organization", "private"]),
    organizationId: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    title: z.string().trim().min(3, "Campaign title is required").max(200),
    category: z.string().min(1, "Select a category"),
    categoryLabel: z.string().optional(),
    goal: z.coerce.number().min(100, "Minimum goal is $100"),
    location: z.string().trim().min(2, "Location scope is required").max(200),
    description: z.string().trim().min(10, "Description is required").max(2000),
  })
  .superRefine((data, ctx) => {
    if (data.submitterType === "organization" && !data.organizationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an organization",
        path: ["organizationId"],
      });
    }
    if (data.submitterType === "private") {
      if (!data.contactName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Contact name is required",
          path: ["contactName"],
        });
      }
      if (!data.contactEmail?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Contact email is required",
          path: ["contactEmail"],
        });
      }
    }
    if (data.category === "other" && !data.categoryLabel?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe your category",
        path: ["categoryLabel"],
      });
    }
  });

const useOfFundsSchema = z.object({
  items: z
    .array(
      z.object({
        item: z.string().trim().min(1, "Item description required"),
        amount: z.coerce.number().min(1, "Amount must be > 0"),
      })
    )
    .min(1, "At least one line item required"),
});

const evidenceSchema = z.object({
  // Organization campaign fields
  needProof: z.string().trim().optional(),
  budgetBreakdown: z.string().trim().optional(),
  supplierQuote: z.string().trim().optional(),
  supplierQuotePublic: z.boolean().optional(),
  // Private campaign fields
  referralName: z.string().trim().optional(),
  referralRole: z.string().trim().optional(),
  referralContact: z.string().trim().optional(),
  documentProof: z.string().trim().optional(),
  documentRedactedNote: z.string().trim().optional(),
  budgetQuote: z.string().trim().optional(),
  budgetQuotePublic: z.boolean().optional(),
  verifierInterview: z.boolean().optional(),
});

type CampaignBasics = z.infer<typeof campaignBasicsSchema>;
type UseOfFundsForm = z.infer<typeof useOfFundsSchema>;
type EvidenceForm = z.infer<typeof evidenceSchema>;

const STEPS = ["Campaign Basics", "Use of Funds", "Evidence Upload", "Review & Submit"];

const CATEGORIES = [
  { value: "medical", label: "Medical" },
  { value: "disaster", label: "Disaster Relief" },
  { value: "education", label: "Education" },
  { value: "housing", label: "Housing" },
  { value: "food", label: "Food Security" },
  { value: "masjid", label: "Masjid / Community" },
  { value: "other", label: "Other (describe)" },
];

const KNOWN_ORGS = [
  { id: "org-kw-muslim", name: "K-W Muslim Community" },
  { id: "org-islamic-relief", name: "Islamic Relief Canada" },
  { id: "org-hci", name: "Human Concern International" },
  { id: "org-penny-appeal", name: "Penny Appeal Canada" },
  { id: "org-nzf", name: "National Zakat Foundation Canada" },
];

export default function CampaignVerificationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState<CampaignBasics | null>(null);
  const [funds, setFunds] = useState<UseOfFundsItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceForm | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [evidenceError, setEvidenceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load real orgs from Supabase
  const [dbOrgs, setDbOrgs] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    supabase
      .from("organizations")
      .select("id, legal_name")
      .is("deleted_at", null)
      .then(({ data }) => {
        if (data) setDbOrgs(data.map(o => ({ id: o.id, name: o.legal_name })));
      });
  }, []);
  const allOrgs = dbOrgs.length > 0 ? dbOrgs : KNOWN_ORGS;

  const basicsForm = useForm<CampaignBasics>({
    resolver: zodResolver(campaignBasicsSchema),
    defaultValues: {
      submitterType: "organization",
      organizationId: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      title: "",
      category: "",
      categoryLabel: "",
      goal: 0,
      location: "",
      description: "",
    },
  });

  const submitterType = basicsForm.watch("submitterType");
  const selectedCategory = basicsForm.watch("category");

  const fundsForm = useForm<UseOfFundsForm>({
    resolver: zodResolver(useOfFundsSchema),
    defaultValues: { items: [{ item: "", amount: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: fundsForm.control,
    name: "items",
  });

  const evidenceForm = useForm<EvidenceForm>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      needProof: "",
      budgetBreakdown: "",
      supplierQuote: "",
      supplierQuotePublic: false,
      referralName: "",
      referralRole: "",
      referralContact: "",
      documentProof: "",
      documentRedactedNote: "",
      budgetQuote: "",
      budgetQuotePublic: false,
      verifierInterview: false,
    },
  });

  const handleBasicsNext = basicsForm.handleSubmit((data) => {
    setBasics(data);
    setStep(1);
  });

  const handleFundsNext = fundsForm.handleSubmit((data) => {
    setFunds(data.items as UseOfFundsItem[]);
    setStep(2);
  });

  const handleEvidenceNext = (e: React.FormEvent) => {
    e.preventDefault();
    const data = evidenceForm.getValues();

    if (basics?.submitterType === "private") {
      let count = 0;
      if (data.referralName?.trim()) count++;
      if (data.documentProof?.trim()) count++;
      if (data.budgetQuote?.trim()) count++;
      if (data.verifierInterview) count++;
      if (count < 2) {
        setEvidenceError("Please provide at least 2 verification supports.");
        return;
      }
    } else {
      if (!data.budgetBreakdown?.trim()) {
        setEvidenceError("Budget breakdown is required for organization campaigns.");
        return;
      }
    }

    setEvidenceError("");
    setEvidence(data);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!basics || !evidence) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const isPrivate = basics.submitterType === "private";
    const evidenceList: EvidenceUpload[] = [];

    const addEvidence = (
      type: EvidenceTypeEnum,
      title: string,
      description: string,
      url: string,
      visibility: "public" | "private",
      mediaType: "image" | "pdf" | "link" = "image"
    ) => {
      if (!url.trim()) return;
      evidenceList.push({ type, title, description, url, visibility, mediaType });
    };

    if (isPrivate) {
      if (evidence.referralName?.trim()) {
        addEvidence(
          "campaign_referral_attestation",
          `Referral Attestation – ${basics.title}`,
          `Referral from ${evidence.referralName} (${evidence.referralRole || "Community member"})`,
          `referral://${evidence.referralContact || "contact-provided"}`,
          "private",
          "link"
        );
      }
      if (evidence.documentProof?.trim()) {
        addEvidence(
          "campaign_document_proof",
          `Document Proof – ${basics.title}`,
          evidence.documentRedactedNote
            ? `Document proof (${evidence.documentRedactedNote})`
            : "Supporting document proof",
          evidence.documentProof,
          "private",
          "pdf"
        );
      }
      if (evidence.budgetQuote?.trim()) {
        addEvidence(
          "campaign_budget_quote",
          `Budget Estimate – ${basics.title}`,
          "Budget quote or estimate for the campaign",
          evidence.budgetQuote,
          evidence.budgetQuotePublic ? "public" : "private",
          "pdf"
        );
      }
      if (evidence.verifierInterview) {
        addEvidence(
          "campaign_verifier_interview",
          `Verifier Interview – ${basics.title}`,
          "Submitter has confirmed availability for verification interview",
          `interview://confirmed-${Date.now()}`,
          "private",
          "link"
        );
      }
    } else {
      if (evidence.needProof?.trim()) {
        addEvidence(
          "campaign_need_photo",
          `Need Documentation – ${basics.title}`,
          "Photo/video evidence of need for this campaign",
          evidence.needProof,
          "public",
          "image"
        );
      }
      addEvidence(
        "campaign_budget_breakdown",
        `Budget Breakdown – ${basics.title}`,
        `Detailed budget for ${basics.title}`,
        evidence.budgetBreakdown || "",
        "public",
        "pdf"
      );
      if (evidence.supplierQuote?.trim()) {
        addEvidence(
          "campaign_endorsement_letter",
          `Supplier Quote – ${basics.title}`,
          "Supplier quote for campaign materials",
          evidence.supplierQuote,
          evidence.supplierQuotePublic ? "public" : "private",
          "pdf"
        );
      }
    }

    const result = await createCampaignSubmission({
      title:          basics.title,
      category:       basics.category,
      goalAmount:     basics.goal,
      locationLabel:  basics.location,
      description:    basics.description,
      organizationId: isPrivate ? null : (basics.organizationId || null),
      submitterType:  basics.submitterType,
      evidence:       evidenceList,
    });

    setIsSubmitting(false);

    if (!result) {
      setSubmitError("Submission failed. Please check your connection and try again.");
      return;
    }

    setSubmissionId(result.id);
    setSubmitted(true);
  };

  const categoryDisplay = (cat: string, label?: string) => {
    if (cat === "other" && label) return label;
    return CATEGORIES.find((c) => c.value === cat)?.label || cat;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
              Campaign Submitted
            </h1>
            <p className="text-muted-foreground mb-6">
              Your campaign has been submitted for verification. Our team will review
              the evidence
              {basics?.submitterType === "private"
                ? " while protecting your privacy"
                : " and budget"}
              {" "}before publishing.
            </p>

            <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
              <h3 className="font-medium text-foreground mb-3">Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Campaign</dt>
                  <dd className="font-medium text-foreground">{basics?.title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Submitted as</dt>
                  <dd className="font-medium text-foreground capitalize">
                    {basics?.submitterType === "private" ? "Private Individual" : "Organization"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-foreground">
                    {categoryDisplay(basics?.category || "", basics?.categoryLabel)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Goal</dt>
                  <dd className="font-medium text-foreground">
                    ${basics?.goal?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="text-xs px-2 py-1 rounded-full bg-pending/10 text-pending font-medium">
                    Pending Verification
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/verification")}>
                Back to Verification Hub
              </Button>
              <Button variant="outline" onClick={() => navigate("/appeals")}>
                View Existing Appeals
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back */}
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/verification"))}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            {step > 0 ? "Previous Step" : "Back to Verification"}
          </button>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center gap-1 mb-3">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length}:{" "}
              <span className="font-medium text-foreground">{STEPS[step]}</span>
            </p>
          </div>

          {/* ===================== Step 0: Campaign Basics ===================== */}
          {step === 0 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Campaign Details
              </h1>
              <Form {...basicsForm}>
                <form onSubmit={handleBasicsNext} className="space-y-5">
                  {/* Submitter Type */}
                  <FormField
                    control={basicsForm.control}
                    name="submitterType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submitting as</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-3"
                          >
                            <div
                              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                field.value === "organization"
                                  ? "border-primary bg-primary-light"
                                  : "border-border hover:border-primary/40"
                              }`}
                              onClick={() => field.onChange("organization")}
                            >
                              <RadioGroupItem value="organization" id="org" />
                              <Label htmlFor="org" className="cursor-pointer flex items-center gap-2">
                                <Building size={16} className="text-primary" />
                                Organization
                              </Label>
                            </div>
                            <div
                              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                field.value === "private"
                                  ? "border-primary bg-primary-light"
                                  : "border-border hover:border-primary/40"
                              }`}
                              onClick={() => field.onChange("private")}
                            >
                              <RadioGroupItem value="private" id="priv" />
                              <Label htmlFor="priv" className="cursor-pointer flex items-center gap-2">
                                <User size={16} className="text-primary" />
                                Individual / Family
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Organization dropdown (only for org submitter) */}
                  {submitterType === "organization" && (
                    <FormField
                      control={basicsForm.control}
                      name="organizationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your organization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allOrgs.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Private contact info */}
                  {submitterType === "private" && (
                    <div className="bg-muted/50 rounded-lg border border-border p-5 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Lock size={14} className="text-muted-foreground" />
                        Private Contact Info
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This information is kept private and only used for verification purposes.
                      </p>
                      <FormField
                        control={basicsForm.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicsForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={basicsForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={basicsForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Clean Water Well in Sindh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category with "Other" support */}
                  <FormField
                    control={basicsForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedCategory === "other" && (
                    <FormField
                      control={basicsForm.control}
                      name="categoryLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Refugee resettlement" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={basicsForm.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fundraising Goal ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicsForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location / Scope</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sindh Province, Pakistan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicsForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the need and how funds will be used..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* ===================== Step 1: Use of Funds ===================== */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-foreground">
                    Use of Funds
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Break down how each dollar will be spent
                  </p>
                </div>
              </div>

              <Form {...fundsForm}>
                <form onSubmit={handleFundsNext} className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder="e.g. Construction materials"
                          {...fundsForm.register(`items.${index}.item`)}
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          placeholder="Amount"
                          {...fundsForm.register(`items.${index}.amount`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="shrink-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ item: "", amount: 0 })}
                    className="w-full"
                  >
                    <Plus size={14} />
                    Add Line Item
                  </Button>

                  {fundsForm.formState.errors.items && (
                    <p className="text-sm text-destructive">
                      {fundsForm.formState.errors.items.message}
                    </p>
                  )}

                  <Button type="submit" className="w-full mt-4">
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* ===================== Step 2: Evidence Upload ===================== */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-foreground">
                    Campaign Evidence
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {basics?.submitterType === "private"
                      ? "Provide verification supports (no hardship media required)"
                      : "Upload proof of need and budget"}
                  </p>
                </div>
              </div>

              {evidenceError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-6">
                  <AlertCircle size={16} />
                  {evidenceError}
                </div>
              )}

              <form onSubmit={handleEvidenceNext} className="space-y-5">
                {basics?.submitterType === "private" ? (
                  /* ========== Private Campaign Evidence ========== */
                  <div className="space-y-5">
                    <div className="bg-accent-light/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Lock size={16} className="text-accent-foreground mt-0.5 shrink-0" />
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Privacy-first verification:</strong>{" "}
                          No photos or videos of hardship are required. Provide at least 2 of the
                          following verification supports.
                        </div>
                      </div>
                    </div>

                    {/* 1. Referral / Attestation */}
                    <div className="bg-card rounded-lg border border-border p-5">
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <UserCheck size={16} className="text-primary" />
                        Referral / Attestation
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Someone who can vouch for the campaign need. Stored privately.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Referrer Name
                          </label>
                          <Input
                            placeholder="e.g. Imam Ahmed"
                            {...evidenceForm.register("referralName")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Role
                          </label>
                          <Input
                            placeholder="e.g. Community leader"
                            {...evidenceForm.register("referralRole")}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Contact
                          </label>
                          <Input
                            placeholder="Email or phone"
                            {...evidenceForm.register("referralContact")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Document Proof */}
                    <div className="bg-card rounded-lg border border-border p-5">
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        Document Proof
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supporting documents (e.g. medical reports, eviction notices). Stored
                        privately.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Document URL
                          </label>
                          <Input
                            placeholder="https://... (private)"
                            {...evidenceForm.register("documentProof")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Redaction Note (optional)
                          </label>
                          <Input
                            placeholder='e.g. "Names redacted for privacy"'
                            {...evidenceForm.register("documentRedactedNote")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Budget Quote */}
                    <div className="bg-card rounded-lg border border-border p-5">
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <DollarSign size={16} className="text-primary" />
                        Budget Quote / Estimate
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1 block">
                            Budget URL
                          </label>
                          <Input
                            placeholder="https://..."
                            {...evidenceForm.register("budgetQuote")}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={evidenceForm.watch("budgetQuotePublic")}
                            onCheckedChange={(v) =>
                              evidenceForm.setValue("budgetQuotePublic", v)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            Make budget quote public
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Verifier Interview */}
                    <div className="bg-card rounded-lg border border-border p-5">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={evidenceForm.watch("verifierInterview")}
                          onCheckedChange={(v) =>
                            evidenceForm.setValue("verifierInterview", v === true)
                          }
                          className="mt-0.5"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            Verifier Interview Confirmation
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            I confirm I am available for a brief verification interview with the
                            Maddad review team.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========== Organization Campaign Evidence ========== */
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Need Photo / Video (Public, recommended)
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        URL to photos or video documenting the need
                      </p>
                      <Input
                        placeholder="https://... (optional but recommended)"
                        {...evidenceForm.register("needProof")}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Budget Breakdown (Public) *
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Detailed budget document URL
                      </p>
                      <Input
                        placeholder="https://..."
                        {...evidenceForm.register("budgetBreakdown")}
                      />
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-medium text-foreground mb-3">Optional</h3>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          Supplier Quote
                        </label>
                        <Input
                          placeholder="https://... (optional)"
                          {...evidenceForm.register("supplierQuote")}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Switch
                          checked={evidenceForm.watch("supplierQuotePublic")}
                          onCheckedChange={(v) =>
                            evidenceForm.setValue("supplierQuotePublic", v)
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          Make supplier quote public
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Review & Submit
                  <ArrowRight size={16} />
                </Button>
              </form>
            </div>
          )}

          {/* ===================== Step 3: Review ===================== */}
          {step === 3 && basics && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Review Campaign Submission
              </h1>

              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-medium text-foreground mb-3">Campaign</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Title</dt>
                      <dd className="font-medium text-foreground">{basics.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Submitted as</dt>
                      <dd className="font-medium text-foreground capitalize">
                        {basics.submitterType === "private"
                          ? "Private Individual"
                          : allOrgs.find((o) => o.id === basics.organizationId)?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium text-foreground">
                        {categoryDisplay(basics.category, basics.categoryLabel)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Goal</dt>
                      <dd className="font-medium text-foreground">
                        ${basics.goal.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium text-foreground">{basics.location}</dd>
                    </div>
                    {basics.submitterType === "private" && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Visibility</dt>
                        <dd className="font-medium text-foreground flex items-center gap-1">
                          <Lock size={12} /> Private
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {funds.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-medium text-foreground mb-3">Use of Funds</h3>
                    <ul className="space-y-2 text-sm">
                      {funds.map((f, i) => (
                        <li key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{f.item}</span>
                          <span className="font-medium text-foreground">
                            ${f.amount.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-medium text-foreground mb-3">Evidence</h3>
                  <ul className="space-y-2 text-sm">
                    {basics.submitterType === "private" ? (
                      <>
                        {evidence?.referralName && (
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle size={14} className="text-primary" />
                            Referral Attestation (Private)
                          </li>
                        )}
                        {evidence?.documentProof && (
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle size={14} className="text-primary" />
                            Document Proof (Private)
                            {evidence.documentRedactedNote && (
                              <span className="text-xs">
                                — {evidence.documentRedactedNote}
                              </span>
                            )}
                          </li>
                        )}
                        {evidence?.budgetQuote && (
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle size={14} className="text-primary" />
                            Budget Quote (
                            {evidence.budgetQuotePublic ? "Public" : "Private"})
                          </li>
                        )}
                        {evidence?.verifierInterview && (
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle size={14} className="text-primary" />
                            Verifier Interview Confirmed
                          </li>
                        )}
                      </>
                    ) : (
                      <>
                        {evidence?.needProof && (
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle size={14} className="text-primary" />
                            Need Photo/Video (Public)
                          </li>
                        )}
                        <li className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle size={14} className="text-primary" />
                          Budget Breakdown (Public)
                        </li>
                        {evidence?.supplierQuote && (
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle size={14} className="text-accent" />
                            Supplier Quote (
                            {evidence.supplierQuotePublic ? "Public" : "Private"})
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>

                {submitError && (
                  <p className="text-sm text-destructive text-center">{submitError}</p>
                )}
                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting…</>
                  ) : (
                    <><Shield size={18} /> Submit Campaign for Verification</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
