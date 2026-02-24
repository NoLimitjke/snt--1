'use client'

import { useEffect, useState, useCallback } from 'react'

interface Session {
  user: {
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'USER'
    isBanned: boolean
  }
  expiresAt: string
}

interface UseAppwriteReturn {
  session: Session | null
  isLoading: boolean
  error: Error | null
  refreshSession: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

export function useAppwrite(): UseAppwriteReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/get-session')
      if (res.ok) {
        const sessionData = await res.json()
        setSession(sessionData)
        setError(null)
      } else if (res.status === 401) {
        setSession(null)
        setError(null)
      } else {
        setError(new Error('Failed to fetch session'))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        await refreshSession()
        return { success: true }
      } else {
        const data = await res.json()
        return { success: false, error: data.error || 'Ошибка входа' }
      }
    } catch (err) {
      return { success: false, error: 'Произошла ошибка при входе' }
    }
  }, [refreshSession])

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const res = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (res.ok) {
        return { success: true }
      } else {
        const data = await res.json()
        return { success: false, error: data.error || 'Ошибка регистрации' }
      }
    } catch (err) {
      return { success: false, error: 'Произошла ошибка при регистрации' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
      })
      setSession(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return {
    session,
    isLoading,
    error,
    refreshSession,
    login,
    register,
    logout,
  }
}
