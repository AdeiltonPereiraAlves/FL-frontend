'use client'

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
  onAbrirProduto?: (produto: any) => void
}

export default function Carrinho({ onClose, onAbrirProduto }: Props) {
  const { carrinho, alterarQuantidade, remover, total } = useCart()
  const router = useRouter()

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-[#16A34A] text-white">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h4 className="font-semibold text-lg">Carrinho</h4>
          {carrinho.length > 0 && (
            <span className="bg-white text-[#16A34A] px-2 py-0.5 rounded-full text-xs font-bold">
              {carrinho.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#15803D] rounded transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Lista de itens */}
      <div className="flex-1 overflow-y-auto p-4">
        {carrinho.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Carrinho vazio</p>
            <p className="text-sm text-gray-400 mt-2">
              Adicione produtos para começar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
      {carrinho.map((item: any) => (
        <div
          key={item.id}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.entidade?.nome}
            </p>
                  </div>
                  <button
                    onClick={() => remover(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
          </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 border rounded-lg">
            <button
              onClick={() => alterarQuantidade(item.id, -1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      disabled={item.quantidade <= 1}
            >
                      <Minus className="h-4 w-4" />
            </button>
                    <span className="px-3 font-semibold min-w-[2rem] text-center">
                      {item.quantidade}
                    </span>
            <button
              onClick={() => alterarQuantidade(item.id, 1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
                      <Plus className="h-4 w-4" />
            </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#16A34A]">
                      R$ {(item.precoFinal * item.quantidade).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      R$ {item.precoFinal.toFixed(2)} cada
                    </p>
                  </div>
          </div>
        </div>
      ))}
          </div>
        )}
      </div>

      {/* Footer com total e botões */}
      {carrinho.length > 0 && (
        <div className="p-4 border-t bg-gray-50 space-y-3">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-700">Total:</span>
            <span className="font-bold text-2xl text-[#16A34A]">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <Button
            onClick={() => {
              // Salvar a página atual antes de ir para o checkout
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('checkoutReturnUrl', window.location.pathname)
                
                // Salvar estado da busca atual para restaurar ao voltar
                try {
                  const savedSearch = localStorage.getItem('feiralivre:ultimaBusca')
                  if (savedSearch) {
                    // Salva no sessionStorage para restaurar ao voltar
                    sessionStorage.setItem('feiralivre:checkoutReturnState', savedSearch)
                  }
                } catch (err) {
                  console.error('Erro ao salvar estado para checkout:', err)
                }
              }
              router.push('/checkout')
              onClose()
            }}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            Finalizar Compra
          </Button>
        </div>
      )}
    </div>
  )
}
