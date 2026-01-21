import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerificationBadge } from "@/components/VerificationBadge";
import { 
  Shield, 
  FileCheck, 
  Users, 
  Building, 
  Landmark,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const verificationSteps = [
  {
    icon: Building,
    title: "Organization Registration",
    description: "We verify that the organization is legally registered in their country of operation with appropriate nonprofit status.",
    checks: [
      "Government registration documents",
      "Tax-exempt status (where applicable)",
      "Active status confirmation"
    ]
  },
  {
    icon: Landmark,
    title: "Financial Verification",
    description: "We ensure funds are managed responsibly through validated banking and financial oversight.",
    checks: [
      "Bank account verification",
      "Financial statements review",
      "Audit reports (for larger orgs)"
    ]
  },
  {
    icon: Users,
    title: "Leadership & Operations",
    description: "We confirm the organization has legitimate leadership and operational capacity.",
    checks: [
      "Board member verification",
      "Staff credentials check",
      "Operational history review"
    ]
  },
  {
    icon: FileCheck,
    title: "Program Validation",
    description: "We validate that humanitarian programs are real, needed, and properly planned.",
    checks: [
      "Needs assessment documentation",
      "Distribution plan review",
      "Local partner verification"
    ]
  }
];

const statusExplanations = [
  {
    status: "verified" as const,
    title: "Verified",
    description: "This organization has passed all verification checks. Their registration, finances, and operations have been validated. Donations are protected by our transparency guarantees.",
    color: "bg-primary-light text-primary"
  },
  {
    status: "pending" as const,
    title: "Pending Verification",
    description: "This organization is currently undergoing our verification process. Some initial checks have passed, but the full review is not yet complete. Donate with awareness that verification is in progress.",
    color: "bg-accent-light text-accent-foreground"
  },
  {
    status: "unverified" as const,
    title: "Unverified",
    description: "This organization has not yet started or completed our verification process. We cannot guarantee the legitimacy of their operations. We recommend waiting for verification before donating.",
    color: "bg-muted text-muted-foreground"
  }
];

export default function Verification() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-light to-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6">
                <Shield size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                How We Verify Organizations
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trust is the foundation of effective giving. We maintain rigorous verification standards to ensure your donations reach legitimate, accountable organizations.
              </p>
            </div>
          </div>
        </section>

        {/* Status Explanations */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">
              Understanding Verification Status
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {statusExplanations.map((status, index) => (
                <div 
                  key={status.title}
                  className="bg-card rounded-xl border border-border p-6 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
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
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Verification Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every organization goes through a comprehensive four-step verification process before receiving the "Verified" badge.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {verificationSteps.map((step, index) => (
                <div 
                  key={step.title}
                  className="bg-card rounded-xl border border-border p-8 card-interactive animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                      <step.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary mb-1">Step {index + 1}</div>
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-5">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {step.checks.map((check, checkIndex) => (
                      <li key={checkIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={14} className="text-primary shrink-0" />
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
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Continuous Monitoring
              </h2>
              <p className="text-muted-foreground mb-8">
                Verification isn't just a one-time event. We continuously monitor verified organizations to ensure they maintain our standards. Organizations must submit regular updates, and we conduct periodic re-verification.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-card rounded-lg px-6 py-4 border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">90 days</div>
                  <div className="text-sm text-muted-foreground">Re-verification cycle</div>
                </div>
                <div className="bg-card rounded-lg px-6 py-4 border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">24 hours</div>
                  <div className="text-sm text-muted-foreground">Concern response time</div>
                </div>
                <div className="bg-card rounded-lg px-6 py-4 border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Transparency commitment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to give with confidence?
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore verified humanitarian needs and make an impact you can trust.
              </p>
              <Button asChild>
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
