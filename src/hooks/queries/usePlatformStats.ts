import { useState, useEffect, useCallback } from 'react'
import {
  getPlatformStats,
  getDonationsByCategory,
  getMonthlyDonationTrend,
} from '@/lib/queries/platformStats'
import type { PlatformStats } from '@/lib/supabase'
import type { CategoryBreakdown, MonthlyTrend } from '@/lib/queries/platformStats'

export interface UsePlatformStatsResult {
  stats: PlatformStats | null
  donationsByCategory: CategoryBreakdown[]
  monthlyTrend: MonthlyTrend[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePlatformStats(): UsePlatformStatsResult {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [donationsByCategory, setDonationsByCategory] = useState<CategoryBreakdown[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    Promise.all([
      getPlatformStats(),
      getDonationsByCategory(),
      getMonthlyDonationTrend(),
    ]).then(([statsData, categories, trend]) => {
      if (cancelled) return
      setStats(statsData)
      setDonationsByCategory(categories)
      setMonthlyTrend(trend)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load platform stats'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [refetchTrigger])

  return { stats, donationsByCategory, monthlyTrend, isLoading, error, refetch }
}
