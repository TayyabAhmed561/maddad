import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CategoryTag } from "@/components/CategoryTag";
import { ProgressBar } from "@/components/ProgressBar";
import { DonationModule } from "@/components/DonationModule";
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  ArrowLeft,
  Users,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data - in a real app this would come from an API
const needData = {
  id: "1",
  title: "Emergency Food Distribution in Gaza",
  organization: "Palestine Relief Network",
  isVerified: true,
  category: "food" as const,
  location: "Gaza, Palestine",
  raised: 45000,
  goal: 75000,
  urgency: "critical",
  zakatEligible: true,
  description: "With ongoing restrictions limiting food imports, families in Gaza face severe food insecurity. This campaign aims to provide emergency food packages to 2,000 families over the next three months, ensuring they have access to essential nutrition during this critical time.",
  coverageItems: [
    "Monthly food packages for 2,000 families",
    "Clean water distribution",
    "Infant formula and baby food",
    "Special dietary items for medical conditions"
  ],
  updates: [
    {
      date: "January 15, 2024",
      title: "First distribution completed",
      content: "Successfully delivered food packages to 450 families in northern Gaza. Distribution continues this week."
    },
    {
      date: "January 10, 2024",
      title: "Supplies secured",
      content: "All food supplies for the first phase have been secured and are ready for distribution."
    },
    {
      date: "January 5, 2024",
      title: "Campaign launched",
      content: "Emergency food campaign launched in response to escalating humanitarian needs."
    }
  ],
  verificationChecks: [
    { label: "Organization registration verified", passed: true },
    { label: "Bank account validated", passed: true },
    { label: "Previous campaigns audited", passed: true },
    { label: "Local partner confirmed", passed: true },
    { label: "Distribution plan reviewed", passed: true }
  ],
  documents: [
    "Registration Certificate",
    "Financial Audit 2023",
    "Distribution Plan",
    "Partner Agreement"
  ],
  transparencyLog: [
    { date: "Jan 12, 2024", action: "Funds released", amount: "$15,000", recipient: "Local distributor" },
    { date: "Jan 8, 2024", action: "Funds released", amount: "$10,000", recipient: "Food supplier" }
  ]
};

export default function NeedDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <Link 
              to="/explore" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Explore
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <CategoryTag category={needData.category} />
                  {needData.isVerified && <VerificationBadge status="verified" />}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {needData.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-4">
                  by {needData.organization}
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={16} />
                    <span>{needData.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <AlertTriangle size={16} className="text-accent" />
                    <span className="capitalize">{needData.urgency} urgency</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle size={16} className="text-primary" />
                    <span>Zakat eligible</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-80">
                <ProgressBar current={needData.raised} goal={needData.goal} />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Details */}
            <div className="flex-1 space-y-10">
              {/* Why This Matters */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Why this need matters</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {needData.description}
                </p>
              </div>

              {/* What Your Donation Covers */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">What your donation covers</h2>
                <ul className="space-y-3">
                  {needData.coverageItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Updates Timeline */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Updates</h2>
                <div className="space-y-6">
                  {needData.updates.map((update, index) => (
                    <div key={index} className="relative pl-6 border-l-2 border-border pb-6 last:pb-0">
                      <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar size={14} />
                        <span>{update.date}</span>
                      </div>
                      <h3 className="font-medium text-foreground mb-1">{update.title}</h3>
                      <p className="text-sm text-muted-foreground">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transparency Section */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">Transparency & Verification</h2>
                
                {/* Verification Checklist */}
                <div className="mb-6">
                  <h3 className="font-medium text-foreground mb-3">Verification Checklist</h3>
                  <div className="space-y-2">
                    {needData.verificationChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-primary" />
                        <span className="text-sm text-muted-foreground">{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h3 className="font-medium text-foreground mb-3">Documents</h3>
                  <div className="flex flex-wrap gap-2">
                    {needData.documents.map((doc, index) => (
                      <button
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                      >
                        <FileText size={14} />
                        {doc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fund Release Log */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Fund Release Log</h3>
                  <div className="space-y-3">
                    {needData.transparencyLog.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">{entry.date} • {entry.recipient}</p>
                        </div>
                        <span className="text-sm font-medium text-primary">{entry.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Donation Module (Sticky) */}
            <div className="lg:w-96">
              <div className="lg:sticky lg:top-24">
                <DonationModule />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
