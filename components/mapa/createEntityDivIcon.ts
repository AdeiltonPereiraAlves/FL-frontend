import L from 'leaflet'

interface CreateEntityDivIconProps {
  imageUrl: string
  label?: string
  nomeEntidade?: string
  preco?: number
  highlight?: boolean
  entidadeId?: string
  tipoEntidade?: string
  // Informações de plano
  temLogo?: boolean // Se a entidade tem logo (nível > 0)
  temDestaque?: boolean // Se a entidade tem destaque (PREMIUM ou PREMIUM_MAX)
  zIndex?: number // Z-index baseado no plano
  corBorda?: string // Cor da borda (para diferenciar camadas)
  pulsando?: boolean // Se o marcador deve pulsar (resultado de busca)
  mostrarNome?: boolean // Se deve mostrar o nome da entidade (baseado no zoom)
  zoomLevel?: number // Nível de zoom atual
}

/**
 * Escapa caracteres especiais para prevenir XSS
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return ''
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Valida se o ID é um UUID válido ou string alfanumérica segura
 */
function isValidId(id: string | undefined | null): boolean {
  if (!id) return false
  // UUID v4 ou string alfanumérica com hífens (formato comum de IDs)
  return /^[a-zA-Z0-9-]{1,50}$/.test(id)
}

/**
 * Mapear tipo da entidade para label do botão
 */
function getLabelBotao(tipoEntidade?: string): string {
  if (!tipoEntidade) return 'Ver loja'
  
  const tipo = tipoEntidade.toUpperCase()
  switch (tipo) {
    case 'COMERCIO':
      return 'Ver comércio'
    case 'SERVICO':
      return 'Ver serviço'
    case 'PROFISSIONAL':
      return 'Ver profissional'
    case 'INSTITUICAO':
      return 'Ver instituição'
    default:
      return 'Ver loja'
  }
}

/**
 * Cria um ícone customizado para marcadores do mapa
 * 
 * Melhorias de segurança e performance:
 * - Sanitização de inputs (escape HTML)
 * - Validação de IDs
 * - Uso de data attributes para armazenar IDs de forma segura
 * - Event listeners serão adicionados no componente React para navegação
 */
export function createEntityDivIcon({
  imageUrl,
  label,
  nomeEntidade,
  preco,
  highlight,
  entidadeId,
  tipoEntidade,
  temLogo = false,
  temDestaque = false,
  zIndex = 100,
  corBorda = '#FFFFFF',
  pulsando = false,
  mostrarNome = false,
  zoomLevel = 14,
}: CreateEntityDivIconProps) {
  // Validação e sanitização
  const safeImageUrl = escapeHtml(imageUrl || 'https://via.placeholder.com/50')
  const safeNomeEntidade = escapeHtml(nomeEntidade)
  const safeEntidadeId = isValidId(entidadeId) ? entidadeId : null
  const labelBotao = getLabelBotao(tipoEntidade)
  
  // Formatação segura do preço
  const precoFormatado = preco !== undefined && preco !== null 
    ? preco.toFixed(2).replace('.', ',')
    : ''

  // Classes condicionais
  const borderColor = highlight ? '#22c55e' : corBorda
  const borderWidth = highlight ? '4px' : temDestaque ? '3px' : '2px'
  const animationStyle = pulsando 
    ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' 
    : ''
  
  const precoClasses = highlight
    ? 'bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-lg shadow-xl border-2 border-white animate-pulse'
    : 'bg-white text-xs font-semibold px-2 py-0.5 rounded shadow'

  // Construção do HTML de forma segura
  const html = `
    <div class="entity-marker-wrapper" 
         style="position: relative; display: flex; flex-direction: column; align-items: center;"
         ${safeEntidadeId ? `data-entity-id="${safeEntidadeId}"` : ''}
         ${tipoEntidade ? `data-entity-type="${escapeHtml(tipoEntidade)}"` : ''}>
      
      <!-- LOGO (só aparece se temLogo = true) -->
      ${temLogo
        ? `<div class="${temDestaque ? 'premium-marker' : ''}" style="width: ${temDestaque ? '56px' : '48px'}; height: ${temDestaque ? '56px' : '48px'}; border-radius: 9999px; overflow: hidden; border: ${borderWidth} solid ${borderColor}; ${highlight ? `box-shadow: 0 0 0 2px ${borderColor}, 0 0 10px rgba(34, 197, 94, 0.5);` : temDestaque ? `box-shadow: 0 0 0 2px ${borderColor}, 0 4px 12px rgba(22, 163, 74, 0.4);` : `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);`} ${animationStyle} background: white; transition: all 0.3s; position: relative;">
          <img src="${safeImageUrl}" 
               alt="${safeNomeEntidade || 'Entidade'}" 
               style="width: 100%; height: 100%; object-fit: cover;"
               loading="lazy" />
          ${temDestaque ? '<div class="premium-badge" style="position: absolute; top: -2px; right: -2px; background: #16A34A; color: white; font-size: 10px; font-weight: bold; padding: 2px 4px; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); animation: premiumBadgePulse 1.5s ease-in-out infinite;">⭐</div>' : ''}
        </div>`
        : `<div style="width: 40px; height: 40px; border-radius: 9999px; overflow: hidden; border: ${borderWidth} solid ${borderColor}; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); background: #F3F4F6; display: flex; align-items: center; justify-content: center; transition: all 0.3s; ${animationStyle}">
          <div style="width: 24px; height: 24px; background: ${corBorda === '#FFFFFF' ? '#9CA3AF' : corBorda}; border-radius: 50%;"></div>
        </div>`
      }

      <!-- NOME DA ENTIDADE (mostrar baseado no zoom) -->
      ${safeNomeEntidade && mostrarNome
        ? `<div style="margin-top: 4px; max-width: 120px; text-align: center;">
            <span class="entity-nome-label" 
                  data-entity-id="${safeEntidadeId || ''}"
                  style="font-size: ${zoomLevel >= 16 ? '13px' : '11px'}; font-weight: 600; color: #1f2937; background: white; padding: 3px 10px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; border: 1px solid #e5e7eb; transition: all 0.2s;">
              ${safeNomeEntidade}
            </span>
          </div>`
        : ''
      }

      <!-- PREÇO (clicável para abrir popup) -->
      ${precoFormatado
        ? `<div class="entity-preco-clickable" 
             data-produto-id="${preco ? 'produto-' : ''}"
             style="margin-top: 4px; ${highlight ? 'background: #22c55e; color: white; font-weight: bold; font-size: 14px; padding: 4px 12px; border-radius: 8px; box-shadow: 0 0 0 2px white, 0 4px 10px rgba(34, 197, 94, 0.5);' : 'background: white; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); color: #1f2937;'} cursor: pointer; transition: all 0.2s;"
             onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';"
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='${highlight ? '0 0 0 2px white, 0 4px 10px rgba(34, 197, 94, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)'}';">
            R$ ${precoFormatado}
          </div>`
        : ''
      }

      <!-- BOTÃO (aparece ao clicar no nome) -->
      ${safeEntidadeId
        ? `<button
            type="button"
            class="entity-marker-button"
            data-entity-id="${safeEntidadeId}"
            aria-label="${escapeHtml(labelBotao)}"
            style="position: absolute; top: 100%; margin-top: 4px; background: #15803D; color: #FFFFFF; font-size: 12px; padding: 4px 12px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); white-space: nowrap; z-index: 9999; cursor: pointer; border: none; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; display: none;"
          >
            ${escapeHtml(labelBotao)}
          </button>`
        : ''
      }
    </div>
  `

  // Ajustar tamanho do ícone baseado em se o nome será mostrado
  const nomeSeraMostrado = mostrarNome && safeNomeEntidade
  const iconSize = temDestaque 
    ? [temLogo ? 56 : 48, nomeSeraMostrado ? 120 : (safeNomeEntidade ? 100 : 80)] as [number, number]
    : [temLogo ? 48 : 40, nomeSeraMostrado ? 110 : (safeNomeEntidade ? 90 : 70)] as [number, number]
  
  const iconAnchor = temDestaque
    ? [temLogo ? 28 : 24, nomeSeraMostrado ? 100 : (safeNomeEntidade ? 80 : 60)] as [number, number]
    : [temLogo ? 24 : 20, nomeSeraMostrado ? 90 : (safeNomeEntidade ? 70 : 50)] as [number, number]

  return L.divIcon({
    className: 'entity-marker',
    html,
    iconSize,
    iconAnchor,
    // Z-index baseado no plano (maior = aparece por cima)
    zIndexOffset: zIndex,
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
