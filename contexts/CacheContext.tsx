'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react'

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
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map())

  // Sincronizar ref com state
  useEffect(() => {
    cacheRef.current = cache
  }, [cache])

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
        
        cacheRef.current = newCache
        return newCache
      })
    }, 60000) // Verifica a cada minuto

    return () => clearInterval(interval)
  }, [])

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key)
    if (!entry) return null

    const now = Date.now()
    if (entry.expiresAt <= now) {
      const newCache = new Map(cacheRef.current)
      newCache.delete(key)
      cacheRef.current = newCache
      setCache(newCache)
      return null
    }

    return entry.data as T
  }, [])

  const set = useCallback(<T,>(key: string, data: T, ttl: number = CACHE_TTL): void => {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    }

    const prev = cacheRef.current
    const newCache = new Map(prev)
    if (newCache.size >= MAX_CACHE_SIZE && !newCache.has(key)) {
      const oldestKey = Array.from(newCache.keys())[0]
      newCache.delete(oldestKey)
    }
    newCache.set(key, entry)
    cacheRef.current = newCache
    setCache(newCache)
  }, [])

  const clear = useCallback((key?: string): void => {
    if (key) {
      const newCache = new Map(cacheRef.current)
      newCache.delete(key)
      cacheRef.current = newCache
      setCache(newCache)
    } else {
      cacheRef.current = new Map()
      setCache(new Map())
    }
  }, [])

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key)
    if (!entry) return false

    const now = Date.now()
    if (entry.expiresAt <= now) {
      const newCache = new Map(cacheRef.current)
      newCache.delete(key)
      cacheRef.current = newCache
      setCache(newCache)
      return false
    }

    return true
  }, [])

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
