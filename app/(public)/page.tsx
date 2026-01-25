'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { PackageX } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { BannerCarousel } from '@/components/banner/BannerCarousel'
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner'

const Map = dynamic(() => import('@/components/mapa/MapaEntidades'), {
  ssr: false,
})

const SEARCH_STORAGE_KEY = 'feiralivre:ultimaBusca'
const CHECKOUT_RETURN_STORAGE_KEY = 'feiralivre:checkoutReturnState'

interface SavedSearchState {
  busca: string
  cidadeId: string
  produtos: any[]
  entidadesDestaqueIds: string[]
  timestamp: number
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  const [cidadeId, setCidadeId] = useState('')
  const [busca, setBusca] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [erroCidade, setErroCidade] = useState('')
  const [cidadeInicializada, setCidadeInicializada] = useState(false)

  const [entidades, setEntidades] = useState<any[]>([])
  const [entidadesDestaqueIds, setEntidadesDestaqueIds] = useState<string[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [paginacao, setPaginacao] = useState<any>(null)
  const [buscaRealizada, setBuscaRealizada] = useState(false)

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

  const buscarComParametros = useCallback(async (query?: string, cidade?: string) => {
    const queryFinal = query || busca
    const cidadeFinal = cidade || cidadeId

    // Validar cidade
    if (!cidadeFinal) {
      setErroCidade('Por favor, selecione uma cidade antes de buscar')
      return
    }

    if (!queryFinal.trim()) {
      setErroCidade('Por favor, digite o nome do produto')
      return
    }

    setErroCidade('')
    setIsSearching(true)
    setBuscaRealizada(false)
    try {
      const data = await produtosApi.execute({
        params: { cidadeId: cidadeFinal, query: queryFinal },
      })

      if (!data) {
        setBuscaRealizada(true)
        setProdutos([])
        setEntidadesDestaqueIds([])
        setIsSearching(false)
        return
      }

      // Ajustar para nova estrutura de resposta com paginação
      const produtosList = Array.isArray(data) 
        ? data 
        : ((data as { produtos?: any[] }).produtos || [])
      const paginacaoData = Array.isArray(data) 
        ? null 
        : ((data as { paginacao?: any }).paginacao || null)
      setProdutos(produtosList)
      setPaginacao(paginacaoData)
      setBuscaRealizada(true)

      // Lojas que têm o produto
      const ids = produtosList.map((p: any) => p.entidade.id)
      setEntidadesDestaqueIds(ids)

      // Salvar busca no localStorage para restaurar depois
      try {
        const stateToSave: SavedSearchState = {
          busca: queryFinal,
          cidadeId: cidadeFinal,
          produtos: produtosList,
          entidadesDestaqueIds: ids,
          timestamp: Date.now(),
        }
        localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(stateToSave))
      } catch (err) {
        console.error('Erro ao salvar busca:', err)
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setErroCidade('Erro ao buscar produtos. Tente novamente.')
      setBuscaRealizada(false)
    } finally {
      setIsSearching(false)
    }
  }, [busca, cidadeId, produtosApi])

  // Verificar se está voltando do checkout e restaurar busca
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Verifica se há estado salvo do checkout para restaurar
    const checkoutReturnState = sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)
    
    if (checkoutReturnState) {
      try {
        const state: SavedSearchState = JSON.parse(checkoutReturnState)
        
        // Só restaura se houver busca e produtos válidos
        if (state.busca && state.cidadeId && state.produtos && state.produtos.length > 0) {
          setBusca(state.busca)
          setCidadeId(state.cidadeId)
          setProdutos(state.produtos)
          setEntidadesDestaqueIds(state.entidadesDestaqueIds || [])
          setBuscaRealizada(true)
        }
        
        // Limpar o estado do checkout após restaurar
        sessionStorage.removeItem(CHECKOUT_RETURN_STORAGE_KEY)
      } catch (err) {
        console.error('Erro ao restaurar estado do checkout:', err)
        sessionStorage.removeItem(CHECKOUT_RETURN_STORAGE_KEY)
      }
    }
  }, [])

  // Carregar busca da URL (não restaura do localStorage no reload)
  useEffect(() => {
    // Se há estado do checkout sendo restaurado, não processa URL ainda
    if (typeof window !== 'undefined' && sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
      return
    }
    
    const urlBusca = searchParams.get('busca')
    const urlCidadeId = searchParams.get('cidadeId')
    
    if (urlBusca && urlCidadeId) {
      // Só atualiza se os valores mudaram
      if (busca !== urlBusca || cidadeId !== urlCidadeId) {
        setBusca(urlBusca)
        setCidadeId(urlCidadeId)
        // Limpar produtos anteriores
        setProdutos([])
        setEntidadesDestaqueIds([])
        setBuscaRealizada(false)
        // Executar busca automaticamente
        buscarComParametros(urlBusca, urlCidadeId)
      }
    } else {
      // Se não há busca na URL e não está restaurando do checkout, limpar
      // Mas só limpa se não houver estado do checkout para restaurar
      if (!sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
        if (busca.trim() || produtos.length > 0) {
          setBusca('')
          setProdutos([])
          setEntidadesDestaqueIds([])
          setBuscaRealizada(false)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    cidadesApi.execute()
  }, [])

  // Escutar evento de busca do header (sem reload)
  useEffect(() => {
    const handleBuscar = (event: CustomEvent) => {
      const { query, cidadeId } = event.detail
      if (query && cidadeId) {
        setBusca(query)
        setCidadeId(cidadeId)
        buscarComParametros(query, cidadeId)
      }
    }

    window.addEventListener('feiralivre:buscar', handleBuscar as EventListener)
    return () => {
      window.removeEventListener('feiralivre:buscar', handleBuscar as EventListener)
    }
  }, [buscarComParametros])

  // Definir cidade padrão quando cidades carregarem (apenas se não houver cidade restaurada)
  useEffect(() => {
    if (cidadesApi.data && cidadesApi.data.length > 0 && !cidadeInicializada) {
      // Só define cidade padrão se não houver cidadeId (não foi restaurada)
      if (!cidadeId) {
        const cidadePadrao = definirCidadePadrao(cidadesApi.data)
        if (cidadePadrao) {
          setCidadeId(cidadePadrao)
        }
      }
      setCidadeInicializada(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadesApi.data, cidadeInicializada])

  // Carregar entidades quando selecionar cidade (só se não houver busca ativa)
  useEffect(() => {
    // Se está restaurando do checkout, não carrega entidades ainda
    if (typeof window !== 'undefined' && sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
      return
    }
    
    if (cidadeId && !busca.trim() && produtos.length === 0) {
      setErroCidade('')
      entidadesApi.execute({
        params: { cidadeId },
      }).then((data) => {
        if (data) setEntidades(data)
      }).catch((error) => {
        console.error('Erro ao carregar entidades:', error)
      })
    } else if (!cidadeId) {
      setEntidades([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeId, busca, produtos.length])

  // Limpar produtos quando não houver busca ativa (mas não se estiver restaurando do checkout)
  useEffect(() => {
    // Se está restaurando do checkout, não limpa produtos
    if (typeof window !== 'undefined' && sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
      return
    }
    
    if (!busca.trim()) {
      // Se não há busca, limpar produtos para mostrar apenas entidades
      if (produtos.length > 0) {
        setProdutos([])
        setEntidadesDestaqueIds([])
        setBuscaRealizada(false)
      }
    }
  }, [busca, produtos.length])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Carrossel de Banners */}
      <section className="py-2 sm:py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BannerCarousel />
        </div>
      </section>

      {/* Loading inicial - quando está carregando cidades ou entidades */}
      {(cidadesApi.isLoading || (entidadesApi.isLoading && !busca.trim() && produtos.length === 0)) && (
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" text="Carregando informações..." />
            </div>
          </div>
        </section>
      )}

      {/* HERO */}
      <section className="py-2 sm:py-4 pb-2">
        <div className="mx-auto max-w-4xl px-4 text-center">

          {/* Mensagem de erro */}
          {erroCidade && (
            <div className="mt-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm mx-auto max-w-full">
                {erroCidade}
              </div>
            </div>
          )}

          {/* Mensagem quando não encontrar produtos */}
          {buscaRealizada && !isSearching && produtos.length === 0 && !erroCidade && (
            <div className="mt-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-3 sm:py-4 rounded-md text-xs sm:text-sm mx-auto max-w-full flex items-center gap-2 sm:gap-3">
                <PackageX className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Produto não encontrado</p>
                  <p className="text-yellow-700 mt-1">
                    Não encontramos "{busca}" nesta cidade. Tente buscar por outro termo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MAPA — SEMPRE VISÍVEL */}
      {!cidadesApi.isLoading && (
        <section className="py-4 sm:py-8 md:py-12">
          <div className="px-2 sm:px-4 md:px-8 lg:px-16">
            {entidadesApi.isLoading && !busca.trim() && produtos.length === 0 ? (
              <div className="relative w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                <LoadingSpinner size="lg" text="Carregando lojas no mapa..." />
              </div>
            ) : (
              <Map
                entidades={entidades}
                produtos={produtos}
                entidadesDestaqueIds={entidadesDestaqueIds}
                isLoading={isSearching}
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}
