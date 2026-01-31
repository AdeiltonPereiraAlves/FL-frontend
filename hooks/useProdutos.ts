'use client'

import { useState, useCallback } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface ProdutoBusca {
  id: string
  nome: string
  descricao?: string
  precoFinal: number
  precoNormal?: number
  precoPromo?: number
  emPromocao: boolean
  validadePromocao?: string
  validade?: string
  peso?: number
  perecivel: boolean
  estoque: number
  entidade: {
    id: string
    nome: string
    fazEntrega: boolean
    valorMinimoEntrega?: number
    contato?: {
      telefone?: string
      email?: string
    }
  }
  categoria?: {
    id: string
    nome: string
  }
  fotos?: Array<{
    id: string
    url: string
    ordem: number
    destaque: boolean
  }>
}

export interface BuscaProdutosParams {
  cidadeId: string
  query: string
  page?: number
  limit?: number
  ordenarPor?: 'preco' | 'nome'
  ordem?: 'asc' | 'desc'
}

export interface BuscaProdutosResponse {
  produtos: ProdutoBusca[]
  paginacao?: {
    paginaAtual: number
    totalPaginas: number
    totalItens: number
    itensPorPagina: number
  }
}

export function useProdutos() {
  const api = useApiContext()
  const [produtos, setProdutos] = useState<ProdutoBusca[]>([])
  const [paginacao, setPaginacao] = useState<BuscaProdutosResponse['paginacao'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarProdutosPorCidade = useCallback(async (params: BuscaProdutosParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<ProdutoBusca[] | BuscaProdutosResponse>('/produtos/cidade', {
        params,
      })

      // Ajustar para nova estrutura de resposta com paginação
      const produtosList = Array.isArray(response) ? response : (response as BuscaProdutosResponse).produtos || []
      const paginacaoData = Array.isArray(response) ? null : (response as BuscaProdutosResponse).paginacao || null

      setProdutos(produtosList)
      setPaginacao(paginacaoData)
      
      return {
        produtos: produtosList,
        paginacao: paginacaoData,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar produtos'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const buscarProdutoPorId = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<ProdutoBusca>(`/produto/${id}`)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produto'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const listarTodosProdutos = useCallback(async (page: number = 1, limit: number = 20) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<BuscaProdutosResponse>('/produtos', {
        params: { page, limit },
      })

      const produtosList = response.produtos || []
      const paginacaoData = response.paginacao || null

      setProdutos(produtosList)
      setPaginacao(paginacaoData)
      
      return {
        produtos: produtosList,
        paginacao: paginacaoData,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao listar produtos'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  return {
    produtos,
    paginacao,
    isLoading,
    error,
    buscarProdutosPorCidade,
    buscarProdutoPorId,
    listarTodosProdutos,
  }
}
