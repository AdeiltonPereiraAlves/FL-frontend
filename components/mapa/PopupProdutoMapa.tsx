'use client'

import { useCart } from '@/contexts/CartContext'
import { Calendar, Tag } from 'lucide-react'

export function PopupProdutoMapa({
  produto,
  onVerProduto,
  isDestaque = false,
}: {
  produto: any
  onVerProduto: () => void
  isDestaque?: boolean
}) {
  const { adicionar } = useCart()

  function handleAdd() {
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: produto.precoFinal,
      entidade: produto.entidade,
    })
  }

  const formatarData = (data: string | Date | null) => {
    if (!data) return null
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-2 text-left min-w-[180px] max-w-[220px] text-sm">
      {/* Nome do produto */}
      <div>
        <strong className="block text-sm font-bold text-gray-900 leading-tight">
          {produto.nome}
        </strong>
      </div>

      {/* Preços */}
      <div className="space-y-1">
        {produto.emPromocao && produto.precoNormal ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 line-through">
                R$ {produto.precoNormal.toFixed(2)}
              </span>
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                PROMOÇÃO
              </span>
            </div>
            <p className={`text-xl font-bold ${
              isDestaque 
                ? 'text-green-600' 
                : 'text-[#FE6233]'
            }`}>
              R$ {produto.precoPromo?.toFixed(2) || produto.precoFinal?.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className={`text-xl font-bold ${
            isDestaque 
              ? 'text-green-600' 
              : 'text-[#FE6233]'
          }`}>
            R$ {produto.precoFinal?.toFixed(2) || 'N/A'}
          </p>
        )}
        {isDestaque && (
          <span className="inline-block px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
            MENOR PREÇO
          </span>
        )}
      </div>

      {/* Validade do produto */}
      {produto.validade && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar className="h-3.5 w-3.5" />
          <span>Validade: {formatarData(produto.validade)}</span>
        </div>
      )}

      {/* Data de expiração da promoção (se houver) */}
      {produto.emPromocao && produto.validadePromocao && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
          <Tag className="h-3.5 w-3.5" />
          <span>Promoção até: {formatarData(produto.validadePromocao)}</span>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onVerProduto}
          className="flex-1 border border-gray-300 rounded-md py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ver produto
        </button>

        <button
          onClick={handleAdd}
          className="flex-1 bg-[#FE6233] text-white rounded-md py-1.5 text-xs font-semibold hover:bg-[#E9571C] transition-colors"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
