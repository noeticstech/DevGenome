/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import { getCurrentUser, logoutCurrentUser } from '@/lib/api/auth'
import type { AuthenticatedUser } from '@/lib/api/types'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  refresh: () => Promise<AuthenticatedUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  const refresh = async () => {
    setStatus((currentStatus) =>
      currentStatus === 'authenticated' ? currentStatus : 'loading',
    )

    try {
      const response = await getCurrentUser()

      if (response.authenticated && response.user) {
        setUser(response.user)
        setStatus('authenticated')
        return response.user
      }

      setUser(null)
      setStatus('unauthenticated')
      return null
    } catch {
      setUser(null)
      setStatus('unauthenticated')
      return null
    }
  }

  const logout = async () => {
    try {
      await logoutCurrentUser()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      refresh,
      logout,
    }),
    [status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
