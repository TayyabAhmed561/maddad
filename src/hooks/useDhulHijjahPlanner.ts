import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { GivingType, ScheduledDonation, ScheduledDonationStatus, CampaignSeries } from '@/lib/supabase'
import { SEASONS } from '@/config/seasons'

export interface ScheduledDay {
  day: number
  date: string          // YYYY-MM-DD
  status: ScheduledDonationStatus | 'not_scheduled'
  dbId?: string
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export function useDhulHijjahPlanner() {
  const { user, session } = useAuth()
  const navigate = useNavigate()

  const [dailyAmount, setDailyAmount] = useState(25)
  const [givingType, setGivingType] = useState<GivingType>('sadaqah')
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [isScheduling, setIsScheduling] = useState(false)
  const [existingPlan, setExistingPlan] = useState<ScheduledDonation[] | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  const season = SEASONS.dhulHijjah2026

  // Load any existing plan for this season on mount
  useEffect(() => {
    if (!user) {
      setPlanLoading(false)
      return
    }
    let cancelled = false
    setPlanLoading(true)

    supabase
      .from('scheduled_donations')
      .select('*')
      .eq('donor_id', user.id)
      .eq('campaign_series', 'dhul_hijjah' satisfies CampaignSeries)
      .gte('scheduled_date', toDateStr(season.start))
      .lte('scheduled_date', toDateStr(season.end))
      .neq('status', 'cancelled')
      .order('scheduled_date', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return
        const rows = (data ?? []) as ScheduledDonation[]
        setExistingPlan(rows.length > 0 ? rows : null)
        setPlanLoading(false)
      })

    return () => { cancelled = true }
  }, [user, season.start, season.end])

  const isScheduled = existingPlan !== null && existingPlan.length > 0

  // Compute 10 display rows — from DB if scheduled, otherwise all 'not_scheduled'
  const scheduledDays: ScheduledDay[] = Array.from({ length: 10 }, (_, i) => {
    const dateStr = toDateStr(addDays(season.start, i))
    const row = existingPlan?.find(r => r.scheduled_date === dateStr)
    return {
      day: i + 1,
      date: dateStr,
      status: (row?.status as ScheduledDonationStatus) ?? 'not_scheduled',
      dbId: row?.id,
    }
  })

  const scheduleGiving = useCallback(async (): Promise<boolean> => {
    if (!session) {
      navigate('/login', { state: { from: { pathname: '/dhul-hijjah' } } })
      return false
    }

    setIsScheduling(true)

    // TODO: Phase 2 — when Stripe Subscriptions are wired, replace this insert
    // with a call to create-payment-intent for each day, or set up a scheduled
    // Edge Function that processes rows where status='scheduled' AND
    // scheduled_date <= now(). For now, rows represent confirmed intent only.
    const rows = Array.from({ length: 10 }, (_, i) => ({
      donor_id: user!.id,
      campaign_id: campaignId,
      giving_type: givingType,
      amount: dailyAmount,
      currency: 'CAD' as const,
      scheduled_date: toDateStr(addDays(season.start, i)),
      status: 'scheduled' as ScheduledDonationStatus,
      campaign_series: 'dhul_hijjah' as CampaignSeries,
    }))

    const { data, error } = await supabase
      .from('scheduled_donations')
      .insert(rows)
      .select()

    setIsScheduling(false)

    if (error) {
      console.error('[useDhulHijjahPlanner] insert failed:', error.message)
      return false
    }

    setExistingPlan((data ?? []) as ScheduledDonation[])
    return true
  }, [session, user, campaignId, givingType, dailyAmount, season.start, navigate])

  const cancelGiving = useCallback(async (): Promise<boolean> => {
    if (!user || !existingPlan) return false

    const ids = existingPlan
      .filter(r => r.status === 'scheduled')
      .map(r => r.id)

    if (ids.length === 0) return true

    const { error } = await supabase
      .from('scheduled_donations')
      .update({ status: 'cancelled' as ScheduledDonationStatus })
      .in('id', ids)
      .eq('donor_id', user.id)

    if (error) {
      console.error('[useDhulHijjahPlanner] cancel failed:', error.message)
      return false
    }

    setExistingPlan(null)
    return true
  }, [user, existingPlan])

  return {
    dailyAmount, setDailyAmount,
    givingType, setGivingType,
    campaignId, setCampaignId,
    scheduledDays,
    isScheduling,
    isScheduled,
    planLoading,
    existingPlan,
    scheduleGiving,
    cancelGiving,
    totalAmount: dailyAmount * 10,
  }
}
