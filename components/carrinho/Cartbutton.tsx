'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Props {
  onClick: () => void
  isOpen?: boolean
}

export default function CartButton({ onClick, isOpen = false }: Props) {
  const { carrinho } = useCart()

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-[1000] ${
        isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-[#FE6233] hover:bg-[#E9571C]'
      } text-white p-4 rounded-full shadow-xl flex items-center gap-2 transition-colors`}
      title={isOpen ? 'Fechar carrinho' : 'Abrir carrinho'}
    >
      <ShoppingCart size={20} />
      {carrinho.length > 0 && (
        <span className={`${
          isOpen 
            ? 'bg-white text-red-600' 
            : 'bg-white text-[#FE6233]'
        } text-xs font-bold px-2 py-0.5 rounded-full`}>
          {carrinho.length}
        </span>
      )}
    </button>
  )
}
