import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Landing page for OAuth redirects (e.g., Google Sign-In).
 *
 * With detectSessionInUrl: true set on the Supabase client, the PKCE
 * code exchange happens automatically when this page mounts. The
 * onAuthStateChange listener in AuthProvider fires with SIGNED_IN
 * and updates session state. This page simply waits for that state
 * to resolve and then redirects.
 *
 * Configure this URL in:
 *   Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 *   Add: <your-domain>/auth/callback
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const { session, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    navigate(session ? '/my-giving' : '/login', { replace: true })
  }, [session, isLoading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}
