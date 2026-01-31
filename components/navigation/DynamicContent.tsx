'use client'

import { useNavigation } from '@/contexts/NavigationContext'
import { useCache } from '@/contexts/CacheContext'
import { useEntidades } from '@/hooks/useEntidades'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { BackButton } from './BackButton'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

import LojaContent from './LojaContent'

export function DynamicContent() {
  const { state } = useNavigation()
  const cache = useCache()
  const { buscarEntidadePorId } = useEntidades()
  const [lojaData, setLojaData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (state.currentView === 'loja' && state.lojaId) {
      // Verificar cache primeiro
      const cached = cache.get<any>(`loja:${state.lojaId}`)
      if (cached) {
        setLojaData(cached)
        return
      }

      // Carregar do backend
      setLoading(true)
      buscarEntidadePorId(state.lojaId)
        .then((data) => {
          setLojaData(data)
          // Salvar no cache
          cache.set(`loja:${state.lojaId}`, data, 5 * 60 * 1000) // 5 minutos
        })
        .catch((error) => {
          console.error('Erro ao carregar loja:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLojaData(null)
    }
  }, [state.currentView, state.lojaId, buscarEntidadePorId, cache])

  if (state.currentView === 'home') {
    return null // Home é renderizado pela página principal
  }

  if (state.currentView === 'loja') {
    if (loading) {
      return (
        <div className="bg-background min-h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-center min-h-[400px] py-8">
            <LoadingSpinner size="lg" text="Carregando loja..." />
          </div>
        </div>
      )
    }

    if (!lojaData) {
      return (
        <div className="bg-background min-h-[calc(100vh-4rem)]">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loja não encontrada</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-background min-h-[calc(100vh-4rem)]">
        <LojaContent lojaId={state.lojaId!} initialData={lojaData} />
      </div>
    )
  }

  return null
}
