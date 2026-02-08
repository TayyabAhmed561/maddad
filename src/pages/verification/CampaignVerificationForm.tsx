import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import {
  addEvidenceOverride,
  addCampaignSubmission,
  getOrgSubmissions,
  type CampaignSubmission,
  type UseOfFundsItem,
} from "@/hooks/useVerificationStore";
import type { EvidenceItem, EvidenceType, MilestoneUpdate } from "@/types/verification";

// ---------- Schemas ----------

const campaignBasicsSchema = z.object({
  organizationId: z.string().min(1, "Select an organization"),
  title: z.string().trim().min(3, "Campaign title is required").max(200),
  category: z.string().min(1, "Select a category"),
  goal: z.coerce.number().min(100, "Minimum goal is $100"),
  location: z.string().trim().min(2, "Location scope is required").max(200),
  description: z.string().trim().min(10, "Description is required").max(2000),
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
  needProof: z.string().trim().min(1, "Need photo/video URL required"),
  budgetBreakdown: z.string().trim().min(1, "Budget breakdown URL required"),
  supplierQuote: z.string().trim().optional(),
  supplierQuotePublic: z.boolean().optional(),
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
];

// Known orgs from the map data + any localStorage submissions
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

  // Merge localStorage org submissions
  const localOrgs = getOrgSubmissions().map((o) => ({ id: o.id, name: o.name }));
  const allOrgs = [...KNOWN_ORGS, ...localOrgs];

  const basicsForm = useForm<CampaignBasics>({
    resolver: zodResolver(campaignBasicsSchema),
    defaultValues: {
      organizationId: "",
      title: "",
      category: "",
      goal: 0,
      location: "",
      description: "",
    },
  });

  const fundsForm = useForm<UseOfFundsForm>({
    resolver: zodResolver(useOfFundsSchema),
    defaultValues: {
      items: [{ item: "", amount: 0 }],
    },
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

  const handleEvidenceNext = evidenceForm.handleSubmit((data) => {
    setEvidence(data);
    setStep(3);
  });

  const handleSubmit = () => {
    if (!basics || !evidence) return;

    const campaignId = `camp-${Date.now()}`;
    const now = new Date().toISOString();
    const orgName = allOrgs.find((o) => o.id === basics.organizationId)?.name || "Unknown Org";

    // Create evidence items
    const evidenceItems: EvidenceItem[] = [];

    const addEvidence = (
      type: EvidenceType,
      title: string,
      description: string,
      url: string,
      visibility: "public" | "private",
      kind: "image" | "pdf" = "image"
    ) => {
      const item: EvidenceItem = {
        id: `ev-sub-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        title,
        description,
        media: { kind, url },
        date: now.slice(0, 10),
        visibility,
        status: "pending",
      };
      evidenceItems.push(item);
      addEvidenceOverride(item);
    };

    addEvidence(
      "campaign_need_photo",
      `Need Documentation – ${basics.title}`,
      `Photo/video evidence of need for this campaign`,
      evidence.needProof,
      "public"
    );

    addEvidence(
      "campaign_budget_breakdown",
      `Budget Breakdown – ${basics.title}`,
      `Detailed budget for ${basics.title}`,
      evidence.budgetBreakdown,
      "public",
      "pdf"
    );

    if (evidence.supplierQuote) {
      addEvidence(
        "campaign_endorsement_letter",
        `Supplier Quote – ${basics.title}`,
        `Supplier quote for campaign materials`,
        evidence.supplierQuote,
        evidence.supplierQuotePublic ? "public" : "private",
        "pdf"
      );
    }

    // Create milestone timeline with verified=pending
    const milestones: MilestoneUpdate[] = [
      {
        stage: "verified",
        date: now.slice(0, 10),
        summary: "Campaign submitted for verification. Awaiting review.",
        evidenceIds: evidenceItems.map((e) => e.id),
      },
    ];

    const submission: CampaignSubmission = {
      id: campaignId,
      organizationId: basics.organizationId,
      organizationName: orgName,
      title: basics.title,
      category: basics.category,
      goal: basics.goal,
      location: basics.location,
      useOfFunds: funds,
      status: "pending_verification",
      evidenceIds: evidenceItems.map((e) => e.id),
      milestones,
      submittedAt: now,
    };

    addCampaignSubmission(submission);
    setSubmissionId(campaignId);
    setSubmitted(true);
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
              Your campaign has been submitted for verification. Our team will review the evidence and budget before publishing.
            </p>

            <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
              <h3 className="font-medium text-foreground mb-3">Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Campaign</dt>
                  <dd className="font-medium text-foreground">{basics?.title}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Goal</dt>
                  <dd className="font-medium text-foreground">${basics?.goal?.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="badge-pending text-xs">Pending Verification</dd>
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
              Step {step + 1} of {STEPS.length}: <span className="font-medium text-foreground">{STEPS[step]}</span>
            </p>
          </div>

          {/* Step 0: Campaign Basics */}
          {step === 0 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Campaign Details
              </h1>
              <Form {...basicsForm}>
                <form onSubmit={handleBasicsNext} className="space-y-5">
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

          {/* Step 1: Use of Funds */}
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
                          {...fundsForm.register(`items.${index}.amount`, { valueAsNumber: true })}
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

          {/* Step 2: Evidence Upload */}
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
                  <p className="text-sm text-muted-foreground">Upload proof of need and budget</p>
                </div>
              </div>

              <Form {...evidenceForm}>
                <form onSubmit={handleEvidenceNext} className="space-y-5">
                  <FormField
                    control={evidenceForm.control}
                    name="needProof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Need Photo / Video (Public)</FormLabel>
                        <FormDescription>URL to photos or video documenting the need</FormDescription>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evidenceForm.control}
                    name="budgetBreakdown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Breakdown (Public)</FormLabel>
                        <FormDescription>Detailed budget document URL</FormDescription>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">Optional</h3>
                    <FormField
                      control={evidenceForm.control}
                      name="supplierQuote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Quote</FormLabel>
                          <FormControl>
                            <Input placeholder="https://... (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <Switch
                        checked={evidenceForm.watch("supplierQuotePublic")}
                        onCheckedChange={(v) => evidenceForm.setValue("supplierQuotePublic", v)}
                      />
                      <span className="text-sm text-muted-foreground">Make supplier quote public</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Review & Submit
                    <ArrowRight size={16} />
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Step 3: Review */}
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
                      <dt className="text-muted-foreground">Organization</dt>
                      <dd className="font-medium text-foreground">
                        {allOrgs.find((o) => o.id === basics.organizationId)?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium text-foreground capitalize">{basics.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Goal</dt>
                      <dd className="font-medium text-foreground">${basics.goal.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium text-foreground">{basics.location}</dd>
                    </div>
                  </dl>
                </div>

                {funds.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-medium text-foreground mb-3">Use of Funds</h3>
                    <ul className="space-y-2 text-sm">
                      {funds.map((f, i) => (
                        <li key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{f.item}</span>
                          <span className="font-medium text-foreground">${f.amount.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-medium text-foreground mb-3">Evidence</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-primary" />
                      Need Photo/Video (Public)
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-primary" />
                      Budget Breakdown (Public)
                    </li>
                    {evidence?.supplierQuote && (
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle size={14} className="text-accent" />
                        Supplier Quote ({evidence.supplierQuotePublic ? "Public" : "Private"})
                      </li>
                    )}
                  </ul>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Shield size={18} />
                  Submit Campaign for Verification
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
