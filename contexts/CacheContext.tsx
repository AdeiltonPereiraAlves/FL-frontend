'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheContextType {
  get: <T>(key: string) => T | null
  set: <T>(key: string, data: T, ttl?: number) => void
  clear: (key?: string) => void
  has: (key: string) => boolean
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutos por padrão
const MAX_CACHE_SIZE = 50 // Máximo de 50 entradas

const CacheContext = createContext<CacheContextType | undefined>(undefined)

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map())

  // Limpar cache expirado periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prev) => {
        const now = Date.now()
        const newCache = new Map()
        
        for (const [key, entry] of prev.entries()) {
          if (entry.expiresAt > now) {
            newCache.set(key, entry)
          }
        }
        
        return newCache
      })
    }, 60000) // Verifica a cada minuto

    return () => clearInterval(interval)
  }, [])

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (entry.expiresAt <= now) {
      cache.delete(key)
      return null
    }

    return entry.data as T
  }, [cache])

  const set = useCallback(<T,>(key: string, data: T, ttl: number = CACHE_TTL): void => {
    setCache((prev) => {
      const newCache = new Map(prev)
      
      // Se o cache está cheio, remove a entrada mais antiga
      if (newCache.size >= MAX_CACHE_SIZE && !newCache.has(key)) {
        const oldestKey = Array.from(newCache.keys())[0]
        newCache.delete(oldestKey)
      }

      const now = Date.now()
      newCache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      })

      return newCache
    })
  }, [])

  const clear = useCallback((key?: string): void => {
    if (key) {
      setCache((prev) => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
    } else {
      setCache(new Map())
    }
  }, [])

  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (entry.expiresAt <= now) {
      cache.delete(key)
      return false
    }

    return true
  }, [cache])

  return (
    <CacheContext.Provider value={{ get, set, clear, has }}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider')
  }
  return context
}
