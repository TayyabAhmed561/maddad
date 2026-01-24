import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GivingTypeCard } from "@/components/giving/GivingTypeCard";
import { 
  Utensils, 
  Heart, 
  Coins, 
  Moon,
  Infinity,
  ArrowRight,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

const givingTypes = [
  {
    title: "Fidya",
    description: "Compensate for missed fasts by providing meals to those in need. Calculate your obligation and support verified feeding partners.",
    icon: Moon,
    href: "/giving/fidya",
    seasonal: false
  },
  {
    title: "Meal Sponsorship",
    description: "Sponsor nutritious meals for verified beneficiaries through trusted partner organizations and masjids.",
    icon: Utensils,
    href: "/giving/meal-sponsorship",
    seasonal: false
  },
  {
    title: "Zakat Distribution",
    description: "Fulfill your Zakat obligation through verified, eligible recipients confirmed by local masjids and scholars.",
    icon: Coins,
    href: "/giving/zakat",
    seasonal: false
  },
  {
    title: "Qurbani / Udhiyah",
    description: "Sponsor Qurbani during Eid al-Adha. Select your region, choose a partner, and receive distribution confirmation.",
    icon: Heart,
    href: "/giving/qurbani",
    seasonal: true,
    seasonLabel: "Dhul Hijjah"
  },
  {
    title: "Sadaqah Jariyah",
    description: "Invest in ongoing reward through endowment-style projects: wells, education, masjid construction, and more.",
    icon: Infinity,
    href: "/giving/sadaqah-jariyah",
    seasonal: false
  }
];

export default function GivingHub() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pattern-subtle border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-light/30 via-transparent to-accent-light/20" />
          <div className="container mx-auto px-4 py-16 md:py-20 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-highlight text-sm font-medium mb-6">
                <Shield size={14} className="gold-icon" />
                <span className="text-accent-foreground">Structured Islamic Giving</span>
              </div>
              
              <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                Give with Purpose
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl text-body">
                Whether fulfilling obligations or seeking ongoing reward, Maddad provides structured pathways 
                for Islamic charitable giving—each verified, transparent, and dignified.
              </p>
            </div>
          </div>
        </section>

        {/* Giving Types Grid */}
        <section className="section-spacing section-warm">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {givingTypes.map((type, index) => (
                <GivingTypeCard
                  key={type.title}
                  {...type}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Assurance */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-section text-2xl md:text-3xl text-foreground mb-4">
                Dignity in Every Transaction
              </h2>
              <p className="text-muted-foreground text-body mb-8">
                All giving flows are designed with Islamic ethics in mind. Beneficiaries remain anonymous, 
                funds are distributed through verified channels, and you receive transparent reporting 
                on your impact—without compromising anyone's dignity.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-6 mt-10">
                {[
                  { label: "Verified Partners", value: "47" },
                  { label: "Countries Served", value: "23" },
                  { label: "Meals Delivered", value: "180K+" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-serif text-2xl font-semibold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* General Donations CTA */}
        <section className="section-spacing section-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="heading-section text-xl md:text-2xl text-foreground mb-4">
                Looking for general giving?
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore verified humanitarian needs and community appeals where your Sadaqah makes direct impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/explore">
                    Explore Needs
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/appeals">
                    Community Appeals
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
