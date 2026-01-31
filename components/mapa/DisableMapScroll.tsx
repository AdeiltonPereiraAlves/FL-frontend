'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface DisableMapScrollProps {
  disabled: boolean
}

export function DisableMapScroll({ disabled }: DisableMapScrollProps) {
  const map = useMap()

  useEffect(() => {
    if (disabled) {
      // Desabilitar zoom com scroll
      map.scrollWheelZoom.disable()
      // Desabilitar zoom com double click
      map.doubleClickZoom.disable()
    } else {
      // Reabilitar zoom com scroll
      map.scrollWheelZoom.enable()
      // Reabilitar zoom com double click
      map.doubleClickZoom.enable()
    }

    return () => {
      // Garantir que o zoom seja reabilitado ao desmontar
      map.scrollWheelZoom.enable()
      map.doubleClickZoom.enable()
    }
  }, [disabled, map])

  return null
}
