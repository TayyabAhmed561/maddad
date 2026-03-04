import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NeedCard } from "@/components/NeedCard";
import { needsData } from "@/data/needsData";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Coins,
  Moon,
  Scale,
  Utensils,
  GraduationCap,
  AlertTriangle,
  Users,
  Stethoscope,
  Compass,
} from "lucide-react";

const givingTypes = [
  { id: "zakat", label: "Zakat", icon: Coins, description: "Obligatory annual giving on accumulated wealth" },
  { id: "sadaqah", label: "Sadaqah", icon: Heart, description: "Voluntary charity for any good cause" },
  { id: "fidya", label: "Fidya", icon: Moon, description: "Compensate for missed fasts" },
  { id: "kaffarah", label: "Kaffarah", icon: Scale, description: "Expiation for broken oaths or fasts" },
  { id: "general", label: "General Charity", icon: Heart, description: "Unrestricted humanitarian giving" },
];

const causeCategories = [
  { id: "food", label: "Food", icon: Utensils },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "emergency", label: "Emergency", icon: AlertTriangle },
  { id: "community", label: "Community", icon: Users },
  { id: "healthcare", label: "Healthcare", icon: Stethoscope },
];

const categoryToNeedCategory: Record<string, string[]> = {
  food: ["food"],
  education: ["education"],
  emergency: ["medical", "shelter"],
  community: ["masjid"],
  healthcare: ["medical"],
};

interface GivingGuideProps {
  className?: string;
}

export function GivingGuide({ className }: GivingGuideProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);

  const getRecommendedNeeds = () => {
    if (!selectedCause) return needsData.filter(n => n.isVerified).slice(0, 4);
    const categories = categoryToNeedCategory[selectedCause] || [];
    const filtered = needsData.filter(n => n.isVerified && categories.includes(n.category));
    return filtered.length > 0 ? filtered.slice(0, 4) : needsData.filter(n => n.isVerified).slice(0, 4);
  };

  const givingTypeRoutes: Record<string, string> = {
    zakat: "/giving/zakat",
    sadaqah: "/explore",
    fidya: "/giving/fidya",
    kaffarah: "/giving/kaffarah",
    general: "/explore",
  };

  return (
    <div className={cn("bg-card rounded-xl border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Guided Giving Assistant
            </h3>
            <p className="text-xs text-muted-foreground">
              Step {step} of 3 — We'll help you find the right cause
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full flex-1 transition-all duration-300",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Giving Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">What type of giving?</h4>
            <div className="grid gap-2">
              {givingTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 shrink-0",
                      selectedType === type.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => {
                if (selectedType && ["zakat", "fidya", "kaffarah"].includes(selectedType)) {
                  navigate(givingTypeRoutes[selectedType]);
                } else {
                  setStep(2);
                }
              }}
              disabled={!selectedType}
              className="w-full"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Cause Category */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">What cause resonates with you?</h4>
            <div className="grid grid-cols-2 gap-2">
              {causeCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCause(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all",
                      selectedCause === cat.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-6 h-6",
                      selectedCause === cat.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!selectedCause} className="flex-1">
                Show Results <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Recommended Needs */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Recommended Verified Needs</h4>
            <p className="text-xs text-muted-foreground">
              Based on your preferences for {selectedType} giving in {selectedCause}.
            </p>
            <div className="space-y-3">
              {getRecommendedNeeds().map((need) => (
                <NeedCard
                  key={need.id}
                  id={need.id}
                  title={need.title}
                  organization={need.organization}
                  isVerified={need.isVerified}
                  category={need.category}
                  location={need.location}
                  raised={need.raised}
                  goal={need.goal}
                  lastUpdated={need.lastUpdated}
                  onView={(id) => navigate(`/need/${id}`)}
                  onDonate={(id) => navigate(`/need/${id}#donate`)}
                />
              ))}
            </div>
            <Button variant="outline" onClick={() => setStep(2)} className="w-full">
              <ArrowLeft className="w-4 h-4" /> Refine Selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
