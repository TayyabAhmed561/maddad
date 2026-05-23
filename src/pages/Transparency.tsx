import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, DollarSign, FileCheck } from "lucide-react";

export default function Transparency() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        <section className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="heading-display text-4xl text-foreground mb-4">
              How Maddad ensures transparency
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Every decision we make is designed to protect the trust between donors and recipients.
            </p>
          </div>
        </section>

        <section className="section-spacing-sm">
          <div className="container mx-auto px-4 max-w-3xl space-y-12">

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <ShieldCheck size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="heading-section text-2xl text-foreground mb-3">Verification process</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Every organization and campaign on Maddad is manually reviewed before going live.
                  We verify legal registration documents, confirm contact identities, and review
                  campaign evidence before a single donation can be accepted.
                </p>
                <Link to="/verification" className="text-primary text-sm font-medium hover:underline">
                  Learn how we verify →
                </Link>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <DollarSign size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="heading-section text-2xl text-foreground mb-3">0% platform fee policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We charge organizations nothing. 100% of every donation goes directly to the campaign.
                  Maddad is funded entirely by voluntary donor tips — you choose whether to add one
                  at checkout. This means our incentives are aligned with donors, not organizations.
                </p>
                <Link to="/support-maddad" className="text-primary text-sm font-medium hover:underline">
                  How we fund Maddad →
                </Link>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <FileCheck size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="heading-section text-2xl text-foreground mb-3">Evidence and proof requirements</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Campaigns must submit supporting evidence before publishing — photos, official letters,
                  medical records, or legal documentation depending on the campaign type.
                  Our verifier team reviews each piece of evidence. Campaigns without sufficient
                  evidence are placed under review until documentation is provided.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
