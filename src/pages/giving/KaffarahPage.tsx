import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PartnerCard } from "@/components/giving/PartnerCard";
import { AllocationBreakdown } from "@/components/giving/AllocationBreakdown";
import { DuaIntentionField } from "@/components/giving/DuaIntentionField";
import { AnonymousDonationToggle } from "@/components/giving/AnonymousDonationToggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { KaffarahCalculator } from "@/components/giving/KaffarahCalculator";
import { GivingProofSection } from "@/components/giving/GivingProofSection";
import { DonationConfirmDialog } from "@/components/DonationConfirmDialog";
import { createReceipt, type DonationReceipt } from "@/types/receipt";
import { Scale, Heart, Loader2, Check, ArrowLeft, Info, ShieldCheck, BookOpen, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { verifiedPartners, allocationRules } from "@/data/givingData";
import type { GivingPartner } from "@/types/giving";

type KaffarahType = "broken-fast" | "broken-oath";

interface KaffarahOption {
  id: KaffarahType;
  title: string;
  description: string;
  requirement: string;
  scholarNote: string;
}

const kaffarahOptions: KaffarahOption[] = [
  {
    id: "broken-fast",
    title: "Broken Fast (Ramadan)",
    description: "For intentionally breaking a Ramadan fast without valid excuse.",
    requirement: "Feeding sixty people per fast, or fasting sixty consecutive days.",
    scholarNote: "Scholars differ on the specific amount per person. Many communities set it at the local cost of one average meal."
  },
  {
    id: "broken-oath",
    title: "Broken Oath",
    description: "For breaking a sworn oath made in the name of Allah.",
    requirement: "Feeding ten people, clothing them, or freeing a slave. If unable, fasting three days.",
    scholarNote: "The feeding amount is typically equivalent to the local cost of one meal per person."
  }
];

export default function KaffarahPage() {
  const [selectedType, setSelectedType] = useState<KaffarahType | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [selectedPartner, setSelectedPartner] = useState<GivingPartner | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [hideAmount, setHideAmount] = useState(true);
  const [duaIntention, setDuaIntention] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<DonationReceipt | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const partners = verifiedPartners.kaffarah || verifiedPartners.fidya || [];
  const allocation = allocationRules.kaffarah || allocationRules.fidya;
  const amount = parseFloat(donationAmount) || 0;

  const handleDonate = async () => {
    if (!selectedPartner || !selectedType || amount <= 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    const receipt = createReceipt({
      amount,
      campaignTitle: `Kaffarah – ${selectedType === "broken-fast" ? "Broken Fast" : "Broken Oath"}`,
      organizationName: selectedPartner.name,
      donationType: "kaffarah",
      frequency: "one-time",
      isAnonymous: anonymous,
      hideAmount,
      duaIntention: duaIntention || undefined,
      givingCategory: "kaffarah",
    });
    setLastReceipt(receipt);
    setShowConfirmDialog(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSelectedType(null);
    setDonationAmount("");
    setSelectedPartner(null);
    setDuaIntention("");
  };

  const handleCalculatorResult = (calculatedAmount: number) => {
    setDonationAmount(calculatedAmount.toFixed(2));
  };

  const selectedOption = kaffarahOptions.find(opt => opt.id === selectedType);

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
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6"><Scale size={28} className="text-primary" /></div>
              <h1 className="heading-display text-3xl md:text-4xl text-foreground mb-4">Kaffarah — Expiation for Obligations</h1>
              <p className="text-lg text-muted-foreground text-body max-w-2xl mb-6">
                Kaffarah is a form of compensation required when certain religious obligations are intentionally violated. It provides a path to seek forgiveness through prescribed acts of charity.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">How is Kaffarah different from Fidya?</span>
                    <p className="mt-1">Fidya is paid when someone <em>cannot</em> fast due to illness or old age. Kaffarah applies when a fast or oath is <em>intentionally</em> broken and requires a more significant form of compensation.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck size={16} className="text-primary" />
                <span>Your donation and recipient information remain completely private</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2"><BookOpen size={20} className="text-primary" /><h2 className="font-serif text-xl font-semibold text-foreground">Select Obligation Type</h2></div>
                <p className="text-sm text-muted-foreground mb-6">Choose the type of Kaffarah that applies to your situation.</p>
                <RadioGroup value={selectedType || ""} onValueChange={(value) => { setSelectedType(value as KaffarahType); setDonationAmount(""); }} className="space-y-4">
                  {kaffarahOptions.map((option) => (
                    <div key={option.id}
                      className={cn("relative flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer", selectedType === option.id ? "border-primary bg-primary-light/50" : "border-border hover:border-primary/50 hover:bg-secondary/50")}
                      onClick={() => { setSelectedType(option.id); setDonationAmount(""); }}>
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="font-medium text-foreground cursor-pointer">{option.title}</Label>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        <div className="mt-3 p-3 bg-background rounded-md border border-border">
                          <p className="text-xs font-medium text-foreground mb-1">Requirement:</p>
                          <p className="text-xs text-muted-foreground">{option.requirement}</p>
                        </div>
                        <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
                          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                          <span className="italic">{option.scholarNote}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {selectedType && <KaffarahCalculator type={selectedType} onCalculate={handleCalculatorResult} />}

              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Donation Amount</h2>
                <p className="text-sm text-muted-foreground mb-6">{selectedType ? "Use the calculator above or enter your amount directly." : "Select an obligation type above, then enter your amount."}</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Amount (USD)</label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" min={1} step="0.01" placeholder="0.00" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className="pl-8 text-lg font-medium" disabled={!selectedType} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">Select a Feeding Partner</h2>
                <p className="text-sm text-muted-foreground mb-2">All partners are verified and follow Islamic guidelines for Kaffarah distribution.</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6"><ShieldCheck size={12} className="text-primary" /><span>Guided by scholarly review</span></div>
                {partners.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {partners.map((partner) => (<PartnerCard key={partner.id} partner={partner} selected={selectedPartner?.id === partner.id} onSelect={setSelectedPartner} />))}
                  </div>
                ) : (<div className="text-center py-8 text-muted-foreground"><p>No partners available.</p></div>)}
              </div>

              <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
                <AnonymousDonationToggle anonymous={anonymous} hideAmount={hideAmount} onAnonymousChange={setAnonymous} onHideAmountChange={setHideAmount} />
                <div className="divider-subtle" />
                <DuaIntentionField value={duaIntention} onChange={setDuaIntention} />
              </div>

              <div className="bg-accent-light/30 rounded-xl border border-border p-6">
                <div className="flex items-start gap-3">
                  <BookOpen size={20} className="text-accent-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Consult a Scholar</h3>
                    <p className="text-sm text-muted-foreground">Kaffarah requirements can vary based on individual circumstances and scholarly interpretation. If you're unsure, we encourage you to consult with a knowledgeable scholar or imam.</p>
                  </div>
                </div>
              </div>

              <GivingProofSection givingCategory="kaffarah" />
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Donation Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Kaffarah type</span><span className="font-medium text-foreground text-right">{selectedOption?.title || "Not selected"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Partner</span><span className="font-medium text-foreground">{selectedPartner?.name || "Not selected"}</span></div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between"><span className="font-medium text-foreground">Total</span><span className="text-xl font-serif font-semibold text-primary">${amount > 0 ? amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</span></div>
                  </div>
                </div>
                <AllocationBreakdown items={allocation} className="mb-6" />
                <Button className="w-full" size="lg" onClick={handleDonate} disabled={!selectedPartner || !selectedType || amount <= 0 || isLoading || isSuccess}>
                  {isLoading ? (<><Loader2 size={18} className="animate-spin" />Processing...</>) : isSuccess ? (<><Check size={18} />Kaffarah Complete</>) : (<><Heart size={18} />Complete Kaffarah</>)}
                </Button>
                {isSuccess && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-center text-muted-foreground">May Allah accept your Kaffarah.</p>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setShowConfirmDialog(true)}>View Receipt & Track Impact</Button>
                      <Button variant="ghost" size="sm" className="w-full" onClick={handleReset}>Make Another Donation</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <DonationConfirmDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog} receipt={lastReceipt} trackingPath="/giving/kaffarah" />
    </div>
  );
}
