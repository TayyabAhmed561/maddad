import { cn } from "@/lib/utils";
import type { DonationFrequency } from "@/types/giving";

interface RecurringDonationToggleProps {
  value: DonationFrequency;
  onChange: (value: DonationFrequency) => void;
  showWeekly?: boolean;
  showYearly?: boolean;
  className?: string;
}

const frequencies: { value: DonationFrequency; label: string }[] = [
  { value: "one-time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function RecurringDonationToggle({
  value,
  onChange,
  showWeekly = false,
  showYearly = true,
  className
}: RecurringDonationToggleProps) {
  const filteredFrequencies = frequencies.filter((f) => {
    if (f.value === "weekly" && !showWeekly) return false;
    if (f.value === "yearly" && !showYearly) return false;
    return true;
  });

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground block">Frequency</label>
      <div className="flex rounded-lg bg-secondary p-1">
        {filteredFrequencies.map((freq) => (
          <button
            key={freq.value}
            onClick={() => onChange(freq.value)}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300",
              value === freq.value
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {freq.label}
          </button>
        ))}
      </div>
    </div>
  );
}
