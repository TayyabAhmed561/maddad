import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { ProgressBar } from "@/components/ProgressBar";
import { 
  Infinity,
  Heart,
  Loader2,
  Check,
  ArrowLeft,
  Droplets,
  BookOpen,
  Building2,
  Stethoscope,
  Users,
  MapPin,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { SadaqahJariyahProject, DonationFrequency } from "@/types/giving";

const projectTypes = [
  { id: "all", label: "All Projects", icon: Infinity },
  { id: "water", label: "Water Wells", icon: Droplets },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "masjid", label: "Masjid", icon: Building2 },
  { id: "healthcare", label: "Healthcare", icon: Stethoscope },
  { id: "orphan-care", label: "Orphan Care", icon: Users }
];

const sampleProjects: SadaqahJariyahProject[] = [
  {
    id: "1",
    title: "Community Water Well — Rural Pakistan",
    type: "water",
    description: "A deep-bore water well serving 500+ villagers daily. Provides clean drinking water for generations.",
    raised: 3200,
    goal: 5000,
    impactYears: 25,
    location: "Punjab, Pakistan",
    partner: "Islamic Relief"
  },
  {
    id: "2",
    title: "Quran School Endowment — Somalia",
    type: "education",
    description: "Endowment fund to support teachers, materials, and facilities for a Quran memorization school.",
    raised: 8500,
    goal: 15000,
    impactYears: 50,
    location: "Mogadishu, Somalia",
    partner: "Muslim Aid"
  },
  {
    id: "3",
    title: "Masjid Construction — Rural Indonesia",
    type: "masjid",
    description: "Building a masjid in an underserved village. Will serve as community center and place of worship.",
    raised: 22000,
    goal: 35000,
    impactYears: 100,
    location: "Sumatra, Indonesia",
    partner: "Helping Hand"
  },
  {
    id: "4",
    title: "Medical Clinic Equipment — Yemen",
    type: "healthcare",
    description: "Equipping a maternal health clinic with essential medical equipment to save lives.",
    raised: 12000,
    goal: 20000,
    impactYears: 15,
    location: "Sana'a, Yemen",
    partner: "ICNA Relief"
  },
  {
    id: "5",
    title: "Orphan Education Fund — Gaza",
    type: "orphan-care",
    description: "Long-term educational support for orphaned children, covering tuition and supplies.",
    raised: 6800,
    goal: 12000,
    impactYears: 18,
    location: "Gaza, Palestine",
    partner: "PCRF"
  },
  {
    id: "6",
    title: "Islamic Library Endowment — USA",
    type: "education",
    description: "Creating a permanent Islamic library resource center for a growing Muslim community.",
    raised: 15000,
    goal: 25000,
    impactYears: 30,
    location: "Chicago, USA",
    partner: "ISNA"
  }
];

const presetAmounts = [50, 100, 250, 500, 1000];

const typeIcons: Record<string, typeof Infinity> = {
  "water": Droplets,
  "education": BookOpen,
  "masjid": Building2,
  "healthcare": Stethoscope,
  "orphan-care": Users
};

export default function SadaqahJariyahPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SadaqahJariyahProject | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<DonationFrequency>("monthly");
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const filteredProjects = selectedType === "all" 
    ? sampleProjects 
    : sampleProjects.filter(p => p.type === selectedType);

  const handleDonate = () => {
    if (!selectedProject || selectedAmount <= 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Back navigation */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/giving" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Giving
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6">
                <Infinity size={28} className="text-primary" />
              </div>
              
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">
                Sadaqah Jariyah
              </h1>
              
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Invest in ongoing reward. These endowment-style projects—water wells, schools, masjids, 
                and care programs—provide benefit for years or decades, generating continuous reward.
              </p>

              <div className="flex items-center gap-2 mt-6 text-sm text-accent gold-text">
                <Infinity size={16} />
                <span>"When a person dies, their deeds end except for three: ongoing charity..."</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Type Filter */}
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        selectedType === type.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      <Icon size={16} />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Projects Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredProjects.map((project) => {
                  const TypeIcon = typeIcons[project.type];
                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={cn(
                        "w-full text-left p-5 rounded-xl border transition-all duration-300",
                        selectedProject?.id === project.id
                          ? "border-primary bg-primary-light ring-2 ring-primary/20"
                          : "border-border bg-card hover:border-primary/40 card-interactive"
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                          <TypeIcon size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm leading-tight mb-1">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={10} />
                            <span>{project.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {project.description}
                      </p>

                      <ProgressBar 
                        current={project.raised} 
                        goal={project.goal} 
                        showLabels={false}
                        className="mb-2"
                      />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          ${project.raised.toLocaleString()} of ${project.goal.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-accent">
                          <Clock size={10} />
                          <span>{project.impactYears}+ years impact</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Donation Form */}
              {selectedProject && (
                <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                      Contribute to: {selectedProject.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Partner: {selectedProject.partner}
                    </p>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Contribution Amount
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {presetAmounts.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            setAmount(preset);
                            setCustomAmount("");
                          }}
                          className={cn(
                            "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                            amount === preset && !customAmount
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          )}
                        >
                          ${preset}
                        </button>
                      ))}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          placeholder="Other"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className={cn(
                            "w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all",
                            "bg-secondary text-foreground placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20",
                            customAmount && "ring-2 ring-primary"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <RecurringDonationToggle
                    value={frequency}
                    onChange={setFrequency}
                    showYearly={true}
                  />

                  {frequency !== "one-time" && (
                    <p className="text-sm text-muted-foreground p-3 bg-accent-light rounded-lg">
                      Recurring contributions are especially impactful for Sadaqah Jariyah, 
                      helping projects reach completion and maintain long-term benefit.
                    </p>
                  )}

                  <div className="divider-subtle" />

                  <AnonymousDonationToggle
                    anonymous={anonymous}
                    hideAmount={hideAmount}
                    onAnonymousChange={setAnonymous}
                    onHideAmountChange={setHideAmount}
                  />

                  <div className="divider-subtle" />

                  <DuaIntentionField
                    value={duaIntention}
                    onChange={setDuaIntention}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Summary */}
              <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Contribution Summary
                </h3>
                
                {selectedProject ? (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Project</span>
                        <p className="font-medium text-foreground mt-1">{selectedProject.title}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium text-foreground">${selectedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frequency</span>
                        <span className="font-medium text-foreground capitalize">{frequency.replace("-", " ")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expected impact</span>
                        <span className="font-medium text-accent">{selectedProject.impactYears}+ years</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">
                            {frequency === "one-time" ? "Total" : `Per ${frequency.replace("ly", "")}`}
                          </span>
                          <span className="text-xl font-serif font-semibold text-primary">
                            ${selectedAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <AllocationBreakdown
                      items={[
                        { label: "Project delivery", percentage: 90 },
                        { label: "Maintenance fund", percentage: 7 },
                        { label: "Admin", percentage: 3 }
                      ]}
                      className="mb-6"
                    />

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleDonate}
                      disabled={selectedAmount <= 0 || isLoading || isSuccess}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : isSuccess ? (
                        <>
                          <Check size={18} />
                          Contribution Complete
                        </>
                      ) : (
                        <>
                          <Infinity size={18} />
                          Contribute
                        </>
                      )}
                    </Button>

                    {isSuccess && (
                      <p className="text-sm text-center text-muted-foreground mt-4">
                        May this be a source of ongoing reward. Updates will be sent to your email.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a project to contribute
                  </p>
                )}
              </div>

              {/* Long-term Impact */}
              <div className="bg-accent-light rounded-xl p-6 border border-accent-muted/20">
                <div className="flex items-center gap-2 text-accent-foreground mb-3">
                  <Infinity size={16} />
                  <span className="font-medium">Ongoing Reward</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sadaqah Jariyah projects are designed for lasting benefit. 
                  Water wells can serve communities for 25+ years, masjids for generations, 
                  and educational endowments can support students indefinitely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
