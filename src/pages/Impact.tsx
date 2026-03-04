import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatCard } from "@/components/StatCard";
import { 
  DollarSign, Users, Clock, Package, TrendingUp, Heart, Calendar, CheckCircle, Globe, BarChart3
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { 
  impactMetrics, donationsByCategory, monthlyDonationTrend, milestoneCompletionRates 
} from "@/data/platformData";

const mainStats = [
  { icon: DollarSign, label: "Total Funds Raised", value: "$2,456,780", subtext: "Since platform launch" },
  { icon: Package, label: "Funds Allocated", value: "$2,198,450", subtext: "89% allocation rate" },
  { icon: Users, label: "Active Donors", value: "89,234", subtext: "Across 45 countries" },
  { icon: Clock, label: "Volunteer Hours", value: "12,450", subtext: "Pledged this month" },
];

const categoryBreakdown = [
  { category: "Food Security", amount: 845000, percentage: 38 },
  { category: "Shelter & Housing", amount: 534000, percentage: 24 },
  { category: "Medical Aid", amount: 378000, percentage: 17 },
  { category: "Education", amount: 267000, percentage: 12 },
  { category: "Masjid Projects", amount: 174450, percentage: 9 },
];

const recentTransparencyLog = [
  { date: "Jan 18, 2024", action: "Funds Released", organization: "Palestine Relief Network", amount: "$25,000", purpose: "Emergency food packages" },
  { date: "Jan 17, 2024", action: "Funds Released", organization: "Turkish Red Crescent", amount: "$45,000", purpose: "Earthquake shelter materials" },
  { date: "Jan 16, 2024", action: "Funds Released", organization: "Health Without Borders", amount: "$12,500", purpose: "Medical supplies shipment" },
  { date: "Jan 15, 2024", action: "Funds Released", organization: "Syrian Relief Initiative", amount: "$18,000", purpose: "Winter food packages" },
  { date: "Jan 14, 2024", action: "Funds Released", organization: "Al-Noor Foundation", amount: "$32,000", purpose: "Masjid construction phase 2" },
];

export default function Impact() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
              {mainStats.map((stat, index) => (
                <StatCard key={stat.label} {...stat} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties} />
              ))}
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <h2 className="heading-section text-2xl text-foreground mb-2">Verified Impact</h2>
            <p className="text-muted-foreground text-sm mb-8">Concrete outcomes from verified projects.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {impactMetrics.map((metric, index) => (
                <div key={metric.label} className="bg-background rounded-xl border border-border p-5 animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-foreground">
                    {metric.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.unit}</p>
                  {metric.previousValue && (
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{Math.round(((metric.value - metric.previousValue) / metric.previousValue) * 100)}% from last period
                    </p>
                  )}
                </div>
              ))}
            </div>
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
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyDonationTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(28, 18%, 42%)" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="hsl(28, 18%, 42%)" />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ color: "hsl(28, 25%, 12%)" }} />
                    <Bar dataKey="amount" fill="hsl(160, 45%, 32%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donations by Category Pie */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">By Category</h3>
                </div>
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
              </div>
            </div>
          </div>
        </section>

        {/* Milestone Completion Rates */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="heading-section text-2xl text-foreground mb-2">Milestone Completion Rates</h2>
              <p className="text-muted-foreground text-sm mb-8">How reliably projects reach each stage.</p>
              <div className="space-y-4">
                {milestoneCompletionRates.map((item, index) => (
                  <div key={item.stage} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.stage}</span>
                      <span className="text-sm font-serif font-semibold text-primary">{item.rate}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" style={{ width: `${item.rate}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="section-spacing-sm section-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-section text-2xl text-foreground mb-10">Funds Allocated by Category</h2>
              <div className="space-y-7">
                {categoryBreakdown.map((item, index) => (
                  <div key={item.category} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">{item.category}</span>
                      <div className="text-right">
                        <span className="font-serif font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" style={{ width: `${item.percentage}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Transparency Log */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="heading-section text-2xl text-foreground mb-3">Recent Transparency Log</h2>
              <p className="text-muted-foreground mb-10">Every fund release is documented and publicly available.</p>
              <div className="bg-background rounded-xl border border-border overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="section-cream">
                      <tr>
                        <th className="text-left px-7 py-5 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left px-7 py-5 text-sm font-medium text-muted-foreground">Organization</th>
                        <th className="text-left px-7 py-5 text-sm font-medium text-muted-foreground">Purpose</th>
                        <th className="text-right px-7 py-5 text-sm font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentTransparencyLog.map((entry, index) => (
                        <tr key={index} className="hover:bg-muted/30 transition-colors duration-200 animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
                          <td className="px-7 py-5 text-sm text-muted-foreground whitespace-nowrap">{entry.date}</td>
                          <td className="px-7 py-5 text-sm font-medium text-foreground">{entry.organization}</td>
                          <td className="px-7 py-5 text-sm text-muted-foreground">{entry.purpose}</td>
                          <td className="px-7 py-5 text-sm font-serif font-semibold text-primary text-right whitespace-nowrap">{entry.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

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
