'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface Props {
  center: [number, number]
}

export function RecenterMap({ center }: Props) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom(), {
      animate: true,
    })
  }, [center, map])

  return null
}
