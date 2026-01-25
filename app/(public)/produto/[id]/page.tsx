'use client'

import { useEffect, useState, use } from 'react'
import { Header } from '@/components/Header'
import { useProdutos } from '@/hooks/useProdutos'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Calendar, Truck, Store, Tag, Copy, Check, AlertCircle, Plus, Minus, MapPin, Phone, Mail, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CartButton from '@/components/carrinho/Cartbutton'
import Carrinho from '@/components/carrinho/Carrinho'
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner'

export default function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { buscarProdutoPorId } = useProdutos()
  const { adicionar } = useCart()
  
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [cupomCopiado, setCupomCopiado] = useState<string | null>(null)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [paginaAnterior, setPaginaAnterior] = useState<string>('/')

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      try {
        const produtoData = await buscarProdutoPorId(resolvedParams.id)
        setProduto(produtoData)
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [resolvedParams.id, buscarProdutoPorId])

  // Carregar página anterior do sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnUrl = sessionStorage.getItem('produtoReturnUrl')
      if (returnUrl) {
        setPaginaAnterior(returnUrl)
      } else {
        const referrer = document.referrer
        if (referrer && referrer.includes(window.location.origin)) {
          const referrerPath = new URL(referrer).pathname
          if (referrerPath !== `/produto/${resolvedParams.id}`) {
            setPaginaAnterior(referrerPath)
          }
        }
      }
    }
  }, [resolvedParams.id])

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

  const handleAdicionarAoCarrinho = () => {
    if (!produto) return
    
    for (let i = 0; i < quantidade; i++) {
      adicionar({
        id: produto.id,
        nome: produto.nome,
        precoFinal: produto.precoFinal,
        entidade: {
          id: produto.entidade.id,
          nome: produto.entidade.nome,
          contato: produto.entidade.contato,
        },
      })
    }
    // Abre o carrinho automaticamente após adicionar
    setCarrinhoAberto(true)
  }

  const toggleCarrinho = () => {
    setCarrinhoAberto((prev) => !prev)
  }

  const fecharCarrinho = () => {
    setCarrinhoAberto(false)
  }

  const precoNormal = produto?.precoNormal || produto?.precoFinal
  const precoPromo = produto?.precoPromo
  const emPromocao = produto?.emPromocao && precoPromo
  const precoFinal = emPromocao ? precoPromo : precoNormal

  // Cupons ativos e válidos
  const cuponsValidos = produto?.cupons?.filter((cupom: any) => {
    if (!cupom.ativo) return false
    if (cupom.validade) {
      return new Date(cupom.validade) > new Date()
    }
    return true
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <LoadingSkeleton className="h-10 w-32 mb-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <LoadingSkeleton className="h-96 w-full rounded-lg mb-4" />
              <div className="flex gap-2">
                <LoadingSkeleton className="h-20 w-20 rounded" />
                <LoadingSkeleton className="h-20 w-20 rounded" />
                <LoadingSkeleton className="h-20 w-20 rounded" />
              </div>
            </div>
            <div>
              <LoadingSkeleton className="h-8 w-3/4 mb-4" />
              <LoadingSkeleton className="h-6 w-1/2 mb-2" />
              <LoadingSkeleton className="h-10 w-32 mb-6" />
              <LoadingSkeleton className="h-4 w-full mb-2" />
              <LoadingSkeleton className="h-4 w-full mb-2" />
              <LoadingSkeleton className="h-4 w-3/4 mb-8" />
              <LoadingSkeleton className="h-12 w-full mb-4" />
              <LoadingSkeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
            <p className="text-gray-600 mb-4">O produto que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => router.push(paginaAnterior)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push(paginaAnterior)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagens do Produto */}
          <div className="space-y-4">
            {produto.fotos && produto.fotos.length > 0 ? (
              <>
                {/* Imagem Principal (destaque ou primeira) */}
                {(() => {
                  const fotoPrincipal = produto.fotos.find((f: any) => f.destaque) || produto.fotos[0]
                  const outrasFotos = produto.fotos.filter((f: any) => f.id !== fotoPrincipal.id)
                  
                  return (
                    <>
                      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <Image
                          src={fotoPrincipal.url}
                          alt={produto.nome}
                          fill
                          className="object-cover"
                          priority
                        />
                        {fotoPrincipal.destaque && (
                          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold">
                            Imagem Principal
                          </div>
                        )}
                        {emPromocao && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                            PROMOÇÃO
                          </div>
                        )}
                      </div>
                      
                      {/* Galeria de outras fotos */}
                      {outrasFotos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {outrasFotos.map((foto: any) => (
                            <div 
                              key={foto.id} 
                              className="relative w-full h-20 rounded overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer hover:border-primary transition-colors"
                            >
                              <Image
                                src={foto.url}
                                alt={`${produto.nome} - Foto ${foto.ordem || ''}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            ) : (
              <div className="w-full h-96 rounded-lg bg-gray-200 flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{produto.nome}</h1>
              {produto.descricao && (
                <p className="text-gray-600 leading-relaxed">{produto.descricao}</p>
              )}
            </div>

            {/* Preços */}
            <div className="space-y-2">
              {emPromocao ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-gray-400 line-through">
                      R$ {precoNormal?.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      PROMOÇÃO
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-[#16A34A]">
                    R$ {precoPromo?.toFixed(2)}
                  </p>
                  {produto.variacoes?.[0]?.descontoPerc && (
                    <p className="text-sm text-green-600 font-semibold">
                      {produto.variacoes[0].descontoPerc}% de desconto
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-4xl font-bold text-[#16A34A]">
                  R$ {precoFinal?.toFixed(2) || 'N/A'}
                </p>
              )}
            </div>

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


            {/* Quantidade e Adicionar ao Carrinho */}
            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantidade}</span>
                  <button
                    onClick={() => setQuantidade(quantidade + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 ml-auto">
                    Total: R$ {(precoFinal * quantidade).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAdicionarAoCarrinho}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold h-12 text-lg"
              >
                Adicionar {quantidade > 1 ? `${quantidade} itens` : 'ao carrinho'}
              </Button>
            </div>
          </div>
        </div>

        {/* Seção de Informações da Loja - Estilo Discreto */}
        {produto?.entidade && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Foto do Perfil da Loja - Menor */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
                <Image
                  src={produto.entidade.fotoPerfilUrl || '/placeholder.png'}
                  alt={produto.entidade.nome}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Informações da Loja */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/loja/${produto.entidade.id}`}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                    }
                  }}
                  className="block"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-[#16A34A] transition-colors">
                    {produto.entidade.nome}
                  </h3>
                </Link>
                
                {produto.entidade.descricao && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {produto.entidade.descricao}
                  </p>
                )}

                {/* Informações de Contato e Localização - Menores */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {produto.entidade.localizacao && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">
                        {produto.entidade.localizacao.endereco || produto.entidade.localizacao.bairro || 'Localização disponível'}
                        {produto.entidade.cidade && ` - ${produto.entidade.cidade.nome}${produto.entidade.cidade.estado ? `/${produto.entidade.cidade.estado}` : ''}`}
                      </span>
                    </div>
                  )}
                  {produto.entidade.contato?.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{produto.entidade.contato.telefone}</span>
                    </div>
                  )}
                </div>

                {/* Botão para Ver Perfil */}
                <div className="mt-3">
                  <Link
                    href={`/loja/${produto.entidade.id}`}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                      }
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                      <Store className="h-3.5 w-3.5 mr-1.5" />
                      Ver Perfil
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
