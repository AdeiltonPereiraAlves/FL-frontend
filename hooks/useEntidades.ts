'use client'

import { useState, useCallback } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface EntidadeLocal {
  id: string
  nome: string
  descricao?: string
  cnpj: string
  tipo: string
  status: string
  fotoPerfilUrl?: string
  cidadeId: string
  fazEntrega: boolean
  valorMinimoEntrega?: number
  contato?: {
    telefone?: string
    email?: string
    redes?: Array<{
      tipo: string
      url: string
    }>
  }
  localizacao?: {
    latitude: number
    longitude: number
  }
  horario?: Array<{
    id: string
    diaSemana: number
    abertura: string
    fechamento: string
    ativo: boolean
  }>
}

export function useEntidades() {
  const api = useApiContext()
  const [entidades, setEntidades] = useState<EntidadeLocal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregarEntidadesPorCidade = useCallback(async (cidadeId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<EntidadeLocal[]>('/entidades/mapa', {
        params: { cidadeId },
      })
      setEntidades(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar entidades'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const buscarEntidadePorId = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<EntidadeLocal>(`/entidade/${id}`)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar entidade'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const buscarEntidadesPorNome = useCallback(async (query: string, page: number = 1, limit: number = 20) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        entidades: EntidadeLocal[]
        paginacao?: {
          paginaAtual: number
          totalPaginas: number
          totalItens: number
          itensPorPagina: number
        }
      }>('/entidades/buscar', {
        params: { query, page, limit },
      })
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar entidades'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  return {
    entidades,
    isLoading,
    error,
    carregarEntidadesPorCidade,
    buscarEntidadePorId,
    buscarEntidadesPorNome,
  }
}
