'use client'

import { Store, MapPin, Phone } from 'lucide-react'
import { sanitizeId } from '@/utils/security'

interface PopupEntidadeMapaProps {
  entidade: {
    id: string
    nome: string
    tipo: string
    fotoPerfilUrl?: string
    localizacao?: {
      endereco?: string
      bairro?: string
    }
    cidade?: {
      nome: string
      estado: string
    }
    contato?: {
      telefone?: string
    }
  }
  onVerEntidade: () => void
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

// Componente sem hooks - apenas renderização para evitar problemas com Leaflet
export function PopupEntidadeMapa({ entidade, onVerEntidade }: PopupEntidadeMapaProps) {
  // Calcular valores sem hooks
  const entidadeId = sanitizeId(entidade.id)
  const labelBotao = getLabelBotao(entidade.tipo)
  const temIdValido = !!entidadeId

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Usar window.location diretamente para evitar problemas com hooks durante navegação
    if (entidadeId && typeof window !== 'undefined') {
      // Salvar URL de retorno
      sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
      // Navegar usando window.location para evitar problemas com hooks
      setTimeout(() => {
        window.location.href = `/loja/${entidadeId}`
      }, 100)
    } else {
      // Fallback para o callback original
      requestAnimationFrame(() => {
        setTimeout(() => {
          onVerEntidade()
        }, 0)
      })
    }
  }

  return (
    <div className="min-w-[200px] max-w-[280px]">
      {!temIdValido ? (
        <div className="p-2 text-sm text-red-600">Erro: ID inválido</div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-3">
            {entidade.fotoPerfilUrl && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                <img
                  src={entidade.fotoPerfilUrl}
                  alt={entidade.nome}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                {entidade.nome}
              </h3>
              {entidade.localizacao && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {entidade.localizacao.bairro || entidade.localizacao.endereco || ''}
                    {entidade.cidade && ` - ${entidade.cidade.nome}/${entidade.cidade.estado}`}
                  </span>
                </div>
              )}
              {entidade.contato?.telefone && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{entidade.contato.telefone}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClick}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Store className="h-3.5 w-3.5" />
            {labelBotao}
          </button>
        </>
      )}
    </div>
  )
}
