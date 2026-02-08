import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import {
  Shield,
  FileCheck,
  Users,
  Building,
  Landmark,
  CheckCircle,
  ArrowRight,
  Eye,
  ClipboardList,
} from "lucide-react";
import { getVerifierMode, setVerifierMode as persistVerifierMode } from "@/hooks/useVerificationStore";

const verificationSteps = [
  {
    icon: Building,
    title: "Organization Registration",
    description: "We verify that the organization is legally registered in their country of operation with appropriate nonprofit status.",
    checks: [
      "Government registration documents",
      "Tax-exempt status (where applicable)",
      "Active status confirmation",
    ],
  },
  {
    icon: Landmark,
    title: "Financial Verification",
    description: "We ensure funds are managed responsibly through validated banking and financial oversight.",
    checks: [
      "Bank account verification",
      "Financial statements review",
      "Audit reports (for larger orgs)",
    ],
  },
  {
    icon: Users,
    title: "Leadership & Operations",
    description: "We confirm the organization has legitimate leadership and operational capacity.",
    checks: [
      "Board member verification",
      "Staff credentials check",
      "Operational history review",
    ],
  },
  {
    icon: FileCheck,
    title: "Program Validation",
    description: "We validate that humanitarian programs are real, needed, and properly planned.",
    checks: [
      "Needs assessment documentation",
      "Distribution plan review",
      "Local partner verification",
    ],
  },
];

const statusExplanations = [
  {
    status: "verified" as const,
    title: "Verified",
    description: "This organization has passed all verification checks. Their registration, finances, and operations have been validated. Donations are protected by our transparency guarantees.",
  },
  {
    status: "pending" as const,
    title: "Pending Verification",
    description: "This organization is currently undergoing our verification process. Some initial checks have passed, but the full review is not yet complete. Donate with awareness that verification is in progress.",
  },
  {
    status: "unverified" as const,
    title: "Unverified",
    description: "This organization has not yet started or completed our verification process. We cannot guarantee the legitimacy of their operations. We recommend waiting for verification before donating.",
  },
];

export default function Verification() {
  const [verifierMode, setVerifierModeLocal] = useState(getVerifierMode());

  const toggleVerifierMode = (enabled: boolean) => {
    persistVerifierMode(enabled);
    setVerifierModeLocal(enabled);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-light/40 via-background to-accent-light/30 py-20 md:py-24 pattern-subtle">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-primary text-primary-foreground mb-8 shadow-warm">
                <Shield size={36} />
              </div>
              <h1 className="heading-display text-4xl md:text-5xl text-foreground mb-5">
                Verification Hub
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-body">
                Trust is the foundation of effective giving. Submit your organization or campaign for verification, or review pending submissions.
              </p>
            </div>
          </div>
        </section>

        {/* Action Hub */}
        <section className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-section text-2xl text-foreground text-center mb-10">
                Get Started
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Verify Organization */}
                <Link
                  to="/verify/organization"
                  className="bg-card rounded-xl border border-border p-8 card-interactive text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Building size={26} className="text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Verify an Organization
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit your nonprofit's registration, financials, and leadership documentation for review.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Start Application <ArrowRight size={14} />
                  </span>
                </Link>

                {/* Submit Campaign */}
                <Link
                  to="/verify/campaign"
                  className="bg-card rounded-xl border border-border p-8 card-interactive text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <ClipboardList size={26} className="text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Submit a Campaign
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit a new fundraising campaign with evidence of need, budget breakdown, and implementation plan.
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all">
                    Submit Campaign <ArrowRight size={14} />
                  </span>
                </Link>
              </div>

              {/* Verifier Dashboard Access */}
              <div className="bg-muted/50 rounded-xl border border-border p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Eye size={20} className="text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Verifier Mode
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Enable to access the review dashboard for pending submissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={verifierMode}
                      onCheckedChange={toggleVerifierMode}
                    />
                    {verifierMode && (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/verifier">
                          Open Dashboard
                          <ArrowRight size={14} />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Explanations */}
        <section className="section-spacing-sm border-b border-border section-cream">
          <div className="container mx-auto px-4">
            <h2 className="heading-section text-2xl text-foreground text-center mb-12">
              Understanding Verification Status
            </h2>

            <div className="grid md:grid-cols-3 gap-7 max-w-5xl mx-auto">
              {statusExplanations.map((status, index) => (
                <div
                  key={status.title}
                  className="bg-card rounded-xl border border-border p-7 animate-fade-in-up shadow-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <VerificationBadge status={status.status} />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {status.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="section-spacing bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="heading-section text-3xl md:text-4xl text-foreground mb-5">
                Our Verification Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-body">
                Every organization goes through a comprehensive four-step verification process before receiving the "Verified" badge.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="bg-background rounded-xl border border-border p-8 md:p-10 card-interactive animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                      <step.icon size={26} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium gold-text mb-1.5">Step {index + 1}</div>
                      <h3 className="text-xl font-serif font-semibold text-foreground">{step.title}</h3>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 text-body">
                    {step.description}
                  </p>

                  <ul className="space-y-3">
                    {step.checks.map((check, checkIndex) => (
                      <li key={checkIndex} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle size={15} className="text-primary shrink-0" />
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ongoing Monitoring */}
        <section className="section-spacing section-warm pattern-geometric">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-section text-2xl md:text-3xl text-foreground mb-5">
                Continuous Monitoring
              </h2>
              <p className="text-muted-foreground mb-10 text-body">
                Verification isn't just a one-time event. We continuously monitor verified organizations to ensure they maintain our standards. Organizations must submit regular updates, and we conduct periodic re-verification.
              </p>

              <div className="flex flex-wrap justify-center gap-5">
                <div className="bg-card rounded-xl px-8 py-6 border border-border shadow-card">
                  <div className="font-serif text-3xl font-bold text-primary mb-2">90 days</div>
                  <div className="text-sm text-muted-foreground">Re-verification cycle</div>
                </div>
                <div className="bg-card rounded-xl px-8 py-6 border border-border shadow-card">
                  <div className="font-serif text-3xl font-bold text-primary mb-2">24 hours</div>
                  <div className="text-sm text-muted-foreground">Concern response time</div>
                </div>
                <div className="bg-card rounded-xl px-8 py-6 border border-border shadow-card">
                  <div className="font-serif text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Transparency commitment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="heading-section text-2xl text-foreground mb-5">
                Ready to give with confidence?
              </h2>
              <p className="text-muted-foreground mb-8 text-body">
                Explore verified humanitarian needs and make an impact you can trust.
              </p>
              <Button size="lg" asChild>
                <Link to="/explore">
                  Explore Verified Needs
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
