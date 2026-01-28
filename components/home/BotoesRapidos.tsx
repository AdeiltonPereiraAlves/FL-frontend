'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface BotaoRapido {
  label: string
  query: string
  icon?: string
}

const PRODUTOS_POPULARES: BotaoRapido[] = [
  { label: 'Arroz', query: 'arroz' },
  { label: 'Leite', query: 'leite' },
  { label: 'Óleo', query: 'óleo' },
  { label: 'Açúcar', query: 'açúcar' },
  { label: 'Feijão', query: 'feijão' },
  { label: 'Macarrão', query: 'macarrão' },
  { label: 'Farinha', query: 'farinha' },
  { label: 'Café', query: 'café' },
]

interface BotoesRapidosProps {
  cidadeId?: string
  onBuscar?: (query: string, cidadeId?: string) => void
}

export function BotoesRapidos({ cidadeId, onBuscar }: BotoesRapidosProps) {
  const router = useRouter()

  const handleClick = (query: string) => {
    if (onBuscar && cidadeId) {
      onBuscar(query, cidadeId)
    } else {
      // Se não houver callback, navegar para produtos com busca
      router.push(`/produtos?busca=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Busca Rápida</h3>
      <div className="flex flex-wrap gap-2">
        {PRODUTOS_POPULARES.map((botao) => (
          <Button
            key={botao.query}
            variant="outline"
            size="sm"
            onClick={() => handleClick(botao.query)}
            className="text-xs sm:text-sm bg-white hover:bg-[#16A34A] hover:text-white border-gray-300 transition-colors"
          >
            {botao.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
