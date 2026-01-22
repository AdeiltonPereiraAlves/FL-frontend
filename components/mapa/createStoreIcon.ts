import L from 'leaflet'

export function createStoreIcon(imageUrl?: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:4px;
      ">
        <div style="
          width:48px;
          height:48px;
          border-radius:50%;
          overflow:hidden;
          border:2px solid #22c55e;
          background:white;
        ">
          <img
            src="${imageUrl || '/default-store.png'}"
            style="width:100%;height:100%;object-fit:cover;"
          />
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  })
}
