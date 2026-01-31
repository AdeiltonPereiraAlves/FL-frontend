'use client'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

interface Props {
  center: [number, number]
  skipIfUserInteracted?: boolean
}

export function RecenterMap({ center, skipIfUserInteracted = true }: Props) {
  const map = useMap()
  const lastCenterRef = useRef<[number, number] | null>(null)
  const userInteractedRef = useRef(false)
  const isInitialMountRef = useRef(true)

  useEffect(() => {
    // Detectar interação do usuário (pan, drag, zoom)
    const handleDragStart = () => {
      userInteractedRef.current = true
    }

    const handleZoomStart = () => {
      userInteractedRef.current = true
    }

    map.on('dragstart', handleDragStart)
    map.on('zoomstart', handleZoomStart)

    return () => {
      map.off('dragstart', handleDragStart)
      map.off('zoomstart', handleZoomStart)
    }
  }, [map])

  useEffect(() => {
    // Se o usuário já interagiu e queremos pular, não recentrar
    if (skipIfUserInteracted && userInteractedRef.current && !isInitialMountRef.current) {
      return
    }

    // Verificar se o centro realmente mudou (com tolerância para evitar re-renderizações por arredondamentos)
    if (lastCenterRef.current) {
      const [lastLat, lastLng] = lastCenterRef.current
      const [newLat, newLng] = center
      const latDiff = Math.abs(lastLat - newLat)
      const lngDiff = Math.abs(lastLng - newLng)
      
      // Só recentrar se a mudança for significativa (mais de 0.001 graus, aproximadamente 100m)
      if (latDiff < 0.001 && lngDiff < 0.001) {
        return
      }
    }

    // Atualizar referência do último centro
    lastCenterRef.current = center

    // Recentrar apenas na primeira vez ou quando o centro mudar significativamente
    map.setView(center, map.getZoom(), {
      animate: !isInitialMountRef.current, // Sem animação no primeiro carregamento
    })

    // Marcar que não é mais o primeiro mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
    }
  }, [center, map, skipIfUserInteracted])

  return null
}
