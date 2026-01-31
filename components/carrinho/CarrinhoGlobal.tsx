'use client'

import { useUIPanel } from '@/contexts/UIPanelContext'
import Carrinho from './Carrinho'

/**
 * Componente global para renderizar o carrinho quando cartOpen = true
 * Este componente deve ser adicionado no layout ou em um componente raiz
 * para garantir que o carrinho apareça em todas as páginas
 */
export function CarrinhoGlobal() {
  const { cartOpen, closeCart } = useUIPanel()

  if (!cartOpen) return null

  return (
    <div className="fixed z-[999] bg-white shadow-xl bottom-0 left-0 w-full h-[60%] md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right">
      <Carrinho onClose={closeCart} />
    </div>
  )
}
