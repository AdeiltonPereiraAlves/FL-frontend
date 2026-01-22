import { useEffect, useState } from 'react'

export function useUserLocation() {
  const [location, setLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude])
      },
      () => {
        // fallback (ex: centro da cidade)
        setLocation([-6.89, -38.56])
      }
    )
  }, [])

  return location
}
