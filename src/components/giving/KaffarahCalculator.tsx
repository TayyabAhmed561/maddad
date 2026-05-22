import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  AlertCircle
} from "lucide-react";

type KaffarahType = "broken-fast" | "broken-oath";

interface KaffarahCalculatorProps {
  type: KaffarahType | null;
  onCalculate: (amount: number) => void;
  className?: string;
}

// Default cost per meal — Ontario, Canada average
const DEFAULT_MEAL_COST = 20;

export function KaffarahCalculator({ type, onCalculate, className }: KaffarahCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Inputs
  const [count, setCount] = useState<string>("1");
  const [mealCost, setMealCost] = useState<string>(DEFAULT_MEAL_COST.toString());

  // Reset when type changes
  useEffect(() => {
    setCount("1");
    setIsOpen(false);
  }, [type]);

  if (!type) return null;

  const isBrokenFast = type === "broken-fast";
  const mealsPerUnit = isBrokenFast ? 60 : 10;
  const unitLabel = isBrokenFast ? "fast" : "oath";
  const unitLabelPlural = isBrokenFast ? "fasts" : "oaths";

  const countNum = parseInt(count) || 0;
  const mealCostNum = parseFloat(mealCost) || 0;
  const totalMeals = countNum * mealsPerUnit;
  const totalAmount = totalMeals * mealCostNum;

  const handleApply = () => {
    if (totalAmount > 0) {
      onCalculate(totalAmount);
    }
  };

  return (
    <div className={cn("bg-card rounded-xl border border-border", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/30 transition-colors rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                <Calculator size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Calculate Kaffarah Amount
                </h3>
                <p className="text-sm text-muted-foreground">
                  Guided estimate for {isBrokenFast ? "broken Ramadan fasts" : "broken oaths"}
                </p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp size={20} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={20} className="text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
            {/* Requirement Reminder */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">
                    {isBrokenFast ? "Broken Fast Kaffarah" : "Broken Oath Kaffarah"}
                  </p>
                  <p className="text-muted-foreground">
                    {isBrokenFast 
                      ? "For each intentionally broken Ramadan fast, feeding 60 people is required."
                      : "For each broken oath, feeding 10 people is required."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Calculator Inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="count" className="text-sm text-muted-foreground">
                  Number of {isBrokenFast ? "Broken Fasts" : "Broken Oaths"}
                </Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="mt-1.5 text-lg font-medium"
                />
              </div>

              <div>
                <Label htmlFor="mealCost" className="text-sm text-muted-foreground flex items-center gap-1">
                  Cost per Meal (CAD)
                  <span className="text-xs text-muted-foreground/70">(editable)</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="mealCost"
                    type="number"
                    min={1}
                    step="0.01"
                    value={mealCost}
                    onChange={(e) => setMealCost(e.target.value)}
                    className="pl-7 text-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Calculation Result */}
            <div className="rounded-lg p-4 border bg-primary-light border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">Calculation Result</span>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={12} />
                  {showBreakdown ? "Hide" : "How this is calculated"}
                </button>
              </div>

              {showBreakdown && (
                <div className="text-xs text-muted-foreground space-y-1 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span>Number of {unitLabelPlural}</span>
                    <span>{countNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>× Meals per {unitLabel}</span>
                    <span>{mealsPerUnit}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                    <span>Total meals</span>
                    <span>{totalMeals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>× Cost per meal</span>
                    <span>${mealCostNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                    <span>Total Kaffarah</span>
                    <span>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Kaffarah Amount</p>
                  <p className="text-2xl font-serif font-semibold text-primary">
                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalMeals.toLocaleString()} meals × ${mealCostNum.toFixed(2)}/meal
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Notice */}
            {isBrokenFast && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Alternative:</strong> Fasting 60 consecutive days per broken fast is also valid. 
                  This calculator covers the feeding option only.
                </span>
              </div>
            )}

            {!isBrokenFast && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> This covers the feeding option. Clothing 10 people or other 
                  alternatives may also fulfill this obligation based on scholarly guidance.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleApply}
                disabled={totalAmount <= 0}
                className="flex-1"
              >
                Apply ${totalAmount > 0 ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"} to Donation
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground italic">
              This calculator provides a guided estimate. For complex situations, please consult with a qualified scholar.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
