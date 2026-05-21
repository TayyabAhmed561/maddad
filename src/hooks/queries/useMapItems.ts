import { useState, useEffect, useCallback } from 'react'
import { getMapItems } from '@/lib/queries/campaigns'
import type { MapBounds, MapFilters } from '@/lib/queries/campaigns'
import type { MapItem } from '@/data/mapData'

export interface UseMapItemsResult {
  data: MapItem[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMapItems(
  bounds?: MapBounds,
  filters?: MapFilters,
): UseMapItemsResult {
  const [data, setData] = useState<MapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const boundsKey = JSON.stringify(bounds)
  const filtersKey = JSON.stringify(filters)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getMapItems(bounds, filters).then(items => {
      if (cancelled) return
      setData(items)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load map items'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  // boundsKey and filtersKey encode all values for stable comparison.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, filtersKey, refetchTrigger])

  return { data, isLoading, error, refetch }
}
