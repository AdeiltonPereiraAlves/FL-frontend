'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner'

interface BuscaHeaderProps {
  onSearch?: (query: string, cidadeId?: string) => void
  initialQuery?: string
  initialCidadeId?: string
}

export function BuscaHeader({ onSearch, initialQuery, initialCidadeId }: BuscaHeaderProps) {
  const pathname = usePathname()
  const [busca, setBusca] = useState(initialQuery || '')
  const [cidadeId, setCidadeId] = useState(initialCidadeId || '')
  const cidadesApi = useApi<any[]>('/cidades')
  const cidadeIdRef = useRef(cidadeId)

  useEffect(() => {
    cidadesApi.execute()
  }, [])

  // Definir cidade padrão
  useEffect(() => {
    if (cidadesApi.data && cidadesApi.data.length > 0 && !cidadeId) {
      const sousa = cidadesApi.data.find((c: any) => 
        c.nome.toLowerCase() === 'sousa' && c.estado === 'PB'
      )
      if (sousa) {
        setCidadeId(sousa.id)
        cidadeIdRef.current = sousa.id
      }
    }
  }, [cidadesApi.data, cidadeId])

  // Sincronizar com props externas
  useEffect(() => {
    if (initialQuery !== undefined) {
      setBusca(initialQuery)
    }
    if (initialCidadeId !== undefined) {
      setCidadeId(initialCidadeId)
      cidadeIdRef.current = initialCidadeId
    }
  }, [initialQuery, initialCidadeId])

  useEffect(() => {
    cidadeIdRef.current = cidadeId
  }, [cidadeId])

  const handleSearch = () => {
    if (onSearch) {
      const isHome = pathname === '/'
      if (isHome) {
        if (cidadeIdRef.current && busca.trim()) {
          onSearch(busca.trim(), cidadeIdRef.current)
        }
      } else {
        if (busca.trim()) {
          onSearch(busca.trim())
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Na home, precisa de cidade selecionada
  const isHome = pathname === '/'
  const canSearch = isHome ? cidadeId && busca.trim() : busca.trim()

  return (
    <div className="flex-1 w-full max-w-2xl mx-2 sm:mx-4 min-w-0">
      <div className="flex gap-1.5 sm:gap-2 w-full">
        {isHome && (
          <>
            {cidadesApi.isLoading ? (
              <LoadingSkeleton className="h-10 w-[85px] sm:w-[120px] md:min-w-[140px] flex-shrink-0 rounded-md" />
            ) : (
              <select
                className="h-10 rounded-md border border-gray-300 px-1.5 sm:px-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent w-[85px] sm:w-[120px] md:min-w-[140px] flex-shrink-0"
                value={cidadeId}
                onChange={(e) => {
                  setCidadeId(e.target.value)
                  cidadeIdRef.current = e.target.value
                }}
              >
                <option value="">Cidade</option>
                {cidadesApi.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.estado}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        <Input
          placeholder={isHome ? "Buscar produtos..." : "Buscar produtos ou lojas..."}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-10 bg-white text-sm sm:text-base min-w-0"
        />
        <Button
          onClick={handleSearch}
          size="sm"
          className="h-10 w-10 sm:w-auto bg-[#16A34A] hover:bg-[#15803D] text-white transition-all hover:scale-110 disabled:hover:scale-100 group flex-shrink-0 px-2 sm:px-3"
          disabled={!canSearch}
        >
          <Search className="h-4 w-4 transition-all group-hover:scale-125 group-hover:rotate-12" />
        </Button>
      </div>
    </div>
  )
}
