
import L from 'leaflet'

interface CreateEntityDivIconProps {
  imageUrl: string
  label?: string
  preco?: number
  highlight?: boolean
  entidadeId?: string
}

export function createEntityDivIcon({
  imageUrl,
  label,
  preco,
  highlight,
  entidadeId,
}: CreateEntityDivIconProps) {
  return L.divIcon({
    className: 'entity-marker',
    html: `
      <div class="relative group flex flex-col items-center">
        
        <!-- LOGO -->
        <div class="
          w-12 h-12 rounded-full overflow-hidden border-2
          ${highlight ? 'border-green-500' : 'border-white'}
          shadow-lg bg-white
        ">
          <img src="${imageUrl}" class="w-full h-full object-cover" />
        </div>

        <!-- PREÇO -->
        ${
          preco
            ? `<div class="mt-1 bg-white text-xs font-semibold px-2 py-0.5 rounded shadow">
                R$ ${preco.toFixed(2)}
              </div>`
            : ''
        }

        <!-- BOTÃO HOVER -->
        <a
          href="/loja/${entidadeId}"
          class="
            absolute top-full mt-1
            opacity-0 group-hover:opacity-100
            transition-opacity
            bg-[#E9571C] text-[#FFFFFF] text-xs
            px-3 py-1 rounded shadow-lg
            whitespace-nowrap
           
            z-50
          "
        >
          Ver loja
        </a>
      </div>
    `,
    iconSize: [50, 70],
    iconAnchor: [25, 50],
  })
}

// import L from 'leaflet'

// interface CreateEntityDivIconProps {
//   imageUrl: string
//   preco?: number
//   label?: any
//   highlight?: boolean
//   entidadeId: string
// }

// export function createEntityDivIcon({
//   imageUrl,
//   preco,
//   highlight,
//   entidadeId,
// }: CreateEntityDivIconProps) {
//   return L.divIcon({
//     className: 'entity-marker',
//     html: `
//       <div class="marker-wrapper">
//         <div class="marker-logo ${highlight ? 'marker-highlight' : ''}">
//           <img src="${imageUrl}" />
//         </div>
//         <div>
         
//         ${
//           preco
//             ? `<div class="marker-price">R$ ${preco.toFixed(2)}</div>`
//             : ''
//         }

//         <a class="marker-link" href="/loja/${entidadeId}">
//           Ver loja
//         </a>
//       </div>
//     `,
//     iconSize: [56, 72],
//     iconAnchor: [28, 56],
//   })
// }
