'use client'

import { Button } from '@/components/ui/button'
import { PackageX, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner'
import { DynamicContent } from '@/components/navigation/DynamicContent'
import { useNavigation } from '@/contexts/NavigationContext'
import { useRouter } from 'next/navigation'
import { BotoesRapidos } from '@/components/home/BotoesRapidos'
import { ListaEntidadesLateral } from '@/components/home/ListaEntidadesLateral'
import { Input } from '@/components/ui/input'
import { buscarInteligente, agruparPorEntidade } from '@/utils/searchInteligente'
import { useCache } from '@/contexts/CacheContext'
import { useDebounce } from '@/hooks/useDebounce'

const Map = dynamic(() => import('@/components/mapa/MapaEntidadesClusterizado'), {
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
  const { state: navState, navigateToLoja } = useNavigation()
  const router = useRouter()

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
  const [highlightedEntityId, setHighlightedEntityId] = useState<string | null>(null)
  const [resultadosBuscaInteligente, setResultadosBuscaInteligente] = useState<any[]>([])
  const [carregandoEntidades, setCarregandoEntidades] = useState(false)

  const cache = useCache()
  const debouncedBusca = useDebounce(busca, 500) // Debounce de 500ms para otimizar buscas

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

    // Verificar cache antes de fazer a requisição
    const cacheKey = `busca:${cidadeFinal}:${queryFinal.toLowerCase().trim()}`
    const cachedData = cache.get<any>(cacheKey)
    
    if (cachedData) {
      console.log('✅ [Cache] Busca encontrada no cache:', cacheKey)
      // Usar dados do cache
      const produtosList = Array.isArray(cachedData) 
        ? cachedData 
        : ((cachedData as { produtos?: any[] }).produtos || [])
      const paginacaoData = Array.isArray(cachedData) 
        ? null 
        : ((cachedData as { paginacao?: any }).paginacao || null)
      
      // Aplicar busca inteligente com scoring
      // Usar entidades do estado atual (não da dependência para evitar loops)
      const entidadesAtuais = entidades.length > 0 ? entidades : []
      const resultados = buscarInteligente({
        query: queryFinal,
        cidadeId: cidadeFinal,
        produtos: produtosList,
        entidades: entidadesAtuais,
      })

      const produtosOrdenados = resultados
        .filter((r) => r.produto)
        .map((r) => r.produto)
        .slice(0, 50)

      setProdutos(produtosOrdenados)
      setPaginacao(paginacaoData)
      setBuscaRealizada(true)
      setResultadosBuscaInteligente(resultados)

      const entidadesComScore = agruparPorEntidade(resultados)
      const ids = Array.from(entidadesComScore.keys())
      setEntidadesDestaqueIds(ids)
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
      
      // Aplicar busca inteligente com scoring
      // Usar entidades do estado atual (não da dependência para evitar loops)
      const entidadesAtuais = entidades.length > 0 ? entidades : []
      const resultados = buscarInteligente({
        query: queryFinal,
        cidadeId: cidadeFinal,
        produtos: produtosList,
        entidades: entidadesAtuais,
      })

      // Ordenar produtos por score
      const produtosOrdenados = resultados
        .filter((r) => r.produto)
        .map((r) => r.produto)
        .slice(0, 50) // Limitar a 50 resultados

      setProdutos(produtosOrdenados)
      setPaginacao(paginacaoData)
      setBuscaRealizada(true)
      setResultadosBuscaInteligente(resultados)

      // Lojas que têm o produto (ordenadas por score)
      const entidadesComScore = agruparPorEntidade(resultados)
      const ids = Array.from(entidadesComScore.keys())
      setEntidadesDestaqueIds(ids)

      // Salvar no cache para próximas buscas
      try {
        cache.set(cacheKey, data, 5 * 60 * 1000) // Cache de 5 minutos
        console.log('💾 [Cache] Busca salva no cache:', cacheKey)
      } catch (err) {
        console.error('Erro ao salvar no cache:', err)
      }

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
  }, [busca, cidadeId, produtosApi, cache])

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
    // Verificar cache de cidades
    const cacheKey = 'cidades:all'
    const cachedCidades = cache.get<any[]>(cacheKey)
    
    if (cachedCidades) {
      console.log('✅ [Cache] Cidades encontradas no cache')
      // As cidades serão carregadas pelo useApi normalmente, mas podemos usar cache em outras partes
    }
    
    cidadesApi.execute().then((data) => {
      if (data) {
        // Salvar cidades no cache (cache longo, pois cidades mudam raramente)
        cache.set(cacheKey, data, 60 * 60 * 1000) // Cache de 1 hora para cidades
        console.log('💾 [Cache] Cidades salvas no cache')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleLimparBusca = () => {
      console.log('🧹 [HomePage] Evento de limpar busca recebido')
      // Limpar busca e produtos
      setBusca('')
      setProdutos([])
      setEntidadesDestaqueIds([])
      setBuscaRealizada(false)
      setErroCidade('')
      
      // Recarregar entidades se houver cidade selecionada
      if (cidadeId) {
        console.log('🔄 [HomePage] Recarregando entidades após limpar busca')
        entidadesApi.execute({
          params: { cidadeId },
        }).then((data) => {
          if (data && Array.isArray(data)) {
            setEntidades(data)
          }
        }).catch((error) => {
          console.error('❌ [HomePage] Erro ao recarregar entidades:', error)
        })
      }
    }

    window.addEventListener('feiralivre:buscar', handleBuscar as EventListener)
    window.addEventListener('feiralivre:limparBusca', handleLimparBusca as EventListener)
    return () => {
      window.removeEventListener('feiralivre:buscar', handleBuscar as EventListener)
      window.removeEventListener('feiralivre:limparBusca', handleLimparBusca as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeId])

  // Definir cidade padrão quando cidades carregarem (apenas se não houver cidade restaurada)
  useEffect(() => {
    if (cidadesApi.data && cidadesApi.data.length > 0 && !cidadeInicializada) {
      // Remover cidades duplicadas
      const cidadesUnicas = cidadesApi.data.filter((c: any, index: number, self: any[]) => 
        index === self.findIndex((ci: any) => 
          ci.nome.toLowerCase() === c.nome.toLowerCase() && 
          ci.estado === c.estado
        )
      )
      
      // Só define cidade padrão se não houver cidadeId (não foi restaurada)
      if (!cidadeId) {
        const cidadePadrao = definirCidadePadrao(cidadesUnicas)
        if (cidadePadrao) {
          setCidadeId(cidadePadrao)
        }
      }
      setCidadeInicializada(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadesApi.data, cidadeInicializada])

  // Busca automática com debounce quando o usuário digita (desabilitada por enquanto para evitar loops)
  // useEffect(() => {
  //   // Só busca automaticamente se:
  //   // 1. Há texto na busca (com pelo menos 2 caracteres)
  //   // 2. Há cidade selecionada
  //   // 3. A busca não foi realizada ainda (para evitar busca duplicada após submit)
  //   if (debouncedBusca.trim() && cidadeId && debouncedBusca.trim().length >= 2 && !buscaRealizada) {
  //     buscarComParametros(debouncedBusca, cidadeId)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [debouncedBusca, cidadeId])

  // Carregar entidades quando selecionar cidade (só se não houver busca ativa)
  useEffect(() => {
    // Se está restaurando do checkout, não carrega entidades ainda
    if (typeof window !== 'undefined' && sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
      return
    }
    
    if (cidadeId && !busca.trim() && produtos.length === 0 && !carregandoEntidades && !entidadesApi.isLoading) {
      // Verificar cache de entidades
      const cacheKey = `entidades:${cidadeId}`
      const cachedEntidades = cache.get<any[]>(cacheKey)
      
      if (cachedEntidades && Array.isArray(cachedEntidades) && cachedEntidades.length > 0) {
        console.log('✅ [Cache] Entidades encontradas no cache:', cacheKey)
        setEntidades(cachedEntidades)
        return
      }

      setCarregandoEntidades(true)
      setErroCidade('')
      entidadesApi.execute({
        params: { cidadeId },
      }).then((data) => {
        console.log('🏪 [HomePage] Entidades carregadas:', data?.length || 0, data)
        if (data && Array.isArray(data)) {
          // Log detalhado de cada entidade recebida
          data.forEach((ent, index) => {
            console.log(`  ${index + 1}. ${ent.nome} (${ent.id}):`, {
              status: ent.status,
              temLocalizacao: !!ent.localizacao,
              latitude: ent.localizacao?.latitude,
              longitude: ent.localizacao?.longitude,
              cidadeId: ent.cidadeId,
              cidadeNome: ent.cidade?.nome,
            })
          })
          setEntidades(data)
          
          // Salvar no cache
          cache.set(cacheKey, data, 10 * 60 * 1000) // Cache de 10 minutos para entidades
          console.log('💾 [Cache] Entidades salvas no cache:', cacheKey)
        } else {
          console.warn('⚠️ [HomePage] Dados de entidades inválidos:', data)
          setEntidades([])
        }
        setCarregandoEntidades(false)
      }).catch((error) => {
        console.error('❌ [HomePage] Erro ao carregar entidades:', error)
        setEntidades([])
        setCarregandoEntidades(false)
      })
    } else if (!cidadeId) {
      setEntidades([])
      setCarregandoEntidades(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeId, busca, produtos.length])

  // Limpar produtos quando não houver busca ativa (mas não se estiver restaurando do checkout)
  useEffect(() => {
    // Se está restaurando do checkout, não limpa produtos
    if (typeof window !== 'undefined' && sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
      return
    }
    
    // Se a busca foi limpa (estava preenchida e agora está vazia)
    if (!busca.trim() && produtos.length > 0) {
      console.log('🧹 [HomePage] Limpando busca - removendo produtos e voltando para entidades')
      setProdutos([])
      setEntidadesDestaqueIds([])
      setBuscaRealizada(false)
      setErroCidade('')
      
      // Recarregar entidades se houver cidade selecionada
      if (cidadeId) {
        console.log('🔄 [HomePage] Recarregando entidades após limpar busca')
        entidadesApi.execute({
          params: { cidadeId },
        }).then((data) => {
          if (data && Array.isArray(data)) {
            setEntidades(data)
          }
        }).catch((error) => {
          console.error('❌ [HomePage] Erro ao recarregar entidades:', error)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, produtos.length, cidadeId])

  // Se estiver visualizando uma loja, não mostrar conteúdo da home
  if (navState.currentView === 'loja') {
    return <DynamicContent />
  }

  const handleBuscaRapida = useCallback((query: string) => {
    if (cidadeId) {
      setBusca(query)
      buscarComParametros(query, cidadeId)
    } else {
      setErroCidade('Por favor, selecione uma cidade antes de buscar')
    }
  }, [cidadeId, buscarComParametros])

  const handleBuscaSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (cidadeId && busca.trim()) {
      buscarComParametros(busca, cidadeId)
    } else if (!cidadeId) {
      setErroCidade('Por favor, selecione uma cidade antes de buscar')
    } else if (!busca.trim()) {
      setErroCidade('Por favor, digite o nome do produto')
    }
  }, [cidadeId, busca, buscarComParametros])

  return (
    <>
      {/* TÍTULO E BOTÕES RÁPIDOS - Busca está no header */}
      <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-[#16A34A]/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Encontre os melhores produtos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Busque por produtos e encontre as melhores ofertas nas lojas próximas
            </p>
          </div>

          {/* Botões Rápidos */}
          {cidadeId && (
            <BotoesRapidos cidadeId={cidadeId} onBuscar={handleBuscaRapida} />
          )}

          {/* Mensagem de erro */}
          {erroCidade && (
            <div className="mt-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {erroCidade}
              </div>
            </div>
          )}

          {/* Mensagem quando não encontrar produtos */}
          {buscaRealizada && !isSearching && produtos.length === 0 && !erroCidade && (
            <div className="mt-4">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm flex items-center gap-3">
                <PackageX className="h-5 w-5 flex-shrink-0" />
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

      {/* MAPA + LISTA LATERAL */}
      {!cidadesApi.isLoading && (
        <section id="mapa-container" className="py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Mapa - Ocupa 2 colunas no desktop */}
              <div className="lg:col-span-2">
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
                    highlightedEntityId={highlightedEntityId}
                    onEntityHover={setHighlightedEntityId}
                    onEntityClick={(id) => {
                      setHighlightedEntityId(id)
                      // Navegar para a loja de forma assíncrona para evitar problemas com hooks
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                        // Usar setTimeout para garantir que todos os hooks sejam executados
                        setTimeout(() => {
                          navigateToLoja(id)
                        }, 0)
                      }
                    }}
                  />
                )}
              </div>

              {/* Lista Lateral de Entidades - Ocupa 1 coluna no desktop */}
              <div className="lg:col-span-1">
                {!busca.trim() && entidades.length > 0 && (
                  <ListaEntidadesLateral 
                    entidades={entidades} 
                    cidadeId={cidadeId}
                    highlightedEntityId={highlightedEntityId}
                    onEntityHover={setHighlightedEntityId}
                    onEntityClick={(id) => {
                      setHighlightedEntityId(id)
                      // Navegar para loja será feito pelo componente
                    }}
                  />
                )}
                {busca.trim() && resultadosBuscaInteligente.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Resultados da Busca
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {resultadosBuscaInteligente.length} resultado(s) encontrado(s) para "{busca}"
                    </p>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {resultadosBuscaInteligente.slice(0, 20).map((resultado, index) => {
                        const entidade = resultado.entidade || resultado.produto?.entidade
                        const produto = resultado.produto
                        const isHighlighted = highlightedEntityId === entidade?.id

                        return (
                          <div
                            key={resultado.produto?.id || entidade?.id || index}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              isHighlighted
                                ? 'border-[#16A34A] bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onMouseEnter={() => setHighlightedEntityId(entidade?.id || null)}
                            onMouseLeave={() => setHighlightedEntityId(null)}
                          >
                            {produto ? (
                              <div>
                                <p className="font-semibold text-sm text-gray-900">
                                  {produto.nome}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {entidade?.nome}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {resultado.hasPromocao && resultado.preco ? (
                                    <>
                                      <span className="text-xs text-gray-400 line-through">
                                        R$ {produto.precoAtual?.toFixed(2)}
                                      </span>
                                      <span className="text-sm font-bold text-[#16A34A]">
                                        R$ {resultado.preco.toFixed(2)}
                                      </span>
                                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                        PROMOÇÃO
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm font-bold text-[#16A34A]">
                                      R$ {resultado.preco?.toFixed(2) || 'N/A'}
                                    </span>
                                  )}
                                </div>
                                {resultado.distancia && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    📍 {resultado.distancia.toFixed(1)} km
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="font-semibold text-sm text-gray-900">
                                  {entidade?.nome}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Tipo: {entidade?.tipo}
                                </p>
                                {resultado.distancia && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    📍 {resultado.distancia.toFixed(1)} km
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
