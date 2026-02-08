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
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  FileCheck,
  Upload,
  CheckCircle,
  Shield,
} from "lucide-react";
import {
  addEvidenceOverride,
  addOrgSubmission,
  type OrgSubmission,
} from "@/hooks/useVerificationStore";
import type { EvidenceItem, EvidenceType } from "@/types/verification";

// ---------- Schema ----------

const orgBasicsSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required").max(200),
  location: z.string().trim().min(2, "Location is required").max(200),
  website: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
  contactEmail: z.string().trim().email("Must be a valid email"),
  contactPhone: z.string().trim().min(5, "Phone number is required").max(30),
});

const evidenceUploadSchema = z.object({
  orgRegistration: z.string().trim().min(1, "Registration document URL required"),
  orgBankVerified: z.string().trim().min(1, "Bank verification URL required"),
  leadership: z.string().trim().min(1, "Leadership document URL required"),
  charityStatus: z.string().trim().optional(),
  pastProjectProof: z.string().trim().optional(),
});

type OrgBasics = z.infer<typeof orgBasicsSchema>;
type EvidenceUploads = z.infer<typeof evidenceUploadSchema>;

const STEPS = ["Organization Basics", "Required Evidence", "Optional Evidence", "Review & Submit"];

export default function OrgVerificationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orgBasics, setOrgBasics] = useState<OrgBasics | null>(null);
  const [evidenceUploads, setEvidenceUploads] = useState<EvidenceUploads | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  // Step 1: Org basics
  const basicsForm = useForm<OrgBasics>({
    resolver: zodResolver(orgBasicsSchema),
    defaultValues: {
      name: "",
      location: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  // Step 2+3: Evidence
  const evidenceForm = useForm<EvidenceUploads>({
    resolver: zodResolver(evidenceUploadSchema),
    defaultValues: {
      orgRegistration: "",
      orgBankVerified: "",
      leadership: "",
      charityStatus: "",
      pastProjectProof: "",
    },
  });

  const handleBasicsNext = basicsForm.handleSubmit((data) => {
    setOrgBasics(data);
    setStep(1);
  });

  const handleEvidenceNext = evidenceForm.handleSubmit((data) => {
    setEvidenceUploads(data);
    setStep(2);
  });

  const handleOptionalNext = () => {
    // Optional fields - just advance with whatever's in the form
    const data = evidenceForm.getValues();
    setEvidenceUploads(data);
    setStep(3);
  };

  const handleSubmit = () => {
    if (!orgBasics || !evidenceUploads) return;

    const orgId = `org-${Date.now()}`;
    const now = new Date().toISOString();

    // Create evidence items
    const evidenceItems: EvidenceItem[] = [];

    const addEvidence = (
      type: EvidenceType,
      title: string,
      description: string,
      url: string,
      visibility: "public" | "private"
    ) => {
      const item: EvidenceItem = {
        id: `ev-sub-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        title,
        description,
        media: { kind: "pdf", url },
        date: now.slice(0, 10),
        visibility,
        status: "pending",
      };
      evidenceItems.push(item);
      addEvidenceOverride(item);
    };

    // Required
    addEvidence(
      "org_registration",
      `Registration – ${orgBasics.name}`,
      `Official registration document for ${orgBasics.name}`,
      evidenceUploads.orgRegistration,
      "public"
    );
    addEvidence(
      "org_financial_audit",
      `Bank Verification – ${orgBasics.name}`,
      `Bank account verification for ${orgBasics.name}`,
      evidenceUploads.orgBankVerified,
      "private"
    );
    addEvidence(
      "org_board_resolution",
      `Leadership – ${orgBasics.name}`,
      `Leadership/trustees documentation for ${orgBasics.name}`,
      evidenceUploads.leadership,
      "private"
    );

    // Optional
    if (evidenceUploads.charityStatus) {
      addEvidence(
        "org_tax_status",
        `Charity Status – ${orgBasics.name}`,
        `Charity/tax-exempt status documentation`,
        evidenceUploads.charityStatus,
        "public"
      );
    }

    // Create org submission
    const submission: OrgSubmission = {
      id: orgId,
      name: orgBasics.name,
      location: orgBasics.location,
      website: orgBasics.website || "",
      contactEmail: orgBasics.contactEmail,
      contactPhone: orgBasics.contactPhone,
      status: "pending_verification",
      evidenceIds: evidenceItems.map((e) => e.id),
      submittedAt: now,
    };

    addOrgSubmission(submission);
    setSubmissionId(orgId);
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
              Submission Received
            </h1>
            <p className="text-muted-foreground mb-6">
              Your organization verification request has been submitted. Our verification team will review the evidence and respond within 5–7 business days.
            </p>

            <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
              <h3 className="font-medium text-foreground mb-4">What Happens Next</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  Our team reviews each evidence document for authenticity
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  We verify registration with the issuing authority
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  Once approved, your organization receives the Verified badge
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  You can then submit campaigns for fundraising
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/verification")}>
                Back to Verification Hub
              </Button>
              <Button variant="outline" onClick={() => navigate("/verify/campaign")}>
                Submit a Campaign
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

          {/* Step 0: Org Basics */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-foreground">
                    Organization Details
                  </h1>
                  <p className="text-sm text-muted-foreground">Tell us about your organization</p>
                </div>
              </div>

              <Form {...basicsForm}>
                <form onSubmit={handleBasicsNext} className="space-y-5">
                  <FormField
                    control={basicsForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Al-Rahma Relief Foundation" {...field} />
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Toronto, ON, Canada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={basicsForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-org.org" {...field} />
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
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@your-org.org" type="email" {...field} />
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
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
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

          {/* Step 1: Required Evidence */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileCheck size={20} className="text-primary" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-foreground">
                    Required Evidence
                  </h1>
                  <p className="text-sm text-muted-foreground">Upload the required documents</p>
                </div>
              </div>

              <Form {...evidenceForm}>
                <form onSubmit={handleEvidenceNext} className="space-y-5">
                  <FormField
                    control={evidenceForm.control}
                    name="orgRegistration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Registration (Public)</FormLabel>
                        <FormDescription>Official registration certificate or document URL</FormDescription>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Upload size={16} className="text-muted-foreground shrink-0" />
                            <Input placeholder="https://drive.google.com/..." {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evidenceForm.control}
                    name="orgBankVerified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Verification (Private)</FormLabel>
                        <FormDescription>Bank account verification — kept private, never shared publicly</FormDescription>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-muted-foreground shrink-0" />
                            <Input placeholder="https://drive.google.com/..." {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evidenceForm.control}
                    name="leadership"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leadership / Trustees (Private)</FormLabel>
                        <FormDescription>Documentation of board members or trustees — kept private</FormDescription>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Shield size={16} className="text-muted-foreground shrink-0" />
                            <Input placeholder="https://drive.google.com/..." {...field} />
                          </div>
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

          {/* Step 2: Optional Evidence */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Upload size={20} className="text-accent" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-foreground">
                    Optional Evidence
                  </h1>
                  <p className="text-sm text-muted-foreground">Strengthen your application with additional proof</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Charity Status Certificate (Public)</label>
                  <p className="text-xs text-muted-foreground">Tax-exempt or registered charity status</p>
                  <Input
                    placeholder="https://drive.google.com/... (optional)"
                    value={evidenceForm.watch("charityStatus") || ""}
                    onChange={(e) => evidenceForm.setValue("charityStatus", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Past Project Proof (Public)</label>
                  <p className="text-xs text-muted-foreground">Evidence of previous successful projects</p>
                  <Input
                    placeholder="https://drive.google.com/... (optional)"
                    value={evidenceForm.watch("pastProjectProof") || ""}
                    onChange={(e) => evidenceForm.setValue("pastProjectProof", e.target.value)}
                  />
                </div>

                <Button onClick={handleOptionalNext} className="w-full">
                  Review & Submit
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && orgBasics && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Review Your Submission
              </h1>

              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-medium text-foreground mb-3">Organization</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium text-foreground">{orgBasics.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium text-foreground">{orgBasics.location}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium text-foreground">{orgBasics.contactEmail}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd className="font-medium text-foreground">{orgBasics.contactPhone}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-medium text-foreground mb-3">Evidence Documents</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-primary" />
                      Registration Document (Public)
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-primary" />
                      Bank Verification (Private)
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={14} className="text-primary" />
                      Leadership / Trustees (Private)
                    </li>
                    {evidenceUploads?.charityStatus && (
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle size={14} className="text-accent" />
                        Charity Status (Public, Optional)
                      </li>
                    )}
                    {evidenceUploads?.pastProjectProof && (
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle size={14} className="text-accent" />
                        Past Project Proof (Public, Optional)
                      </li>
                    )}
                  </ul>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Shield size={18} />
                  Submit for Verification
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
