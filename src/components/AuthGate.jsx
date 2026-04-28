import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthProvider } from '../context/AuthContext.jsx'
import { PERMISSIONS } from '../lib/permissions.js'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setPermissions(Object.values(PERMISSIONS))
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !session) {
      setPermissions(isSupabaseConfigured ? [] : Object.values(PERMISSIONS))
      return
    }

    let cancelled = false

    Promise.all(
      Object.values(PERMISSIONS).map(async permission => {
        const { data, error } = await supabase.rpc('current_user_has_permission', {
          permission_key: permission,
        })

        return !error && data ? permission : null
      })
    ).then(results => {
      if (!cancelled) {
        setPermissions(results.filter(Boolean))
      }
    })

    return () => {
      cancelled = true
    }
  }, [session])

  const signInWithPassword = useCallback(async ({ email, password }) => {
    if (!isSupabaseConfigured) return { error: null }

    setAuthError('')
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) {
      setAuthError(result.error.message)
    }
    return result
  }, [])

  const signUpWithPassword = useCallback(async ({ email, password }) => {
    if (!isSupabaseConfigured) return { error: null }

    setAuthError('')
    const result = await supabase.auth.signUp({ email, password })
    if (result.error) {
      setAuthError(result.error.message)
    }
    return result
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return { error: null }

    setAuthError('')
    setOauthLoading(true)

    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    })

    if (result.error) {
      setOauthLoading(false)
      setAuthError(result.error.message)
    }

    return result
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return

    setAuthError('')
    await supabase.auth.signOut()
  }, [])

  const auth = useMemo(() => ({
    authError,
    authLoading: loading,
    oauthLoading,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    signUpWithPassword,
  }), [authError, loading, oauthLoading, signInWithGoogle, signInWithPassword, signOut, signUpWithPassword])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    )
  }

  return (
    <AuthProvider session={session} permissions={permissions} auth={auth}>
      {children}
    </AuthProvider>
  )
}
