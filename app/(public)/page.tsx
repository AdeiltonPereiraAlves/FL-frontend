'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/useApi'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/mapa/MapaEntidades'), {
  ssr: false,
})

const SEARCH_STORAGE_KEY = 'feiralivre:busca'

interface SavedSearchState {
  busca: string
  cidadeId: string
  produtos: any[]
  entidadesDestaqueIds: string[]
  timestamp: number
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  const [cidadeId, setCidadeId] = useState('')
  const [busca, setBusca] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [erroCidade, setErroCidade] = useState('')
  const [cidadeInicializada, setCidadeInicializada] = useState(false)
  const [buscaRestaurada, setBuscaRestaurada] = useState(false)

  const [entidades, setEntidades] = useState<any[]>([])
  const [entidadesDestaqueIds, setEntidadesDestaqueIds] = useState<string[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [paginacao, setPaginacao] = useState<any>(null)

  const cidadesApi = useApi<any[]>('/cidades')
  const entidadesApi = useApi<any[]>('/entidades/mapa')
  const produtosApi = useApi<any[]>('/produtos/cidade')

  // Função para definir cidade padrão (preparada para geolocalização futura)
  // TODO: Futuro - substituir por geolocalização
  // Exemplo futuro: async function definirCidadePadrao(cidades, userLocation) { ... }
  const definirCidadePadrao = (cidades: any[]) => {
    // Por enquanto, usa Sousa como padrão
    const sousa = cidades.find((c) => 
      c.nome.toLowerCase() === 'sousa' && c.estado === 'PB'
    )
    return sousa?.id || ''
  }

  // Carregar busca salva do localStorage ao montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_STORAGE_KEY)
      if (saved) {
        const savedState: SavedSearchState = JSON.parse(saved)
        // Restaurar apenas se tiver menos de 1 hora (opcional, pode remover se quiser manter sempre)
        const umaHora = 60 * 60 * 1000
        if (Date.now() - savedState.timestamp < umaHora) {
          setBusca(savedState.busca)
          setCidadeId(savedState.cidadeId)
          setProdutos(savedState.produtos || [])
          setEntidadesDestaqueIds(savedState.entidadesDestaqueIds || [])
          setBuscaRestaurada(true)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar busca salva:', err)
    }
  }, [])

  useEffect(() => {
    cidadesApi.execute()
  }, [])

  // Definir cidade padrão quando cidades carregarem (apenas uma vez)
  useEffect(() => {
    if (cidadesApi.data && cidadesApi.data.length > 0 && !cidadeInicializada) {
      const cidadePadrao = definirCidadePadrao(cidadesApi.data)
      if (cidadePadrao && !cidadeId) {
        setCidadeId(cidadePadrao)
        setCidadeInicializada(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadesApi.data, cidadeInicializada])

  // Carregar entidades quando selecionar cidade
  useEffect(() => {
    if (cidadeId) {
      setErroCidade('')
      entidadesApi.execute({
        params: { cidadeId },
      }).then((data) => {
        if (data) setEntidades(data)
      }).catch((error) => {
        console.error('Erro ao carregar entidades:', error)
      })
    } else {
      setEntidades([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeId])

  // Verificar se a cidade restaurada ainda é válida quando cidades carregarem
  useEffect(() => {
    if (buscaRestaurada && cidadeId && cidadesApi.data && cidadesApi.data.length > 0) {
      const cidadeExiste = cidadesApi.data.some((c: any) => c.id === cidadeId)
      if (!cidadeExiste) {
        // Cidade não existe mais, limpar busca
        setBusca('')
        setProdutos([])
        setEntidadesDestaqueIds([])
        localStorage.removeItem(SEARCH_STORAGE_KEY)
        setBuscaRestaurada(false)
      } else {
        // Cidade existe, marcar como não restaurada para evitar loops
        setBuscaRestaurada(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadesApi.data])

  // Função auxiliar para salvar busca no localStorage
  function salvarBusca(produtosList: any[], ids: string[]) {
    try {
      const stateToSave: SavedSearchState = {
        busca,
        cidadeId,
        produtos: produtosList,
        entidadesDestaqueIds: ids,
        timestamp: Date.now(),
      }
      localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (err) {
      console.error('Erro ao salvar busca:', err)
    }
  }


  async function buscar() {
    // Validar cidade
    if (!cidadeId) {
      setErroCidade('Por favor, selecione uma cidade antes de buscar')
      return
    }

    if (!busca.trim()) {
      setErroCidade('Por favor, digite o nome do produto')
      return
    }

    setErroCidade('')
    setIsSearching(true)
    try {
      const data = await produtosApi.execute({
        params: { cidadeId, query: busca },
      })

      if (!data) return

      // Ajustar para nova estrutura de resposta com paginação
      const produtosList = Array.isArray(data) ? data : (data.produtos || [])
      setProdutos(produtosList)
      setPaginacao(data.paginacao || null)

      // Lojas que têm o produto
      const ids = produtosList.map((p: any) => p.entidade.id)
      setEntidadesDestaqueIds(ids)

      // Salvar busca no localStorage
      salvarBusca(produtosList, ids)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setErroCidade('Erro ao buscar produtos. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="py-6 sm:py-10 pb-4">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Encontre os melhores <span className="text-[#FE6233]">produtos pelo melhor preço!!!</span>
          </h1>

          <div className="mt-6 sm:mt-8 space-y-3">
            {/* Select de cidade - menor em mobile */}
            <div className="w-full sm:w-auto sm:max-w-xs mx-auto">
              <select
                className="h-11 sm:h-12 rounded-md border border-gray-300 px-3 w-full text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#FE6233] focus:border-transparent"
                value={cidadeId}
                onChange={(e) => {
                  const novaCidadeId = e.target.value
                  setCidadeId(novaCidadeId)
                  // Limpar busca se mudar de cidade
                  if (novaCidadeId !== cidadeId) {
                    setProdutos([])
                    setEntidadesDestaqueIds([])
                    setBusca('')
                    setErroCidade('')
                    // Limpar busca salva se mudar de cidade
                    localStorage.removeItem(SEARCH_STORAGE_KEY)
                  } else {
                    setErroCidade('')
                  }
                }}
              >
                <option value="">Escolha a cidade</option>
                {cidadesApi.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Input e botão em linha no mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Ex: arroz, carne, refrigerante..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      buscar()
                    }
                  }}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  disabled={isSearching}
                />
              </div>

              <Button
                onClick={buscar}
                size="lg"
                className="h-11 sm:h-12 bg-[#FE6233] hover:bg-[#E9571C] w-full sm:w-auto sm:min-w-[120px]"
                disabled={isSearching}
              >
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </span>
              </Button>
            </div>

            {/* Mensagem de erro */}
            {erroCidade && (
              <div className="mt-2">
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm mx-auto max-w-full">
                  {erroCidade}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MAPA — SEMPRE VISÍVEL */}
      <section className="py-4 sm:py-8 md:py-12">
        <div className="px-2 sm:px-4 md:px-8 lg:px-16">
          <Map
            entidades={entidades}
            produtos={produtos}
            entidadesDestaqueIds={entidadesDestaqueIds}
          />
        </div>
      </section>
    </div>
  )
}
