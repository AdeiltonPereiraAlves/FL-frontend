'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ViewMode = 'DEFAULT' | 'BEST_PRICE'

interface ViewModeContextData {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleBestPrice: () => void
  toggleDefault: () => void
}

const ViewModeContext = createContext<ViewModeContextData>({} as ViewModeContextData)

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('DEFAULT')

  const toggleBestPrice = () => {
    setViewMode('BEST_PRICE')
  }

  const toggleDefault = () => {
    setViewMode('DEFAULT')
  }

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleBestPrice,
        toggleDefault,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider')
  }
  return context
}
