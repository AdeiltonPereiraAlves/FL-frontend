'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { useProdutos } from '@/hooks/useProdutos'
import { useEntidades } from '@/hooks/useEntidades'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Package, Store, ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import CartButton from '@/components/carrinho/Cartbutton'
import Carrinho from '@/components/carrinho/Carrinho'
import { CardEntidade } from '@/components/entidade/CardEntidade'
import { useApiContext } from '@/contexts/ApiContext'
import { LoadingSpinner, LoadingGrid, LoadingSkeleton } from '@/components/ui/LoadingSpinner'

export default function ProdutosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { listarTodosProdutos, buscarProdutosPorCidade, produtos, paginacao, isLoading } = useProdutos()
  const { buscarEntidadesPorNome } = useEntidades()
  const { adicionar } = useCart()
  const api = useApiContext()
  
  const [page, setPage] = useState(1)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [entidades, setEntidades] = useState<any[]>([])
  const [paginacaoEntidades, setPaginacaoEntidades] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'all' | 'entities' | 'products'>('all')
  const limit = 20

  // Verificar se há busca na URL
  useEffect(() => {
    const busca = searchParams.get('busca')
    if (busca) {
      setSearchQuery(busca)
      realizarBusca(busca)
    } else {
      // Carregar todos os produtos se não houver busca
      carregarProdutos()
    }
  }, [searchParams])

  const carregarProdutos = async () => {
    try {
      await listarTodosProdutos(page, limit)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const realizarBusca = async (query: string) => {
    if (!query.trim()) {
      carregarProdutos()
      return
    }

    setIsSearching(true)
    setSearchQuery(query)

    try {
      // Buscar entidades e produtos em paralelo
      const [entidadesResult, produtosResult] = await Promise.allSettled([
        buscarEntidadesPorNome(query, 1, 20),
        api.get('/produtos', { params: { query, page: 1, limit: 20 } }).catch(() => null),
      ])

      // Processar resultados de entidades
      if (entidadesResult.status === 'fulfilled') {
        const entidadesData = entidadesResult.value
        setEntidades(entidadesData.entidades || [])
        setPaginacaoEntidades(entidadesData.paginacao || null)
      } else {
        setEntidades([])
        setPaginacaoEntidades(null)
      }

      // Processar resultados de produtos
      if (produtosResult.status === 'fulfilled' && produtosResult.value) {
        const produtosData = produtosResult.value
        const produtosList = Array.isArray(produtosData) 
          ? produtosData 
          : (produtosData.produtos || [])
        setProdutos(produtosList)
        setPaginacao(produtosData.paginacao || null)
      } else {
        // Se não encontrar produtos, tentar buscar por nome
        try {
          const produtosPorNome = await api.get('/produtos', {
            params: { page: 1, limit: 20 },
          })
          const todosProdutos = produtosPorNome.produtos || []
          const produtosFiltrados = todosProdutos.filter((p: any) =>
            p.nome.toLowerCase().includes(query.toLowerCase())
          )
          setProdutos(produtosFiltrados)
          setPaginacao(null)
        } catch {
          setProdutos([])
          setPaginacao(null)
        }
      }

      // Determinar modo de busca baseado nos resultados
      if (entidadesResult.status === 'fulfilled' && entidadesResult.value.entidades?.length > 0) {
        if (produtosResult.status === 'fulfilled' && produtosResult.value?.produtos?.length > 0) {
          setSearchMode('all')
        } else {
          setSearchMode('entities')
        }
      } else {
        setSearchMode('products')
      }
    } catch (error) {
      console.error('Erro ao buscar:', error)
      setEntidades([])
      setProdutos([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (!searchQuery) {
      carregarProdutos()
    }
  }, [page, listarTodosProdutos, searchQuery])

  const handleAdicionarAoCarrinho = (produto: any) => {
    // MVP: Usar precoAtual como preço principal
    const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
    
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: precoAtual,
      entidade: {
        id: produto.entidade.id,
        nome: produto.entidade.nome,
        contato: produto.entidade.contato,
      },
    })
    setCarrinhoAberto(true)
  }


  const abrirCarrinho = () => {
    setCarrinhoAberto(true)
  }

  const fecharCarrinho = () => {
    setCarrinhoAberto(false)
  }

  const toggleCarrinho = () => {
    setCarrinhoAberto((prev) => !prev)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading && produtos.length === 0 && !isSearching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <LoadingSkeleton className="h-8 w-64 mb-2" />
            <LoadingSkeleton className="h-4 w-48" />
          </div>
          <LoadingGrid count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos os Produtos'}
          </h1>
          <p className="text-gray-600">
            {searchQuery 
              ? `${entidades.length} loja(s) e ${produtos.length} produto(s) encontrado(s)`
              : paginacao?.totalItens 
                ? `${paginacao.totalItens} produtos encontrados` 
                : 'Carregando...'}
          </p>
        </div>

        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Buscando produtos e lojas..." />
          </div>
        ) : (
          <>
            {/* Resultados de Entidades */}
            {searchQuery && entidades.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="h-6 w-6 text-[#16A34A]" />
                  Lojas ({entidades.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {entidades.map((entidade) => (
                    <CardEntidade key={entidade.id} entidade={entidade} />
                  ))}
                </div>
              </div>
            )}

            {/* Resultados de Produtos */}
            {produtos.length > 0 && (
              <div>
                {searchQuery && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6 text-[#16A34A]" />
                    Produtos ({produtos.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {produtos.map((produto) => {
                // MVP: Usar precoAtual e precoAntigo do ProdutoPrecoHistorico
                const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
                const precoAntigo = produto.precoAntigo || (produto.emPromocao ? produto.precoNormal : null)
                const emPromocao = produto.emPromocao || (!!precoAntigo && !!precoAtual)
                const precoExibido = precoAtual

                return (
                  <div
                    key={produto.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
                  >
                    {/* Imagem do Produto */}
                    <Link
                      href={`/produto/${produto.id}`}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('produtoReturnUrl', window.location.pathname)
                        }
                      }}
                      className="block relative w-full h-48 bg-gray-100 group cursor-pointer"
                    >
                      {produto.fotos && produto.fotos.length > 0 ? (
                        <Image
                          src={produto.fotos[0].url}
                          alt={produto.nome}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      {emPromocao && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          PROMOÇÃO
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-semibold bg-[#16A34A] px-4 py-2 rounded">
                          Ver Detalhes
                        </span>
                      </div>
                    </Link>

                    {/* Informações do Produto */}
                    <div className="p-4">
                      <Link
                        href={`/produto/${produto.id}`}
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('produtoReturnUrl', window.location.pathname)
                          }
                        }}
                        className="block"
                      >
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3rem] hover:text-[#16A34A] transition-colors">
                          {produto.nome}
                        </h3>
                      </Link>

                      {/* Nome da Entidade com Link */}
                      {produto.entidade && (
                        <Link
                          href={`/loja/${produto.entidade.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                            }
                          }}
                          className="flex items-center gap-1 text-sm text-[#16A34A] hover:text-[#15803D] hover:underline mb-3"
                        >
                          <Store className="h-3.5 w-3.5" />
                          <span className="font-medium">{produto.entidade.nome}</span>
                        </Link>
                      )}

                      {/* Preços */}
                      <div className="mb-4">
                        {emPromocao && precoAntigo ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400 line-through">
                                R$ {precoAntigo.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-[#16A34A]">
                              R$ {precoAtual.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-[#16A34A]">
                            R$ {precoExibido.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-2">
                        <Link
                          href={`/produto/${produto.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (typeof window !== 'undefined') {
                              sessionStorage.setItem('produtoReturnUrl', window.location.pathname)
                            }
                          }}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAdicionarAoCarrinho(produto)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Carrinho
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

                {/* Paginação de Produtos - Apenas quando não há busca */}
                {!searchQuery && paginacao && paginacao.totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, paginacao.totalPaginas) }, (_, i) => {
                        let pageNum: number
                        if (paginacao.totalPaginas <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= paginacao.totalPaginas - 2) {
                          pageNum = paginacao.totalPaginas - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={page === pageNum ? 'bg-[#16A34A] hover:bg-[#15803D]' : ''}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === paginacao.totalPaginas}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Mensagem quando não encontrar nada */}
            {!isSearching && searchQuery && entidades.length === 0 && produtos.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nada encontrado</h2>
                <p className="text-gray-600">
                  Não encontramos lojas ou produtos para "{searchQuery}". Tente buscar por outro termo.
                </p>
              </div>
            )}

            {/* Mensagem quando não houver busca e não houver produtos */}
            {!searchQuery && produtos.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h2>
                <p className="text-gray-600">Não há produtos disponíveis no momento.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Painel de Carrinho */}
      {carrinhoAberto && (
        <div
          className="
            fixed z-[999] bg-white shadow-xl
            bottom-0 left-0 w-full h-[60%]
            md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full
            flex flex-col
            animate-in slide-in-from-bottom md:slide-in-from-right
          "
        >
          <Carrinho 
            onClose={fecharCarrinho}
          />
        </div>
      )}

      {/* Botão flutuante do carrinho */}
      <CartButton onClick={toggleCarrinho} isOpen={carrinhoAberto} />
    </div>
  )
}
