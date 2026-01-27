'use client'

import { useState, useCallback } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface ProdutoEntidade {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
  visivel: boolean
  destaque: boolean
  precoAtual?: number
  precoAntigo?: number
  emPromocao: boolean
  estoque?: number
  fotos?: Array<{
    id: string
    url: string
    ordem: number
    destaque: boolean
  }>
  categoria?: {
    id: string
    nome: string
  }
}

export interface ListarProdutosEntidadeResponse {
  produtos: ProdutoEntidade[]
  paginacao?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useProdutosEntidade() {
  const api = useApiContext()
  const [produtos, setProdutos] = useState<ProdutoEntidade[]>([])
  const [paginacao, setPaginacao] = useState<ListarProdutosEntidadeResponse['paginacao'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listarProdutos = useCallback(async (entidadeId: string, page: number = 1, limit: number = 50) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<ListarProdutosEntidadeResponse>(
        `/admin/entidades/${entidadeId}/produtos?page=${page}&limit=${limit}`
      )

      setProdutos(response.produtos || [])
      setPaginacao(response.paginacao || null)

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao listar produtos da entidade'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const criarProduto = useCallback(async (entidadeId: string, dados: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post<{ produto: any; mensagem?: string }>(`/admin/entidades/${entidadeId}/produtos`, dados)
      // O endpoint retorna { produto: ..., mensagem: ... }
      const produtoRetornado = response.produto || response
      
      // Formatar produto para o formato esperado pela lista
      const produtoFormatado: any = {
        id: produtoRetornado.id,
        nome: produtoRetornado.nome,
        descricao: produtoRetornado.descricao,
        ativo: produtoRetornado.ativo,
        visivel: produtoRetornado.visivel,
        destaque: produtoRetornado.destaque,
        categoria: produtoRetornado.categoria,
        foto: produtoRetornado.fotos?.[0]?.url || produtoRetornado.foto || null,
        precoAtual: produtoRetornado.precoAtual ? Number(produtoRetornado.precoAtual) : null,
        precoDesconto: produtoRetornado.precoDesconto ? Number(produtoRetornado.precoDesconto) : null,
        emPromocao: produtoRetornado.emPromocao || false,
        criadoEm: produtoRetornado.criadoEm,
      }
      
      return produtoFormatado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const atualizarProduto = useCallback(async (produtoId: string, dados: Partial<ProdutoEntidade>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.put<{ produto: any; mensagem?: string }>(`/admin/produtos/${produtoId}`, dados)
      const produtoRetornado = response.produto || response
      
      // Formatar produto para o formato esperado pela lista
      const produtoFormatado: any = {
        id: produtoRetornado.id,
        nome: produtoRetornado.nome,
        descricao: produtoRetornado.descricao,
        ativo: produtoRetornado.ativo,
        visivel: produtoRetornado.visivel,
        destaque: produtoRetornado.destaque,
        categoria: produtoRetornado.categoria,
        foto: produtoRetornado.fotos?.[0]?.url || produtoRetornado.foto || null,
        precoAtual: produtoRetornado.precoAtual ? Number(produtoRetornado.precoAtual) : null,
        precoDesconto: produtoRetornado.precoDesconto ? Number(produtoRetornado.precoDesconto) : null,
        emPromocao: produtoRetornado.emPromocao || false,
        criadoEm: produtoRetornado.criadoEm,
      }
      
      return produtoFormatado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const excluirProduto = useCallback(async (produtoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.delete(`/admin/produtos/${produtoId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto'
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
    listarProdutos,
    criarProduto,
    atualizarProduto,
    excluirProduto,
  }
}
