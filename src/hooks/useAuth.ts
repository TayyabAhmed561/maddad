import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

/**
 * Returns the current auth state and actions from AuthContext.
 *
 * Must be called inside a component that is a descendant of AuthProvider.
 * Throws a clear error if called outside of AuthProvider so the mistake
 * is caught immediately at development time.
 *
 * Returns: user, session, role, isLoading, signIn, signUp, signOut, refreshRole
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error(
      'useAuth must be used inside <AuthProvider>. ' +
        'Wrap your app root (or the relevant subtree) with AuthProvider.'
    )
  }
  return ctx
}
