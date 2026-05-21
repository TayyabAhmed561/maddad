import { useState, useEffect, useCallback } from 'react'
import { getAppeals, getAppealById } from '@/lib/queries/appeals'
import type { CommunityAppeal } from '@/data/appealsData'

export interface UseAppealsResult {
  data: CommunityAppeal[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAppeals(): UseAppealsResult {
  const [data, setData] = useState<CommunityAppeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    getAppeals().then(appeals => {
      if (cancelled) return
      setData(appeals)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load appeals'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [refetchTrigger])

  return { data, isLoading, error, refetch }
}

export interface UseAppealResult {
  data: CommunityAppeal | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAppeal(id: string | undefined): UseAppealResult {
  const [data, setData] = useState<CommunityAppeal | null>(null)
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

    getAppealById(id).then(appeal => {
      if (cancelled) return
      setData(appeal)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load appeal'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [id, refetchTrigger])

  return { data, isLoading, error, refetch }
}
