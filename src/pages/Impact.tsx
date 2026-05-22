import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatCard } from "@/components/StatCard";
import {
  DollarSign, Users, Clock, Package, TrendingUp, Heart, CheckCircle, Globe, BarChart3, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { usePlatformStats } from "@/hooks/queries/usePlatformStats";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

export default function Impact() {
  const { stats, donationsByCategory, monthlyTrend, isLoading } = usePlatformStats();

  const mainStats = [
    {
      icon: DollarSign,
      label: "Total Funds Raised",
      value: stats ? formatCurrency(stats.total_raised_cad) : "—",
      subtext: "Since platform launch",
    },
    {
      icon: Package,
      label: "Active Campaigns",
      value: stats ? stats.active_campaigns.toLocaleString() : "—",
      subtext: "Currently accepting donations",
    },
    {
      icon: Users,
      label: "Active Donors",
      value: stats ? stats.total_donors.toLocaleString() : "—",
      subtext: `Across ${stats?.regions_covered ?? "—"} regions`,
    },
    {
      icon: Clock,
      label: "Verified Organizations",
      value: stats ? stats.verified_organizations.toLocaleString() : "—",
      subtext: "Reviewed and approved",
    },
  ];

  const impactMetrics = stats
    ? [
        { label: "Total Donations", value: stats.total_donations, unit: "completed donations" },
        { label: "Zakat Raised", value: stats.total_zakat_raised_cad, unit: "CAD (ring-fenced)" },
        { label: "Zakat Donations", value: stats.total_zakat_donations, unit: "dedicated zakat transactions" },
        { label: "Active Campaigns", value: stats.active_campaigns, unit: "campaigns accepting donations" },
        { label: "Regions Covered", value: stats.regions_covered, unit: "distinct geographic regions" },
        { label: "Verified Organizations", value: stats.verified_organizations, unit: "approved organizations" },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary-light/40 via-background to-accent-light/30 py-20 md:py-24 pattern-subtle">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-primary text-primary-foreground mb-8 shadow-warm">
                <TrendingUp size={36} />
              </div>
              <h1 className="heading-display text-4xl md:text-5xl text-foreground mb-5">Impact Dashboard</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-body">
                Full transparency into where donations go and the impact they create. Updated in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Main Stats */}
        <section className="py-12 border-b border-border section-cream">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
                {mainStats.map((stat, index) => (
                  <StatCard
                    key={stat.label}
                    {...stat}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <h2 className="heading-section text-2xl text-foreground mb-2">Platform Metrics</h2>
            <p className="text-muted-foreground text-sm mb-8">Live numbers from the platform database.</p>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {impactMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className="bg-background rounded-xl border border-border p-5 animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-foreground">
                      {metric.label.includes("Raised")
                        ? formatCurrency(metric.value)
                        : metric.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Charts Row */}
        <section className="section-spacing-sm section-warm pattern-geometric">
          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Monthly Trend */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">Monthly Donations</h3>
                </div>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(28, 18%, 42%)" />
                      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="hsl(28, 18%, 42%)" />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ color: "hsl(28, 25%, 12%)" }} />
                      <Bar dataKey="amount" fill="hsl(160, 45%, 32%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                    No donation data yet.
                  </div>
                )}
              </div>

              {/* Donations by Category Pie */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">By Category</h3>
                </div>
                {donationsByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={donationsByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donationsByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                      {donationsByCategory.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.fill }} />
                          {cat.name}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                    No donation data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Category Breakdown from donations */}
        {donationsByCategory.length > 0 && (
          <section className="section-spacing-sm section-cream">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="heading-section text-2xl text-foreground mb-10">Funds Allocated by Category</h2>
                <div className="space-y-7">
                  {donationsByCategory.map((item, index) => {
                    const total = donationsByCategory.reduce((s, c) => s + c.value, 0)
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                    return (
                      <div
                        key={item.name}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-foreground">{item.name}</span>
                          <div className="text-right">
                            <span className="font-serif font-semibold text-foreground">{formatCurrency(item.value)}</span>
                            <span className="text-sm text-muted-foreground ml-2">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.fill,
                              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trust Statement */}
        <section className="section-spacing-sm section-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Heart size={36} className="text-primary mx-auto mb-5" />
              <h2 className="heading-section text-2xl text-foreground mb-5">Our Commitment to Transparency</h2>
              <p className="text-muted-foreground text-body">
                Every donation is tracked from the moment it's received to the moment it reaches those in need. We publish complete fund allocation reports monthly, and our platform fee never exceeds 2%. Your trust is our responsibility.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
