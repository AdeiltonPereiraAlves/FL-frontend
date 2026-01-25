'use client'

import { useState, useCallback } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface Banner {
  id: string
  titulo?: string
  imagemUrl: string
  tipo: 'PRODUTO' | 'ENTIDADE' | 'URL_EXTERNA'
  produtoId?: string
  entidadeId?: string
  urlExterna?: string
  produto?: {
    id: string
    nome: string
    entidade?: {
      id: string
      nome: string
    }
  }
  entidade?: {
    id: string
    nome: string
  }
}

export function useBanners() {
  const api = useApiContext()
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listarBannersAtivos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<Banner[]>('/banners/ativos')
      setBanners(data || [])
      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar banners'
      setError(errorMessage)
      // Não relança o erro para recursos não críticos como banners
      // Retorna array vazio para que o componente possa usar banners padrão
      console.warn('Erro ao carregar banners (usando fallback):', errorMessage)
      setBanners([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [api])

  return {
    banners,
    isLoading,
    error,
    listarBannersAtivos,
  }
}
