'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Store, MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/contexts/NavigationContext'

interface ProdutoPrincipal {
  id: string
  nome: string
  precoAtual?: number | null
  precoDesconto?: number | null
  emPromocao?: boolean
  precoFinal?: number | null
  fotos?: Array<{ url: string }>
}

interface Entidade {
  id: string
  nome: string
  fotoPerfilUrl?: string
  localizacao?: {
    endereco?: string
    bairro?: string
  }
  cidade?: {
    nome: string
    estado: string
  }
  produtos?: ProdutoPrincipal[]
}

interface ListaEntidadesLateralProps {
  entidades: Entidade[]
  cidadeId?: string
  highlightedEntityId?: string | null
  onEntityHover?: (entityId: string | null) => void
  onEntityClick?: (entityId: string) => void
}

export function ListaEntidadesLateral({ 
  entidades, 
  cidadeId,
  highlightedEntityId,
  onEntityHover,
  onEntityClick,
}: ListaEntidadesLateralProps) {
  const { navigateToLoja } = useNavigation()

  const handleVerLoja = (entidadeId: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
    }
    if (onEntityClick) {
      onEntityClick(entidadeId)
    }
    navigateToLoja(entidadeId)
  }

  if (entidades.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Store className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Nenhuma loja encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lojas Disponíveis</h3>
        <span className="text-sm text-gray-600">{entidades.length} loja(s)</span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {entidades.map((entidade) => {
          // Pegar produtos principais (máximo 3)
          const produtosPrincipais = (entidade.produtos || []).slice(0, 3)

          return (
            <div
              key={entidade.id}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
                highlightedEntityId === entidade.id
                  ? 'border-[#16A34A] bg-green-50 shadow-md'
                  : 'border-gray-200'
              }`}
              onMouseEnter={() => onEntityHover?.(entidade.id)}
              onMouseLeave={() => onEntityHover?.(null)}
              onClick={() => handleVerLoja(entidade.id)}
            >
              {/* Cabeçalho da Entidade */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <Image
                    src={entidade.fotoPerfilUrl || '/placeholder.png'}
                    alt={entidade.nome}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base text-gray-900 mb-1 line-clamp-1">
                    {entidade.nome}
                  </h4>
                  {entidade.localizacao && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {entidade.localizacao.bairro || entidade.localizacao.endereco || ''}
                        {entidade.cidade && ` - ${entidade.cidade.nome}/${entidade.cidade.estado}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Produtos Principais */}
              {produtosPrincipais.length > 0 ? (
                <div className="mb-3 space-y-2">
                  {produtosPrincipais.map((produto) => {
                    const precoAtual = produto.precoAtual || produto.precoFinal || 0
                    const precoDesconto = produto.precoDesconto || null
                    const emPromocao = produto.emPromocao && precoDesconto !== null
                    const precoExibido = emPromocao ? precoDesconto : precoAtual
                    const precoAntigo = emPromocao ? precoAtual : null

                    return (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {produto.nome}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {emPromocao && precoAntigo ? (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  R$ {precoAntigo.toFixed(2)}
                                </span>
                                <span className="text-sm font-bold text-[#16A34A]">
                                  R$ {precoExibido.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-[#16A34A]">
                                R$ {precoExibido.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="mb-3 text-xs text-gray-500 italic">
                  Clique em "Ver Loja" para ver os produtos disponíveis
                </div>
              )}

              {/* Botão Ver Loja */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleVerLoja(entidade.id)}
              >
                <Store className="h-3.5 w-3.5 mr-1.5" />
                Ver Loja
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
