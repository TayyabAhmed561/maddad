import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Loader2, Check } from "lucide-react";

interface DonationModuleProps {
  className?: string;
}

const presetAmounts = [25, 50, 100, 250, 500];

export function DonationModule({ className }: DonationModuleProps) {
  const [amount, setAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [donationType, setDonationType] = useState<"sadaqah" | "zakat">("sadaqah");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const num = parseFloat(value);
    setAmount(isNaN(num) ? null : num);
  };

  const handleDonate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  const selectedAmount = customAmount ? parseFloat(customAmount) || 0 : amount || 0;

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border shadow-card p-6",
      className
    )}>
      <h3 className="font-semibold text-lg text-foreground mb-5">Make a Donation</h3>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
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
            onChange={(e) => handleCustomChange(e.target.value)}
            className={cn(
              "w-full py-3 px-4 pl-7 rounded-lg text-sm font-medium transition-all",
              "bg-secondary text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              customAmount && "ring-2 ring-primary"
            )}
          />
        </div>
      </div>

      {/* Frequency Toggle */}
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
        <div className="flex rounded-lg bg-secondary p-1">
          <button
            onClick={() => setFrequency("one-time")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              frequency === "one-time"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            One-time
          </button>
          <button
            onClick={() => setFrequency("monthly")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              frequency === "monthly"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Donation Type Toggle */}
      <div className="mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Donation Type</label>
        <div className="flex rounded-lg bg-secondary p-1">
          <button
            onClick={() => setDonationType("sadaqah")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              donationType === "sadaqah"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sadaqah
          </button>
          <button
            onClick={() => setDonationType("zakat")}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              donationType === "zakat"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Zakat
          </button>
        </div>
      </div>

      {/* Fund Usage Breakdown */}
      <div className="bg-primary-light rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-primary mb-2">Where your donation goes</p>
        <div className="space-y-1.5 text-sm text-secondary-foreground">
          <div className="flex justify-between">
            <span>Direct aid</span>
            <span className="font-medium">92%</span>
          </div>
          <div className="flex justify-between">
            <span>Operations</span>
            <span className="font-medium">6%</span>
          </div>
          <div className="flex justify-between">
            <span>Platform fee</span>
            <span className="font-medium">2%</span>
          </div>
        </div>
      </div>

      {/* Donate Button */}
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
            Thank you!
          </>
        ) : (
          <>
            <Heart size={18} />
            Donate ${selectedAmount.toLocaleString()}
          </>
        )}
      </Button>
    </div>
  );
}
