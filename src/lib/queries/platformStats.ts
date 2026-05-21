import { supabase } from '@/lib/supabase'
import type { PlatformStats, GivingType } from '@/lib/supabase'

// ── Return types ──────────────────────────────────────────────────────────────

export interface CategoryBreakdown {
  name: string
  value: number
  fill: string
}

export interface MonthlyTrend {
  month: string
  amount: number
}

// Colour palette keyed by giving_type — mirrors the categoryColors in mapData.ts.
// 'sadaqah' and 'sadaqah_jariyah' are not chart categories in the mock, so they
// share a neutral teal.
const CATEGORY_FILL: Record<GivingType, string> = {
  sadaqah: 'hsl(32, 65%, 42%)',
  meal_sponsorship: 'hsl(32, 65%, 42%)',
  fidya: 'hsl(38, 62%, 42%)',
  kaffarah: 'hsl(38, 62%, 42%)',
  qurbani: 'hsl(28, 55%, 42%)',
  sadaqah_jariyah: 'hsl(160, 45%, 32%)',
  zakat: 'hsl(160, 50%, 28%)',
}

const CATEGORY_LABEL: Record<GivingType, string> = {
  sadaqah: 'Sadaqah',
  meal_sponsorship: 'Meal Sponsorship',
  fidya: 'Fidya',
  kaffarah: 'Kaffarah',
  qurbani: 'Qurbani',
  sadaqah_jariyah: 'Sadaqah Jariyah',
  zakat: 'Zakat',
}

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ── Query functions ───────────────────────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await supabase
    .from('platform_stats')
    .select('total_raised_cad, total_donors, total_donations, active_campaigns, verified_organizations, regions_covered, total_zakat_raised_cad, total_zakat_donations')
    .maybeSingle()

  if (error || !data) {
    console.error('[getPlatformStats]', error)
    return {
      total_raised_cad: 0,
      total_donors: 0,
      total_donations: 0,
      active_campaigns: 0,
      verified_organizations: 0,
      regions_covered: 0,
      total_zakat_raised_cad: 0,
      total_zakat_donations: 0,
    }
  }

  return data as PlatformStats
}

// Aggregates succeeded donations by giving_type client-side.
// NOTE: For production scale this should be moved to a DB view or RPC function.
// The donations table will be empty until Stripe webhooks are active (Step 10).
export async function getDonationsByCategory(): Promise<CategoryBreakdown[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('giving_type, amount')
    .eq('status', 'succeeded')
    .is('deleted_at', null)

  if (error) {
    console.error('[getDonationsByCategory]', error)
    return []
  }

  const totals: Partial<Record<GivingType, number>> = {}

  for (const row of data as Array<{ giving_type: GivingType; amount: number }>) {
    totals[row.giving_type] = (totals[row.giving_type] ?? 0) + row.amount
  }

  return (Object.keys(totals) as GivingType[])
    .sort((a, b) => (totals[b] ?? 0) - (totals[a] ?? 0))
    .map(type => ({
      name: CATEGORY_LABEL[type],
      value: totals[type] ?? 0,
      fill: CATEGORY_FILL[type],
    }))
}

// Aggregates succeeded donations by calendar month for the last 12 months.
// Months with no donations are filled with 0 so the chart line is continuous.
// NOTE: Same scale caveat as getDonationsByCategory — move to a DB view at scale.
export async function getMonthlyDonationTrend(): Promise<MonthlyTrend[]> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const { data, error } = await supabase
    .from('donations')
    .select('amount, created_at')
    .eq('status', 'succeeded')
    .is('deleted_at', null)
    .gte('created_at', twelveMonthsAgo.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getMonthlyDonationTrend]', error)
    return []
  }

  const totals = new Map<string, number>()

  for (const row of data as Array<{ amount: number; created_at: string }>) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    totals.set(key, (totals.get(key) ?? 0) + row.amount)
  }

  // Build a full 12-month series with zeros for missing months
  const result: MonthlyTrend[] = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    result.push({
      month: SHORT_MONTH[d.getMonth()],
      amount: totals.get(key) ?? 0,
    })
  }

  return result
}
