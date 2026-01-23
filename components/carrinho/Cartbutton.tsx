'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Props {
  onClick: () => void
}

export default function CartButton({ onClick }: Props) {
  const { carrinho } = useCart()

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[999] bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
    >
      <ShoppingCart size={20} />
      {carrinho.length > 0 && (
        <span className="bg-white text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {carrinho.length}
        </span>
      )}
    </button>
  )
}
