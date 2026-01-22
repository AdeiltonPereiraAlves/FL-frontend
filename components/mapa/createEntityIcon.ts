// components/mapa/createEntityIcon.ts
import L from 'leaflet'

export function createEntityIcon(imageUrl?: string) {
  return L.icon({
    iconUrl: imageUrl || '/leaflet/marker-icon.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    className: 'rounded-full',
  })
}
