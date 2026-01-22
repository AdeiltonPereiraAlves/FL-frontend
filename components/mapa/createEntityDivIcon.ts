import L from 'leaflet'

interface EntityIconOptions {
  imageUrl?: string | null
  preco?: number
  label?: string
  isCheapest?: boolean
}

export function createEntityDivIcon({
  imageUrl,
  preco,
  label,
  isCheapest = false,
}: EntityIconOptions) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 3px solid ${isCheapest ? '#22c55e' : '#e5e7eb'};
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      ">
        <img
          src="${imageUrl || '/default-store.png'}"
          style="width: 100%; height: 100%; object-fit: cover;"
        />
      </div>

      ${
        preco !== undefined
          ? `
        <div style="
          background: ${isCheapest ? '#22c55e' : '#111'};
          color: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          margin-top: 4px;
        ">
          R$ ${preco.toFixed(2)}
        </div>
      `
          : label
          ? `
        <div style="
          background: #11111100;
          color: blue;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          margin-top: 4px;
        ">
          ${label}
        </div>
      `
          : ''
      }
    `,
    iconSize: [56, preco !== undefined || label ? 78 : 56],
    iconAnchor: [28, preco !== undefined || label ? 78 : 56],
  })
}
