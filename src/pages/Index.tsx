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

// Partner logos
import alRahmahLogo from "@/assets/logos/al-rahmah.png";
import islamicReliefLogo from "@/assets/logos/islamic-relief.jpeg";
import pennyAppealLogo from "@/assets/logos/penny-appeal.png";
import hciLogo from "@/assets/logos/hci.png";
import mercyMissionLogo from "@/assets/logos/mercy-mission.png";
import grtLogo from "@/assets/logos/grt.png";
import coldestNightLogo from "@/assets/logos/coldest-night.jpeg";

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
  { name: "Al-Rahmah Foundation", logo: alRahmahLogo },
  { name: "Islamic Relief", logo: islamicReliefLogo },
  { name: "Penny Appeal Canada", logo: pennyAppealLogo },
  { name: "Human Concern International", logo: hciLogo },
  { name: "Mercy Mission Madinah", logo: mercyMissionLogo },
  { name: "Global Relief Trust", logo: grtLogo },
  { name: "Coldest Night of the Year", logo: coldestNightLogo },
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
        {/* Hero Section - With subtle geometric pattern */}
        <section className="relative overflow-hidden bg-background pattern-subtle">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-light/30 via-transparent to-accent-light/20" />
          <div className="container mx-auto px-4 py-24 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Trust pill with gold accent */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gold-highlight text-sm font-medium mb-8 animate-fade-in-up">
                <Sparkles size={16} className="gold-icon" />
                <span className="text-accent-foreground">Trusted by 150+ masjids worldwide</span>
              </div>
              
              <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                Know where your charity is needed most, and give with{" "}
                <span className="text-primary">confidence</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-body animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                Maddad connects you with verified humanitarian needs around the world, ensuring your sadaqah and zakat reach those who need it most—with full transparency.
              </p>
              
              {/* Single primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <Button variant="hero" size="xl" asChild>
                  <Link to="/explore">
                    <MapPin size={20} />
                    Explore Needs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative arch-inspired bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-cream to-transparent" />
        </section>

        {/* Stats Section - Cream background with subtle pattern */}
        <section className="relative border-y border-border section-cream pattern-geometric">
          <div className="container mx-auto px-4 py-14 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - White cards on warm background */}
        <section className="section-spacing section-warm relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="heading-section text-3xl md:text-4xl text-foreground mb-5">
                Built on Trust
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-body">
                We believe effective giving starts with transparency. Here's how Maddad ensures your donations make real impact.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="bg-card rounded-xl p-8 md:p-10 border border-border card-interactive animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6">
                    <feature.icon size={26} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-body">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ornamental divider */}
        <div className="divider-ornamental" />

        {/* How It Works Section */}
        <section className="section-spacing-sm bg-card relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="heading-section text-3xl md:text-4xl text-foreground mb-5">
                How Maddad Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-body">
                From discovery to impact, we make giving simple and transparent.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Explore", desc: "Browse verified needs on our interactive map, filtered by location, category, or urgency." },
                { step: "02", title: "Give", desc: "Choose your amount, select zakat or sadaqah, and donate securely in seconds." },
                { step: "03", title: "Track", desc: "Receive updates on how your donation is being used and the impact it creates." }
              ].map((item, index) => (
                <div key={item.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="font-serif text-5xl font-bold text-accent/30 mb-5">{item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-serif">{item.title}</h3>
                  <p className="text-muted-foreground text-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Appeals Highlight */}
        <section className="py-20 md:py-24 section-cream border-y border-border relative pattern-arch">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full endorsement-badge mb-8">
                <Users size={16} className="gold-icon" />
                <span>Community-Powered</span>
              </div>
              <h2 className="heading-section text-2xl md:text-3xl text-foreground mb-5">
                Community Appeals
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-body">
                Support verified personal fundraisers endorsed by local masjids and trusted organizations. Community-led compassion with full accountability.
              </p>
              <Button variant="outline" size="lg" asChild>
                <Link to="/appeals">
                  View Community Appeals
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Partners Section - Scrolling Logos */}
        <section className="section-spacing-sm bg-card border-b border-border overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Trusted Partners
              </p>
              <h2 className="heading-section text-2xl md:text-3xl text-foreground">
                Working with leading organizations
              </h2>
            </div>
          </div>
          
          {/* Scrolling logo marquee */}
          <div className="relative group/marquee">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
            
            <div className="flex overflow-hidden">
              <div className="marquee-track flex gap-12 py-4 group-hover/marquee:[animation-play-state:paused]">
                {/* First set of logos */}
                {partners.map((partner) => (
                  <div 
                    key={partner.name}
                    className="flex-shrink-0 h-16 md:h-20 px-6 flex items-center justify-center bg-background rounded-xl border border-border shadow-soft hover:shadow-warm transition-shadow duration-300"
                  >
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="h-10 md:h-14 w-auto max-w-[140px] md:max-w-[180px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {partners.map((partner) => (
                  <div 
                    key={`${partner.name}-dup`}
                    className="flex-shrink-0 h-16 md:h-20 px-6 flex items-center justify-center bg-background rounded-xl border border-border shadow-soft hover:shadow-warm transition-shadow duration-300"
                  >
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="h-10 md:h-14 w-auto max-w-[140px] md:max-w-[180px] object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-spacing section-warm">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-12 md:p-20 text-center shadow-prominent relative overflow-hidden">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }} />
              </div>
              
              <div className="relative">
                <h2 className="heading-display text-3xl md:text-4xl text-primary-foreground mb-5">
                  Start giving with confidence
                </h2>
                <p className="text-lg text-primary-foreground/85 mb-10 max-w-xl mx-auto">
                  Join thousands of Muslims who trust Maddad to connect them with verified humanitarian needs.
                </p>
                <Button 
                  variant="outline" 
                  size="xl"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0 shadow-warm"
                  asChild
                >
                  <Link to="/explore">
                    Explore Needs
                    <ArrowRight size={20} />
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