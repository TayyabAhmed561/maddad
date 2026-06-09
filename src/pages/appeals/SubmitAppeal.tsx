import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Heart, Shield, Users, ArrowRight } from "lucide-react";
import { submitAppealIntake } from "@/lib/queries/appealIntakes";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";
import type { AppealIntakeInsert } from "@/lib/queries/appealIntakes";

type NeedType = AppealIntakeInsert["need_type"];

const NEED_TYPE_LABELS: Record<NeedType, string> = {
  medical:   "Medical",
  housing:   "Housing",
  education: "Education",
  emergency: "Emergency",
  other:     "Other",
};

const WHAT_WE_ACCEPT = [
  { Icon: Heart,  label: "Medical & health needs",   description: "Treatment costs, medical equipment, rehabilitation" },
  { Icon: Users,  label: "Housing & displacement",   description: "Emergency shelter, rental arrears, relocation" },
  { Icon: Shield, label: "Education support",        description: "School fees, supplies, university tuition" },
];

export default function SubmitAppeal() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    need_type: NeedType | "";
    description: string;
    endorsing_contact: string;
  }>({
    name: "",
    email: "",
    need_type: "",
    description: "",
    endorsing_contact: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descLen = form.description.length;
  const DESC_MAX = 500;

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.need_type) { setError("Please select a need type."); return; }
    if (form.description.trim().length < 30) { setError("Please describe the need in at least 30 characters."); return; }

    setSubmitting(true);
    setError(null);

    const ok = await submitAppealIntake({
      name:              sanitizeText(form.name, 200),
      email:             sanitizeEmail(form.email),
      need_type:         form.need_type,
      description:       sanitizeText(form.description, 500),
      endorsing_contact: sanitizeText(form.endorsing_contact, 300),
    });

    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again or contact us.");
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Appeal submitted
            </h1>
            <p className="text-muted-foreground">
              JazakAllah khayran. Our team will review your submission and reach out within 3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/appeals">
                <Button variant="outline">View community appeals</Button>
              </Link>
              <Link to="/">
                <Button>Return home</Button>
              </Link>
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

      <main className="flex-1">

        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users size={14} />
              Community appeals
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Submit a community appeal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Do you or someone you know have a genuine need? We review every appeal and list verified ones on Maddad for the community to support.
            </p>
          </div>
        </section>

        {/* What we accept */}
        <section className="py-14 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-8 text-center">
              What we accept
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {WHAT_WE_ACCEPT.map(({ Icon, label, description }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's required */}
        <section className="py-14 border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 text-center">
              What's required
            </h2>
            <ul className="space-y-3 max-w-xl mx-auto">
              {[
                "A brief, honest description of the need",
                "Contact information for a masjid imam or known community leader who can vouch for the need",
                "Your name and email so we can follow up",
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-xl">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-8 text-center">
              Submit your appeal
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="need_type">Type of need</Label>
                <Select
                  value={form.need_type}
                  onValueChange={v => set("need_type", v)}
                >
                  <SelectTrigger id="need_type">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(NEED_TYPE_LABELS) as NeedType[]).map(k => (
                      <SelectItem key={k} value={k}>{NEED_TYPE_LABELS[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Describe the need</Label>
                  <span className={`text-xs ${descLen > DESC_MAX ? "text-destructive" : "text-muted-foreground"}`}>
                    {descLen}/{DESC_MAX}
                  </span>
                </div>
                <Textarea
                  id="description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  maxLength={DESC_MAX}
                  placeholder="Please describe the situation and the specific need. The more context you provide, the faster we can review."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endorsing_contact">
                  Endorsing contact
                </Label>
                <Input
                  id="endorsing_contact"
                  required
                  value={form.endorsing_contact}
                  onChange={e => set("endorsing_contact", e.target.value)}
                  placeholder="Name, role, and contact (e.g. Imam Abdullah, Masjid Al-Noor, 416-555-0000)"
                />
                <p className="text-xs text-muted-foreground">
                  A local imam, masjid representative, or community leader who can vouch for this need.
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={submitting || descLen > DESC_MAX}
              >
                {submitting ? "Submitting…" : (
                  <>Submit appeal <ArrowRight size={16} /></>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                All submissions are reviewed manually. We typically respond within 3 business days.
              </p>
            </form>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
