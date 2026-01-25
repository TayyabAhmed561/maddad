import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { VerificationBadge } from "@/components/VerificationBadge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle, 
  Award,
  Heart,
  Share2,
  Globe
} from "lucide-react";
import { realMapItems, MapItem, categoryColors } from "@/data/mapData";
import { cn } from "@/lib/utils";

// External URLs for known organizations
const organizationUrls: Record<string, string> = {
  "Islamic Relief Canada": "https://islamicreliefcanada.org",
  "Human Concern International": "https://humanconcern.org",
  "Penny Appeal Canada": "https://pennyappeal.ca",
  "Islamic Society of North America": "https://isna.ca",
  "National Zakat Foundation Canada": "https://nzfcanada.com",
  "Muslim Welfare Centre of Toronto": "https://muslimwelfarecentre.com",
  "Muslim Association of Canada": "https://macnet.ca",
};

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Find the charity by ID from the real items
  const charity = realMapItems.find(item => item.id === id);
  
  // Get external URL for the organization
  const externalUrl = charity?.orgName ? organizationUrls[charity.orgName] : undefined;
  
  // Scroll to donate section if hash present
  useEffect(() => {
    if (location.hash === "#donate") {
      const donateSection = document.getElementById("donate");
      if (donateSection) {
        donateSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);
  
  if (!charity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
              Charity Not Found
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This charity page doesn't exist or may have been removed. 
              Explore other verified needs on the map.
            </p>
            <Button onClick={() => navigate("/explore")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const categoryStyle = categoryColors[charity.category];
  const hasProgress = charity.goal && charity.fundingRaised !== undefined;
  const progressPercent = hasProgress 
    ? Math.min((charity.fundingRaised! / charity.goal!) * 100, 100) 
    : 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-muted/50 to-background">
          <div className="container-narrow pt-6 pb-12">
            {/* Back Button */}
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </button>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                {/* Category & Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full"
                    style={{ 
                      backgroundColor: categoryStyle.bg, 
                      color: categoryStyle.text 
                    }}
                  >
                    {charity.category}
                  </span>
                  
                  {charity.verifiedStatus === "verified" && (
                    <VerificationBadge status="verified" />
                  )}
                  
                  {charity.zakatEligible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent-foreground">
                      Zakat Eligible
                    </span>
                  )}
                  
                  {charity.endorsedBy && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-accent-light text-accent-foreground">
                      <Award className="w-3 h-3" />
                      {charity.endorsedBy}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {charity.title}
                </h1>
                
                {/* Organization */}
                {charity.orgName && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-muted-foreground">by</span>
                    {externalUrl ? (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-lg font-medium text-primary hover:underline"
                      >
                        {charity.orgName}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-lg font-medium text-foreground">
                        {charity.orgName}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Location & Updated */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {charity.privacyLevel === "local_private" 
                      ? charity.locationLabel.split(",")[0] + " Area"
                      : charity.locationLabel
                    }
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Updated {charity.lastUpdated}
                  </span>
                </div>
                
                {/* Description */}
                {charity.description && (
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-foreground/80 text-lg leading-relaxed">
                      {charity.description}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Donation Card */}
              <div className="md:col-span-1">
                <div 
                  id="donate"
                  className="bg-card rounded-2xl border border-border p-6 shadow-card sticky top-24 scroll-mt-24"
                >
                  {/* Progress */}
                  {hasProgress && (
                    <div className="mb-6">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-2xl font-bold text-foreground">
                          ${charity.fundingRaised!.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of ${charity.goal!.toLocaleString()} goal
                        </span>
                      </div>
                      <ProgressBar 
                        current={charity.fundingRaised!} 
                        goal={charity.goal!} 
                        size="md"
                      />
                    </div>
                  )}
                  
                  {/* Donation Buttons */}
                  <div className="space-y-3">
                    {(charity.type === "need" || charity.type === "appeal") && (
                      <>
                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={() => {
                            // For now, show coming soon - in production this would open payment flow
                            navigate(`/need/${charity.id}#donate`);
                          }}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Donate Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Appeal
                        </Button>
                      </>
                    )}
                    
                    {externalUrl && (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full"
                      >
                        <Button variant="secondary" size="lg" className="w-full">
                          <Globe className="w-4 h-4 mr-2" />
                          Visit Website
                        </Button>
                      </a>
                    )}
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">Trust & Verification</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {charity.verifiedStatus === "verified" && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Identity verified by Maddad
                        </li>
                      )}
                      {charity.zakatEligible && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Zakat-eligible verified
                        </li>
                      )}
                      {charity.endorsedBy && (
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-accent-foreground" />
                          Endorsed by {charity.endorsedBy}
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last verified {charity.lastUpdated}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Information Section */}
        <section className="py-12 bg-muted/30">
          <div className="container-narrow">
            <div className="grid md:grid-cols-2 gap-8">
              {/* About the Organization */}
              {charity.orgName && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                    About {charity.orgName}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This organization is a verified partner on the Maddad platform, 
                    working to support communities in need through transparent, 
                    accountable giving programs.
                  </p>
                  {externalUrl && (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Learn more on their website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
              
              {/* Location Details */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Location
                </h3>
                <p className="text-muted-foreground mb-4">
                  This {charity.category.toLowerCase()} initiative serves the 
                  {" "}{charity.locationLabel} area.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/explore`)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
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
