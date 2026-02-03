import { useState } from "react";
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
  Info,
  HelpCircle,
  DollarSign,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface ZakatCalculatorProps {
  onCalculate: (amount: number) => void;
  className?: string;
}

// Current approximate values (these would be fetched from an API in production)
const NISAB_GOLD_GRAMS = 87.48; // grams of gold
const NISAB_SILVER_GRAMS = 612.36; // grams of silver
const GOLD_PRICE_PER_GRAM = 75; // USD (approximate)
const SILVER_PRICE_PER_GRAM = 0.95; // USD (approximate)

const NISAB_GOLD_VALUE = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;
const NISAB_SILVER_VALUE = NISAB_SILVER_GRAMS * SILVER_PRICE_PER_GRAM;

export function ZakatCalculator({ onCalculate, className }: ZakatCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Asset inputs
  const [cashSavings, setCashSavings] = useState("");
  const [goldValue, setGoldValue] = useState("");
  const [silverValue, setSilverValue] = useState("");
  const [businessAssets, setBusinessAssets] = useState("");
  const [investments, setInvestments] = useState("");
  const [receivables, setReceivables] = useState("");
  
  // Liabilities
  const [debts, setDebts] = useState("");
  const [expenses, setExpenses] = useState("");

  // Nisab preference
  const [nisabType, setNisabType] = useState<"gold" | "silver">("gold");

  const parseValue = (val: string) => parseFloat(val) || 0;

  // Calculate totals
  const totalAssets = 
    parseValue(cashSavings) +
    parseValue(goldValue) +
    parseValue(silverValue) +
    parseValue(businessAssets) +
    parseValue(investments) +
    parseValue(receivables);

  const totalLiabilities = parseValue(debts) + parseValue(expenses);
  const netZakatableAssets = Math.max(0, totalAssets - totalLiabilities);
  
  const nisabThreshold = nisabType === "gold" ? NISAB_GOLD_VALUE : NISAB_SILVER_VALUE;
  const isAboveNisab = netZakatableAssets >= nisabThreshold;
  const zakatDue = isAboveNisab ? netZakatableAssets * 0.025 : 0;

  const handleApply = () => {
    if (zakatDue > 0) {
      onCalculate(Math.round(zakatDue * 100) / 100);
    }
  };

  const handleReset = () => {
    setCashSavings("");
    setGoldValue("");
    setSilverValue("");
    setBusinessAssets("");
    setInvestments("");
    setReceivables("");
    setDebts("");
    setExpenses("");
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
                  Calculate my Zakat
                </h3>
                <p className="text-sm text-muted-foreground">
                  Guided estimate based on your assets
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
            {/* Nisab Reference */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-2">Nisab Threshold</p>
                  <p className="text-muted-foreground mb-3">
                    Zakat is due when your net assets exceed the Nisab threshold for one lunar year.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setNisabType("gold")}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        nisabType === "gold"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      Gold: ${NISAB_GOLD_VALUE.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </button>
                    <button
                      onClick={() => setNisabType("silver")}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        nisabType === "silver"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      Silver: ${NISAB_SILVER_VALUE.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Section */}
            <div>
              <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Zakatable Assets
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cash" className="text-sm text-muted-foreground">
                    Cash & Bank Savings
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="cash"
                      type="number"
                      placeholder="0.00"
                      value={cashSavings}
                      onChange={(e) => setCashSavings(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gold" className="text-sm text-muted-foreground flex items-center gap-1">
                    Gold Value
                    <span className="text-xs text-muted-foreground/70">(~${GOLD_PRICE_PER_GRAM}/g)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="gold"
                      type="number"
                      placeholder="0.00"
                      value={goldValue}
                      onChange={(e) => setGoldValue(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="silver" className="text-sm text-muted-foreground flex items-center gap-1">
                    Silver Value
                    <span className="text-xs text-muted-foreground/70">(~${SILVER_PRICE_PER_GRAM}/g)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="silver"
                      type="number"
                      placeholder="0.00"
                      value={silverValue}
                      onChange={(e) => setSilverValue(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business" className="text-sm text-muted-foreground">
                    Business Assets <span className="text-xs">(optional)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="business"
                      type="number"
                      placeholder="0.00"
                      value={businessAssets}
                      onChange={(e) => setBusinessAssets(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="investments" className="text-sm text-muted-foreground">
                    Investments <span className="text-xs">(optional)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="investments"
                      type="number"
                      placeholder="0.00"
                      value={investments}
                      onChange={(e) => setInvestments(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="receivables" className="text-sm text-muted-foreground">
                    Money Owed to You <span className="text-xs">(optional)</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="receivables"
                      type="number"
                      placeholder="0.00"
                      value={receivables}
                      onChange={(e) => setReceivables(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Liabilities Section */}
            <div>
              <h4 className="font-medium text-foreground mb-4">
                Deductible Liabilities <span className="text-sm font-normal text-muted-foreground">(optional)</span>
              </h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="debts" className="text-sm text-muted-foreground">
                    Outstanding Debts
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="debts"
                      type="number"
                      placeholder="0.00"
                      value={debts}
                      onChange={(e) => setDebts(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expenses" className="text-sm text-muted-foreground">
                    Immediate Expenses Due
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="expenses"
                      type="number"
                      placeholder="0.00"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Result */}
            <div className={cn(
              "rounded-lg p-4 border",
              isAboveNisab && totalAssets > 0
                ? "bg-primary-light border-primary/20"
                : "bg-secondary border-border"
            )}>
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
                    <span>Total Assets</span>
                    <span>${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Liabilities</span>
                    <span>${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                    <span>Net Zakatable</span>
                    <span>${netZakatableAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nisab ({nisabType})</span>
                    <span>${nisabThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>× 2.5%</span>
                    <span>= Zakat Due</span>
                  </div>
                </div>
              )}

              {totalAssets > 0 ? (
                isAboveNisab ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Zakat Due</p>
                      <p className="text-2xl font-serif font-semibold text-primary">
                        ${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Sparkles size={24} className="text-primary" />
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">Below Nisab Threshold</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your net assets (${netZakatableAssets.toLocaleString()}) are below the {nisabType} Nisab of ${nisabThreshold.toLocaleString()}.
                        Zakat may not be obligatory, but voluntary Sadaqah is always rewarded.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter your assets above to calculate your Zakat.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleApply}
                disabled={!isAboveNisab || zakatDue <= 0}
                className="flex-1"
              >
                Apply ${zakatDue > 0 ? zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} to Donation
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="sm:w-auto"
              >
                Reset
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground italic">
              This calculator provides a guided estimate. For complex cases involving business partnerships, 
              agricultural income, or unique circumstances, please consult with a qualified scholar.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
