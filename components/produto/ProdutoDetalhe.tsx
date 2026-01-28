'use client'

import Image from 'next/image'
import { X, Calendar, Truck, Package, Store, Tag, Copy, Check, AlertCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Props {
  produto: any
  onClose: () => void
  onAbrirCarrinho?: () => void
}

export default function ProdutoDetalhes({ produto, onClose, onAbrirCarrinho }: Props) {
  const { adicionar, carrinho } = useCart()
  const [quantidade, setQuantidade] = useState(1)
  const [cupomCopiado, setCupomCopiado] = useState<string | null>(null)

  const formatarData = (data: string | Date | null) => {
    if (!data) return null
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatarDataHora = (data: string | Date | null) => {
    if (!data) return null
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copiarCupom = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
    setCupomCopiado(codigo)
    setTimeout(() => setCupomCopiado(null), 2000)
  }

  const handleAdicionar = () => {
    // MVP: Usar precoFinal (promoção se houver, senão precoAtual)
    for (let i = 0; i < quantidade; i++) {
      adicionar({
        id: produto.id,
        nome: produto.nome,
        precoFinal: precoFinal,
        entidade: produto.entidade,
      })
    }
  }

  // MVP: Usar campos diretos do produto
  const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
  const precoDesconto = produto.precoDesconto || produto.precoPromo || null
  const emPromocao = produto.emPromocao && precoDesconto !== null
  const precoAntigo = emPromocao ? precoAtual : null
  const precoFinal = emPromocao ? precoDesconto : precoAtual

  // Cupons ativos e válidos
  const cuponsValidos = produto.cupons?.filter((cupom: any) => {
    if (!cupom.ativo) return false
    if (cupom.validade) {
      return new Date(cupom.validade) > new Date()
    }
    return true
  }) || []

  return (
    <div className="flex flex-col bg-white">
      {/* Header removido - agora está no componente pai */}
      {/* Conteúdo do produto */}

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Imagem */}
        {produto.fotos?.[0] && (
          <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={produto.fotos[0].url}
              alt={produto.nome}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Preços - Destaque */}
        <div className="space-y-2">
          {emPromocao && precoAntigo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400 line-through">
                  R$ {precoAntigo.toFixed(2)}
                </span>
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  PROMOÇÃO
                </span>
              </div>
              <p className="text-3xl font-bold text-[#16A34A]">
                R$ {precoFinal.toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-[#16A34A]">
              R$ {precoFinal?.toFixed(2) || 'N/A'}
            </p>
          )}
        </div>

        {/* Descrição */}
        {produto.descricao && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{produto.descricao}</p>
          </div>
        )}

        {/* Validade do Produto */}
        {produto.validade && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-900">Validade do Produto:</span>
            </div>
            <p className="text-sm text-gray-700 ml-6 mt-1">
              {formatarData(produto.validade)}
            </p>
            {produto.perecivel && (
              <div className="flex items-center gap-1 mt-2 ml-6">
                <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs text-orange-600 font-medium">Produto perecível</span>
              </div>
            )}
          </div>
        )}

        {/* Validade da Promoção */}
        {emPromocao && produto.validadePromocao && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-600">Promoção válida até:</span>
            </div>
            <p className="text-sm text-red-700 font-medium ml-6 mt-1 bg-red-50 px-2 py-1 rounded">
              {formatarDataHora(produto.validadePromocao)}
            </p>
          </div>
        )}

        {/* Cupons */}
        {cuponsValidos.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Cupons de Desconto</h4>
            <div className="space-y-2">
              {cuponsValidos.map((cupom: any) => (
                <div
                  key={cupom.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-yellow-800">{cupom.codigo}</span>
                      <span className="text-sm text-yellow-700">
                        {cupom.desconto}% OFF
                      </span>
                    </div>
                    {cupom.validade && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Válido até: {formatarData(cupom.validade)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copiarCupom(cupom.codigo)}
                    className="ml-2 p-2 hover:bg-yellow-100 rounded transition-colors"
                    title="Copiar cupom"
                  >
                    {cupomCopiado === cupom.codigo ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-yellow-700" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações do produto */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Informações do Produto</h4>
          
          {produto.peso && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>Peso: {produto.peso} kg</span>
            </div>
          )}

          {produto.dimensoesStr && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>Dimensões: {produto.dimensoesStr}</span>
            </div>
          )}

          {produto.variacoes?.[0]?.estoque !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>Estoque disponível: {produto.variacoes[0].estoque} unidades</span>
            </div>
          )}

          {/* Atributos */}
          {produto.atributos && produto.atributos.length > 0 && (
            <div className="mt-3">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Características:</h5>
              <div className="grid grid-cols-2 gap-2">
                {produto.atributos.map((attr: any) => (
                  <div key={attr.id} className="text-xs text-gray-600">
                    <span className="font-medium">{attr.chave}:</span> {attr.valor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {produto.tags && produto.tags.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {produto.tags.map((pt: any) => (
                  <span
                    key={pt.tagId}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {pt.tag?.nome}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Informações de Entrega da Loja */}
        {produto.entidade && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Entrega da Loja</h4>
            {produto.entidade.fazEntrega ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                  <Truck className="h-4 w-4" />
                  <span>Esta loja faz entrega</span>
                </div>
                {produto.entidade.valorMinimoEntrega && (
                  <div className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-800 font-medium">
                      Valor mínimo para entrega: R$ {Number(produto.entidade.valorMinimoEntrega).toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Adicione mais produtos desta loja para atingir o valor mínimo e habilitar o WhatsApp
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>Esta loja não faz entrega</span>
              </div>
            )}
          </div>
        )}

        {/* Informações da loja */}
        {produto.entidade && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Loja</h4>
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900">
                {produto.entidade.nome}
              </span>
            </div>
            {produto.entidade.localizacao && (
              <p className="text-xs text-gray-500 ml-6">
                {produto.entidade.localizacao.endereco || 
                 `${produto.entidade.localizacao.bairro || ''} - ${produto.entidade.cidade?.nome || ''}`}
              </p>
            )}
          </div>
        )}

        {/* Quantidade */}
        <div className="border-t pt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quantidade
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="text-lg font-semibold w-12 text-center">{quantidade}</span>
            <button
              onClick={() => setQuantidade(quantidade + 1)}
              className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-gray-600 ml-auto">
              Total: R$ {(precoFinal * quantidade).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer com botões */}
      <div className="p-4 border-t space-y-2 bg-gray-50">
        <Button
          onClick={handleAdicionar}
          className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold h-12"
        >
          Adicionar {quantidade > 1 ? `${quantidade} itens` : 'ao carrinho'}
        </Button>
      </div>
    </div>
  )
}
