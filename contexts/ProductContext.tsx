'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import api from '@/services/api'
import { Produto, ProductContextType } from '@/types/product'

const ProductContext = createContext<ProductContextType | undefined>(undefined)

interface ProductProviderProps {
  children: ReactNode
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const listarProdutos = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/produtos')
      setProdutos(response.data)
    } catch (error) {
      console.error('Erro ao listar produtos', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <ProductContext.Provider
      value={{
        produtos,
        isLoading,
        listarProdutos,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProductContext() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext deve ser usado dentro de ProductProvider')
  }
  return context
}
