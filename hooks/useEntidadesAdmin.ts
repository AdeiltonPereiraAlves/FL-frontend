'use client'

import { useState, useCallback } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface EntidadeAdmin {
  id: string
  nome: string
  descricao?: string
  cnpj: string
  tipo: string
  status: 'ATIVA' | 'INATIVA' | 'BLOQUEADA' | 'EM_ANALISE'
  fotoPerfilUrl?: string
  cidade: {
    id: string
    nome: string
    estado: string
  }
  categoria?: {
    id: string
    nome: string
  }
  responsavel?: {
    id: string
    nome: string
    email: string
  }
  fazEntrega: boolean
  valorMinimoEntrega?: number
  quantidadeProdutos: number
  plano: string
  criadaEm: string
  localizacao?: {
    latitude: number
    longitude: number
    endereco?: string
    bairro?: string
    cep?: string
  }
  contato?: {
    telefone?: string
    email?: string
    redes?: Array<{
      tipo: string
      url: string
    }>
  }
}

export interface ListarEntidadesParams {
  nome?: string
  cidadeId?: string
  status?: string
  tipoPlano?: string
  page?: number
  limit?: number
}

export interface ListarEntidadesResponse {
  entidades: EntidadeAdmin[]
  paginacao: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useEntidadesAdmin() {
  const api = useApiContext()
  const [entidades, setEntidades] = useState<EntidadeAdmin[]>([])
  const [paginacao, setPaginacao] = useState<ListarEntidadesResponse['paginacao'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listarEntidades = useCallback(async (params: ListarEntidadesParams = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (params.nome) queryParams.append('nome', params.nome)
      if (params.cidadeId) queryParams.append('cidadeId', params.cidadeId)
      if (params.status) queryParams.append('status', params.status)
      if (params.tipoPlano) queryParams.append('tipoPlano', params.tipoPlano)
      queryParams.append('page', (params.page || 1).toString())
      queryParams.append('limit', (params.limit || 20).toString())

      const response = await api.get<ListarEntidadesResponse>(
        `/admin/entidades?${queryParams.toString()}`
      )

      setEntidades(response.entidades || [])
      setPaginacao(response.paginacao || null)

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao listar entidades'
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
      const data = await api.get<EntidadeAdmin>(`/admin/entidades/${id}`)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar entidade'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const atualizarEntidade = useCallback(async (id: string, dados: Partial<EntidadeAdmin>) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.put<EntidadeAdmin>(`/admin/entidades/${id}`, dados)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar entidade'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const alterarStatusEntidade = useCallback(async (id: string, status: 'ATIVA' | 'INATIVA') => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.patch<EntidadeAdmin>(`/admin/entidades/${id}/status`, { status })
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status da entidade'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const atualizarPlanoEntidade = useCallback(async (
    entidadeId: string,
    tipo: 'FREE' | 'BASICO' | 'PREMIUM' | 'PREMIUM_MAX',
    nivel: number
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.put<{ mensagem: string; entidade: EntidadeAdmin }>(
        `/entidade/${entidadeId}/plano`,
        { tipo, nivel }
      )
      
      // Atualizar a entidade na lista local
      setEntidades((prev) =>
        prev.map((ent) =>
          ent.id === entidadeId
            ? { ...ent, plano: tipo }
            : ent
        )
      )
      
      return response.entidade
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar plano da entidade'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  return {
    entidades,
    paginacao,
    isLoading,
    error,
    listarEntidades,
    buscarEntidadePorId,
    atualizarEntidade,
    alterarStatusEntidade,
    atualizarPlanoEntidade,
  }
}
