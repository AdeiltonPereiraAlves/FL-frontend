'use client'

import { useEffect, useState, use, useMemo } from 'react'
import { useEntidades } from '@/hooks/useEntidades'
import { useApiContext } from '@/contexts/ApiContext'
import { Button } from '@/components/ui/button'
import { Store, MapPin, Phone, Mail, MessageSquare, Package, ChevronLeft, ChevronRight, ArrowLeft, Edit, X, Save, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import CartButton from '@/components/carrinho/Cartbutton'
import Carrinho from '@/components/carrinho/Carrinho'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner, LoadingGrid, LoadingSkeleton } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { EditarEntidadeForm } from '@/components/admin/EditarEntidadeForm'
import { DialogProdutoCompleto } from '@/components/admin/DialogProdutoCompleto'
import { EditarProdutoInline } from '@/components/admin/EditarProdutoInline'
import { useNavigation } from '@/contexts/NavigationContext'
import { BackButton } from '@/components/navigation/BackButton'
import { useCache } from '@/contexts/CacheContext'

export default function LojaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { buscarEntidadePorId } = useEntidades()
  const api = useApiContext()
  const { adicionar } = useCart()
  const { isAuthenticated } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const { state: navState, canGoBack } = useNavigation()
  const cache = useCache()
  
  // Verificar se está em modo admin (vindo da página de planos)
  const isAdminMode = searchParams.get('admin') === 'true' && (isDonoSistema() || isAdmin())
  
  // Verificar se o usuário tem permissão de admin/dono do sistema
  const podeEditar = isDonoSistema() || isAdmin()
  
  const [entidade, setEntidade] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [paginacao, setPaginacao] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [paginaAnterior, setPaginaAnterior] = useState<string | null>(null)
  
  // Verificar se deve mostrar botão voltar: se veio do mapa/home ou se tem página anterior no sessionStorage
  // Usar useMemo para calcular depois que paginaAnterior for definido
  const veioDoMapaOuHome = useMemo(() => {
    return canGoBack() && (navState.previousView === 'home' || navState.currentView === 'loja')
  }, [canGoBack, navState.previousView, navState.currentView])
  
  const deveMostrarVoltar = useMemo(() => {
    return veioDoMapaOuHome || paginaAnterior || isAdminMode
  }, [veioDoMapaOuHome, paginaAnterior, isAdminMode])
  
  // Estados para modo de edição
  const [editandoEntidade, setEditandoEntidade] = useState(false)
  const [salvandoEntidade, setSalvandoEntidade] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<string | null>(null)
  const [salvandoProduto, setSalvandoProduto] = useState(false)
  const [produtoEditandoInline, setProdutoEditandoInline] = useState<string | null>(null)
  
  const limit = 20

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      setError(null)
      try {
        // Verificar cache primeiro
        const cacheKey = `loja:${resolvedParams.id}`
        const cached = cache.get<any>(cacheKey)
        if (cached) {
          console.log('✅ [LojaPage] Usando dados do cache')
          setEntidade(cached)
          setLoading(false)
          await carregarProdutos(1)
          return
        }

        // Carregar entidade
        console.log('🔍 [LojaPage] Buscando entidade do servidor')
        const entidadeData = await buscarEntidadePorId(resolvedParams.id)
        setEntidade(entidadeData)
        
        // Salvar no cache (5 minutos)
        cache.set(cacheKey, entidadeData, 5 * 60 * 1000)
        console.log('💾 [LojaPage] Dados salvos no cache')

        // Carregar produtos da entidade
        await carregarProdutos(1)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados da loja'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [resolvedParams.id, buscarEntidadePorId, cache])

  // Carregar página anterior do sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnUrl = sessionStorage.getItem('lojaReturnUrl')
      if (returnUrl && returnUrl.startsWith('/produto/')) {
        setPaginaAnterior(returnUrl)
      }
    }
  }, [])

  // Função para salvar entidade
  const handleSalvarEntidade = async (dados: any) => {
    setSalvandoEntidade(true)
    try {
      await api.put(`/entidade/${resolvedParams.id}`, dados)
      // Recarregar entidade
      const entidadeData = await buscarEntidadePorId(resolvedParams.id)
      setEntidade(entidadeData)
      setEditandoEntidade(false)
    } catch (error) {
      console.error('Erro ao salvar entidade:', error)
      alert('Erro ao salvar entidade. Tente novamente.')
    } finally {
      setSalvandoEntidade(false)
    }
  }

  // Função para salvar produto
  const handleSalvarProduto = async (produtoId: string, dados: any) => {
    setSalvandoProduto(true)
    try {
      await api.put(`/produto/${produtoId}`, dados)
      // Recarregar produtos
      await carregarProdutos(page)
      setProdutoEditando(null)
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto. Tente novamente.')
    } finally {
      setSalvandoProduto(false)
    }
  }

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
      precoFinal: produto.emPromocao && produto.precoDesconto 
        ? produto.precoDesconto 
        : (produto.precoAtual || produto.precoFinal || produto.precoNormal || 0),
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

  // Mostrar erro de conexão
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md px-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h1 className="text-2xl font-bold text-red-900 mb-2">Erro de Conexão</h1>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600 mb-4">
                Verifique se o servidor backend está rodando e tente novamente.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="default">
                Tentar Novamente
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Voltar para Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!entidade && !loading) {
    return (
      <div className="min-h-screen bg-background">
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
              <div className="flex gap-3 mt-4 flex-wrap">
                {isAdminMode && (
                  <Button
                    variant="secondary"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={() => setEditandoEntidade(!editandoEntidade)}
                  >
                    {editandoEntidade ? (
                      <span className="flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar Edição
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Entidade
                      </span>
                    )}
                  </Button>
                )}
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

      {/* Horários de Funcionamento */}
      {entidade.horario && entidade.horario.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Horários de Funcionamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {entidade.horario.map((horario) => {
                    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
                    const diaNome = diasSemana[horario.diaSemana] || `Dia ${horario.diaSemana}`
                    return (
                      <div key={horario.id} className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">{diaNome}:</span>
                        <span className="text-gray-600">
                          {horario.abertura} - {horario.fechamento}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Formulário de Edição de Entidade */}
      {isAdminMode && editandoEntidade && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EditarEntidadeForm
            entidade={entidade}
            onSave={handleSalvarEntidade}
            onCancel={() => setEditandoEntidade(false)}
            isLoading={salvandoEntidade}
          />
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar - Se veio do mapa/home, de uma página de produto ou admin */}
        {deveMostrarVoltar && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {/* Botão voltar padrão (do NavigationContext) - aparece quando veio do mapa/home */}
              {veioDoMapaOuHome && !paginaAnterior && !isAdminMode && (
                <BackButton />
              )}
              {/* Botão voltar para produto - aparece quando veio de uma página de produto */}
              {paginaAnterior && (
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
              )}
              {/* Botão voltar para admin - aparece quando está em modo admin */}
              {isAdminMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const returnUrl = sessionStorage.getItem('adminReturnUrl') || '/admin/planos'
                    router.push(returnUrl)
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Planos
                </Button>
              )}
              {isAdminMode && (
                <div className="ml-auto">
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                    🔧 Modo Administrador
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
            {/* Renderização condicional: Grade para visitantes/clientes/lojistas, Lista para admin/dono */}
            {podeEditar && isAdminMode ? (
              /* Lista de Produtos para Admin/Dono do Sistema */
              <div className="space-y-4">
                {produtos.map((produto) => {
                  // MVP: Usar campos diretos do produto
                  const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
                  const precoDesconto = produto.precoDesconto || produto.precoPromo || null
                  const emPromocao = produto.emPromocao && precoDesconto !== null
                  const precoAntigo = emPromocao ? precoAtual : null
                  const precoFinal = emPromocao ? precoDesconto : precoAtual
                  const isEditando = produtoEditandoInline === produto.id

                  return (
                    <div key={produto.id} className="space-y-4">
                      {/* Formulário de Edição Inline */}
                      {isEditando && (
                        <EditarProdutoInline
                          produtoId={produto.id}
                          onSave={async () => {
                            await carregarProdutos(page)
                          }}
                          onCancel={() => setProdutoEditandoInline(null)}
                        />
                      )}

                      {/* Item da Lista */}
                      <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${isEditando ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-4">
                          {/* Imagem Pequena */}
                          {produto.fotos?.[0] && (
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                              <Image
                                src={produto.fotos[0].url}
                                alt={produto.nome}
                                fill
                                className="object-cover"
                              />
                              {emPromocao && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1 rounded-bl">
                                  PROMO
                                </div>
                              )}
                            </div>
                          )}

                          {/* Informações do Produto */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {produto.nome}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              {emPromocao && precoAntigo ? (
                                <>
                                  <span className="text-sm text-gray-400 line-through">
                                    R$ {precoAntigo.toFixed(2)}
                                  </span>
                                  <span className="text-lg font-bold text-[#16A34A]">
                                    R$ {precoFinal.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-[#16A34A]">
                                  R$ {precoFinal?.toFixed(2) || 'N/A'}
                                </span>
                              )}
                            </div>
                            {produto.descricao && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {produto.descricao}
                              </p>
                            )}
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              size="sm"
                              onClick={() => {
                                if (produtoEditandoInline === produto.id) {
                                  setProdutoEditandoInline(null)
                                } else {
                                  setProdutoEditandoInline(produto.id)
                                }
                              }}
                              title={produtoEditandoInline === produto.id ? "Cancelar edição" : "Editar produto"}
                            >
                              {produtoEditandoInline === produto.id ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Grade de Produtos para Visitantes/Clientes/Lojistas */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {produtos.map((produto) => {
                  // MVP: Usar campos diretos do produto
                  const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
                  const precoDesconto = produto.precoDesconto || produto.precoPromo || null
                  const emPromocao = produto.emPromocao && precoDesconto !== null
                  const precoAntigo = emPromocao ? precoAtual : null
                  const precoFinal = emPromocao ? precoDesconto : precoAtual

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
                          {emPromocao && precoAntigo ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 line-through">
                                  R$ {precoAntigo.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xl font-bold text-[#16A34A]">
                                R$ {precoAtual.toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xl font-bold text-[#16A34A]">
                              R$ {precoFinal?.toFixed(2) || 'N/A'}
                            </p>
                          )}
                        </div>

                        {/* Botão Adicionar ao Carrinho */}
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
            )}

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

      {/* Modal de Edição de Produto - apenas para não-admin */}
      {!isAdminMode && produtoEditando && (
        <DialogProdutoCompleto
          produtoId={produtoEditando}
          onClose={() => setProdutoEditando(null)}
          onSave={async () => {
            await carregarProdutos(page)
            setProdutoEditando(null)
          }}
        />
      )}
    </div>
  )
}
