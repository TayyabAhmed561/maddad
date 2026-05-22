import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NeedCard } from "@/components/NeedCard";
import { useDhulHijjahPlanner } from "@/hooks/useDhulHijjahPlanner";
import { useCampaigns } from "@/hooks/queries/useCampaigns";
import { SEASONS } from "@/config/seasons";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { GivingType } from "@/lib/supabase";
import {
  Sun,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Heart,
  Star,
  ArrowRight,
  Loader2,
  X,
  Scissors,
  Sparkles,
} from "lucide-react";

// ── Static data ────────────────────────────────────────────────────────────────

const GIVING_TYPE_OPTIONS: { value: GivingType; label: string }[] = [
  { value: "sadaqah",        label: "Sadaqah" },
  { value: "sadaqah_jariyah", label: "Sadaqah Jariyah" },
  { value: "zakat",          label: "Zakat" },
  { value: "qurbani",        label: "Qurbani" },
]

const AMAL_BY_DAY = [
  {
    day: 1, title: "Begin with intention",
    deed: "Make tawbah and set your Dhul Hijjah intention. Start fasting if able — every fast earns a year's reward.",
    badge: null, highlight: false,
  },
  {
    day: 2, title: "Give Sadaqah",
    deed: "Give charity today. Even a date-worth given with sincerity is beloved to Allah.",
    badge: null, highlight: false,
  },
  {
    day: 3, title: "Recite Quran",
    deed: "Increase recitation and complete a juz if possible. Add 100 Subhanallah, 100 Alhamdulillah.",
    badge: null, highlight: false,
  },
  {
    day: 4, title: "Pray Tahajjud",
    deed: "Rise before Fajr. These nights are among the most powerful times for dua.",
    badge: null, highlight: false,
  },
  {
    day: 5, title: "Seek forgiveness",
    deed: "Recite Astaghfirullah 100 times. Call a family member you have not spoken to recently.",
    badge: null, highlight: false,
  },
  {
    day: 6, title: "Give Sadaqah Jariyah",
    deed: "Contribute to ongoing benefit — a well, a masjid project, or sponsoring an orphan.",
    badge: null, highlight: false,
  },
  {
    day: 7, title: "Strengthen family ties",
    deed: "Visit or call family and neighbours. Silat al-rahim earns extra reward in these days.",
    badge: null, highlight: false,
  },
  {
    day: 8, title: "Day of Tarwiyah — Fast",
    deed: "Pilgrims set out for Mina today. Those not at Hajj should fast and increase their dhikr.",
    badge: "Tarwiyah", highlight: false,
  },
  {
    day: 9, title: "Day of Arafah — Fast",
    deed: "The best day of the entire year. Fasting expiates sins of the previous and coming year. Make abundant dua from Dhuhr to Maghrib.",
    badge: "Arafah", highlight: true,
  },
  {
    day: 10, title: "Eid al-Adha — Give Qurbani",
    deed: "Do NOT fast today. Perform or donate your Qurbani. Celebrate Eid, distribute meat, and remember those in need.",
    badge: "Eid al-Adha", highlight: true,
  },
]

interface Countdown {
  days: number; hours: number; minutes: number; seconds: number; started: boolean
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function DhulHijjah() {
  const navigate = useNavigate()
  const plannerRef = useRef<HTMLElement>(null)

  const {
    dailyAmount, setDailyAmount,
    givingType, setGivingType,
    campaignId, setCampaignId,
    scheduledDays,
    isScheduling, isScheduled,
    planLoading,
    scheduleGiving, cancelGiving,
    totalAmount,
  } = useDhulHijjahPlanner()

  const { data: allCampaigns } = useCampaigns({ verifiedOnly: true })

  // Featured: qurbani, sadaqah_jariyah, zakat giving types
  const featuredCampaigns = allCampaigns
    .filter(c => c.category === "qurbani" || c.zakatEligible)
    .slice(0, 6)

  const qurbaniCampaigns = allCampaigns
    .filter(c => c.category === "qurbani")
    .slice(0, 3)

  // Countdown timer
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0, hours: 0, minutes: 0, seconds: 0, started: false,
  })

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const target = SEASONS.dhulHijjah2026.start.getTime()
      if (now >= target) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, started: true })
        return
      }
      const diff = target - now
      setCountdown({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)      / 1_000),
        started: false,
      })
    }
    update()
    const id = setInterval(update, 1_000)
    return () => clearInterval(id)
  }, [])

  const handleSchedule = async () => {
    if (dailyAmount <= 0) return
    const ok = await scheduleGiving()
    if (ok) {
      toast({ title: "10-day plan scheduled", description: "Your giving is set. May Allah accept it." })
    } else {
      toast({ title: "Could not schedule", description: "Please try again.", variant: "destructive" })
    }
  }

  const handleCancel = async () => {
    const ok = await cancelGiving()
    if (ok) toast({ title: "Plan cancelled" })
    else toast({ title: "Could not cancel", variant: "destructive" })
  }

  const handleView = useCallback((id: string) => navigate(`/need/${id}`), [navigate])
  const handleDonate = useCallback((id: string) => navigate(`/need/${id}#donate`), [navigate])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-22 pattern-subtle overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <Link
              to="/giving"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Giving
            </Link>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sun size={14} />
                <span>Dhul Hijjah 1447H · May – June 2026</span>
              </div>

              <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-5">
                The 10 Best Days of the Year
              </h1>

              <p className="text-lg text-muted-foreground text-body max-w-2xl mb-4">
                "There are no days in which righteous deeds are more beloved to Allah
                than these ten days."
              </p>
              <p className="text-sm text-muted-foreground italic mb-8">
                — Ibn ʿAbbas (may Allah be pleased with him), reported in Bukhari
              </p>

              {/* Countdown */}
              {countdown.started ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium mb-8">
                  <Sparkles size={16} />
                  The blessed days are here — every deed is multiplied
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mb-8">
                  {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
                    <div key={unit} className="bg-card border border-border rounded-xl px-5 py-4 text-center min-w-[72px]">
                      <div className="font-serif text-3xl font-bold text-primary tabular-nums">
                        {String(countdown[unit]).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{unit}</div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                size="lg"
                onClick={() => plannerRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                <Heart size={16} />
                Start My 10-Day Plan
              </Button>
            </div>
          </div>
        </section>

        {/* ── 10-Day Planner ─────────────────────────────────────────── */}
        <section ref={plannerRef} className="section-spacing-sm border-b border-border bg-card" id="planner">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="heading-section text-2xl text-foreground">
                  10-Day Automated Giving
                </h2>
              </div>
              <p className="text-muted-foreground text-sm mb-8">
                Set it and forget it — give every day of Dhul Hijjah automatically.
                One daily amount, distributed across 10 days.
              </p>

              {planLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : isScheduled ? (
                <PlanActiveCard
                  scheduledDays={scheduledDays}
                  onCancel={handleCancel}
                />
              ) : (
                <div className="bg-background rounded-xl border border-border p-6 space-y-6">
                  {/* Daily amount */}
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Daily Amount (CAD)
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {[10, 25, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setDailyAmount(preset)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            dailyAmount === preset
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground hover:bg-secondary/80"
                          )}
                        >
                          ${preset}
                        </button>
                      ))}
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min={1}
                          value={dailyAmount}
                          onChange={(e) => setDailyAmount(Math.max(1, Number(e.target.value)))}
                          className="w-24 h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Giving type */}
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Giving Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {GIVING_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setGivingType(opt.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                            givingType === opt.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign selector */}
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Campaign
                    </label>
                    <Select
                      value={campaignId ?? "auto"}
                      onValueChange={(v) => setCampaignId(v === "auto" ? null : v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a campaign…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          Let Maddad choose — distribute across verified campaigns
                        </SelectItem>
                        {allCampaigns.slice(0, 20).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        ${dailyAmount} × 10 days
                      </p>
                      <p className="font-serif text-2xl font-bold text-primary">
                        ${totalAmount.toLocaleString()} CAD total
                      </p>
                    </div>
                    <Button
                      onClick={handleSchedule}
                      disabled={isScheduling || dailyAmount <= 0}
                    >
                      {isScheduling ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scheduling…</>
                      ) : (
                        <><Heart className="w-4 h-4 mr-1" />Schedule 10-Day Giving</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Daily Amal Tracker ─────────────────────────────────────── */}
        <section className="section-spacing-sm section-warm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="heading-section text-2xl md:text-3xl text-foreground mb-3">
                10-Day Amal Tracker
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Every day has its own virtue. Pair your giving with these recommended deeds.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {AMAL_BY_DAY.map((amal, i) => {
                const dayStatus = isScheduled ? scheduledDays[i]?.status : 'not_scheduled'
                return (
                  <AmalDayCard
                    key={amal.day}
                    day={amal}
                    status={dayStatus ?? 'not_scheduled'}
                    date={SEASONS.dhulHijjah2026.start}
                  />
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Featured Campaigns ─────────────────────────────────────── */}
        <section className="section-spacing-sm bg-card">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <h2 className="heading-section text-2xl text-foreground">
                  Best Deeds in These Blessed Days
                </h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Verified campaigns for Sadaqah, Zakat, and Qurbani — the most rewarded acts of Dhul Hijjah.
              </p>
            </div>

            {featuredCampaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredCampaigns.map((c) => (
                  <NeedCard
                    key={c.id}
                    id={c.id}
                    title={c.title}
                    organization={c.organization}
                    isVerified={c.isVerified}
                    category={c.category}
                    location={c.location}
                    raised={c.raised}
                    goal={c.goal}
                    lastUpdated={c.lastUpdated}
                    onView={handleView}
                    onDonate={handleDonate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">
                Featured Dhul Hijjah campaigns will appear here once published.
              </p>
            )}
          </div>
        </section>

        {/* ── Qurbani ────────────────────────────────────────────────── */}
        <section className="section-spacing-sm pattern-subtle section-warm border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="w-5 h-5 text-primary" />
                    <h2 className="heading-section text-2xl text-foreground">
                      Qurbani — Day 10
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Eid al-Adha is Qurbani day. Give your sacrifice through a verified organization
                    and feed families across the world.
                  </p>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link to="/giving/qurbani">
                    All Qurbani Options
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>

              {qurbaniCampaigns.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-5">
                  {qurbaniCampaigns.map((c) => (
                    <NeedCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      organization={c.organization}
                      isVerified={c.isVerified}
                      category={c.category}
                      location={c.location}
                      raised={c.raised}
                      goal={c.goal}
                      lastUpdated={c.lastUpdated}
                      onView={handleView}
                      onDonate={handleDonate}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    Qurbani campaigns will be listed here closer to Eid al-Adha.
                  </p>
                  <Button asChild>
                    <Link to="/giving/qurbani">
                      <Scissors size={14} />
                      Explore Qurbani
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PlanActiveCard({
  scheduledDays,
  onCancel,
}: {
  scheduledDays: import("@/hooks/useDhulHijjahPlanner").ScheduledDay[]
  onCancel: () => void
}) {
  const completed = scheduledDays.filter(d => d.status === 'completed').length
  const scheduled = scheduledDays.filter(d => d.status === 'scheduled').length

  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Your 10-Day Plan is Active
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <X size={12} />
          Cancel plan
        </button>
      </div>

      <div className="flex gap-4 mb-5">
        <div className="bg-primary/5 rounded-lg px-4 py-3 text-center flex-1">
          <p className="text-xl font-bold text-primary">{completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-secondary rounded-lg px-4 py-3 text-center flex-1">
          <p className="text-xl font-bold text-foreground">{scheduled}</p>
          <p className="text-xs text-muted-foreground">Upcoming</p>
        </div>
        <div className="bg-secondary rounded-lg px-4 py-3 text-center flex-1">
          <p className="text-xl font-bold text-foreground">10</p>
          <p className="text-xs text-muted-foreground">Total days</p>
        </div>
      </div>

      <div className="flex gap-1">
        {scheduledDays.map((d) => (
          <div
            key={d.day}
            title={`Day ${d.day}: ${d.status}`}
            className={cn(
              "flex-1 h-2 rounded-full",
              d.status === 'completed' ? "bg-primary" :
              d.status === 'scheduled' ? "bg-primary/30" :
              d.status === 'failed'    ? "bg-destructive/50" :
              "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}

function AmalDayCard({
  day,
  status,
  date: baseDate,
}: {
  day: typeof AMAL_BY_DAY[0]
  status: import("@/hooks/useDhulHijjahPlanner").ScheduledDay["status"]
  date: Date
}) {
  const dayDate = new Date(baseDate)
  dayDate.setDate(dayDate.getDate() + day.day - 1)
  const dateStr = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const StatusIcon =
    status === 'completed'      ? CheckCircle :
    status === 'scheduled'      ? Clock :
    status === 'failed'         ? XCircle :
    status === 'not_scheduled'  ? null :
    null

  const statusColor =
    status === 'completed'     ? "text-primary" :
    status === 'scheduled'     ? "text-muted-foreground" :
    status === 'failed'        ? "text-destructive" :
    "text-muted-foreground"

  return (
    <div className={cn(
      "bg-card rounded-xl border p-5 transition-all",
      day.highlight ? "border-primary/30 bg-primary/5" : "border-border",
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            day.highlight
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          )}>
            {day.day}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {day.title}
            </p>
            <p className="text-xs text-muted-foreground">{dateStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {day.badge && (
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              day.day === 9
                ? "bg-primary text-primary-foreground"
                : "bg-accent/15 text-accent-foreground"
            )}>
              {day.badge}
            </span>
          )}
          {StatusIcon && (
            <StatusIcon size={15} className={statusColor} />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {day.deed}
      </p>
    </div>
  )
}
