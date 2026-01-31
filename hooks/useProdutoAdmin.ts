'use client'

import { useState, useCallback, useEffect } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

export interface ProdutoCompleto {
  id: string
  nome: string
  descricao?: string
  sku?: string
  visivel: boolean
  ativo: boolean
  destaque: boolean
  perecivel: boolean
  peso?: number
  validade?: string
  largura?: number
  altura?: number
  profundidade?: number
  dimensoesStr?: string
  categoriaId?: string
  categoria?: {
    id: string
    nome: string
  }
  precoAtual?: number
  precoNormal?: number
  precoPromo?: number
  estoque?: number
  fotos?: Array<{
    id: string
    url: string
    ordem: number
    destaque: boolean
  }>
  tags?: Array<{
    id: string
    tag: {
      id: string
      nome: string
    }
  }>
  atributos?: Array<{
    id: string
    chave: string
    valor: string
  }>
  variacoes?: Array<{
    id: string
    nome: string
    preco: number
    estoque: number
  }>
}

export function useProdutoAdmin(produtoId: string | null) {
  const api = useApiContext()
  const [produto, setProduto] = useState<ProdutoCompleto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregarProduto = useCallback(async () => {
    if (!produtoId || !api) {
      setProduto(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<ProdutoCompleto>(`/produto/${produtoId}/completo`)
      setProduto(data)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produto'
      setError(errorMessage)
      setProduto(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [produtoId, api])

  // Carregar produto apenas quando produtoId mudar
  useEffect(() => {
    if (produtoId && api) {
      carregarProduto()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtoId]) // Removido carregarProduto e api das dependências para evitar loops

  const atualizarProduto = useCallback((dados: Partial<ProdutoCompleto>) => {
    if (produto) {
      setProduto({ ...produto, ...dados })
    }
  }, [produto])

  return {
    produto,
    isLoading,
    error,
    carregarProduto,
    atualizarProduto,
  }
}
