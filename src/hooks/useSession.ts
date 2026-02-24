'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@/lib/auth'

interface UseSessionReturn {
  data: Session | null
  isLoading: boolean
  error: Error | null
  update: () => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [data, setData] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/get-session')
      if (res.ok) {
        const session = await res.json()
        setData(session)
        setError(null)
      } else if (res.status === 401) {
        setData(null)
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

  const update = useCallback(async () => {
    setIsLoading(true)
    await fetchSession()
  }, [fetchSession])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return { data, isLoading, error, update }
}
