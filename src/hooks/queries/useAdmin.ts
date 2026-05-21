import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  getSubmissionsQueue,
  getAllOrganizations,
  getAllCampaigns,
  getRecentDonations,
} from '@/lib/queries/admin'
import type { AdminOrg, AdminCampaign, AdminDonation } from '@/lib/queries/admin'
import type { SubmissionRow } from '@/lib/queries/verification'
import type { VerificationStatus } from '@/lib/supabase'

// ── useSubmissionsQueue ───────────────────────────────────────────────────────

interface UseSubmissionsQueueResult {
  data: SubmissionRow[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useSubmissionsQueue(): UseSubmissionsQueueResult {
  const { role } = useAuth()
  const [data, setData]         = useState<SubmissionRow[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [tick, setTick]         = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (role !== 'verifier' && role !== 'platform_admin') return
    let cancelled = false
    setLoading(true)
    setError(null)

    getSubmissionsQueue().then(rows => {
      if (!cancelled) { setData(rows); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setError('Failed to load submissions queue'); setLoading(false) }
    })

    return () => { cancelled = true }
  }, [role, tick])

  return { data, isLoading, error, refetch }
}

// ── useAllOrganizations ───────────────────────────────────────────────────────

interface UseAdminOrgsResult {
  data: AdminOrg[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAllOrganizations(): UseAdminOrgsResult {
  const { role } = useAuth()
  const [data, setData]         = useState<AdminOrg[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [tick, setTick]         = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (role !== 'platform_admin') return
    let cancelled = false
    setLoading(true)

    getAllOrganizations().then(rows => {
      if (!cancelled) { setData(rows); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setError('Failed to load organizations'); setLoading(false) }
    })

    return () => { cancelled = true }
  }, [role, tick])

  return { data, isLoading, error, refetch }
}

// ── useAllCampaigns ───────────────────────────────────────────────────────────

interface UseAdminCampaignsResult {
  data: AdminCampaign[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useAllCampaigns(statusFilter?: VerificationStatus): UseAdminCampaignsResult {
  const { role } = useAuth()
  const [data, setData]         = useState<AdminCampaign[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [tick, setTick]         = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (role !== 'platform_admin') return
    let cancelled = false
    setLoading(true)

    getAllCampaigns(statusFilter).then(rows => {
      if (!cancelled) { setData(rows); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setError('Failed to load campaigns'); setLoading(false) }
    })

    return () => { cancelled = true }
  }, [role, statusFilter, tick])

  return { data, isLoading, error, refetch }
}

// ── useRecentDonations ────────────────────────────────────────────────────────

interface UseRecentDonationsResult {
  data: AdminDonation[]
  isLoading: boolean
  error: string | null
}

export function useRecentDonations(): UseRecentDonationsResult {
  const { role } = useAuth()
  const [data, setData]         = useState<AdminDonation[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (role !== 'platform_admin') return
    let cancelled = false
    setLoading(true)

    getRecentDonations().then(rows => {
      if (!cancelled) { setData(rows); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setError('Failed to load donations'); setLoading(false) }
    })

    return () => { cancelled = true }
  }, [role])

  return { data, isLoading, error }
}
