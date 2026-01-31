'use client'

import { Button } from '@/components/ui/button'
import { useViewMode } from '@/contexts/ViewModeContext'

interface ViewModeToggleProps {
  hasSearch: boolean
  compact?: boolean // Para mobile: ajustar tamanho
}

export function ViewModeToggle({ hasSearch, compact = false }: ViewModeToggleProps) {
  const { viewMode, toggleBestPrice, toggleDefault } = useViewMode()

  // Só mostrar se houver busca ativa
  if (!hasSearch) {
    return null
  }

  const baseClasses = compact 
    ? 'flex gap-1.5 px-2 py-2 bg-[#16A34A] border-b border-[#15803D]'
    : 'flex gap-2 px-4 py-3 bg-[#16A34A] border-b border-[#15803D]'

  const buttonSize = compact ? 'sm' : 'sm'
  const textSize = compact ? 'text-xs' : 'text-sm'

  return (
    <div className={baseClasses}>
      <Button
        onClick={toggleBestPrice}
        variant="ghost"
        size={buttonSize}
        className={`flex-1 ${textSize} font-medium transition-all duration-200 ${
          viewMode === 'BEST_PRICE'
            ? 'bg-[#15803D] text-white hover:bg-[#166534] hover:shadow-sm'
            : 'bg-transparent text-white/80 hover:bg-white/10'
        }`}
      >
        Melhor Preço
      </Button>
      <Button
        onClick={toggleDefault}
        variant="ghost"
        size={buttonSize}
        className={`flex-1 ${textSize} font-medium transition-all duration-200 ${
          viewMode === 'DEFAULT'
            ? 'bg-[#15803D] text-white hover:bg-[#166534] hover:shadow-sm'
            : 'bg-transparent text-white/80 hover:bg-white/10'
        }`}
      >
        Ver Tudo
      </Button>
    </div>
  )
}
