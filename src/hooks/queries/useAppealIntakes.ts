import { useQuery } from '@tanstack/react-query'
import { getAppealIntakes } from '@/lib/queries/appealIntakes'
import type { AppealIntakeRow } from '@/lib/queries/appealIntakes'

export function useAppealIntakes() {
  const { data = [], isLoading, refetch } = useQuery<AppealIntakeRow[]>({
    queryKey: ['appeal-intakes'],
    queryFn: getAppealIntakes,
  })
  return { data, isLoading, refetch }
}
