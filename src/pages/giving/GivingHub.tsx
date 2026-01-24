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
import { givingTypes, platformStats } from "@/data/givingData";

// Icon mapping for dynamic lookup
const iconMap = {
  Moon,
  Utensils,
  Coins,
  Heart,
  Infinity
};

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
              {givingTypes.map((type, index) => {
                const IconComponent = iconMap[type.icon as keyof typeof iconMap] || Heart;
                return (
                  <GivingTypeCard
                    key={type.id}
                    title={type.title}
                    description={type.description}
                    icon={IconComponent}
                    href={type.href}
                    seasonal={type.seasonal}
                    seasonLabel={type.seasonLabel}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                );
              })}
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
                <div className="text-center">
                  <div className="font-serif text-2xl font-semibold text-primary mb-1">
                    {platformStats.verifiedPartners}
                  </div>
                  <div className="text-sm text-muted-foreground">Verified Partners</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl font-semibold text-primary mb-1">
                    {platformStats.countriesServed}
                  </div>
                  <div className="text-sm text-muted-foreground">Countries Served</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl font-semibold text-primary mb-1">
                    {platformStats.mealsDelivered}
                  </div>
                  <div className="text-sm text-muted-foreground">Meals Delivered</div>
                </div>
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
