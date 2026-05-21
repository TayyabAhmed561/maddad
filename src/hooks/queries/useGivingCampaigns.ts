import { useState, useEffect, useCallback } from 'react'
import { getCampaignsByGivingType, getZakatEligibleCampaigns } from '@/lib/queries/campaigns'
import type { GivingType } from '@/lib/supabase'
import type { Need } from '@/data/needsData'

export interface UseGivingCampaignsResult {
  data: Need[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useGivingCampaigns(givingType: GivingType): UseGivingCampaignsResult {
  const [data, setData] = useState<Need[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getCampaignsByGivingType(givingType).then(campaigns => {
      if (cancelled) return
      setData(campaigns)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load giving campaigns'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [givingType, refetchTrigger])

  return { data, isLoading, error, refetch }
}

export function useZakatCampaigns(): UseGivingCampaignsResult {
  const [data, setData] = useState<Need[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getZakatEligibleCampaigns().then(campaigns => {
      if (cancelled) return
      setData(campaigns)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load zakat campaigns'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [refetchTrigger])

  return { data, isLoading, error, refetch }
}
