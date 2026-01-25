

// 'use client'

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import { useMemo, useState } from 'react'
// import { RecenterMap } from './RecenterMap'
// import { createEntityDivIcon } from './createEntityDivIcon'
// import ProdutoDetalhes from './../produto/ProdutoDetalhe'
// import Carrinho from './../carrinho/Carrinho'
// import CartButton from './../carrinho/Cartbutton'
// import { PopupProdutoMapa } from './PopupProdutoMapa'

// interface Props {
//   entidades: any[]
//   produtos?: any[]
//    entidadesDestaqueIds: any
// }

// const SOUSA_PB: [number, number] = [-6.759, -38.2316]

// export default function MapaEntidades({ entidades, produtos = [] }: Props) {
//   const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
//   const [carrinhoAberto, setCarrinhoAberto] = useState(false)

//   const temBusca = produtos.length > 0

//   const produtosValidos = useMemo(
//     () =>
//       produtos.filter(
//         (p) =>
//           p.precoFinal !== null &&
//           p.entidade?.localizacao?.latitude
//       ),
//     [produtos]
//   )

//   const center = useMemo<[number, number]>(() => {
//     if (temBusca && produtosValidos.length > 0) {
//       const loc = produtosValidos[0].entidade.localizacao
//       return [loc.latitude, loc.longitude]
//     }
//     return SOUSA_PB
//   }, [temBusca, produtosValidos])

//   return (
//     <div className="relative w-full h-[500px]">
//       <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full z-0">
//         <TileLayer
//           attribution="© OpenStreetMap"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         <RecenterMap center={center} />

//         {!temBusca &&
//           entidades.map((ent) => {
//             const loc = ent.localizacao
//             if (!loc) return null

//             return (
//               <Marker
//                 key={ent.id}
//                 position={[loc.latitude, loc.longitude]}
//                 icon={createEntityDivIcon({
//                   imageUrl: ent.fotoPerfilUrl,
//                   label: ent.nome,
//                 })}
//               />
//             )
//           })}

//         {temBusca &&
//           produtosValidos.map((produto, index) => {
//             const loc = produto.entidade.localizacao

//             return (
//               <Marker
//                 key={produto.id}
//                 position={[loc.latitude, loc.longitude]}
//                 icon={createEntityDivIcon({
//                   imageUrl: produto.entidade.fotoPerfilUrl,
//                   preco: produto.precoFinal,
//                   isCheapest: index === 0,
//                 })}
//               >
//                 {/* <Popup closeButton={false}>
//                   <div className="space-y-2">
//                     <strong>{produto.nome}</strong>

//                     <button
//                       onClick={() => setProdutoSelecionado(produto)}
//                       className="block w-full bg-blue-600 text-white text-sm py-1 rounded"
//                     >
//                       Ver produto
//                     </button>

//                     <button
//                       onClick={() => setCarrinhoAberto(true)}
//                       className="block w-full bg-green-600 text-white text-sm py-1 rounded"
//                     >
//                       Abrir carrinho
//                     </button>


//                   </div>

//                     <PopupProdutoMapa produto={produto} />
//                 </Popup> */}
//                 <Popup closeButton={false}>
//                   <PopupProdutoMapa
//                     produto={produto}
//                     onVerProduto={() => setProdutoSelecionado(produto)}
//                   />
//                 </Popup>
//               </Marker>
//             )
//           })}
//       </MapContainer>

//       {/* PAINEL (DESKTOP lateral / MOBILE inferior) */}
//       {(produtoSelecionado || carrinhoAberto) && (
//         <div className="
//           fixed z-[998] bg-white shadow-xl
//           bottom-0 left-0 w-full h-[60%]
//           md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full
//           flex flex-col
//         ">
//           {produtoSelecionado && (
//             <ProdutoDetalhes
//               produto={produtoSelecionado}
//               onClose={() => setProdutoSelecionado(null)}
//             />
//           )}

//           {carrinhoAberto && (
//             <Carrinho onClose={() => setCarrinhoAberto(false)} />
//           )}
//         </div>
//       )}

//       <CartButton onClick={() => setCarrinhoAberto(true)} />
//     </div>
//   )
// }


'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RecenterMap } from './RecenterMap'
import { createEntityDivIcon } from './createEntityDivIcon'
import ProdutoDetalhes from './../produto/ProdutoDetalhe'
import Carrinho from './../carrinho/Carrinho'
import CartButton from './../carrinho/Cartbutton'
import { Button } from '@/components/ui/button'
import { PopupProdutoMapa } from './PopupProdutoMapa'
import { useCart } from '@/contexts/CartContext'
import { sanitizeId } from '@/utils/security'

interface Props {
  entidades: any[]
  produtos?: any[]
  entidadesDestaqueIds?: string[] // usado caso queira destacar após clique
  isLoading?: boolean // indica se está carregando busca
}

const SOUSA_PB: [number, number] = [-6.759, -38.2316]

export default function MapaEntidades({
  entidades,
  produtos = [],
  entidadesDestaqueIds = [],
  isLoading = false,
}: Props) {
  const router = useRouter()
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [filtroMenorPreco, setFiltroMenorPreco] = useState(false)
  const { adicionar } = useCart()

  // Função para abrir carrinho (mantém produto selecionado em memória)
  const abrirCarrinho = () => {
    // Não limpa produtoSelecionado, apenas mostra carrinho por cima
    setCarrinhoAberto(true)
  }

  // Função para fechar carrinho (restaura produto se existir)
  const fecharCarrinho = () => {
    setCarrinhoAberto(false)
    // produtoSelecionado permanece, então o produto será exibido novamente
  }

  // Função toggle do carrinho (abre/fecha sem afetar produto)
  const toggleCarrinho = () => {
    if (carrinhoAberto) {
      fecharCarrinho()
    } else {
      abrirCarrinho()
    }
  }

  // Função para abrir produto (não fecha carrinho, apenas mostra produto)
  const abrirProduto = (produto: any) => {
    // Não fecha carrinho - permite que ambos existam, mas produto aparece por cima
    setProdutoSelecionado(produto)
  }

  // Função para fechar produto (não afeta carrinho)
  const fecharProduto = () => {
    setProdutoSelecionado(null)
    // carrinhoAberto permanece como está
  }
  const temBusca = produtos.length > 0

  // Filtra produtos com preço válido e localização
  const produtosValidos = useMemo(
    () => {
      const validos = produtos.filter(
        (p) => {
          // Verifica se tem preço (pode ser 0, mas não null/undefined)
          const temPreco = p.precoFinal !== null && p.precoFinal !== undefined && !isNaN(Number(p.precoFinal))
          // Verifica se tem localização válida
          const temLocalizacao = 
            p.entidade?.localizacao?.latitude !== null && 
            p.entidade?.localizacao?.latitude !== undefined &&
            !isNaN(Number(p.entidade.localizacao.latitude)) &&
            p.entidade?.localizacao?.longitude !== null &&
            p.entidade?.localizacao?.longitude !== undefined &&
            !isNaN(Number(p.entidade.localizacao.longitude))
          
          return temPreco && temLocalizacao
        }
      )
      
      return validos
    },
    [produtos]
  )

  // Calcula o menor preço para destacar quando filtro estiver ativo
  const menorPreco = useMemo(() => {
    if (produtosValidos.length === 0) return null
    return produtosValidos.reduce(
      (min, p) => (p.precoFinal! < min ? p.precoFinal! : min),
      Number.MAX_SAFE_INTEGER
    )
  }, [produtosValidos])

  // Filtra apenas menor preço se botão clicado, senão mostra todos
  const produtosExibidos = useMemo(() => {
    if (!filtroMenorPreco) return produtosValidos
    // Se filtro ativo, mostra apenas os com menor preço
    return produtosValidos.filter((p) => p.precoFinal === menorPreco)
  }, [produtosValidos, filtroMenorPreco, menorPreco])

  // Centro do mapa
  const center = useMemo<[number, number]>(() => {
    if (temBusca && produtosExibidos.length > 0) {
      const loc = produtosExibidos[0].entidade.localizacao
      return [loc.latitude, loc.longitude]
    }
    return SOUSA_PB
  }, [temBusca, produtosExibidos])

  // Event delegation para navegação e interações dos marcadores
  useEffect(() => {
    // Clique no botão "Ver entidade"
    const handleMarkerButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('.entity-marker-button') as HTMLElement | null
      
      if (!button) return
      
      const entityId = button.getAttribute('data-entity-id')
      if (!entityId) return
      
      // Validação de segurança do ID
      const sanitizedId = sanitizeId(entityId)
      if (!sanitizedId) {
        console.warn('ID de entidade inválido:', entityId)
        return
      }
      
      // Previne comportamento padrão
      e.preventDefault()
      e.stopPropagation()
      
      // Salva a página atual antes de navegar
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
      }
      
      // Navegação segura usando Next.js router
      router.push(`/loja/${sanitizedId}`)
    }

    // Clique no nome da entidade para mostrar/esconder botão
    const handleNomeClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const nomeClickable = target.closest('.entity-nome-clickable') as HTMLElement | null
      
      if (!nomeClickable) return
      
      e.preventDefault()
      e.stopPropagation()
      
      const entityId = nomeClickable.getAttribute('data-entity-id')
      if (!entityId) return
      
      // Encontra o wrapper e o botão
      const wrapper = nomeClickable.closest('.entity-marker-wrapper') as HTMLElement | null
      if (!wrapper) return
      
      const button = wrapper.querySelector('.entity-marker-button') as HTMLElement | null
      if (!button) return
      
      // Toggle do botão
      const isVisible = button.style.display === 'block'
      if (isVisible) {
        button.style.display = 'none'
        button.style.opacity = '0'
        button.style.pointerEvents = 'none'
      } else {
        button.style.display = 'block'
        button.style.opacity = '1'
        button.style.pointerEvents = 'auto'
      }
    }

    // Clique no preço para abrir popup (se for produto)
    const handlePrecoClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const precoClickable = target.closest('.entity-preco-clickable') as HTMLElement | null
      
      if (!precoClickable) return
      
      e.preventDefault()
      e.stopPropagation()
      
      // Encontra o marcador Leaflet mais próximo e abre o popup
      const wrapper = precoClickable.closest('.entity-marker-wrapper') as HTMLElement | null
      if (!wrapper) return
      
      // O Leaflet gerencia o popup automaticamente ao clicar no marcador
      // Mas precisamos garantir que o clique no preço também abra
      const markerElement = wrapper.closest('.leaflet-marker-icon') as HTMLElement | null
      if (markerElement) {
        // Dispara um evento de clique no marcador para abrir o popup
        markerElement.click()
      }
    }

    // Event delegation no document
    document.addEventListener('click', handleMarkerButtonClick)
    document.addEventListener('click', handleNomeClick, true)
    document.addEventListener('click', handlePrecoClick, true)
    
    return () => {
      document.removeEventListener('click', handleMarkerButtonClick)
      document.removeEventListener('click', handleNomeClick, true)
      document.removeEventListener('click', handlePrecoClick, true)
    }
  }, [router])

  return (
    <div className="relative w-full h-[500px]">
      {/* Overlay de carregamento */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
            <p className="text-[#16A34A] font-semibold">Buscando produtos...</p>
          </div>
        </div>
      )}
      {/* Botão de filtro menor preço - sempre visível quando há busca, mas escondido quando painéis estão abertos */}
      {temBusca && !carrinhoAberto && !produtoSelecionado && (
        <div className="absolute z-[999] top-2 right-2 flex gap-2">
          <Button
            size="sm"
            variant={!filtroMenorPreco ? 'default' : 'outline'}
            onClick={() => setFiltroMenorPreco(false)}
            className={!filtroMenorPreco 
              ? 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-md font-semibold' 
              : 'bg-white hover:bg-gray-100 text-black hover:text-black border-gray-300 shadow-md'}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filtroMenorPreco ? 'default' : 'outline'}
            onClick={() => setFiltroMenorPreco(true)}
            className={filtroMenorPreco 
              ? 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-md font-semibold' 
              : 'bg-white hover:bg-gray-100 text-black hover:text-black border-gray-300 shadow-md'}
          >
            Menor preço
          </Button>
        </div>
      )}

      <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full z-0">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* 1️⃣ Mostrar todas as entidades quando não há busca */}
        {!temBusca &&
          entidades.map((ent) => {
            const loc = ent.localizacao
            if (!loc) return null
            return (
              <Marker
                key={ent.id}
                position={[loc.latitude, loc.longitude]}
                icon={createEntityDivIcon({
                  imageUrl: ent.fotoPerfilUrl || 'https://via.placeholder.com/50',
                  nomeEntidade: ent.nome,
                  entidadeId: ent.id,
                  tipoEntidade: ent.tipo,
                })}
              />
            )
          })}

        {/* 2️⃣ Mostrar produtos encontrados - TODAS as entidades com o produto */}
        {temBusca && produtosExibidos.length > 0 &&
          produtosExibidos.map((produto) => {
            const loc = produto.entidade?.localizacao
            if (!loc || !loc.latitude || !loc.longitude) {
              console.warn('Produto sem localização válida:', produto.nome, produto.id)
              return null
            }
            
            // Destacar apenas se filtro estiver ativo E for o menor preço
            const deveDestacar = filtroMenorPreco && produto.precoFinal === menorPreco
            
            return (
              <Marker
                key={produto.id}
                position={[loc.latitude, loc.longitude]}
                icon={createEntityDivIcon({
                  imageUrl: produto.entidade?.fotoPerfilUrl || 'https://via.placeholder.com/50',
                  nomeEntidade: produto.entidade?.nome,
                  preco: produto.precoFinal!,
                  highlight: deveDestacar, // Só destaca quando filtro ativo E for menor preço
                  entidadeId: produto.entidade?.id,
                  tipoEntidade: produto.entidade?.tipo,
                })}
                eventHandlers={{
                  click: (e) => {
                    // Abre o popup ao clicar no marcador
                    const marker = e.target
                    marker.openPopup()
                  }
                }}
              >
                <Popup closeButton={true} autoClose={true} closeOnClick={true}>
                  <PopupProdutoMapa 
                    produto={produto} 
                    onVerProduto={() => abrirProduto(produto)}
                    isDestaque={deveDestacar}
                  />
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>

      {/* Painel de produto */}
      {produtoSelecionado && (
        <div
          className="
            fixed z-[998] bg-white shadow-xl
            bottom-0 left-0 w-full h-[60%]
            md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full
            flex flex-col
            animate-in slide-in-from-bottom md:slide-in-from-right
          "
        >
          <ProdutoDetalhes
            produto={produtoSelecionado}
            onClose={fecharProduto}
            onAbrirCarrinho={abrirCarrinho}
          />
        </div>
      )}

      {/* Painel de carrinho */}
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
            onAbrirProduto={abrirProduto}
          />
        </div>
      )}

      {/* Botão flutuante de abrir/fechar carrinho (toggle) */}
      <CartButton onClick={toggleCarrinho} isOpen={carrinhoAberto} />
    </div>
  )
}
