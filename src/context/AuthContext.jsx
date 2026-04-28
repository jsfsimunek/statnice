import { createContext, useContext, useMemo } from 'react'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'
import { PERMISSIONS } from '../lib/permissions.js'

const AuthContext = createContext(null)

export function AuthProvider({ session, permissions, auth, children }) {
  const value = useMemo(() => {
    const activePermissions = isSupabaseConfigured
      ? permissions
      : Object.values(PERMISSIONS)

    return {
      session,
      user: session?.user ?? null,
      permissions: activePermissions,
      isDevAdmin: !isSupabaseConfigured,
      ...auth,
      can(permission) {
        return activePermissions.includes(permission)
      },
    }
  }, [auth, permissions, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
