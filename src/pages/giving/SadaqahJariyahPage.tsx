import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { RecurringDonationToggle } from "@/components/giving/RecurringDonationToggle";
import { ProgressBar } from "@/components/ProgressBar";
import { GivingProofSection } from "@/components/giving/GivingProofSection";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { Infinity, Loader2, Check, ArrowLeft, Droplets, BookOpen, Building2, Stethoscope, Users, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sadaqahJariyahProjects, sadaqahJariyahConfig, allocationRules } from "@/data/givingData";
import type { SadaqahJariyahProject, DonationFrequency } from "@/types/giving";

const typeIconMap: Record<string, typeof Infinity> = {
  "Infinity": Infinity, "Droplets": Droplets, "BookOpen": BookOpen, "Building2": Building2, "Stethoscope": Stethoscope, "Users": Users
};
const typeIcons: Record<string, typeof Infinity> = {
  "water": Droplets, "education": BookOpen, "masjid": Building2, "healthcare": Stethoscope, "orphan-care": Users
};

export default function SadaqahJariyahPage() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProject, setSelectedProject] = useState<SadaqahJariyahProject | null>(null);
  const [localAmount, setLocalAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<DonationFrequency>("monthly");
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : localAmount;
  const allocationItems = allocationRules["sadaqah-jariyah"];
  const presetAmounts = sadaqahJariyahConfig.presetAmounts;
  const projectTypes = sadaqahJariyahConfig.projectTypes;
  const filteredProjects = selectedType === "all" ? sadaqahJariyahProjects : sadaqahJariyahProjects.filter(p => p.type === selectedType);

  const handleDonate = async () => {
    if (!selectedProject || selectedAmount <= 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    const receipt = createReceipt({
      amount: selectedAmount,
      campaignTitle: `Sadaqah Jariyah – ${selectedProject.title}`,
      organizationName: selectedProject.partner,
      donationType: "sadaqah-jariyah",
      frequency,
      isAnonymous: anonymous,
      hideAmount,
      duaIntention: duaIntention || undefined,
      givingCategory: "sadaqah-jariyah",
      givingCampaignId: selectedProject.id,
    });
    setLastReceipt(receipt);
    setShowConfirmDialog(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedProject(null);
    setLocalAmount(100);
    setCustomAmount("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/giving" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={16} />Back to Giving</Link>
          </div>
        </div>

        <section className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6"><Infinity size={28} className="text-primary" /></div>
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">Sadaqah Jariyah</h1>
              <p className="text-lg text-muted-foreground text-body max-w-2xl">
                Invest in ongoing reward. These endowment-style projects—water wells, schools, masjids, and care programs—provide benefit for years or decades, generating continuous reward.
              </p>
              <div className="flex items-center gap-2 mt-6 text-sm text-accent gold-text"><Infinity size={16} /><span>"When a person dies, their deeds end except for three: ongoing charity..."</span></div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type) => {
                  const Icon = typeIconMap[type.icon] || Infinity;
                  return (
                    <button key={type.id} onClick={() => setSelectedType(type.id)}
                      className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300", selectedType === type.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
                      <Icon size={16} />{type.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredProjects.map((project) => {
                  const TypeIcon = typeIcons[project.type];
                  return (
                    <button key={project.id} onClick={() => setSelectedProject(project)}
                      className={cn("w-full text-left p-5 rounded-xl border transition-all duration-300", selectedProject?.id === project.id ? "border-primary bg-primary-light ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40 card-interactive")}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0"><TypeIcon size={20} className="text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm leading-tight mb-1">{project.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={10} /><span>{project.location}</span></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                      <ProgressBar current={project.raised} goal={project.goal} showLabels={false} className="mb-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">${project.raised.toLocaleString()} of ${project.goal.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-accent"><Clock size={10} /><span>{project.impactYears}+ years impact</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedProject && (
                <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Contribute to: {selectedProject.title}</h2>
                    <p className="text-sm text-muted-foreground">Partner: {selectedProject.partner}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Contribution Amount</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {presetAmounts.map((preset) => (
                        <button key={preset} onClick={() => { setLocalAmount(preset); setCustomAmount(""); }}
                          className={cn("py-3 px-4 rounded-lg text-sm font-medium transition-all", localAmount === preset && !customAmount ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
                          ${preset}
                        </button>
                      ))}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <input type="number" placeholder="Other" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)}
                          className={cn("w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20", customAmount && "ring-2 ring-primary")} />
                      </div>
                    </div>
                  </div>
                  <RecurringDonationToggle value={frequency} onChange={setFrequency} showYearly={true} />
                  {frequency !== "one-time" && (
                    <p className="text-sm text-muted-foreground p-3 bg-accent-light rounded-lg">Recurring contributions are especially impactful for Sadaqah Jariyah, helping projects reach completion and maintain long-term benefit.</p>
                  )}
                  <div className="divider-subtle" />
                  <AnonymousDonationToggle anonymous={anonymous} hideAmount={hideAmount} onAnonymousChange={setAnonymous} onHideAmountChange={setHideAmount} />
                  <div className="divider-subtle" />
                  <DuaIntentionField value={duaIntention} onChange={setDuaIntention} />
                </div>
              )}

              <GivingProofSection givingCategory="sadaqah-jariyah" />
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Contribution Summary</h3>
                {selectedProject ? (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="text-sm"><span className="text-muted-foreground">Project</span><p className="font-medium text-foreground mt-1">{selectedProject.title}</p></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-medium text-foreground">${selectedAmount.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frequency</span><span className="font-medium text-foreground capitalize">{frequency.replace("-", " ")}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected impact</span><span className="font-medium text-accent">{selectedProject.impactYears}+ years</span></div>
                      <div className="border-t border-border pt-3"><div className="flex justify-between"><span className="font-medium text-foreground">{frequency === "one-time" ? "Total" : `Per ${frequency.replace("ly", "")}`}</span><span className="text-xl font-serif font-semibold text-primary">${selectedAmount.toLocaleString()}</span></div></div>
                    </div>
                    <AllocationBreakdown items={allocationItems} className="mb-6" />
                    <Button className="w-full" size="lg" onClick={handleDonate} disabled={selectedAmount <= 0 || isLoading || isSuccess}>
                      {isLoading ? (<><Loader2 size={18} className="animate-spin" />Processing...</>) : isSuccess ? (<><Check size={18} />Contribution Complete</>) : (<><Infinity size={18} />Contribute</>)}
                    </Button>
                    {isSuccess && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-center text-muted-foreground">May this be a source of ongoing reward.</p>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowConfirmDialog(true)}>View Receipt & Track Impact</Button>
                        <Button variant="ghost" size="sm" className="w-full" onClick={handleReset}>Make Another Contribution</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Select a project to contribute</p>
                )}
              </div>

              <div className="bg-accent-light rounded-xl p-6 border border-accent-muted/20">
                <div className="flex items-center gap-2 text-accent-foreground mb-3"><Infinity size={16} /><span className="font-medium">Ongoing Reward</span></div>
                <p className="text-sm text-muted-foreground">Sadaqah Jariyah projects are designed for lasting benefit. Water wells can serve communities for 25+ years, masjids for generations, and educational endowments can support students indefinitely.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <DonationConfirmDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog} receipt={lastReceipt} trackingPath="/giving/sadaqah-jariyah" />
    </div>
  );
}
