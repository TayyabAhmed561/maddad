import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyDonations } from "@/hooks/queries/useMyDonations";
import { useMyReceipts } from "@/hooks/queries/useMyReceipts";
import type { DonationReceipt } from "@/types/receipt";
import type { ReceiptRow } from "@/lib/queries/receipts";
import {
  Receipt,
  TrendingUp,
  Heart,
  Filter,
  ArrowUpDown,
  Calendar,
  Download,
  Loader2,
  ArrowRight,
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
  const { data: allDonations, isLoading: donationsLoading } = useMyDonations();
  const { data: allReceipts, isLoading: receiptsLoading } = useMyReceipts();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");

  const filteredDonations = useMemo(() => {
    let result = [...allDonations];

    if (filterType !== "all") {
      result = result.filter((r) => r.donationType === filterType);
    }

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
  }, [allDonations, filterType, sortBy]);

  const totalDonated = allDonations.reduce((sum, r) => sum + r.amount, 0);

  if (donationsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

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
              Your donation history and receipts.
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
                value={allDonations.length.toString()}
                icon={<Receipt className="w-5 h-5 text-primary" />}
              />
              <StatBox
                label="Impact Tracked"
                value={allDonations.length.toString()}
                icon={<TrendingUp className="w-5 h-5 text-primary" />}
              />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Tabs defaultValue="donations">
              <TabsList className="mb-6">
                <TabsTrigger value="donations">Donations</TabsTrigger>
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
              </TabsList>

              {/* ── Donations tab ─────────────────────────────────── */}
              <TabsContent value="donations">
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

                {filteredDonations.length === 0 ? (
                  <EmptyState
                    icon={<Heart className="w-10 h-10 text-muted-foreground" />}
                    title={allDonations.length === 0 ? "No donations yet" : "No matching donations"}
                    body={
                      allDonations.length === 0
                        ? "Your donations will appear here once you make your first contribution."
                        : "Try adjusting your filters to see more results."
                    }
                    cta={allDonations.length === 0 ? <Link to="/explore"><Button>Explore Causes</Button></Link> : null}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredDonations.map((receipt) => (
                      <DonationRow
                        key={receipt.receiptId}
                        receipt={receipt}
                        onClick={() => navigate(`/receipt/${receipt.receiptId}`)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── Receipts tab ──────────────────────────────────── */}
              <TabsContent value="receipts">
                {receiptsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 size={32} className="animate-spin text-primary" />
                  </div>
                ) : allReceipts.length === 0 ? (
                  <EmptyState
                    icon={<Receipt className="w-10 h-10 text-muted-foreground" />}
                    title="No receipts yet"
                    body="Official receipts are generated after each successful donation is processed."
                    cta={null}
                  />
                ) : (
                  <div className="space-y-3">
                    {allReceipts.map((r) => (
                      <ReceiptRowItem key={r.id} receipt={r} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Support Maddad nudge */}
            <div className="mt-8 bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-0.5">
                  Enjoying Maddad? Help us stay free.
                </p>
                <p className="text-xs text-muted-foreground">
                  100% of your donations go to causes. We run on community support.
                </p>
              </div>
              <Link to="/support-maddad" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5">
                  Support Maddad
                  <ArrowRight size={13} />
                </Button>
              </Link>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

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

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h2 className="font-serif text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{body}</p>
      {cta}
    </div>
  );
}

function DonationRow({
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

function ReceiptRowItem({ receipt }: { receipt: ReceiptRow }) {
  const date = new Date(receipt.date);

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Receipt className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
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
          <span className="text-border">·</span>
          <span className="text-xs text-muted-foreground font-mono">
            {receipt.receiptSerial}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="text-sm font-bold text-foreground">
          ${receipt.amount.toLocaleString()} CAD
        </p>
        <Button variant="outline" size="sm" disabled>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          PDF
        </Button>
      </div>
    </div>
  );
}
