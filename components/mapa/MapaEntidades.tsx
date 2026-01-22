

// 'use client'

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import { useMemo } from 'react'
// import { useRouter } from 'next/navigation'
// import { RecenterMap } from './RecenterMap'
// import { markerIcon } from './leafletIcon'
// import { createEntityIcon } from './createEntityIcon'
// import { createEntityDivIcon } from './createEntityDivIcon'
// interface Props {
//     produtos: any[]
// }

// const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

// export default function MapaEntidades({ produtos }: Props) {
//     const router = useRouter()

//     const produtosComLocalizacao = produtos.filter(
//         (p) => p.entidade?.localizacao?.latitude && p.entidade?.localizacao?.longitude
//     )

//     // 📍 centro do mapa
//     const center = useMemo<[number, number]>(() => {
//         if (produtosComLocalizacao.length > 0) {
//             // 🔥 primeiro produto = mais barato (orderBy já garante)
//             const loc = produtosComLocalizacao[0].entidade.localizacao
//             return [loc.latitude, loc.longitude]
//         }

//         return SOUSA_PB
//     }, [produtosComLocalizacao])

//     return (
//         <div className="h-[400px] w-full rounded-xl overflow-hidden border">
//             <MapContainer center={SOUSA_PB} zoom={13} className="h-full w-full">
//                 <TileLayer
//                     attribution="© OpenStreetMap"
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />

//                 {/* 🚀 CONTROLA O MOVIMENTO DO MAPA */}
//                 <RecenterMap center={center} />

                
//             </MapContainer>
//         </div>
//     )
// }


'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { RecenterMap } from './RecenterMap'
import { createEntityDivIcon } from './createEntityDivIcon'

interface Props {
  entidades: any[]
  produtos?: any[] // opcional
  entidadesDestaqueIds: string[]
}

const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

export default function MapaEntidades({ entidades, produtos = [] }: Props) {
  const router = useRouter()

  const temBusca = produtos.length > 0

  // 📍 Centro do mapa
  const center = useMemo<[number, number]>(() => {
    if (temBusca) {
      const loc = produtos[0].entidade.localizacao
      return [Number(loc.latitude), Number(loc.longitude)]
    }

    return SOUSA_PB
  }, [produtos, temBusca])

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border">
      <MapContainer center={SOUSA_PB} zoom={13} className="h-full w-full">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* 🔹 SEM BUSCA → MOSTRA TODAS AS LOJAS */}
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
                  mouseover: (e) => e.target.openPopup(),
                  mouseout: (e) => e.target.closePopup(),
                  click: () => router.push(`/entidade/${entidade.id}`),
                }}
              >
                <Popup closeButton={false} autoClose={false}>
                  <div className="space-y-1 text-center">
                    <strong>{entidade.nome}</strong>
                    <p className="text-sm text-muted-foreground">
                      {entidade.descricao}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}

        {/* 🔹 COM BUSCA → MOSTRA PRODUTOS */}
        {temBusca &&
          produtos.map((produto, index) => {
            const loc = produto.entidade.localizacao
            if (!loc) return null

            return (
              <Marker
                key={produto.id}
                position={[Number(loc.latitude), Number(loc.longitude)]}
                icon={createEntityDivIcon({
                  imageUrl: produto.entidade.fotoPerfilUrl,
                  preco: produto.preco,
                  isCheapest: index === 0,
                })}
                eventHandlers={{
                  mouseover: (e) => e.target.openPopup(),
                  mouseout: (e) => e.target.closePopup(),
                  click: () =>
                    router.push(`/entidade/${produto.entidade.id}`),
                }}
              >
                <Popup closeButton={false} autoClose={false}>
                  <div className="space-y-1 text-center">
                    <strong>{produto.entidade.nome}</strong>
                    <p>{produto.nome}</p>
                    <p className="font-bold text-green-600">
                      R$ {produto.preco.toFixed(2)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>
    </div>
  )
}
