import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Users,
  Building2,
  Shield,
  AlertCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityAppeal {
  id: string;
  title: string;
  beneficiary: string;
  category: "medical" | "disaster" | "education" | "housing";
  location: string;
  raised: number;
  goal: number;
  endorsedBy: {
    type: "masjid" | "organization";
    name: string;
  };
  lastUpdated: string;
  description: string;
  zakatEligible: boolean;
}

const sampleAppeals: CommunityAppeal[] = [
  {
    id: "1",
    title: "Medical Treatment for Brother Ahmad",
    beneficiary: "Ahmad Hassan Family",
    category: "medical",
    location: "Chicago, IL",
    raised: 12500,
    goal: 25000,
    endorsedBy: { type: "masjid", name: "Masjid Al-Huda" },
    lastUpdated: "Updated 3 hours ago by family",
    description: "Brother Ahmad requires urgent kidney treatment. His family has been part of our community for 15 years.",
    zakatEligible: true
  },
  {
    id: "2",
    title: "House Fire Recovery - Fatima's Family",
    beneficiary: "Fatima Begum",
    category: "disaster",
    location: "Detroit, MI",
    raised: 8200,
    goal: 15000,
    endorsedBy: { type: "masjid", name: "Islamic Center of Detroit" },
    lastUpdated: "Updated 1 day ago by volunteers",
    description: "Sister Fatima lost her home in a fire. This appeal covers temporary housing and essential items.",
    zakatEligible: true
  },
  {
    id: "3",
    title: "College Tuition for Orphaned Student",
    beneficiary: "Yusuf Mohammed",
    category: "education",
    location: "Houston, TX",
    raised: 4500,
    goal: 12000,
    endorsedBy: { type: "organization", name: "Muslim Youth Foundation" },
    lastUpdated: "Updated 2 days ago",
    description: "Yusuf lost both parents and needs support to continue his engineering degree.",
    zakatEligible: true
  },
  {
    id: "4",
    title: "Emergency Housing Assistance",
    beneficiary: "Al-Rahman Family",
    category: "housing",
    location: "Atlanta, GA",
    raised: 3200,
    goal: 8000,
    endorsedBy: { type: "masjid", name: "Atlanta Masjid" },
    lastUpdated: "Updated 5 hours ago",
    description: "A refugee family facing eviction needs immediate support for rent and deposit.",
    zakatEligible: true
  }
];

const categoryLabels = {
  medical: { label: "Medical Emergency", color: "bg-red-50 text-red-700 border-red-200" },
  disaster: { label: "Disaster Relief", color: "bg-orange-50 text-orange-700 border-orange-200" },
  education: { label: "Education Hardship", color: "bg-purple-50 text-purple-700 border-purple-200" },
  housing: { label: "Housing Crisis", color: "bg-blue-50 text-blue-700 border-blue-200" }
};

function AppealCard({ appeal }: { appeal: CommunityAppeal }) {
  const category = categoryLabels[appeal.category];
  
  return (
    <div className="bg-card rounded-xl border border-border p-6 card-interactive">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium border mb-3", category.color)}>
            {category.label}
          </span>
          <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
            {appeal.title}
          </h3>
          <p className="text-sm text-muted-foreground">{appeal.beneficiary}</p>
        </div>
      </div>

      {/* Endorsement Badge */}
      <div className="endorsement-badge mb-4">
        {appeal.endorsedBy.type === "masjid" ? (
          <Building2 size={14} className="text-accent" />
        ) : (
          <Shield size={14} className="text-accent" />
        )}
        <span>Endorsed by {appeal.endorsedBy.name}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {appeal.description}
      </p>

      {/* Location & Zakat */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="shrink-0" />
          <span>{appeal.location}</span>
        </div>
        {appeal.zakatEligible && (
          <div className="flex items-center gap-1.5 text-primary">
            <CheckCircle size={14} />
            <span className="font-medium">Zakat Eligible</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <ProgressBar current={appeal.raised} goal={appeal.goal} size="sm" className="mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{appeal.lastUpdated}</span>
        </div>
        <Button size="sm">
          <Heart size={16} />
          Support
        </Button>
      </div>
    </div>
  );
}

export default function Appeals() {
  const [filter, setFilter] = useState<string>("all");

  const filteredAppeals = filter === "all" 
    ? sampleAppeals 
    : sampleAppeals.filter(a => a.category === filter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-accent-light/50 via-background to-primary-light/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full endorsement-badge mb-6">
                <Users size={14} />
                <span>Community-Powered Giving</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Community Appeals
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Support verified personal fundraisers endorsed by local masjids and trusted organizations. Every appeal is vetted for legitimacy and accountability.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Notice */}
        <section className="border-y border-border section-cream py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Shield size={18} className="text-primary" />
              <span className="text-muted-foreground">
                All appeals require endorsement from a verified masjid or organization before listing
              </span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground mr-2">Filter by:</span>
              {[
                { value: "all", label: "All Appeals" },
                { value: "medical", label: "Medical" },
                { value: "disaster", label: "Disaster Relief" },
                { value: "education", label: "Education" },
                { value: "housing", label: "Housing" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filter === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Appeals Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppeals.map((appeal, index) => (
                <div 
                  key={appeal.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AppealCard appeal={appeal} />
                </div>
              ))}
            </div>

            {filteredAppeals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No appeals found in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 section-warm">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
              How Community Appeals Work
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { 
                  step: "01", 
                  title: "Submit Request", 
                  desc: "Individual or family submits appeal with documentation" 
                },
                { 
                  step: "02", 
                  title: "Masjid Endorsement", 
                  desc: "Local masjid or verified org reviews and endorses" 
                },
                { 
                  step: "03", 
                  title: "Platform Review", 
                  desc: "Maddad verifies endorsement and approves listing" 
                },
                { 
                  step: "04", 
                  title: "Staged Disbursement", 
                  desc: "Funds released in stages with update requirements" 
                }
              ].map((item, index) => (
                <div 
                  key={item.step} 
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl font-bold text-accent mb-3">{item.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rules & Guidelines */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Appeal Guidelines
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-primary" />
                    Allowed Categories
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Medical emergencies</li>
                    <li>• Disaster relief (fire, flood, etc.)</li>
                    <li>• Education hardship</li>
                    <li>• Housing crisis (eviction, displacement)</li>
                  </ul>
                </div>
                
                <div className="bg-background rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-muted-foreground" />
                    Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Endorsement from verified masjid/org</li>
                    <li>• Identity verification of beneficiary</li>
                    <li>• Regular update commitment</li>
                    <li>• Maximum $25,000 per appeal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 section-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Need to create an appeal?
              </h2>
              <p className="text-muted-foreground mb-6">
                Contact your local masjid or a verified organization to submit an appeal on your behalf.
              </p>
              <Button variant="outline" asChild>
                <a href="/verification">
                  Learn About Verification
                  <ArrowRight size={18} />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
