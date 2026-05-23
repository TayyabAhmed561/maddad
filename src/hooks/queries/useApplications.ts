import { useQuery } from '@tanstack/react-query'
import { getApplications } from '@/lib/queries/applications'
import type { OrgApplication } from '@/lib/queries/applications'

export function useApplications() {
  const { data = [], isLoading, refetch } = useQuery<OrgApplication[]>({
    queryKey: ['applications'],
    queryFn: getApplications,
  })
  return { data, isLoading, refetch }
}
