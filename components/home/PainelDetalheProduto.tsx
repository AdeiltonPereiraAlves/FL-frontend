'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProdutoDetalhes from '@/components/produto/ProdutoDetalhe'

interface PainelDetalheProdutoProps {
  produto: any
  onClose: () => void
  showHeader?: boolean // Para controlar se mostra header (no drawer mobile não precisa)
}

export function PainelDetalheProduto({ produto, onClose, showHeader = true }: PainelDetalheProdutoProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header - só mostra se showHeader for true (desktop) */}
      {showHeader && (
        <div className="flex justify-between items-center p-4 border-b bg-[#16A34A] text-white rounded-t-lg flex-shrink-0">
          <h3 className="text-lg font-semibold truncate pr-2">Detalhes do Produto</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-[#15803D] flex-shrink-0"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto">
        <ProdutoDetalhes produto={produto} onClose={onClose} />
      </div>
    </div>
  )
}
