'use client'

import { useEffect, useState, use } from 'react'
import { Header } from '@/components/Header'
import { useEntidades } from '@/hooks/useEntidades'
import { useApiContext } from '@/contexts/ApiContext'
import { Button } from '@/components/ui/button'
import { Store, MapPin, Phone, Mail, MessageSquare, Package, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import CartButton from '@/components/carrinho/Cartbutton'
import Carrinho from '@/components/carrinho/Carrinho'
import { useRouter } from 'next/navigation'
import { LoadingSpinner, LoadingGrid, LoadingSkeleton } from '@/components/ui/LoadingSpinner'

export default function LojaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { buscarEntidadePorId } = useEntidades()
  const api = useApiContext()
  const { adicionar } = useCart()
  
  const [entidade, setEntidade] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [paginacao, setPaginacao] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [paginaAnterior, setPaginaAnterior] = useState<string | null>(null)
  const limit = 20

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      try {
        // Carregar entidade
        const entidadeData = await buscarEntidadePorId(resolvedParams.id)
        setEntidade(entidadeData)

        // Carregar produtos da entidade
        await carregarProdutos(1)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [resolvedParams.id, buscarEntidadePorId])

  // Carregar página anterior do sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnUrl = sessionStorage.getItem('lojaReturnUrl')
      if (returnUrl && returnUrl.startsWith('/produto/')) {
        setPaginaAnterior(returnUrl)
      }
    }
  }, [])

  const carregarProdutos = async (pagina: number) => {
    try {
      const response = await api.get<{
        produtos: any[]
        paginacao: {
          paginaAtual: number
          totalPaginas: number
          totalItens: number
          itensPorPagina: number
        }
      }>(`/entidade/${resolvedParams.id}/produtos?page=${pagina}&limit=${limit}`)
      
      setProdutos(response.produtos || [])
      setPaginacao(response.paginacao || null)
      setPage(pagina)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleAdicionarAoCarrinho = (produto: any) => {
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: produto.precoFinal,
      entidade: {
        id: entidade.id,
        nome: entidade.nome,
        contato: entidade.contato,
      },
    })
    // Abre o carrinho automaticamente após adicionar
    setCarrinhoAberto(true)
  }

  const toggleCarrinho = () => {
    setCarrinhoAberto((prev) => !prev)
  }

  const fecharCarrinho = () => {
    setCarrinhoAberto(false)
  }

  const whatsappUrl = entidade?.contato?.redes?.find(
    (r: any) => r.tipo === 'WHATSAPP'
  )?.url

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <LoadingSkeleton className="h-10 w-64 mb-4" />
            <LoadingSkeleton className="h-6 w-48 mb-2" />
            <LoadingSkeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              <LoadingSkeleton className="h-64 w-full rounded-lg mb-4" />
              <LoadingSkeleton className="h-4 w-full mb-2" />
              <LoadingSkeleton className="h-4 w-3/4" />
            </div>
            <div className="md:col-span-2">
              <LoadingSkeleton className="h-8 w-48 mb-4" />
              <LoadingGrid count={6} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!entidade) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
            <p className="text-gray-600 mb-4">A loja que você está procurando não existe ou foi removida.</p>
            <Button asChild>
              <Link href="/">Voltar para Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Botão Voltar - Se veio de uma página de produto */}
      {paginaAnterior && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              router.push(paginaAnterior)
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Produto
          </Button>
        </div>
      )}

      {/* Header da Loja */}
      <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Foto do Perfil */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <Image
                src={entidade.fotoPerfilUrl || '/placeholder.png'}
                alt={entidade.nome}
                fill
                className="object-cover"
              />
            </div>

            {/* Informações */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{entidade.nome}</h1>
              {entidade.descricao && (
                <p className="text-white/90 mb-4">{entidade.descricao}</p>
              )}

              {/* Informações de Contato e Localização */}
              <div className="flex flex-wrap gap-4 text-sm">
                {entidade.localizacao && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {entidade.localizacao.endereco || entidade.localizacao.bairro || ''}
                      {entidade.cidade && ` - ${entidade.cidade.nome}/${entidade.cidade.estado}`}
                    </span>
                  </div>
                )}
                {entidade.contato?.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{entidade.contato.telefone}</span>
                  </div>
                )}
                {entidade.contato?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{entidade.contato.email}</span>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4">
                {whatsappUrl && (
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {entidade.localizacao && (
                  <Button
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${entidade.localizacao.latitude},${entidade.localizacao.longitude}`
                      window.open(url, '_blank')
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de Entrega */}
      {entidade.fazEntrega !== undefined && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {entidade.fazEntrega ? (
                  <>
                    Esta loja faz entrega
                    {entidade.valorMinimoEntrega && (
                      <span className="font-normal text-blue-700 ml-2">
                        (Valor mínimo: R$ {Number(entidade.valorMinimoEntrega).toFixed(2)})
                      </span>
                    )}
                  </>
                ) : (
                  'Esta loja não faz entrega'
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="h-6 w-6 text-[#16A34A]" />
            Produtos ({paginacao?.totalItens || produtos.length})
          </h2>
        </div>

        {produtos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum produto disponível</p>
            <p className="text-sm text-gray-400 mt-2">
              Esta loja ainda não possui produtos cadastrados.
            </p>
          </div>
        ) : (
          <>
            {/* Grid de Produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {produtos.map((produto) => {
                const precoNormal = produto.precoNormal || produto.precoFinal
                const precoPromo = produto.precoPromo
                const emPromocao = produto.emPromocao && precoPromo
                const precoFinal = emPromocao ? precoPromo : precoNormal

                return (
                  <div
                    key={produto.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Imagem do Produto */}
                    {produto.fotos?.[0] && (
                      <Link 
                        href={`/produto/${produto.id}`}
                        onClick={() => {
                          // Salvar página atual antes de ir para o produto
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('produtoReturnUrl', window.location.pathname)
                          }
                        }}
                        className="block relative w-full h-48 bg-gray-100 cursor-pointer group"
                      >
                        <Image
                          src={produto.fotos[0].url}
                          alt={produto.nome}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
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
                    )}

                    {/* Informações do Produto */}
                    <div className="p-4">
                      <Link 
                        href={`/produto/${produto.id}`}
                        onClick={() => {
                          // Salvar página atual antes de ir para o produto
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('produtoReturnUrl', window.location.pathname)
                          }
                        }}
                        className="block"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#16A34A] transition-colors">
                          {produto.nome}
                        </h3>
                      </Link>

                      {/* Preços */}
                      <div className="mb-3">
                        {emPromocao ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400 line-through">
                                R$ {precoNormal?.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xl font-bold text-[#16A34A]">
                              R$ {precoPromo?.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xl font-bold text-[#16A34A]">
                            R$ {precoFinal?.toFixed(2) || 'N/A'}
                          </p>
                        )}
                      </div>

                      {/* Botão Adicionar */}
                      <Button
                        onClick={() => handleAdicionarAoCarrinho(produto)}
                        className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
                        size="sm"
                      >
                        Adicionar ao Carrinho
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Paginação */}
            {paginacao && paginacao.totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => carregarProdutos(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <span className="text-sm text-gray-600">
                  Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => carregarProdutos(page + 1)}
                  disabled={page >= paginacao.totalPaginas}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Painel do Carrinho */}
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
          <Carrinho onClose={fecharCarrinho} />
        </div>
      )}

      {/* Botão flutuante do carrinho */}
      <CartButton onClick={toggleCarrinho} isOpen={carrinhoAberto} />
    </div>
  )
}
