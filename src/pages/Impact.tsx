import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatCard } from "@/components/StatCard";
import { 
  DollarSign, 
  Users, 
  Clock, 
  Package,
  TrendingUp,
  Heart,
  Calendar
} from "lucide-react";

const mainStats = [
  {
    icon: DollarSign,
    label: "Total Funds Raised",
    value: "$2,456,780",
    subtext: "Since platform launch"
  },
  {
    icon: Package,
    label: "Funds Allocated",
    value: "$2,198,450",
    subtext: "89% allocation rate"
  },
  {
    icon: Users,
    label: "Active Donors",
    value: "89,234",
    subtext: "Across 45 countries"
  },
  {
    icon: Clock,
    label: "Volunteer Hours",
    value: "12,450",
    subtext: "Pledged this month"
  }
];

const categoryBreakdown = [
  { category: "Food Security", amount: 845000, percentage: 38 },
  { category: "Shelter & Housing", amount: 534000, percentage: 24 },
  { category: "Medical Aid", amount: 378000, percentage: 17 },
  { category: "Education", amount: 267000, percentage: 12 },
  { category: "Masjid Projects", amount: 174450, percentage: 9 }
];

const recentTransparencyLog = [
  {
    date: "Jan 18, 2024",
    action: "Funds Released",
    organization: "Palestine Relief Network",
    amount: "$25,000",
    purpose: "Emergency food packages"
  },
  {
    date: "Jan 17, 2024",
    action: "Funds Released",
    organization: "Turkish Red Crescent",
    amount: "$45,000",
    purpose: "Earthquake shelter materials"
  },
  {
    date: "Jan 16, 2024",
    action: "Funds Released",
    organization: "Health Without Borders",
    amount: "$12,500",
    purpose: "Medical supplies shipment"
  },
  {
    date: "Jan 15, 2024",
    action: "Funds Released",
    organization: "Syrian Relief Initiative",
    amount: "$18,000",
    purpose: "Winter food packages"
  },
  {
    date: "Jan 14, 2024",
    action: "Funds Released",
    organization: "Al-Noor Foundation",
    amount: "$32,000",
    purpose: "Masjid construction phase 2"
  }
];

const monthlyStats = [
  { month: "Jan 2024", raised: 245000, donors: 8900 },
  { month: "Dec 2023", raised: 312000, donors: 11200 },
  { month: "Nov 2023", raised: 198000, donors: 7400 },
  { month: "Oct 2023", raised: 267000, donors: 9100 }
];

export default function Impact() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-light/50 via-background to-accent-light/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6">
                <TrendingUp size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Impact Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Full transparency into where donations go and the impact they create. Updated in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Main Stats */}
        <section className="py-10 border-b border-border section-cream">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {mainStats.map((stat, index) => (
                <StatCard 
                  key={stat.label}
                  {...stat}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="py-12 md:py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Funds Allocated by Category
              </h2>
              
              <div className="space-y-6">
                {categoryBreakdown.map((item, index) => (
                  <div 
                    key={item.category}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{item.category}</span>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Overview */}
        <section className="py-12 md:py-16 section-warm">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Monthly Overview
            </h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              {monthlyStats.map((stat, index) => (
                <div 
                  key={stat.month}
                  className="bg-card rounded-xl border border-border p-5 animate-fade-in-up shadow-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar size={14} />
                    {stat.month}
                  </div>
                  <div className="text-xl font-bold text-foreground mb-1">
                    {formatCurrency(stat.raised)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.donors.toLocaleString()} donors
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transparency Log */}
        <section className="py-12 md:py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Recent Transparency Log
              </h2>
              <p className="text-muted-foreground mb-8">
                Every fund release is documented and publicly available.
              </p>
              
              <div className="bg-background rounded-xl border border-border overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="section-cream">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Organization</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Purpose</th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentTransparencyLog.map((entry, index) => (
                        <tr 
                          key={index}
                          className="hover:bg-muted/30 transition-colors animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                            {entry.date}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            {entry.organization}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {entry.purpose}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-primary text-right whitespace-nowrap">
                            {entry.amount}
                          </td>
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
        <section className="py-12 md:py-16 section-cream">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Heart size={32} className="text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Our Commitment to Transparency
              </h2>
              <p className="text-muted-foreground leading-relaxed">
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
