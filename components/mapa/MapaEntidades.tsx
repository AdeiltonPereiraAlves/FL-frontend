// 'use client'

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'
// import { useMemo } from 'react'
// import { useRouter } from 'next/navigation'

// // 🔧 Correção do ícone padrão do Leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl:
//     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl:
//     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// })

// interface MapaEntidadesProps {
//   produtos: any[]
// }

// export default function MapaEntidades({ produtos }: MapaEntidadesProps) {
//   const router = useRouter()

//   // 🔐 Filtra SOMENTE produtos com localização válida
//   const produtosComLocalizacao = useMemo(
//     () =>
//       produtos.filter(
//         (p) =>
//           p.entidade?.localizacao?.latitude !== undefined &&
//           p.entidade?.localizacao?.longitude !== undefined
//       ),
//     [produtos]
//   )

//   // 📍 Centro do mapa (primeira entidade)
//   const center = useMemo<[number, number]>(() => {
//     if (produtosComLocalizacao.length > 0) {
//       const loc = produtosComLocalizacao[0].entidade.localizacao
//       return [loc.latitude, loc.longitude]
//     }

//     // fallback: centro de Marizópolis
//     return [-6.8275, -38.3483]
//   }, [produtosComLocalizacao])

//   return (
//     <MapContainer
//       center={center}
//       zoom={14}
//       style={{ height: '400px', width: '100%' }}
//       className="rounded-xl z-0"
//     >
//       <TileLayer
//         attribution="© OpenStreetMap"
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {produtosComLocalizacao.map((produto) => {
//         const loc = produto.entidade.localizacao

//         return (
//           <Marker
//             key={produto.id}
//             position={[loc.latitude, loc.longitude]}
//             eventHandlers={{
//               click: () => router.push(`/entidade/${produto.entidade.id}`),
//             }}
//           >
//             <Popup>
//               <div className="space-y-1">
//                 <strong className="block">
//                   {produto.entidade.nome}
//                 </strong>
//                 <p>{produto.nome}</p>
//                 <p className="font-bold text-green-600">
//                   R$ {produto.preco.toFixed(2)}
//                 </p>
//               </div>
//             </Popup>
//           </Marker>
//         )
//       })}
//     </MapContainer>
//   )
// }


'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { RecenterMap } from './RecenterMap'
import { markerIcon } from './leafletIcon'
import { createEntityIcon } from './createEntityIcon'
import { createEntityDivIcon } from './createEntityDivIcon'
interface Props {
    produtos: any[]
}

const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

export default function MapaEntidades({ produtos }: Props) {
    const router = useRouter()

    const produtosComLocalizacao = produtos.filter(
        (p) => p.entidade?.localizacao?.latitude && p.entidade?.localizacao?.longitude
    )

    // 📍 centro do mapa
    const center = useMemo<[number, number]>(() => {
        if (produtosComLocalizacao.length > 0) {
            // 🔥 primeiro produto = mais barato (orderBy já garante)
            const loc = produtosComLocalizacao[0].entidade.localizacao
            return [loc.latitude, loc.longitude]
        }

        return SOUSA_PB
    }, [produtosComLocalizacao])

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border">
            <MapContainer center={SOUSA_PB} zoom={13} className="h-full w-full">
                <TileLayer
                    attribution="© OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 🚀 CONTROLA O MOVIMENTO DO MAPA */}
                <RecenterMap center={center} />

                {produtosComLocalizacao.map((produto) => {
                    const loc = produto.entidade.localizacao

                    return (
                        <Marker
                            key={produto.id}
                            position={[loc.latitude, loc.longitude]}
                            icon={createEntityDivIcon(
                                produto.entidade.fotoPerfilUrl,
                                produto.preco,
                                produto.index === 0 // mais barato
                            )}
                            eventHandlers={{
                                mouseover: (e) => e.target.openPopup(),
                                mouseout: (e) => e.target.closePopup(),
                                click: () => router.push(`/entidade/${produto.entidade.id}`),
                            }}
                        >
                            <Popup closeButton={false} autoClose={false}>
                                <div className="space-y-1">
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
