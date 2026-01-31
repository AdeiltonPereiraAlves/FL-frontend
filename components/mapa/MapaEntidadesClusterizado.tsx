'use client'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useMemo, useState, useRef, useEffect } from 'react'
import { RecenterMap } from './RecenterMap'
import { createEntityDivIcon } from './createEntityDivIcon'
import ProdutoDetalhes from './../produto/ProdutoDetalhe'
import Carrinho from './../carrinho/Carrinho'
import CartButton from './../carrinho/Cartbutton'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { PopupProdutoMapa } from './PopupProdutoMapa'
import { PopupEntidadeMapa } from './PopupEntidadeMapa'
import { useCart } from '@/contexts/CartContext'
import { useUIPanel } from '@/contexts/UIPanelContext'
import { sanitizeId } from '@/utils/security'
import { entidadeTemLogo, entidadeTemDestaque, obterZIndexPlano } from '@/utils/entidadePlano'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { Marker, Popup } from 'react-leaflet'
import { MapZoomListener } from './MapZoomListener'

// Importar MarkerClusterGroup - usar wrapper para compatibilidade
import MarkerClusterGroupWrapper from 'react-leaflet-cluster'

// Componente para painel de produto com scroll inteligente
function ProdutoPanel({ 
  produto, 
  carrinhoAberto, 
  onClose, 
  onAbrirCarrinho 
}: { 
  produto: any
  carrinhoAberto: boolean
  onClose: () => void
  onAbrirCarrinho: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!panelRef.current || !scrollContainerRef.current) return
      
      const rect = panelRef.current.getBoundingClientRect()
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )

      if (isInside) {
        // Se o mouse está dentro do painel, prevenir zoom do mapa
        // Mas permitir scroll normal dentro do painel
        const scrollContainer = scrollContainerRef.current
        const isAtTop = scrollContainer.scrollTop === 0
        const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1
        
        // Se está no topo e scrollando para cima, ou no fundo e scrollando para baixo, prevenir comportamento padrão
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault()
        }
        
        // Desabilitar zoom do mapa quando dentro do painel
        const mapElement = document.querySelector('.leaflet-container')
        if (mapElement) {
          const mapInstance = (mapElement as any)._leaflet
          if (mapInstance && mapInstance.scrollWheelZoom) {
            mapInstance.scrollWheelZoom.disable()
          }
        }
      } else {
        // Se o mouse está fora, reabilitar zoom do mapa
        const mapElement = document.querySelector('.leaflet-container')
        if (mapElement) {
          const mapInstance = (mapElement as any)._leaflet
          if (mapInstance && mapInstance.scrollWheelZoom) {
            mapInstance.scrollWheelZoom.enable()
          }
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      // Garantir que o zoom seja reabilitado ao desmontar
      const mapElement = document.querySelector('.leaflet-container')
      if (mapElement) {
        const mapInstance = (mapElement as any)._leaflet
        if (mapInstance && mapInstance.scrollWheelZoom) {
          mapInstance.scrollWheelZoom.enable()
        }
      }
    }
  }, [])

  return (
    <div
      ref={panelRef}
      className={`
        fixed z-[998] bg-white shadow-xl
        bottom-0 left-0 w-full h-[60%]
        md:top-0 md:h-full md:w-[360px] md:right-[360px]
        flex flex-col
        animate-in slide-in-from-bottom md:slide-in-from-right
      `}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header com botão de fechar */}
      <div className="flex justify-between items-center p-4 border-b bg-[#16A34A] text-white flex-shrink-0">
        <h4 className="font-semibold text-lg truncate pr-2">Detalhes do Produto</h4>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#15803D] rounded transition-colors flex-shrink-0"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Conteúdo com scroll */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
        <ProdutoDetalhes
          produto={produto}
          onClose={onClose}
          onAbrirCarrinho={onAbrirCarrinho}
        />
      </div>
    </div>
  )
}

// Componente para painel de lista com scroll inteligente
function CarrinhoPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!panelRef.current) return
      
      const rect = panelRef.current.getBoundingClientRect()
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )

      if (isInside) {
        // Se o mouse está dentro do painel, prevenir zoom do mapa
        // O scroll dentro da lista será gerenciado pelo próprio componente Carrinho
        const scrollContainer = panelRef.current.querySelector('.overflow-y-auto')
        if (scrollContainer) {
          const isAtTop = scrollContainer.scrollTop === 0
          const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1
          
          // Se está no topo e scrollando para cima, ou no fundo e scrollando para baixo, prevenir comportamento padrão
          if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
            e.preventDefault()
          }
        }
        
        // Desabilitar zoom do mapa quando dentro do painel
        const mapElement = document.querySelector('.leaflet-container')
        if (mapElement) {
          const mapInstance = (mapElement as any)._leaflet
          if (mapInstance && mapInstance.scrollWheelZoom) {
            mapInstance.scrollWheelZoom.disable()
          }
        }
      } else {
        // Se o mouse está fora, reabilitar zoom do mapa
        const mapElement = document.querySelector('.leaflet-container')
        if (mapElement) {
          const mapInstance = (mapElement as any)._leaflet
          if (mapInstance && mapInstance.scrollWheelZoom) {
            mapInstance.scrollWheelZoom.enable()
          }
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      // Garantir que o zoom seja reabilitado ao desmontar
      const mapElement = document.querySelector('.leaflet-container')
      if (mapElement) {
        const mapInstance = (mapElement as any)._leaflet
        if (mapInstance && mapInstance.scrollWheelZoom) {
          mapInstance.scrollWheelZoom.enable()
        }
      }
    }
  }, [])

  return (
    <div
      ref={panelRef}
      className="
        fixed z-[999] bg-white shadow-xl
        bottom-0 left-0 w-full h-[60%]
        md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full
        flex flex-col
        animate-in slide-in-from-bottom md:slide-in-from-right
      "
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-full flex flex-col">
        <Carrinho onClose={onClose} />
      </div>
    </div>
  )
}

interface Props {
  entidades: any[]
  produtos?: any[]
  entidadesDestaqueIds?: string[]
  isLoading?: boolean
  onEntityHover?: (entityId: string | null) => void
  onEntityClick?: (entityId: string) => void
  highlightedEntityId?: string | null
  currentZoom?: number
  top3EntityIds?: string[] // IDs das TOP 3 entidades no modo BEST_PRICE
}

const SOUSA_PB: [number, number] = [-6.759, -38.2316]

// Componente para gerenciar clusters e camadas
function MapLayers({
  entidades,
  produtos,
  entidadesDestaqueIds = [],
  top3EntityIds = [],
  onEntityHover,
  onEntityClick,
  highlightedEntityId,
  currentZoom = 14,
  produtoSelecionado,
  setProdutoSelecionado,
}: Omit<Props, 'isLoading'> & { 
  produtoSelecionado: any
  setProdutoSelecionado: (produto: any) => void
}) {
  // IMPORTANTE: Todos os hooks devem ser chamados antes de qualquer retorno condicional
  // NÃO usar navigateToLoja aqui para evitar problemas com hooks durante navegação
  const clusterRefs = useRef<{ [key: string]: any }>({})
  
  // Garantir que todos os hooks sejam sempre executados
  const temBusca = produtos && produtos.length > 0
  
  // Zoom mínimo para mostrar nomes (zoom 15 ou maior)
  const mostrarNomes = currentZoom >= 15

  // NÃO desabilitar zoom do mapa - apenas prevenir que eventos do painel afetem o mapa
  // O zoom deve continuar funcionando normalmente

  // Separar entidades por camadas
  const camadas = useMemo(() => {
    const comum: any[] = []
    const promocao: any[] = []
    const premium: any[] = []
    const busca: any[] = []

    // Se há busca, processar produtos
    if (temBusca && produtos) {
      produtos.forEach((produto) => {
        const entidade = produto.entidade
        if (!entidade?.localizacao) return

        const loc = entidade.localizacao
        const lat = Number(loc.latitude)
        const lng = Number(loc.longitude)

        if (
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        )
          return

        const temPromocao = produto.emPromocao && produto.precoDesconto
        const temDestaque = entidadeTemDestaque(entidade)

        busca.push({
          ...produto,
          position: [lat, lng],
          tipo: temPromocao ? 'promocao' : temDestaque ? 'premium' : 'comum',
        })
      })
    } else {
      // Sem busca, processar entidades
      entidades.forEach((ent) => {
        if (ent.status !== 'ATIVA') return

        const loc = ent.localizacao
        if (!loc || loc.latitude === null || loc.longitude === null) return

        const lat = Number(loc.latitude)
        const lng = Number(loc.longitude)

        if (
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        )
          return

        const temDestaque = entidadeTemDestaque(ent)
        const temLogo = entidadeTemLogo(ent)

        const entidadeData = {
          ...ent,
          position: [lat, lng],
        }

        if (temDestaque || temLogo) {
          premium.push(entidadeData)
        } else {
          comum.push(entidadeData)
        }
      })
    }

    return { comum, promocao, premium, busca }
  }, [entidades, produtos, temBusca])

  // Criar marcadores para cada camada
  const criarMarcador = (
    item: any,
    tipo: 'comum' | 'promocao' | 'premium' | 'busca',
    isProduto: boolean = false
  ) => {
    const entidade = isProduto ? item.entidade : item
    const entidadeId = entidade?.id

    // Não retornar null - filtrar antes de chamar esta função
    if (!entidadeId) {
      console.warn('Tentando criar marcador sem entidadeId:', item)
      return null
    }

    const temLogo = entidadeTemLogo(entidade)
    const temDestaque = entidadeTemDestaque(entidade)
    const zIndex = obterZIndexPlano(entidade)
    const isHighlighted = highlightedEntityId === entidadeId
    const isTop3 = top3EntityIds.includes(entidadeId)

    // Ícone diferenciado por tipo
    let iconConfig: any = {
      imageUrl: entidade.fotoPerfilUrl || 'https://via.placeholder.com/50',
      nomeEntidade: entidade.nome,
      entidadeId,
      tipoEntidade: entidade.tipo,
      temLogo,
      temDestaque,
      zIndex,
      entidade, // Passar entidade completa para verificar o plano
    }

    // Se for produto, adicionar preço
    if (isProduto) {
      iconConfig.preco = item.precoFinal || item.precoAtual
      iconConfig.highlight = isHighlighted || isTop3 // Destacar se for TOP 3
      iconConfig.pulsando = true // Resultado de busca sempre pulsa
    }
    
    // Destacar TOP 3 no modo BEST_PRICE
    if (isTop3) {
      iconConfig.highlight = true
      iconConfig.corBorda = '#22c55e' // Verde para TOP 3
      iconConfig.pulsando = true
    }

    // Cores diferenciadas por tipo
    if (tipo === 'promocao') {
      iconConfig.corBorda = '#16A34A' // Verde para promoção
    } else if (tipo === 'premium') {
      iconConfig.corBorda = '#FFD700' // Dourado para premium
    } else if (tipo === 'comum') {
      iconConfig.corBorda = '#6B7280' // Cinza para comum
    }

    // Adicionar informações de zoom
    iconConfig.mostrarNome = mostrarNomes
    iconConfig.zoomLevel = currentZoom

    const icon = createEntityDivIcon(iconConfig)

    return (
      <Marker
        key={isProduto ? item.id : entidadeId}
        position={item.position}
        icon={icon}
        eventHandlers={{
          click: (e: any) => {
            // Notificar o componente pai para hover
            if (onEntityHover) {
              onEntityHover(entidadeId)
            }
            
            // Se for produto, mostrar detalhes
            if (isProduto) {
              setProdutoSelecionado(item)
            }
            // Para entidades, o popup será aberto automaticamente pelo Leaflet
          },
          mouseover: () => {
            if (onEntityHover) {
              onEntityHover(entidadeId)
            }
          },
          mouseout: () => {
            if (onEntityHover) {
              onEntityHover(null)
            }
          },
        }}
      >
        {/* Sempre renderizar popup - conteúdo muda baseado no tipo */}
        <Popup 
          key={`popup-${isProduto ? `produto-${item.id}` : `entidade-${entidadeId}`}`}
          closeButton={true} 
          autoClose={false} 
          closeOnClick={false}
        >
          {isProduto ? (
            <PopupProdutoMapa
              produto={item}
              onVerProduto={() => setProdutoSelecionado(item)}
              isDestaque={item.emPromocao}
            />
          ) : (
            <PopupEntidadeMapa
              entidade={entidade}
              onVerEntidade={() => {
                if (onEntityClick) {
                  onEntityClick(entidadeId)
                }
              }}
            />
          )}
        </Popup>
      </Marker>
    )
  }

  // Renderizar camadas com clusters

  return (
    <>
      {/* Layer 1: Entidades Comuns (sem busca) */}
      {!temBusca && camadas.comum.length > 0 && (
        <MarkerClusterGroupWrapper
          key={`layer-comum-${currentZoom}`}
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover
          zoomToBoundsOnClick
          maxClusterRadius={50}
        >
          {camadas.comum
            .map((ent) => criarMarcador(ent, 'comum'))
            .filter((marker) => marker !== null)}
        </MarkerClusterGroupWrapper>
      )}

      {/* Layer 2: Entidades em Promoção */}
      {!temBusca && camadas.promocao.length > 0 && (
        <MarkerClusterGroupWrapper
          key={`layer-promocao-${currentZoom}`}
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover
          zoomToBoundsOnClick
          maxClusterRadius={50}
        >
          {camadas.promocao
            .map((ent) => criarMarcador(ent, 'promocao'))
            .filter((marker) => marker !== null)}
        </MarkerClusterGroupWrapper>
      )}

      {/* Layer 3: Entidades Premium */}
      {!temBusca && camadas.premium.length > 0 && (
        <MarkerClusterGroupWrapper
          key={`layer-premium-${currentZoom}`}
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover
          zoomToBoundsOnClick
          maxClusterRadius={50}
        >
          {camadas.premium
            .map((ent) => criarMarcador(ent, 'premium'))
            .filter((marker) => marker !== null)}
        </MarkerClusterGroupWrapper>
      )}

      {/* Layer 4: Resultados da Busca */}
      {temBusca && camadas.busca.length > 0 && (
        <MarkerClusterGroupWrapper
          key={`layer-busca-${currentZoom}`}
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover
          zoomToBoundsOnClick
          maxClusterRadius={50}
        >
          {camadas.busca
            .map((produto) => criarMarcador(produto, 'busca', true))
            .filter((marker) => marker !== null)}
        </MarkerClusterGroupWrapper>
      )}

    </>
  )
}

export default function MapaEntidadesClusterizado({
  entidades,
  produtos = [],
  entidadesDestaqueIds = [],
  top3EntityIds = [],
  isLoading = false,
  onEntityHover,
  onEntityClick,
  highlightedEntityId,
}: Props) {
  const { selectedProduct, cartOpen, openProduct, closeProduct, toggleCart } = useUIPanel()
  const [currentZoom, setCurrentZoom] = useState<number>(14)
  const { adicionar } = useCart()

  const temBusca = produtos.length > 0

  // Calcular centro do mapa - usar useRef para manter estabilidade
  const centerRef = useRef<[number, number]>(SOUSA_PB)
  
  const center = useMemo<[number, number]>(() => {
    let newCenter: [number, number] = SOUSA_PB
    
    if (temBusca && produtos.length > 0) {
      const primeiroProduto = produtos[0]
      const loc = primeiroProduto.entidade?.localizacao
      if (loc) {
        const lat = Number(loc.latitude)
        const lng = Number(loc.longitude)
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          newCenter = [lat, lng]
        }
      }
    } else if (!temBusca && entidades.length > 0) {
      const entidadesComLocalizacao = entidades.filter((e) => {
        if (e.status !== 'ATIVA') return false
        const loc = e.localizacao
        if (!loc || loc.latitude === null || loc.longitude === null) return false
        const lat = Number(loc.latitude)
        const lng = Number(loc.longitude)
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      })

      if (entidadesComLocalizacao.length > 0) {
        const somaLat = entidadesComLocalizacao.reduce((sum, e) => sum + Number(e.localizacao.latitude), 0)
        const somaLng = entidadesComLocalizacao.reduce((sum, e) => sum + Number(e.localizacao.longitude), 0)
        const centroLat = somaLat / entidadesComLocalizacao.length
        const centroLng = somaLng / entidadesComLocalizacao.length
        if (!isNaN(centroLat) && !isNaN(centroLng) && centroLat >= -90 && centroLat <= 90 && centroLng >= -180 && centroLng <= 180) {
          newCenter = [centroLat, centroLng]
        }
      }
    }

    // Só atualizar se o centro mudou significativamente (mais de 0.001 graus)
    const [lastLat, lastLng] = centerRef.current
    const [newLat, newLng] = newCenter
    const latDiff = Math.abs(lastLat - newLat)
    const lngDiff = Math.abs(lastLng - newLng)
    
    if (latDiff >= 0.001 || lngDiff >= 0.001) {
      centerRef.current = newCenter
      return newCenter
    }
    
    // Retornar o centro anterior se a mudança for insignificante
    return centerRef.current
  }, [temBusca, produtos, entidades])

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Overlay de carregamento */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
            <p className="text-[#16A34A] font-semibold">Buscando produtos...</p>
          </div>
        </div>
      )}

      <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full z-0">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        <MapZoomListener 
          onZoomChange={(zoom) => {
            setCurrentZoom(zoom)
          }}
        />

        <MapLayers
          entidades={entidades}
          produtos={produtos}
          entidadesDestaqueIds={entidadesDestaqueIds}
          top3EntityIds={top3EntityIds}
          onEntityHover={onEntityHover}
          onEntityClick={onEntityClick}
          highlightedEntityId={highlightedEntityId}
          currentZoom={currentZoom}
          produtoSelecionado={selectedProduct}
          setProdutoSelecionado={openProduct}
        />
      </MapContainer>

      {/* Painéis laterais - REGRA: Lista tem prioridade sobre produto */}
      {/* Desktop: mostrar painéis aqui. Mobile: usar drawer lateral */}
      <div className="hidden lg:block">
        {cartOpen ? (
          <CarrinhoPanel
            onClose={toggleCart}
          />
        ) : selectedProduct ? (
          <ProdutoPanel
            produto={selectedProduct}
            carrinhoAberto={false}
            onClose={closeProduct}
            onAbrirCarrinho={toggleCart}
          />
        ) : null}
      </div>

      {/* Botão flutuante de lista */}
      <CartButton onClick={toggleCart} isOpen={cartOpen} />
    </div>
  )
}
