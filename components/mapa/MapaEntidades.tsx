

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
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RecenterMap } from './RecenterMap'
import { createEntityDivIcon } from './createEntityDivIcon'

interface Props {
  entidades: any[]
  produtos?: any[]
  entidadesDestaqueIds: any
}

const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

export default function MapaEntidades({
  entidades,
  produtos = [],
}: Props) {
  const router = useRouter()

  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null)
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [mostrarCarrinho, setMostrarCarrinho] = useState(true)

  const temBusca = produtos.length > 0

  const produtosValidos = useMemo(() => {
    return produtos.filter(
      (p) =>
        p.precoFinal !== null &&
        p.entidade?.localizacao?.latitude &&
        p.entidade?.localizacao?.longitude
    )
  }, [produtos])

  const center = useMemo<[number, number]>(() => {
    if (temBusca && produtosValidos.length > 0) {
      const loc = produtosValidos[0].entidade.localizacao
      return [Number(loc.latitude), Number(loc.longitude)]
    }
    return SOUSA_PB
  }, [temBusca, produtosValidos])

  function adicionarAoCarrinho(produto: any) {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id)
      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
        )
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
    setMostrarCarrinho(true)
  }

  function alterarQuantidade(id: string, delta: number) {
    setCarrinho((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantidade: p.quantidade + delta } : p
        )
        .filter((p) => p.quantidade > 0)
    )
  }

  const totalCarrinho = carrinho.reduce(
    (acc, item) => acc + item.precoFinal * item.quantidade,
    0
  )

  return (
    <div className="relative h-[500px] w-full rounded-xl overflow-hidden border">
      <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full z-0">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* 🔹 SEM BUSCA */}
        {!temBusca &&
          entidades.map((entidade) => {
            const loc = entidade.localizacao
            if (!loc) return null

            return (
              <Marker
                key={entidade.id}
                position={[Number(loc.latitude), Number(loc.longitude)]}
                icon={createEntityDivIcon({
                  imageUrl: entidade.fotoPerfilUrl,
                  label: entidade.nome,
                })}
                eventHandlers={{
                  click: () => router.push(`/entidade/${entidade.id}`),
                }}
              />
            )
          })}

        {/* 🔹 COM BUSCA */}
        {temBusca &&
          produtosValidos.map((produto, index) => {
            const loc = produto.entidade.localizacao

            return (
              <Marker
                key={produto.id}
                position={[Number(loc.latitude), Number(loc.longitude)]}
                icon={createEntityDivIcon({
                  imageUrl: produto.entidade.fotoPerfilUrl,
                  preco: produto.precoFinal,
                  label: produto.nome,
                  isCheapest: index === 0,
                })}
              >
                <Popup closeButton={false}>
                  <div className="space-y-2 text-center">
                    <strong>{produto.nome}</strong>
                    <p>{produto.descricao}</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setProdutoSelecionado(produto)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                      >
                        Ver produto
                      </button>

                      <button
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                      >
                        + Carrinho
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>

      {/* =========================
          🪟 PAINEL LATERAL / MOBILE
      ========================== */}
      {(produtoSelecionado || carrinho.length > 0) && (
        <div
          className="
            fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg
            lg:top-[calc(50%-275px)]
            lg:right-4 lg:left-auto lg:bottom-auto
            lg:w-[380px] lg:h-[550px]
            lg:rounded-xl lg:border
            flex flex-col
          "
        >
          {/* 🧾 PRODUTO */}
          {produtoSelecionado && (
            <div className="p-4 border-b overflow-auto max-h-[45%]">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{produtoSelecionado.nome}</h3>
                <button
                  onClick={() => setProdutoSelecionado(null)}
                  className="text-sm text-red-500"
                >
                  Fechar
                </button>
              </div>

              {produtoSelecionado.fotos?.[0] && (
                <Image
                  src={produtoSelecionado.fotos[0].url}
                  alt=""
                  width={50}
                  height={50}
                  className="rounded my-2"
                />
              )}

              <p className="text-sm">{produtoSelecionado.descricao}</p>

              {produtoSelecionado.peso && (
                <p className="text-sm">Peso: {produtoSelecionado.peso}</p>
              )}

              {produtoSelecionado.validade && (
                <p className="text-sm">
                  Validade:{' '}
                  {new Date(produtoSelecionado.validade).toLocaleDateString()}
                </p>
              )}

              <p className="font-bold text-green-600">
                R$ {produtoSelecionado.precoFinal.toFixed(2)}
              </p>

              <button
                onClick={() => adicionarAoCarrinho(produtoSelecionado)}
                className="mt-2 w-full bg-green-600 text-white py-2 rounded"
              >
                Adicionar ao carrinho
              </button>
            </div>
          )}

          {/* 🛒 CARRINHO */}
          {mostrarCarrinho && carrinho.length > 0 && (
            <div className="p-4 flex-1 overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Carrinho</h4>
                <button
                  onClick={() => setMostrarCarrinho(false)}
                  className="text-sm text-red-500"
                >
                  Fechar
                </button>
              </div>

              {carrinho.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{item.nome}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alterarQuantidade(item.id, -1)}
                      className="px-2 bg-muted rounded"
                    >
                      –
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(item.id, 1)}
                      className="px-2 bg-muted rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <p className="font-bold mt-2">
                Total: R$ {totalCarrinho.toFixed(2)}
              </p>

              <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded">
                Salvar carrinho
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
