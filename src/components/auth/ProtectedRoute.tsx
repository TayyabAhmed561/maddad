import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Redirects unauthenticated users to /login, preserving the intended
 * destination in location.state.from so Login can redirect back after
 * a successful sign-in.
 *
 * Renders nothing while the initial session check is in flight —
 * AuthProvider already shows a full-screen spinner during isLoading,
 * so this guard will only render after isLoading is false.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  // isLoading should always be false here because AuthProvider renders
  // a spinner while loading, but guard defensively regardless.
  if (isLoading) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
