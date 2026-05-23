import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { DonorRole } from '@/lib/supabase'

// ── Context shape ─────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: DonorRole | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; emailConfirmRequired: boolean }>
  signOut: () => Promise<void>
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<DonorRole | null>(null)
  // True until the initial getSession() call resolves — prevents flash of
  // unauthenticated state on page refresh.
  const [isLoading, setIsLoading] = useState(true)

  // ── Fetch role from donors table ────────────────────────────────────────
  const fetchAndSetRole = useCallback(async (userId: string) => {
    // Try JWT app_metadata first (populated by DB trigger after role change)
    const { data: { session: current } } = await supabase.auth.getSession()
    const jwtRole = current?.user?.app_metadata?.role as DonorRole | undefined
    if (jwtRole) {
      setRole(jwtRole)
      return
    }
    // Fallback: read own row directly (own_select policy allows this)
    const { data } = await supabase
      .from('donors')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    setRole((data?.role as DonorRole) ?? null)
  }, [])

  // ── Ensure donors profile row exists (idempotent) ───────────────────────
  // Called on SIGNED_IN to handle:
  //   a) The email-confirmation flow where the donors row was not yet created
  //      at signup time (session was null then).
  //   b) Recovery from a failed INSERT during signup.
  // ignoreDuplicates: true → ON CONFLICT DO NOTHING, so an existing row
  // with a higher role (charity_admin, verifier) is never downgraded.
  const ensureDonorProfile = useCallback(
    async (signedInUser: User) => {
      try {
        await new Promise<void>(resolve => setTimeout(resolve, 800))

        const { data: existing } = await supabase
          .from('donors')
          .select('id')
          .eq('id', signedInUser.id)
          .maybeSingle()

        if (existing) {
          // Profile exists — refresh JWT to pick up latest role from app_metadata
          await supabase.auth.refreshSession()
          await fetchAndSetRole(signedInUser.id)
          return
        }

        const { error } = await supabase
          .from('donors')
          .insert({
            id: signedInUser.id,
            email: signedInUser.email ?? '',
            full_name: (signedInUser.user_metadata?.full_name as string) ?? null,
            display_name: (signedInUser.user_metadata?.full_name as string) ?? null,
            role: 'donor' as DonorRole,
          })

        if (error) {
          console.error('[Maddad] ensureDonorProfile failed:', error.message)
        } else {
          // New profile created — refresh JWT and re-read role
          await supabase.auth.refreshSession()
          await fetchAndSetRole(signedInUser.id)
        }
      } catch (err) {
        console.error('[Maddad] ensureDonorProfile unexpected error:', err)
      }
    },
    [fetchAndSetRole]
  )

  // ── Auth state initialization ───────────────────────────────────────────
  useEffect(() => {
    // 1. Get the initial session (reads from localStorage — fast).
    //    Sets isLoading=false once resolved so the app can render.
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial)
      setUser(initial?.user ?? null)
      if (initial?.user) {
        fetchAndSetRole(initial.user.id)
      } else {
        setRole(null)
      }
      setIsLoading(false)
    })

    // 2. Subscribe to ongoing auth state changes (sign-in, sign-out,
    //    token refresh, OAuth callback, email confirmation).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        fetchAndSetRole(newSession.user.id)
        // On SIGNED_IN ensure the donors row exists — covers the
        // email-confirmation flow and signup profile-creation failures.
        // Delay 500 ms to let Supabase auth fully propagate before the
        // RLS check runs (avoids transient "permission denied" errors).
        if (event === 'SIGNED_IN' && newSession.user.id) {
          void ensureDonorProfile(newSession.user)
        }
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchAndSetRole, ensureDonorProfile])

  // ── signIn ───────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) return { error: null }

      // Surface a specific message for the unconfirmed-email case so the
      // donor knows to check their inbox rather than resetting their password.
      if (
        error.message.toLowerCase().includes('email not confirmed') ||
        error.message.toLowerCase().includes('not confirmed')
      ) {
        return {
          error:
            'Please confirm your email address before signing in. ' +
            'Check your inbox for the confirmation link.',
        }
      }

      return { error: error.message }
    },
    []
  )

  // ── signUp ───────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ error: string | null; emailConfirmRequired: boolean }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) {
        return { error: error.message, emailConfirmRequired: false }
      }

      if (!data.user) {
        return { error: 'Signup failed — please try again.', emailConfirmRequired: false }
      }

      // If the session is immediately available (email confirmation disabled
      // in the Supabase dashboard), create the donors profile row now.
      // If not (email confirmation required), ensureDonorProfile() will
      // create it when onAuthStateChange fires with SIGNED_IN after confirmation.
      if (data.session) {
        const { error: profileError } = await supabase.from('donors').upsert(
          {
            id: data.user.id,
            email: data.user.email ?? email,
            full_name: fullName,
            display_name: fullName,
            role: 'donor' as DonorRole,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )

        if (profileError) {
          console.error('[Maddad] donors profile creation failed after signup:', profileError.message)
          return {
            error:
              'Your account was created but profile setup failed. ' +
              'Please sign in to complete your profile.',
            emailConfirmRequired: false,
          }
        }
      }

      // session=null means Supabase requires email confirmation before
      // the user can sign in. The UI should show "check your email."
      return { error: null, emailConfirmRequired: !data.session }
    },
    []
  )

  // ── signOut ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // ── refreshRole ──────────────────────────────────────────────────────────
  // Call this after a role change (e.g., a verifier is promoted by an admin)
  // to update the cached role without waiting for the next sign-in.
  const refreshRole = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession()
    if (current?.user?.id) {
      await fetchAndSetRole(current.user.id)
    }
  }, [fetchAndSetRole])

  // ── Full-screen loading state ─────────────────────────────────────────────
  // Shown only during the initial session check on page load.
  // Prevents any protected route from flashing "redirect to /login" before
  // the session is known.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{ user, session, role, isLoading, signIn, signUp, signOut, refreshRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Internal context access (not exported — use useAuth instead) ───────────
export { AuthContext }
