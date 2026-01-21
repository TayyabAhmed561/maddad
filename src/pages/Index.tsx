import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Shield, 
  Eye, 
  Heart, 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  Users,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Charities",
    description: "Every organization undergoes rigorous verification to ensure your donations reach those in need."
  },
  {
    icon: Eye,
    title: "Transparent Allocation",
    description: "Track exactly how funds are distributed with detailed breakdowns and regular updates."
  },
  {
    icon: Heart,
    title: "Zakat & Sadaqah Support",
    description: "Clearly marked eligible causes help you fulfill your religious obligations with confidence."
  }
];

const partners = [
  "Al-Rahma Foundation",
  "Global Relief Trust",
  "Islamic Relief",
  "Mercy Mission",
  "ICNA Relief"
];

const stats = [
  { value: "$2.4M", label: "Funds Distributed" },
  { value: "156", label: "Verified Organizations" },
  { value: "89,000+", label: "Donors" },
  { value: "34", label: "Countries Reached" }
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Warm off-white */}
        <section className="relative overflow-hidden bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-light/40 via-background to-accent-light/30" />
          <div className="container mx-auto px-4 py-20 md:py-28 relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Trust pill with gold accent */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gold-highlight text-sm font-medium mb-6 animate-fade-in-up">
                <Sparkles size={16} className="text-accent" />
                <span className="text-accent-foreground">Trusted by 150+ masjids worldwide</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                Know where your charity is needed most, and give with{" "}
                <span className="text-primary">confidence</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                Maddad connects you with verified humanitarian needs around the world, ensuring your sadaqah and zakat reach those who need it most—with full transparency.
              </p>
              
              {/* Single primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <Button variant="hero" asChild>
                  <Link to="/explore">
                    <MapPin size={20} />
                    Explore Needs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Cream background */}
        <section className="border-y border-border section-cream">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - White cards on warm background */}
        <section className="py-20 md:py-24 section-warm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Built on Trust
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We believe effective giving starts with transparency. Here's how Maddad ensures your donations make real impact.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="bg-card rounded-xl p-8 border border-border card-interactive animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-5">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Maddad Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From discovery to impact, we make giving simple and transparent.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Explore", desc: "Browse verified needs on our interactive map, filtered by location, category, or urgency." },
                { step: "02", title: "Give", desc: "Choose your amount, select zakat or sadaqah, and donate securely in seconds." },
                { step: "03", title: "Track", desc: "Receive updates on how your donation is being used and the impact it creates." }
              ].map((item, index) => (
                <div key={item.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Appeals Highlight */}
        <section className="py-16 md:py-20 section-cream border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full endorsement-badge mb-6">
                <Users size={14} />
                <span>Community-Powered</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Community Appeals
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Support verified personal fundraisers endorsed by local masjids and trusted organizations. Community-led compassion with full accountability.
              </p>
              <Button variant="outline" asChild>
                <Link to="/appeals">
                  View Community Appeals
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-16 md:py-20 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Trusted Partners
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Working with leading organizations
              </h2>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {partners.map((partner) => (
                <div 
                  key={partner}
                  className="px-6 py-3 bg-background rounded-lg border border-border shadow-soft text-muted-foreground font-medium"
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-24 section-warm">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-10 md:p-16 text-center shadow-warm">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Start giving with confidence
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of Muslims who trust Maddad to connect them with verified humanitarian needs.
              </p>
              <Button 
                variant="outline" 
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0"
                asChild
              >
                <Link to="/explore">
                  Explore Needs
                  <ArrowRight size={20} />
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
