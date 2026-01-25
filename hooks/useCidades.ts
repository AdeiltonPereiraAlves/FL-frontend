'use client'

import { useState, useCallback } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface Cidade {
  id: string
  nome: string
  estado: string
  cep?: string
  criadaEm?: string
}

export function useCidades() {
  const api = useApiContext()
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregarCidades = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<Cidade[]>('/cidades')
      setCidades(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar cidades'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  return {
    cidades,
    isLoading,
    error,
    carregarCidades,
  }
}
