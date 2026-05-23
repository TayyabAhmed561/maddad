import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const VALUES = [
  {
    title: "Transparency",
    description:
      "Every donation, every fee (0%), every verification decision — visible and accountable.",
  },
  {
    title: "Trust",
    description:
      "We verify before we publish. Donors deserve certainty, not hope.",
  },
  {
    title: "Dignity",
    description:
      "Every recipient of charitable giving deserves to be treated with respect and care.",
  },
  {
    title: "Community",
    description:
      "We are built by and for Ontario's Muslim community — not as a product, but as a service.",
  },
];

export default function Mission() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        <section className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="heading-display text-4xl text-foreground mb-6">Our Mission</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Maddad exists to make Islamic charitable giving transparent, verified, and dignified.
              We believe every donor deserves to know exactly where their Sadaqah and Zakat goes —
              and every recipient deserves to be treated with dignity.
            </p>
          </div>
        </section>

        <section className="section-spacing-sm border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="heading-section text-2xl text-foreground mb-6">Why we built this</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Charitable giving in the Muslim community too often happens through informal channels —
                group chat forwards, paper flyers at the masjid, crowdfunding campaigns with no
                verification. Donors are asked to trust without evidence. Recipients are left without
                accountability.
              </p>
              <p>
                We built Maddad to change that. A platform where every organization is verified,
                every campaign is reviewed, and every dollar is traceable. One focused on Ontario
                because trust is local — it is built in communities, not across continents.
              </p>
              <p>
                We are an Ontario-focused platform built by and for the Muslim community.
              </p>
            </div>
          </div>
        </section>

        <section className="section-spacing-sm">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="heading-section text-2xl text-foreground mb-8">Our values</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {VALUES.map(({ title, description }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
