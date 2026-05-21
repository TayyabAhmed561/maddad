import { useState, useEffect, useCallback } from 'react'
import { getMyDonations } from '@/lib/queries/donations'
import { useAuth } from '@/hooks/useAuth'
import type { DonationReceipt } from '@/types/receipt'

export interface UseMyDonationsResult {
  data: DonationReceipt[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMyDonations(): UseMyDonationsResult {
  const { user } = useAuth()
  const [data, setData] = useState<DonationReceipt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    if (!user) {
      setData([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    getMyDonations(user.id).then(donations => {
      if (cancelled) return
      setData(donations)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load donations'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [user, refetchTrigger])

  return { data, isLoading, error, refetch }
}
