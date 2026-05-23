import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShieldCheck,
  MapPin,
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── FAQ item ──────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is there a cost to join?",
    a: "No. Maddad is completely free for organizations.",
  },
  {
    q: "Do you take a percentage of donations?",
    a: "No. 100% of every donation goes directly to your campaign. Our platform is funded entirely by voluntary donor tips — donors can choose to add a tip to support Maddad's operations.",
  },
  {
    q: "What if we're not a registered charity?",
    a: "Masjids, MSAs, and community groups are welcome to apply. Note: CRA-compliant tax receipts require a valid CRA registration number. We'll note your eligibility during the review process.",
  },
  {
    q: "How long does verification take?",
    a: "We aim to review all applications within 3 business days. For registered charities with complete documentation, reviews are often faster.",
  },
  {
    q: "Can we run multiple campaigns?",
    a: "Yes. Once approved, you can create and manage multiple campaigns from your organization dashboard. Each campaign goes through a lightweight review before going live.",
  },
  {
    q: "What happens after we apply?",
    a: "You'll receive a confirmation email immediately. Our team will review your application and reach out within 3 business days. If approved, we'll create your organization page and first campaign draft, then send you a signup link.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="text-sm text-muted-foreground pb-5 leading-relaxed pr-6">{a}</p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Partners() {
  const benefits = [
    {
      Icon: DollarSign,
      title: "Zero platform fees",
      description:
        "We take nothing from your campaigns. Every dollar donated goes to your cause. Maddad is funded by voluntary donor tips — donors choose whether to add one.",
    },
    {
      Icon: ShieldCheck,
      title: "Verified trust",
      description:
        "Our verification badge signals to donors that your campaign is legitimate. In a space crowded with unverified appeals, a Maddad badge builds real confidence.",
    },
    {
      Icon: MapPin,
      title: "Ontario-focused",
      description:
        "Built specifically for Ontario's Muslim community. CRA-compliant tax receipts, local credibility, and a donor base that cares about your neighbourhood.",
    },
  ];

  const whoCanApply = [
    { Icon: Building2, label: "Registered Canadian charities", description: "With or without a CRA number" },
    { Icon: BookOpen, label: "Masjids and Islamic centres", description: "Community mosques and prayer spaces" },
    { Icon: GraduationCap, label: "University MSAs", description: "Muslim Students' Associations and campus clubs" },
    { Icon: Users, label: "Community organizations", description: "Informal groups doing meaningful work" },
  ];

  const processSteps = [
    { n: 1, title: "Apply", description: "Fill out a 4-step application. Takes about 10 minutes.", cta: null },
    { n: 2, title: "We verify", description: "Our team reviews your application within 3 business days.", cta: null },
    { n: 3, title: "Go live", description: "We create your campaign draft and send you a signup link.", cta: null },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 md:py-28 pattern-arch">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <ShieldCheck size={14} />
                For organizations
              </div>
              <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Run verified, transparent campaigns on Maddad
              </h1>
              <p className="text-xl text-muted-foreground text-body max-w-2xl mb-8">
                0% platform fee. Every dollar goes to your cause.
                We verify so your donors trust.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/apply">
                  <Button size="lg" className="gap-2">
                    Apply to join
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">See how it works</Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ──────────────────────────────────────────────────── */}
        <section className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="heading-section text-3xl text-foreground mb-4">
                Why partner with Maddad?
              </h2>
              <p className="text-muted-foreground">
                Built for the Muslim community, by the Muslim community.
                No hidden fees, no fine print.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map(({ Icon, title, description }) => (
                <div key={title} className="bg-card rounded-xl border border-border p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who can apply ──────────────────────────────────────────────── */}
        <section className="section-spacing-sm section-warm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="heading-section text-3xl text-foreground mb-3 text-center">
                Who can apply?
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                We welcome a broad range of Ontario-based Muslim-led organizations.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {whoCanApply.map(({ Icon, label, description }) => (
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
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="heading-section text-3xl text-foreground mb-4">
                Simple 3-step process
              </h2>
              <p className="text-muted-foreground">No complicated onboarding. No waiting months to go live.</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-0">
                {processSteps.map((s, idx) => (
                  <div key={s.n} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 flex-1">
                    <div className="flex items-center gap-4 sm:flex-col sm:gap-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shrink-0 sm:mb-4">
                        {s.n}
                      </div>
                      {idx < processSteps.length - 1 && (
                        <div className="hidden sm:block w-full h-px bg-border sm:absolute" />
                      )}
                    </div>
                    <div className="sm:text-center">
                      <p className="font-serif text-base font-semibold text-foreground">{s.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/apply">
                  <Button size="lg" className="gap-2">
                    Apply now — it&apos;s free
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── What you get ──────────────────────────────────────────────── */}
        <section className="section-spacing-sm section-cream border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="heading-section text-3xl text-foreground mb-8 text-center">
              What you get with Maddad
            </h2>
            <div className="bg-card rounded-xl border border-border p-6 md:p-8">
              <ul className="space-y-3">
                {[
                  "Verified organization page visible to all Maddad donors",
                  "Unlimited campaigns with full donor transparency",
                  "CRA-compliant tax receipts for registered charities",
                  "Real-time donation tracking dashboard",
                  "Donation history and impact reports",
                  "0% platform fee — always",
                  "Support from the Maddad team during onboarding",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="heading-section text-3xl text-foreground mb-8 text-center">
              Frequently asked questions
            </h2>
            <div className="bg-card rounded-xl border border-border px-6">
              {FAQS.map(faq => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="section-spacing-sm bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="heading-section text-3xl text-primary-foreground mb-4">
              Ready to run your first campaign?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join Ontario&apos;s trusted platform for Islamic charitable giving.
              Free to apply. No fees. No commitment.
            </p>
            <Link to="/apply">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 bg-white text-primary hover:bg-white/90"
              >
                Apply to join Maddad
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
