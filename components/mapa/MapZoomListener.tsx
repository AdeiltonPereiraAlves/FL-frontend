'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapZoomListenerProps {
  onZoomChange: (zoom: number) => void
}

export function MapZoomListener({ onZoomChange }: MapZoomListenerProps) {
  const map = useMap()

  useEffect(() => {
    const handleZoomEnd = () => {
      const currentZoom = map.getZoom()
      onZoomChange(currentZoom)
    }

    // Obter zoom inicial
    onZoomChange(map.getZoom())

    // Escutar mudanças de zoom
    map.on('zoomend', handleZoomEnd)
    map.on('zoom', handleZoomEnd)

    return () => {
      map.off('zoomend', handleZoomEnd)
      map.off('zoom', handleZoomEnd)
    }
  }, [map, onZoomChange])

  return null
}
