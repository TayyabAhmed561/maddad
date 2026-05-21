import { useState, useEffect, useCallback } from 'react'
import {
  getEvidenceForCampaign,
  getEvidenceForOrganization,
} from '@/lib/queries/evidence'
import type { EvidenceItem as UIEvidenceItem } from '@/types/verification'

export interface UseEvidenceResult {
  data: UIEvidenceItem[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useEvidence(params: {
  campaignId?: string
  orgId?: string
}): UseEvidenceResult {
  const [data, setData] = useState<UIEvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const { campaignId, orgId } = params

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    if (!campaignId && !orgId) {
      setData([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    setIsLoading(true)
    setError(null)

    const query = campaignId
      ? getEvidenceForCampaign(campaignId)
      : getEvidenceForOrganization(orgId as string)

    query.then(items => {
      if (cancelled) return
      setData(items)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load evidence'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [campaignId, orgId, refetchTrigger])

  return { data, isLoading, error, refetch }
}
