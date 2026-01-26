'use client'

import { useCart } from '@/contexts/CartContext'
import { Calendar, Tag, Truck, Package } from 'lucide-react'

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

  // MVP: Usar precoAtual como preço principal
  const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
  const precoAntigo = produto.precoAntigo
  const emPromocao = produto.emPromocao || (!!precoAntigo && !!precoAtual)

  function handleAdd() {
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: precoAtual,
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
        {emPromocao && precoAntigo ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 line-through">
                R$ {precoAntigo.toFixed(2)}
              </span>
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                PROMOÇÃO
              </span>
            </div>
            <p className={`text-xl font-bold ${
              isDestaque 
                ? 'text-green-600' 
                : 'text-[#16A34A]'
            }`}>
              R$ {precoAtual.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className={`text-xl font-bold ${
            isDestaque 
              ? 'text-green-600' 
              : 'text-[#16A34A]'
          }`}>
            R$ {precoAtual.toFixed(2) || 'N/A'}
          </p>
        )}
        {isDestaque && (
          <span className="inline-block px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">
            MENOR PREÇO
          </span>
        )}
      </div>

      {/* Informações de entrega */}
      {produto.fazEntrega !== undefined && (
        <div className="space-y-1">
          {produto.temFreteGratis ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              <Truck className="h-3.5 w-3.5" />
              <span>🟢 Frete grátis</span>
            </div>
          ) : produto.valorMinimoEntrega ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-yellow-50 px-2 py-1 rounded">
              <Truck className="h-3.5 w-3.5" />
              <span>🟡 Frete grátis acima de R$ {Number(produto.valorMinimoEntrega).toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              <Package className="h-3.5 w-3.5" />
              <span>🔴 Somente retirada</span>
            </div>
          )}
        </div>
      )}

      {/* Indicador de destaque pago (se aplicável) */}
      {produto.entidade?.configuracoes && produto.entidade.configuracoes.some(
        (c: any) => c.chave === 'plano' && (c.valor?.tipo === 'PREMIUM' || c.valor?.tipo === 'PREMIUM_MAX')
      ) && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-green-50 px-2 py-1 rounded">
          <span>⭐ Loja em destaque</span>
        </div>
      )}

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
          className="flex-1 bg-[#16A34A] text-white rounded-md py-1.5 text-xs font-semibold hover:bg-[#15803D] transition-colors"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
