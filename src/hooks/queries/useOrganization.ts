import { useState, useEffect, useCallback } from 'react'
import { getOrganizationById, getOrganizationBySlug } from '@/lib/queries/organizations'
import type { OrgRow } from '@/lib/queries/organizations'

export interface UseOrganizationResult {
  data: OrgRow | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useOrganization(id: string | undefined): UseOrganizationResult {
  const [data, setData] = useState<OrgRow | null>(null)
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

    getOrganizationById(id).then(org => {
      if (cancelled) return
      setData(org)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load organization'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [id, refetchTrigger])

  return { data, isLoading, error, refetch }
}

export function useOrganizationBySlug(slug: string | undefined): UseOrganizationResult {
  const [data, setData] = useState<OrgRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger(n => n + 1), [])

  useEffect(() => {
    if (!slug) {
      setData(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    getOrganizationBySlug(slug).then(org => {
      if (cancelled) return
      setData(org)
      setIsLoading(false)
    }).catch((err: unknown) => {
      if (cancelled) return
      const message = err instanceof Error ? err.message : 'Failed to load organization'
      setError(message)
      setIsLoading(false)
    })

    return () => { cancelled = true }
  }, [slug, refetchTrigger])

  return { data, isLoading, error, refetch }
}
