'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface UIPanelContextData {
  selectedProduct: any | null
  cartOpen: boolean
  openProduct: (product: any) => void
  closeProduct: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const UIPanelContext = createContext<UIPanelContextData>({} as UIPanelContextData)

export function UIPanelProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  /**
   * Abrir detalhe de produto
   * REGRA: Fecha carrinho automaticamente se estiver aberto
   */
  const openProduct = useCallback((product: any) => {
    setCartOpen(false) // Carrinho fecha automaticamente
    setSelectedProduct(product)
  }, [])

  /**
   * Fechar detalhe de produto
   */
  const closeProduct = useCallback(() => {
    setSelectedProduct(null)
  }, [])

  /**
   * Abrir carrinho
   * REGRA: Fecha detalhe de produto automaticamente se estiver aberto
   */
  const openCart = useCallback(() => {
    setSelectedProduct(null) // Produto fecha automaticamente
    setCartOpen(true)
  }, [])

  /**
   * Fechar carrinho
   */
  const closeCart = useCallback(() => {
    setCartOpen(false)
  }, [])

  /**
   * Toggle carrinho (abrir/fechar)
   * REGRA: Se abrir, fecha produto. Se fechar, não abre produto.
   */
  const toggleCart = useCallback(() => {
    if (cartOpen) {
      closeCart()
    } else {
      openCart()
    }
  }, [cartOpen, openCart, closeCart])

  return (
    <UIPanelContext.Provider
      value={{
        selectedProduct,
        cartOpen,
        openProduct,
        closeProduct,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </UIPanelContext.Provider>
  )
}

export function useUIPanel() {
  const context = useContext(UIPanelContext)
  if (!context) {
    throw new Error('useUIPanel must be used within UIPanelProvider')
  }
  return context
}
