'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Store, MapPin, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useViewMode } from '@/contexts/ViewModeContext'
import { ordenarPorBestPrice, ProductWithLocation } from '@/utils/bestPriceScore'
import { useMemo } from 'react'

interface ProdutoPrincipal {
  id: string
  nome: string
  precoAtual?: number | null
  precoDesconto?: number | null
  emPromocao?: boolean
  precoFinal?: number | null
  fotos?: Array<{ url: string }>
  entidade?: {
    id: string
    nome: string
    localizacao?: {
      endereco?: string
      bairro?: string
    }
    cidade?: {
      nome: string
      estado: string
    }
  }
}

interface ListaResultadosProdutosProps {
  produtos: ProdutoPrincipal[]
  highlightedEntityId?: string | null
  onEntityHover?: (entityId: string | null) => void
  onProdutoClick?: (produto: ProdutoPrincipal) => void
  userLocation?: { lat: number; lng: number }
}

export function ListaResultadosProdutos({
  produtos,
  highlightedEntityId,
  onEntityHover,
  onProdutoClick,
  userLocation,
}: ListaResultadosProdutosProps) {
  const { adicionar } = useCart()
  const { viewMode } = useViewMode()

  // Converter produtos para formato com score
  const produtosComScore = useMemo(() => {
    const produtosFormatados: ProductWithLocation[] = produtos.map((p) => ({
      produto: p,
      entidade: p.entidade,
      preco: p.precoAtual || p.precoFinal || 0,
      temPromocao: p.emPromocao || false,
    }))

    if (viewMode === 'BEST_PRICE') {
      return ordenarPorBestPrice(produtosFormatados, userLocation)
    }

    return produtosFormatados.map((p) => ({ ...p, score: 0 }))
  }, [produtos, viewMode, userLocation])

  // Obter TOP 3 IDs para destacar no mapa
  const top3EntityIds = useMemo(() => {
    if (viewMode === 'BEST_PRICE') {
      return produtosComScore
        .filter((p) => p.ranking && p.ranking <= 3)
        .map((p) => p.entidade?.id)
        .filter(Boolean) as string[]
    }
    return []
  }, [produtosComScore, viewMode])

  const handleAdicionarAoCarrinho = (produto: ProdutoPrincipal, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const precoAtual = produto.precoAtual || produto.precoFinal || 0
    
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: precoAtual,
      entidade: produto.entidade || {
        id: '',
        nome: '',
      },
    })
  }

  const handleProdutoClick = (produto: ProdutoPrincipal) => {
    if (onProdutoClick) {
      onProdutoClick(produto)
    }
  }

  if (produtos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center h-full flex items-center justify-center">
        <div>
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhum produto encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-[#16A34A] text-white flex-shrink-0">
        <h3 className="text-lg font-semibold">Resultados da Busca</h3>
        <p className="text-sm text-white/90 mt-1">
          {produtos.length} produto(s) encontrado(s)
        </p>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {produtosComScore.map((item) => {
          const produto = item.produto
          const precoAtual = produto.precoAtual || produto.precoFinal || 0
          const precoDesconto = produto.precoDesconto || null
          const emPromocao = produto.emPromocao && precoDesconto !== null
          const precoExibido = emPromocao ? precoDesconto : precoAtual
          const precoAntigo = emPromocao ? precoAtual : null
          const isHighlighted = highlightedEntityId === produto.entidade?.id
          const ranking = item.ranking

          return (
            <div
              key={produto.id}
              className={`bg-gray-50 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                isHighlighted
                  ? 'border-[#16A34A] bg-green-50 shadow-md'
                  : 'border-gray-200'
              }`}
              onClick={() => handleProdutoClick(produto)}
              onMouseEnter={() => {
                if (produto.entidade?.id && onEntityHover) {
                  onEntityHover(produto.entidade.id)
                }
              }}
              onMouseLeave={() => {
                if (onEntityHover) {
                  onEntityHover(null)
                }
              }}
            >
              {/* Conteúdo do Produto */}
              <div className="p-3">
                <div className="flex gap-3">
                  {/* Ranking visual (TOP 3) */}
                  {viewMode === 'BEST_PRICE' && ranking && (
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                      {ranking === 1 && <span className="text-2xl">🥇</span>}
                      {ranking === 2 && <span className="text-2xl">🥈</span>}
                      {ranking === 3 && <span className="text-2xl">🥉</span>}
                    </div>
                  )}

                  {/* Imagem do Produto */}
                  {produto.fotos && produto.fotos.length > 0 && (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={produto.fotos[0].url}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Informações do Produto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1">
                        {produto.nome}
                      </h4>
                      {viewMode === 'BEST_PRICE' && ranking && (
                        <span className="text-xs font-bold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded flex-shrink-0">
                          #{ranking}
                        </span>
                      )}
                    </div>
                    
                    {/* Nome da Entidade - link para página da loja */}
                    {produto.entidade && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <Store className="h-3 w-3 flex-shrink-0" />
                        <Link
                          href={`/loja/${produto.entidade.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('lojaReturnUrl', window.location.pathname || '/')
                            }
                          }}
                          className="truncate hover:text-[#16A34A] hover:underline font-medium transition-colors"
                        >
                          {produto.entidade.nome}
                        </Link>
                      </div>
                    )}

                    {/* Localização (se disponível) */}
                    {produto.entidade?.localizacao && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {produto.entidade.localizacao.bairro || produto.entidade.localizacao.endereco || ''}
                          {produto.entidade.cidade && ` - ${produto.entidade.cidade.nome}/${produto.entidade.cidade.estado}`}
                        </span>
                      </div>
                    )}

                    {/* Preço */}
                    <div className="flex items-center gap-2 mt-2">
                      {emPromocao && precoAntigo ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            R$ {precoAntigo.toFixed(2)}
                          </span>
                          <span className="text-base font-bold text-[#16A34A]">
                            R$ {precoExibido.toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                            PROMO
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-bold text-[#16A34A]">
                          R$ {precoExibido.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProdutoClick(produto)
                      }}
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0 bg-[#16A34A] hover:bg-[#15803D] text-white"
                      onClick={(e) => handleAdicionarAoCarrinho(produto, e)}
                      title="Adicionar à lista"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
