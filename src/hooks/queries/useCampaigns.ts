import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getCampaigns, getCampaignById } from '@/lib/queries/campaigns'
import type { CampaignFilters } from '@/lib/queries/campaigns'
import type { Need } from '@/data/needsData'

export interface UseCampaignsResult {
  data: Need[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useCampaigns(filters?: CampaignFilters): UseCampaignsResult {
  const [data, setData] = useState<Need[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Stable string key for filter comparison — avoids reference equality issues.
  const filtersKey = JSON.stringify(filters)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getCampaigns(filters).then(campaigns => {
      if (cancelled) return
      setData(campaigns)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load campaigns'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  // filtersKey encodes all filter values; refetchTrigger forces a re-fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, refetchTrigger])

  // ── Realtime: update only raised_amount for changed campaigns ────────────────
  // Subscribes once on mount. When the DB fires an UPDATE on campaigns, we
  // patch only the raised field so progress bars stay live without a full
  // re-fetch. The filter excludes soft-deleted rows at the channel level.
  useEffect(() => {
    const channel = supabase
      .channel('campaign-raised-amounts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: 'deleted_at=is.null',
        },
        (payload) => {
          const updated = payload.new as { id: string; raised_amount: number }
          setData(prev =>
            prev.map(c =>
              c.id === updated.id ? { ...c, raised: updated.raised_amount } : c,
            ),
          )
        },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])

  return { data, isLoading, error, refetch }
}

export interface UseCampaignResult {
  data: Need | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useCampaign(id: string | undefined): UseCampaignResult {
  const [data, setData] = useState<Need | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    if (!id) {
      setData(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)

    getCampaignById(id).then(need => {
      if (cancelled) return
      setData(need)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load campaign'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [id, refetchTrigger])

  return { data, isLoading, error, refetch }
}
