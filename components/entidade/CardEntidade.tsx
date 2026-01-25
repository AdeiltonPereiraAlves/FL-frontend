'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Store, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CardEntidadeProps {
  entidade: {
    id: string
    nome: string
    descricao?: string
    fotoPerfilUrl?: string
    cidade?: {
      nome: string
      estado: string
    }
    localizacao?: {
      endereco?: string
      bairro?: string
    }
    contato?: {
      telefone?: string
      email?: string
    }
    fazEntrega?: boolean
    valorMinimoEntrega?: number
  }
}

export function CardEntidade({ entidade }: CardEntidadeProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link
        href={`/loja/${entidade.id}`}
        onClick={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
          }
        }}
        className="block"
      >
        {/* Foto e Nome */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <Image
                src={entidade.fotoPerfilUrl || '/placeholder.png'}
                alt={entidade.nome}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-[#16A34A] transition-colors">
                {entidade.nome}
              </h3>
              {entidade.descricao && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {entidade.descricao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="px-4 pb-4 space-y-2">
          {entidade.localizacao && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {entidade.localizacao.endereco || entidade.localizacao.bairro || ''}
                {entidade.cidade && ` - ${entidade.cidade.nome}/${entidade.cidade.estado}`}
              </span>
            </div>
          )}
          {entidade.contato?.telefone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{entidade.contato.telefone}</span>
            </div>
          )}
          {entidade.fazEntrega && entidade.valorMinimoEntrega && (
            <div className="text-xs text-green-600 font-medium">
              Entrega: R$ {Number(entidade.valorMinimoEntrega).toFixed(2)} mínimo
            </div>
          )}
        </div>

        {/* Botão Ver Perfil */}
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.preventDefault()
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                window.location.href = `/loja/${entidade.id}`
              }
            }}
          >
            <Store className="h-3.5 w-3.5 mr-1.5" />
            Ver Perfil
          </Button>
        </div>
      </Link>
    </div>
  )
}
