
import L from 'leaflet'

interface CreateEntityDivIconProps {
  imageUrl: string
  label?: string
  nomeEntidade?: string
  preco?: number
  highlight?: boolean
  entidadeId?: string
}

export function createEntityDivIcon({
  imageUrl,
  label,
  nomeEntidade,
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
          ${highlight ? 'border-green-500 border-4 shadow-xl ring-2 ring-green-500 ring-offset-2' : 'border-white'}
          shadow-lg bg-white transition-all duration-300
        ">
          <img src="${imageUrl}" class="w-full h-full object-cover" />
        </div>

        <!-- NOME DA ENTIDADE -->
        ${
          nomeEntidade
            ? `<div class="mt-1 max-w-[100px] text-center">
                <span class="text-xs font-semibold text-gray-800 bg-white px-2 py-0.5 rounded shadow whitespace-nowrap overflow-hidden text-ellipsis block">
                  ${nomeEntidade}
                </span>
              </div>`
            : ''
        }

        <!-- PREÇO -->
        ${
          preco
            ? `<div class="mt-1 ${
                highlight 
                  ? 'bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-lg shadow-xl border-2 border-white animate-pulse' 
                  : 'bg-white text-xs font-semibold px-2 py-0.5 rounded shadow'
              }">
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
    iconSize: [50, nomeEntidade ? 90 : 70],
    iconAnchor: [25, nomeEntidade ? 70 : 50],
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
