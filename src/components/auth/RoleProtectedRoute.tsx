import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { DonorRole } from '@/lib/supabase'

interface RoleProtectedRouteProps {
  children: ReactNode
  /** The route is accessible to users whose role is in this list. */
  allowedRoles: DonorRole[]
}

/**
 * Extends ProtectedRoute with a role check.
 *
 * Unauthenticated users → /login (with return path in state).
 * Authenticated but wrong role → / (home). We do not redirect to /login
 * because the user IS authenticated; showing a 403-like redirect to home
 * avoids leaking that the route exists to unprivileged users.
 *
 * Role is null briefly after SIGNED_IN while it is fetched from the
 * donors table. During that window we render null rather than incorrectly
 * redirecting — the role fetch is fast (single primary-key lookup).
 */
export function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { session, role, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role is being fetched — wait rather than incorrectly redirecting.
  if (role === null) {
    return null
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
