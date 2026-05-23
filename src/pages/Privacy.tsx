import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="section-spacing-sm">
          <div className="container mx-auto px-4 max-w-3xl">

            <div className="mb-10">
              <h1 className="heading-display text-4xl text-foreground mb-3">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground mb-3">Last updated: May 2026</p>
              <div className="bg-secondary rounded-lg px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  This is a plain-language summary. A full legal privacy policy is coming soon.
                </p>
              </div>
            </div>

            <div className="space-y-10">

              <div>
                <h2 className="heading-section text-2xl text-foreground mb-4">What we collect</h2>
                <ul className="space-y-2.5 text-muted-foreground">
                  {[
                    "Name and email address when you create an account",
                    "Donation amounts and which campaigns you've supported",
                    "Mailing address when a CRA tax receipt is requested",
                    "Payment information (processed securely by Stripe — we never store card numbers)",
                  ].map(item => (
                    <li key={item} className="flex gap-2.5">
                      <span className="text-primary shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="heading-section text-2xl text-foreground mb-4">How we use it</h2>
                <ul className="space-y-2.5 text-muted-foreground">
                  {[
                    "Processing your donations and sending payment confirmations",
                    "Generating CRA-compliant tax receipts for registered charities",
                    "Sending receipts and updates you have subscribed to",
                    "Improving the platform using anonymized, aggregated usage data only",
                  ].map(item => (
                    <li key={item} className="flex gap-2.5">
                      <span className="text-primary shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="heading-section text-2xl text-foreground mb-4">Your rights (PIPEDA)</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA),
                  you have the right to:
                </p>
                <ul className="space-y-2.5 text-muted-foreground mb-5">
                  {[
                    "Access the personal information we hold about you",
                    "Request correction of inaccurate information",
                    "Request deletion of your account and personal data",
                  ].map(item => (
                    <li key={item} className="flex gap-2.5">
                      <span className="text-primary shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground">
                  To exercise any of these rights, email{" "}
                  <a
                    href="mailto:privacy@maddad.ca"
                    className="text-primary font-medium hover:underline"
                  >
                    privacy@maddad.ca
                  </a>
                  . We will respond within 30 days.
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
