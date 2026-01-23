

// 'use client'

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import { useMemo } from 'react'
// import { useRouter } from 'next/navigation'
// import { RecenterMap } from './RecenterMap'
// import { createEntityDivIcon } from './createEntityDivIcon'
// import Image from 'next/image'
// interface Props {
//   entidades: any[]
//   produtos?: any[]
//   entidadesDestaqueIds: any
// }

// const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

// export default function MapaEntidades({
//   entidades,
//   produtos = [],
// }: Props) {
//   const router = useRouter()

//   const temBusca = produtos.length > 0

//   /**
//    * 🔥 Produtos válidos (com localização + preço)
//    * Já vêm ordenados do backend pelo menor preço
//    */
//   const produtosValidos = useMemo(() => {
//     return produtos.filter(
//       (p) =>
//         p.precoFinal !== null &&
//         p.entidade?.localizacao?.latitude &&
//         p.entidade?.localizacao?.longitude
//     )
//   }, [produtos])

//   /**
//    * 📍 Centro do mapa
//    * - Busca → produto mais barato
//    * - Sem busca → cidade padrão
//    */
//   const center = useMemo<[number, number]>(() => {
//     if (temBusca && produtosValidos.length > 0) {
//       const loc = produtosValidos[0].entidade.localizacao
//       return [Number(loc.latitude), Number(loc.longitude)]
//     }

//     return SOUSA_PB
//   }, [temBusca, produtosValidos])

//   return (
//     <div className="h-[500px] w-full rounded-xl overflow-hidden border">
//       <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full">
//         <TileLayer
//           attribution="© OpenStreetMap"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         <RecenterMap center={center} />

//         {/* 🔹 SEM BUSCA → MOSTRA TODAS AS ENTIDADES */}
//         {!temBusca &&
//           entidades.map((entidade) => {
//             const loc = entidade.localizacao
//             if (!loc) return null

//             return (
//               <Marker
//                 key={entidade.id}
//                 position={[Number(loc.latitude), Number(loc.longitude)]}
//                 icon={createEntityDivIcon({
//                   imageUrl: entidade.fotoPerfilUrl,
//                   label: entidade.nome,
//                 })}
//                 eventHandlers={{
//                   mouseover: (e) => e.target.openPopup(),
//                   mouseout: (e) => e.target.closePopup(),
//                   click: () => router.push(`/entidade/${entidade.id}`),
//                 }}
//               >
//                 <Popup closeButton={false} autoClose={false}>
//                   <div className="space-y-1 text-center">
//                     <strong>{entidade.nome}</strong>
//                     <p className="text-sm text-muted-foreground">
//                       {entidade.descricao}
//                     </p>
//                   </div>
//                 </Popup>
//               </Marker>
//             )
//           })}

//         {/* 🔹 COM BUSCA → MOSTRA PRODUTOS */}
//         {temBusca &&
//           produtosValidos.map((produto, index) => {
//             const loc = produto.entidade.localizacao

//             return (
//               <Marker
//                 key={produto.id}
//                 position={[Number(loc.latitude), Number(loc.longitude)]}
//                 icon={createEntityDivIcon({
//                   imageUrl: produto.entidade.fotoPerfilUrl,
//                   preco: produto.precoFinal, // ✅ preço correto
//                   isCheapest: index === 0,    // 🔥 destaque garantido
//                 })}
//                 eventHandlers={{
//                   mouseover: (e) => e.target.openPopup(),
//                   mouseout: (e) => e.target.closePopup(),
//                   click: () =>
//                     router.push(`/entidade/${produto.entidade.id}`),
//                 }}
//               >
//                 <Popup closeButton={false} autoClose={false}>
//                   <div className="space-y-1 text-center">
//                     <strong>{produto.entidade.nome}</strong>
//                     <p>{produto.nome}</p>
//                     {produto.fotos?.[0] ? (
//                       <Image
//                         src={produto.fotos[0].url} // caminho da imagem na pasta public
//                         alt="foto produto"
//                         width={30} // largura desejada
//                         height={30} // altura desejada
//                         className="rounded-full object-cover scale-110"

//                       />

//                     ) : (
//                       <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
//                         🛒
//                       </div>
//                     )}


//                     <p className="font-bold text-green-600">
//                       R$ {produto.precoFinal.toFixed(2)}
//                     </p>
//                   </div>
//                 </Popup>
//               </Marker>
//             )
//           })}
//       </MapContainer>
//     </div>
//   )
// }

'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo, useState } from 'react'
import { RecenterMap } from './RecenterMap'
import { createEntityDivIcon } from './createEntityDivIcon'
import ProdutoDetalhes from './../produto/ProdutoDetalhe'
import Carrinho from './../carrinho/Carrinho'
import CartButton from './../carrinho/Cartbutton'
import { PopupProdutoMapa } from './PopupProdutoMapa'

interface Props {
  entidades: any[]
  produtos?: any[]
   entidadesDestaqueIds: any
}

const SOUSA_PB: [number, number] = [-6.759, -38.2316]

export default function MapaEntidades({ entidades, produtos = [] }: Props) {
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)

  const temBusca = produtos.length > 0

  const produtosValidos = useMemo(
    () =>
      produtos.filter(
        (p) =>
          p.precoFinal !== null &&
          p.entidade?.localizacao?.latitude
      ),
    [produtos]
  )

  const center = useMemo<[number, number]>(() => {
    if (temBusca && produtosValidos.length > 0) {
      const loc = produtosValidos[0].entidade.localizacao
      return [loc.latitude, loc.longitude]
    }
    return SOUSA_PB
  }, [temBusca, produtosValidos])

  return (
    <div className="relative w-full h-[500px]">
      <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full z-0">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {!temBusca &&
          entidades.map((ent) => {
            const loc = ent.localizacao
            if (!loc) return null

            return (
              <Marker
                key={ent.id}
                position={[loc.latitude, loc.longitude]}
                icon={createEntityDivIcon({
                  imageUrl: ent.fotoPerfilUrl,
                  label: ent.nome,
                })}
              />
            )
          })}

        {temBusca &&
          produtosValidos.map((produto, index) => {
            const loc = produto.entidade.localizacao

            return (
              <Marker
                key={produto.id}
                position={[loc.latitude, loc.longitude]}
                icon={createEntityDivIcon({
                  imageUrl: produto.entidade.fotoPerfilUrl,
                  preco: produto.precoFinal,
                  isCheapest: index === 0,
                })}
              >
                {/* <Popup closeButton={false}>
                  <div className="space-y-2">
                    <strong>{produto.nome}</strong>

                    <button
                      onClick={() => setProdutoSelecionado(produto)}
                      className="block w-full bg-blue-600 text-white text-sm py-1 rounded"
                    >
                      Ver produto
                    </button>

                    <button
                      onClick={() => setCarrinhoAberto(true)}
                      className="block w-full bg-green-600 text-white text-sm py-1 rounded"
                    >
                      Abrir carrinho
                    </button>


                  </div>

                    <PopupProdutoMapa produto={produto} />
                </Popup> */}
                <Popup closeButton={false}>
                  <PopupProdutoMapa
                    produto={produto}
                    onVerProduto={() => setProdutoSelecionado(produto)}
                  />
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>

      {/* PAINEL (DESKTOP lateral / MOBILE inferior) */}
      {(produtoSelecionado || carrinhoAberto) && (
        <div className="
          fixed z-[998] bg-white shadow-xl
          bottom-0 left-0 w-full h-[60%]
          md:top-0 md:right-0 md:left-auto md:w-[360px] md:h-full
          flex flex-col
        ">
          {produtoSelecionado && (
            <ProdutoDetalhes
              produto={produtoSelecionado}
              onClose={() => setProdutoSelecionado(null)}
            />
          )}

          {carrinhoAberto && (
            <Carrinho onClose={() => setCarrinhoAberto(false)} />
          )}
        </div>
      )}

      <CartButton onClick={() => setCarrinhoAberto(true)} />
    </div>
  )
}
