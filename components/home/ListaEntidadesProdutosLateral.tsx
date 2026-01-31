'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Store, MapPin, Package, ShoppingCart, Plus, Minus, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { SearchResult, agruparPorEntidade } from '@/utils/searchInteligente'

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
  }
}

interface Entidade {
  id: string
  nome: string
  fotoPerfilUrl?: string
  tipo?: string
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

interface ListaEntidadesProdutosLateralProps {
  entidades?: Entidade[]
  produtos?: ProdutoPrincipal[]
  resultadosBusca?: SearchResult[]
  busca?: string
  cidadeId?: string
  highlightedEntityId?: string | null
  onEntityHover?: (entityId: string | null) => void
  onEntityClick?: (entityId: string) => void
  onProdutoClick?: (produto: ProdutoPrincipal) => void
  onSalvarEstadoBusca?: () => void
}

export function ListaEntidadesProdutosLateral({ 
  entidades = [],
  produtos = [],
  resultadosBusca = [],
  busca = '',
  cidadeId,
  highlightedEntityId,
  onEntityHover,
  onEntityClick,
  onProdutoClick,
  onSalvarEstadoBusca,
}: ListaEntidadesProdutosLateralProps) {
  // IMPORTANTE: Todos os hooks devem ser chamados ANTES de qualquer return condicional
  // Isso garante que o React sempre veja o mesmo número de hooks em cada renderização
  const { adicionar } = useCart()
  const [produtosExpandidos, setProdutosExpandidos] = useState<Set<string>>(() => new Set())
  const [produtosDetalhesExpandidos, setProdutosDetalhesExpandidos] = useState<Set<string>>(() => new Set())
  const [quantidades, setQuantidades] = useState<Map<string, number>>(() => new Map())

  // Função para formatar o tipo da entidade
  const formatarTipoEntidade = (tipo?: string): string => {
    if (!tipo) return ''
    
    const tipos: Record<string, string> = {
      'COMERCIO': 'Comércio',
      'SERVICO': 'Serviço',
      'PROFISSIONAL': 'Profissional',
      'INSTITUICAO': 'Instituição',
      'LOJA': 'Loja', // Caso exista
    }
    
    return tipos[tipo.toUpperCase()] || tipo
  }

  const handleVerLoja = (entidadeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    // Salvar estado da busca antes de navegar
    if (onSalvarEstadoBusca) {
      onSalvarEstadoBusca()
    }
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
    }
    
    if (onEntityClick) {
      onEntityClick(entidadeId)
    }
    
    // Usar window.location.href diretamente, como no mapa
    // Isso evita problemas com hooks durante a navegação
    // O navigateToLoja pode causar desmontagem do componente antes dos hooks serem executados
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = `/loja/${entidadeId}`
      }, 100)
    }
  }

  const toggleProdutoDetalhes = (produtoId: string) => {
    setProdutosDetalhesExpandidos((prev) => {
      const novo = new Set(prev)
      if (novo.has(produtoId)) {
        novo.delete(produtoId)
      } else {
        novo.add(produtoId)
        // Inicializar quantidade se não existir
        if (!quantidades.has(produtoId)) {
          setQuantidades((prevQty) => new Map(prevQty.set(produtoId, 1)))
        }
      }
      return novo
    })
  }

  const alterarQuantidade = (produtoId: string, delta: number) => {
    setQuantidades((prev) => {
      const novo = new Map(prev)
      const atual = novo.get(produtoId) || 1
      const novaQuantidade = Math.max(1, atual + delta)
      novo.set(produtoId, novaQuantidade)
      return novo
    })
  }

  const handleAdicionarAoCarrinho = (produto: ProdutoPrincipal, quantidade: number = 1, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const precoAtual = produto.precoAtual || produto.precoFinal || 0
    
    for (let i = 0; i < quantidade; i++) {
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
    
    // Fechar detalhes após adicionar
    setProdutosDetalhesExpandidos((prev) => {
      const novo = new Set(prev)
      novo.delete(produto.id)
      return novo
    })
  }

  const toggleProdutosExpandidos = (entidadeId: string) => {
    setProdutosExpandidos((prev) => {
      const novo = new Set(prev)
      if (novo.has(entidadeId)) {
        novo.delete(entidadeId)
      } else {
        novo.add(entidadeId)
      }
      return novo
    })
  }

  // Se há busca, agrupar resultados por entidade
  // REMOVIDO: Não mostrar produtos agrupados por entidade no modo exploração
  // Produtos agora são mostrados apenas no modo resultadoBusca via ListaResultadosProdutos
  // Código removido para evitar erro de parsing com comentários JSX dentro de comentários de bloco

  // Sem busca - mostrar todas as entidades
  // IMPORTANTE: Este return está DEPOIS de todos os hooks, então está correto
  if (entidades.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center h-full flex items-center justify-center">
        <div>
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhuma loja encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-[#16A34A] text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Lojas Disponíveis</h3>
            <p className="text-sm text-white/90 mt-1">{entidades.length} loja(s)</p>
          </div>
        </div>
      </div>

      {/* Lista de Entidades */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {entidades.map((entidade) => {
          const produtosPrincipais = (entidade.produtos || []).slice(0, 3)
          const isHighlighted = highlightedEntityId === entidade.id
          const isExpanded = produtosExpandidos.has(entidade.id)

          return (
            <div
              key={entidade.id}
              className={`bg-gray-50 rounded-lg border transition-all ${
                isHighlighted
                  ? 'border-[#16A34A] bg-green-50 shadow-md'
                  : 'border-gray-200'
              }`}
              onMouseEnter={() => onEntityHover?.(entidade.id)}
              onMouseLeave={() => onEntityHover?.(null)}
            >
              {/* Cabeçalho da Entidade */}
              <div className="p-3 flex items-start gap-3">
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
                  {entidade.tipo && (
                    <p className="text-xs text-[#16A34A] font-medium mb-1">
                      {formatarTipoEntidade(entidade.tipo)}
                    </p>
                  )}
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
                {/* Botão de expandir produtos removido no modo exploração */}
                {false && (entidade.produtos || []).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleProdutosExpandidos(entidade.id)}
                  >
                    {isExpanded ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Produtos Principais - REMOVIDO no modo exploração */}
              {false && isExpanded && produtosPrincipais.length > 0 && (
                <div className="px-3 pb-3 space-y-2">
                  {produtosPrincipais.map((produto) => {
                    const precoAtual = produto.precoAtual || produto.precoFinal || 0
                    const precoDesconto = produto.precoDesconto || null
                    const emPromocao = produto.emPromocao && precoDesconto !== null
                    const precoExibido = emPromocao ? precoDesconto : precoAtual
                    const precoAntigo = emPromocao ? precoAtual : null
                    const detalhesExpandido = produtosDetalhesExpandidos.has(produto.id)
                    const quantidade = quantidades.get(produto.id) || 1

                    return (
                      <div
                        key={produto.id}
                        className="bg-white rounded-md border border-gray-200 hover:border-[#16A34A] transition-colors"
                      >
                        {/* Resumo do Produto */}
                        <div className="p-2">
                          <div className="flex items-start justify-between gap-2">
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
                                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                                      PROMO
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-[#16A34A]">
                                    R$ {precoExibido.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => toggleProdutoDetalhes(produto.id)}
                                title="Ver detalhes"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 w-7 p-0 bg-[#16A34A] hover:bg-[#15803D] text-white flex-shrink-0"
                                onClick={(e) => handleAdicionarAoCarrinho(produto, 1, e)}
                                title="Adicionar à lista"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Detalhes Expandidos do Produto */}
                        {detalhesExpandido && (
                          <div className="px-2 pb-2 border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {/* Imagem */}
                            {produto.fotos && produto.fotos.length > 0 && (
                              <div className="relative w-full h-32 rounded-md overflow-hidden bg-gray-100 mt-2">
                                <Image
                                  src={produto.fotos[0].url}
                                  alt={produto.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Preços */}
                            <div className="space-y-1">
                              {emPromocao && precoAntigo ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400 line-through">
                                      R$ {precoAntigo.toFixed(2)}
                                    </span>
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                      PROMOÇÃO
                                    </span>
                                  </div>
                                  <p className="text-xl font-bold text-[#16A34A]">
                                    R$ {precoExibido.toFixed(2)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xl font-bold text-[#16A34A]">
                                  R$ {precoExibido.toFixed(2)}
                                </p>
                              )}
                            </div>

                            {/* Quantidade */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                              <div className="flex items-center gap-2 border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => alterarQuantidade(produto.id, -1)}
                                  disabled={quantidade <= 1}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <span className="px-3 font-semibold min-w-[2rem] text-center text-sm">
                                  {quantidade}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => alterarQuantidade(produto.id, 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Botão Adicionar à Lista */}
                            <Button
                              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold h-9"
                              onClick={(e) => handleAdicionarAoCarrinho(produto, quantidade, e)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Adicionar {quantidade > 1 ? `${quantidade} itens` : 'à lista'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Botão Ver Entidade */}
              <div className="px-3 pb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => handleVerLoja(entidade.id, e)}
                >
                  <Store className="h-3.5 w-3.5 mr-1.5" />
                  Ver {entidade.tipo ? formatarTipoEntidade(entidade.tipo) : 'Loja'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
