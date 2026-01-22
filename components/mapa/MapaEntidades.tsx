

'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { RecenterMap } from './RecenterMap'
import { createEntityDivIcon } from './createEntityDivIcon'

interface Props {
  entidades: any[]
  produtos?: any[]
  entidadesDestaqueIds:any
}

const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

export default function MapaEntidades({
  entidades,
  produtos = [],
}: Props) {
  const router = useRouter()

  const temBusca = produtos.length > 0

  /**
   * 🔥 Produtos válidos (com localização + preço)
   * Já vêm ordenados do backend pelo menor preço
   */
  const produtosValidos = useMemo(() => {
    return produtos.filter(
      (p) =>
        p.precoFinal !== null &&
        p.entidade?.localizacao?.latitude &&
        p.entidade?.localizacao?.longitude
    )
  }, [produtos])

  /**
   * 📍 Centro do mapa
   * - Busca → produto mais barato
   * - Sem busca → cidade padrão
   */
  const center = useMemo<[number, number]>(() => {
    if (temBusca && produtosValidos.length > 0) {
      const loc = produtosValidos[0].entidade.localizacao
      return [Number(loc.latitude), Number(loc.longitude)]
    }

    return SOUSA_PB
  }, [temBusca, produtosValidos])

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border">
      <MapContainer center={SOUSA_PB} zoom={14} className="h-full w-full">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center}  />

        {/* 🔹 SEM BUSCA → MOSTRA TODAS AS ENTIDADES */}
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
          produtosValidos.map((produto, index) => {
            const loc = produto.entidade.localizacao

            return (
              <Marker
                key={produto.id}
                position={[Number(loc.latitude), Number(loc.longitude)]}
                icon={createEntityDivIcon({
                  imageUrl: produto.entidade.fotoPerfilUrl,
                  preco: produto.precoFinal, // ✅ preço correto
                  isCheapest: index === 0,    // 🔥 destaque garantido
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
                      R$ {produto.precoFinal.toFixed(2)}
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

