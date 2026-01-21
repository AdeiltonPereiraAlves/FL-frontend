'use client'

import { useProductContext } from '@/contexts/ProductContext'
import { useCallback } from 'react'

export function useProducts() {
  const productContext = useProductContext()

  const carregarProdutos = useCallback(async () => {
    await productContext.listarProdutos()
  }, [productContext])

  return {
    ...productContext,
    carregarProdutos,
  }
}
