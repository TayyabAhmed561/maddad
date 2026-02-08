import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getReceipts, type DonationReceipt } from "@/types/receipt";
import {
  Receipt,
  TrendingUp,
  Heart,
  Filter,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortBy = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
type FilterType = "all" | "zakat" | "sadaqah" | "general" | "fidya" | "kaffarah" | "qurbani" | "sadaqah-jariyah";

const filterLabels: Record<FilterType, string> = {
  all: "All",
  zakat: "Zakat",
  sadaqah: "Sadaqah",
  general: "General",
  fidya: "Fidya",
  kaffarah: "Kaffarah",
  qurbani: "Qurbani",
  "sadaqah-jariyah": "Jariyah",
};

export default function MyGiving() {
  const navigate = useNavigate();
  const allReceipts = getReceipts();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");

  const filteredReceipts = useMemo(() => {
    let result = [...allReceipts];

    // Filter
    if (filterType !== "all") {
      result = result.filter((r) => r.donationType === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "date-desc":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [allReceipts, filterType, sortBy]);

  const totalDonated = allReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="section-warm py-12 pattern-subtle">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
              My Giving
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your donation history and receipts — stored locally in this browser.
            </p>

            {/* Summary Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <StatBox
                label="Total Donated"
                value={`$${totalDonated.toLocaleString()}`}
                icon={<Heart className="w-5 h-5 text-primary" />}
              />
              <StatBox
                label="Donations"
                value={allReceipts.length.toString()}
                icon={<Receipt className="w-5 h-5 text-primary" />}
              />
              <StatBox
                label="Impact Tracked"
                value={`${allReceipts.length}`}
                icon={<TrendingUp className="w-5 h-5 text-primary" />}
              />
            </div>
          </div>
        </section>

        {/* Receipts List */}
        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Filters & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {(Object.keys(filterLabels) as FilterType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      filterType === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filterLabels[key]}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setSortBy((prev) =>
                    prev === "date-desc"
                      ? "amount-desc"
                      : prev === "amount-desc"
                        ? "amount-asc"
                        : prev === "amount-asc"
                          ? "date-asc"
                          : "date-desc"
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortBy === "date-desc"
                  ? "Newest first"
                  : sortBy === "date-asc"
                    ? "Oldest first"
                    : sortBy === "amount-desc"
                      ? "Highest amount"
                      : "Lowest amount"}
              </button>
            </div>

            {filteredReceipts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Receipt className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {allReceipts.length === 0
                    ? "No donations yet"
                    : "No matching donations"}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {allReceipts.length === 0
                    ? "When you make a donation on Maddad, your receipts will appear here."
                    : "Try adjusting your filters to see more results."}
                </p>
                {allReceipts.length === 0 && (
                  <Link to="/explore">
                    <Button>Explore Causes</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReceipts.map((receipt) => (
                  <ReceiptRow
                    key={receipt.receiptId}
                    receipt={receipt}
                    onClick={() => navigate(`/receipt/${receipt.receiptId}`)}
                  />
                ))}
              </div>
            )}

            {/* Auth teaser */}
            <div className="mt-10 bg-muted/50 rounded-xl border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Currently stored in your browser.{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>{" "}
                to sync your giving history across devices.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ReceiptRow({
  receipt,
  onClick,
}: {
  receipt: DonationReceipt;
  onClick: () => void;
}) {
  const date = new Date(receipt.date);

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl border border-border p-4 sm:p-5 flex items-center gap-4 hover:shadow-warm transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Heart className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {receipt.campaignTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {receipt.donationType && (
            <>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground capitalize">
                {receipt.donationType}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-foreground">
          ${receipt.amount.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {receipt.receiptId.slice(-10)}
        </p>
      </div>
    </button>
  );
}
