import { useState, useEffect, useCallback } from 'react'
import { getMyReceipts } from '@/lib/queries/receipts'
import type { ReceiptRow } from '@/lib/queries/receipts'
import { useAuth } from '@/hooks/useAuth'

export interface UseMyReceiptsResult {
  data: ReceiptRow[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useMyReceipts(): UseMyReceiptsResult {
  const { user } = useAuth()
  const [data, setData] = useState<ReceiptRow[]>([])
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

    getMyReceipts(user.id).then(rows => {
      if (cancelled) return
      setData(rows)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      setError(err instanceof Error ? err.message : 'Failed to load receipts')
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [user, refetchTrigger])

  return { data, isLoading, error, refetch }
}
