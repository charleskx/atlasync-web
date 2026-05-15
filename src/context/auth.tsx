import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  subscriptionStatus: string | null
  login: (email: string, password: string) => Promise<{
    requiresTwoFactor?: boolean
    tempToken?: string
  }>
  loginWithTotp: (tempToken: string, code: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthCtx = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setUser(null)
      setSubscriptionStatus(null)
      return
    }
    try {
      const me = await api.auth.me()
      setUser(me)
      setSubscriptionStatus(me.subscriptionStatus)
    } catch {
      setUser(null)
      setSubscriptionStatus(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password)
    if (result.accessToken) {
      await refreshUser()
    }
    return {
      requiresTwoFactor: result.requiresTwoFactor,
      tempToken: result.tempToken,
    }
  }, [refreshUser])

  const loginWithTotp = useCallback(async (tempToken: string, code: string) => {
    await api.auth.loginWithTotp(tempToken, code)
    await refreshUser()
  }, [refreshUser])

  const loginWithGoogle = useCallback(async (credential: string) => {
    await api.auth.loginWithGoogle(credential)
    await refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    await api.auth.logout()
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        subscriptionStatus,
        login,
        loginWithTotp,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
