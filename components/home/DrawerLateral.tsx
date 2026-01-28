'use client'

import { X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { ListaEntidadesProdutosLateral } from './ListaEntidadesProdutosLateral'

interface DrawerLateralProps {
  entidades?: any[]
  produtos?: any[]
  resultadosBusca?: any[]
  busca?: string
  cidadeId?: string
  highlightedEntityId?: string | null
  onEntityHover?: (entityId: string | null) => void
  onEntityClick?: (entityId: string) => void
  onSalvarEstadoBusca?: () => void
}

export function DrawerLateral({
  entidades = [],
  produtos = [],
  resultadosBusca = [],
  busca = '',
  cidadeId,
  highlightedEntityId,
  onEntityHover,
  onEntityClick,
  onSalvarEstadoBusca,
}: DrawerLateralProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Fechar drawer ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  return (
    <>
      {/* Botão para abrir drawer */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[997] lg:hidden bg-[#16A34A] hover:bg-[#15803D] text-white rounded-full shadow-lg h-14 w-14"
        size="icon"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[999] lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header do Drawer */}
        <div className="flex items-center justify-between p-4 border-b bg-[#16A34A] text-white">
          <h3 className="text-lg font-semibold">Lojas e Produtos</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-[#15803D]"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Conteúdo do Drawer */}
        <div className="h-[calc(100%-64px)] overflow-hidden">
          <ListaEntidadesProdutosLateral
            entidades={entidades}
            produtos={produtos}
            resultadosBusca={resultadosBusca}
            busca={busca}
            cidadeId={cidadeId}
            highlightedEntityId={highlightedEntityId}
            onEntityHover={onEntityHover}
            onEntityClick={(id) => {
              setIsOpen(false)
              onEntityClick?.(id)
            }}
            onSalvarEstadoBusca={onSalvarEstadoBusca}
          />
        </div>
      </div>
    </>
  )
}
