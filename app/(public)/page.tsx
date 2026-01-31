'use client'

import { Button } from '@/components/ui/button'
import { PackageX, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useApi } from '@/hooks/useApi'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner'
import { DynamicContent } from '@/components/navigation/DynamicContent'
import { useNavigation } from '@/contexts/NavigationContext'
import { useRouter } from 'next/navigation'
import { BotoesRapidos } from '@/components/home/BotoesRapidos'
import { ListaEntidadesProdutosLateral } from '@/components/home/ListaEntidadesProdutosLateral'
import { DrawerLateral } from '@/components/home/DrawerLateral'
import { ListaResultadosProdutos } from '@/components/home/ListaResultadosProdutos'
import { PainelDetalheProduto } from '@/components/home/PainelDetalheProduto'
import { ViewModeToggle } from '@/components/home/ViewModeToggle'
import { Input } from '@/components/ui/input'
import { buscarInteligente, agruparPorEntidade } from '@/utils/searchInteligente'
import { useCache } from '@/contexts/CacheContext'
import { useDebounce } from '@/hooks/useDebounce'
import { useUIPanel } from '@/contexts/UIPanelContext'
import { useViewMode } from '@/contexts/ViewModeContext'
import { useUserLocation } from '@/hooks/useUserLocation'

const Map = dynamic(() => import('@/components/mapa/MapaEntidadesClusterizado'), {
  ssr: false,
})

const SEARCH_STORAGE_KEY = 'feiralivre:ultimaBusca'
const CHECKOUT_RETURN_STORAGE_KEY = 'feiralivre:checkoutReturnState'
const LOJA_RETURN_STORAGE_KEY = 'feiralivre:lojaReturnState'

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
  
  // Estados para controle de modo da home
  type HomeModo = 'exploracao' | 'resultadoBusca' | 'detalheProduto'
  const [homeModo, setHomeModo] = useState<HomeModo>('exploracao')
  const { selectedProduct, cartOpen, openProduct, closeProduct } = useUIPanel()
  const { viewMode } = useViewMode()
  const userLocationRaw = useUserLocation()
  const userLocation = userLocationRaw ? { lat: userLocationRaw[0], lng: userLocationRaw[1] } : undefined
  
  // Sincronizar modo com estado de busca
  useEffect(() => {
    if (busca.trim() && produtos.length > 0) {
      // Se há busca e produtos, modo resultadoBusca
      if (homeModo === 'exploracao') {
        setHomeModo('resultadoBusca')
      }
    } else if (!busca.trim()) {
      // Se busca está vazia, SEMPRE voltar para exploração
      if (homeModo !== 'exploracao') {
        setHomeModo('exploracao')
        closeProduct()
      }
      // Limpar produtos se ainda houver
      if (produtos.length > 0) {
        setProdutos([])
        setEntidadesDestaqueIds([])
        setBuscaRealizada(false)
        setResultadosBuscaInteligente([])
      }
    }
  }, [busca, produtos.length, homeModo, closeProduct])
  
  // Sincronizar homeModo com selectedProduct do contexto
  useEffect(() => {
    if (selectedProduct && homeModo !== 'detalheProduto') {
      setHomeModo('detalheProduto')
    } else if (!selectedProduct && homeModo === 'detalheProduto' && busca.trim() && produtos.length > 0) {
      setHomeModo('resultadoBusca')
    } else if (!selectedProduct && homeModo === 'detalheProduto' && !busca.trim()) {
      setHomeModo('exploracao')
    }
  }, [selectedProduct, homeModo, busca, produtos.length])

  // Calcular TOP 3 entidades quando em modo BEST_PRICE
  // IMPORTANTE: useMemo sempre deve retornar um valor, nunca undefined
  const top3EntityIds = useMemo(() => {
    try {
      if (viewMode === 'BEST_PRICE' && produtos.length > 0 && userLocation) {
        const { ordenarPorBestPrice } = require('@/utils/bestPriceScore')
        const produtosFormatados = produtos.map((p: any) => ({
          produto: p,
          entidade: p.entidade,
          preco: p.precoAtual || p.precoFinal || 0,
          temPromocao: p.emPromocao || false,
        }))
        const ordenados = ordenarPorBestPrice(produtosFormatados, userLocation)
        return ordenados
          .filter((p: any) => p.ranking && p.ranking <= 3)
          .map((p: any) => p.entidade?.id)
          .filter(Boolean) as string[]
      }
      return []
    } catch (error) {
      console.error('Erro ao calcular top3EntityIds:', error)
      return []
    }
  }, [viewMode, produtos, userLocation])

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

    // Se busca estiver vazia, restaurar estado original
    if (!queryFinal.trim()) {
      console.log('🧹 [HomePage] Busca vazia em buscarComParametros - restaurando estado')
      setProdutos([])
      setEntidadesDestaqueIds([])
      setBuscaRealizada(false)
      setResultadosBuscaInteligente([])
      setErroCidade('')
      setHomeModo('exploracao')
      closeProduct()
      
      // Recarregar entidades se necessário
      if (cidadeFinal && entidades.length === 0) {
        entidadesApi.execute({
          params: { cidadeId: cidadeFinal },
        }).then((data) => {
          if (data && Array.isArray(data)) {
            setEntidades(data)
          }
        }).catch((error) => {
          console.error('❌ [HomePage] Erro ao recarregar entidades:', error)
        })
      }
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
      
      // Mudar para modo resultadoBusca
      setHomeModo('resultadoBusca')
      closeProduct() // Limpar produto selecionado ao fazer nova busca
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
      
      // Mudar para modo resultadoBusca
      setHomeModo('resultadoBusca')
      closeProduct() // Limpar produto selecionado ao fazer nova busca

      // Salvar no cache para próximas buscas
      try {
        // Salvar os produtos brutos (antes do processamento inteligente) no cache
        cache.set(cacheKey, produtosList, 5 * 60 * 1000) // Cache de 5 minutos
        console.log('💾 [Cache] Busca salva no cache:', cacheKey, `(${produtosList.length} produtos)`)
      } catch (err) {
        console.error('❌ [Cache] Erro ao salvar busca no cache:', err)
      }

      // Salvar busca no localStorage e sessionStorage para restaurar depois
      try {
        const stateToSave: SavedSearchState = {
          busca: queryFinal,
          cidadeId: cidadeFinal,
          produtos: produtosList,
          entidadesDestaqueIds: ids,
          timestamp: Date.now(),
        }
        localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(stateToSave))
        // Também salvar no sessionStorage para restaurar ao voltar da loja
        sessionStorage.setItem(LOJA_RETURN_STORAGE_KEY, JSON.stringify(stateToSave))
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

  // Verificar se está voltando do checkout ou da loja e restaurar busca
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
        return
      } catch (err) {
        console.error('Erro ao restaurar estado do checkout:', err)
        sessionStorage.removeItem(CHECKOUT_RETURN_STORAGE_KEY)
      }
    }

    // Verifica se há estado salvo da loja para restaurar
    const lojaReturnState = sessionStorage.getItem(LOJA_RETURN_STORAGE_KEY)
    
    if (lojaReturnState) {
      try {
        const state: SavedSearchState = JSON.parse(lojaReturnState)
        
        // Restaurar busca se houver
        if (state.busca && state.cidadeId) {
          console.log('🔄 [HomePage] Restaurando busca após voltar da loja:', state.busca)
          setBusca(state.busca)
          setCidadeId(state.cidadeId)
          
          // Se houver produtos salvos, restaurar também
          if (state.produtos && state.produtos.length > 0) {
            setProdutos(state.produtos)
            setEntidadesDestaqueIds(state.entidadesDestaqueIds || [])
            setBuscaRealizada(true)
            setResultadosBuscaInteligente(state.produtos.map((p: any) => ({
              produto: p,
              entidade: p.entidade,
              score: 100,
              matchType: 'produto' as const,
              hasPromocao: p.emPromocao || false,
              preco: p.precoFinal || p.precoAtual,
            })))
            // Restaurar modo resultadoBusca
            setHomeModo('resultadoBusca')
            closeProduct()
          } else {
            // Se não houver produtos salvos, executar busca novamente
            buscarComParametros(state.busca, state.cidadeId)
          }
        }
        
        // Limpar o estado da loja após restaurar
        sessionStorage.removeItem(LOJA_RETURN_STORAGE_KEY)
      } catch (err) {
        console.error('Erro ao restaurar estado da loja:', err)
        sessionStorage.removeItem(LOJA_RETURN_STORAGE_KEY)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Limpar estado anterior da loja ao fazer nova busca
        sessionStorage.removeItem(LOJA_RETURN_STORAGE_KEY)
        setBusca(query)
        setCidadeId(cidadeId)
        // Disparar evento para atualizar o input no BuscaHeader
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('feiralivre:atualizarBusca', {
            detail: { query }
          }))
        }
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
      setResultadosBuscaInteligente([])
      setErroCidade('')
      
      // Voltar para modo exploração
      setHomeModo('exploracao')
      closeProduct()
      
      // Limpar estado salvo da loja também
      sessionStorage.removeItem(LOJA_RETURN_STORAGE_KEY)
      localStorage.removeItem(SEARCH_STORAGE_KEY)
      
      // Disparar evento para limpar o input no BuscaHeader
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('feiralivre:atualizarBusca', {
          detail: { query: '' }
        }))
      }
      
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

  // Limpar produtos e restaurar estado quando busca estiver vazia
  useEffect(() => {
    // Se está restaurando do checkout, não limpa produtos
    if (typeof window !== 'undefined' && sessionStorage.getItem(CHECKOUT_RETURN_STORAGE_KEY)) {
      return
    }
    
    // Se a busca foi limpa (está vazia), restaurar estado original IMEDIATAMENTE
    if (!busca.trim()) {
      // Se havia produtos ou busca realizada, limpar tudo
      if (produtos.length > 0 || buscaRealizada || resultadosBuscaInteligente.length > 0) {
        console.log('🧹 [HomePage] Busca vazia - restaurando estado original')
        setProdutos([])
        setEntidadesDestaqueIds([])
        setBuscaRealizada(false)
        setResultadosBuscaInteligente([])
        setErroCidade('')
        
        // Limpar cache de buscas relacionadas a esta cidade (opcional, para forçar refresh)
        // Não limpar tudo, apenas buscas da cidade atual se necessário
        if (cidadeId) {
          // Limpar apenas buscas antigas da cidade (manter cache de entidades)
          // O cache de buscas será naturalmente expirado pelo TTL
        }
        
        // Voltar para modo exploração
        setHomeModo('exploracao')
        closeProduct()
        
        // Recarregar entidades se houver cidade selecionada
        // Não verificar se entidades.length === 0, pois pode ter sido filtrado
        if (cidadeId && !entidadesApi.isLoading && !carregandoEntidades) {
          console.log('🔄 [HomePage] Recarregando entidades após limpar busca')
          // Verificar cache primeiro
          const cacheKey = `entidades:${cidadeId}`
          const cachedEntidades = cache.get<any[]>(cacheKey)
          
          if (cachedEntidades && Array.isArray(cachedEntidades) && cachedEntidades.length > 0) {
            console.log('✅ [Cache] Usando entidades do cache após limpar busca')
            setEntidades(cachedEntidades)
          } else {
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, produtos.length, cidadeId])

  // Se estiver visualizando uma loja, não mostrar conteúdo da home
  if (navState.currentView === 'loja') {
    return <DynamicContent />
  }

  // Função para salvar estado da busca antes de navegar para loja
  const salvarEstadoBusca = useCallback(() => {
    if (busca.trim() && cidadeId) {
      const stateToSave: SavedSearchState = {
        busca: busca,
        cidadeId: cidadeId,
        produtos: produtos,
        entidadesDestaqueIds: entidadesDestaqueIds,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(LOJA_RETURN_STORAGE_KEY, JSON.stringify(stateToSave))
      console.log('💾 [HomePage] Estado da busca salvo antes de navegar para loja:', busca)
    }
  }, [busca, cidadeId, produtos, entidadesDestaqueIds])

  const handleBuscaRapida = useCallback((query: string) => {
    if (cidadeId) {
      // Limpar estado anterior da loja ao fazer nova busca
      sessionStorage.removeItem(LOJA_RETURN_STORAGE_KEY)
      // Atualizar o estado de busca para que apareça no input
      setBusca(query)
      // Disparar evento para atualizar o input no BuscaHeader
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('feiralivre:atualizarBusca', {
          detail: { query }
        }))
      }
      // Executar a busca
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
      // Se busca estiver vazia, restaurar estado original
      console.log('🧹 [HomePage] Busca vazia no submit - restaurando estado')
      setProdutos([])
      setEntidadesDestaqueIds([])
      setBuscaRealizada(false)
      setResultadosBuscaInteligente([])
      setHomeModo('exploracao')
      closeProduct()
      
      // Recarregar entidades se necessário
      if (cidadeId && entidades.length === 0) {
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
  }, [cidadeId, busca, buscarComParametros, entidades.length, entidadesApi, closeProduct])

  return (
    <>
      {/* TÍTULO E BOTÕES RÁPIDOS - Busca está no header */}
      <section className="py-4 sm:py-6 md:py-8 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Encontre os melhores produtos pelo melhor preço!
            </h1>
          
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
        <section id="mapa-container" className="py-4 sm:py-6 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Layout Desktop: Lista (30%) + Mapa (70%) */}
            <div className="hidden lg:flex gap-6 h-[calc(100vh-300px)] min-h-[600px]">
              {/* Lista Lateral - 30% width */}
              <div className="w-[30%] flex-shrink-0 flex flex-col">
                {/* Toggle de modo de visualização */}
                {homeModo === 'resultadoBusca' && produtos.length > 0 && (
                  <ViewModeToggle hasSearch={true} />
                )}
                
                <div className="flex-1 min-h-0">
                  {cartOpen ? (
                    // Lista tem prioridade - não renderizar nada aqui, lista é renderizada globalmente
                    homeModo === 'resultadoBusca' && produtos.length > 0 ? (
                      <ListaResultadosProdutos
                        produtos={produtos}
                        highlightedEntityId={highlightedEntityId}
                        onEntityHover={setHighlightedEntityId}
                        onProdutoClick={openProduct}
                        userLocation={userLocation}
                      />
                    ) : (
                    <ListaEntidadesProdutosLateral
                      key="lista-entidades-cart-open"
                      entidades={entidades}
                      produtos={[]}
                      resultadosBusca={[]}
                      busca=""
                      cidadeId={cidadeId}
                      highlightedEntityId={highlightedEntityId}
                      onEntityHover={setHighlightedEntityId}
                      onEntityClick={(id) => {
                        setHighlightedEntityId(id)
                        salvarEstadoBusca()
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                          setTimeout(() => {
                            navigateToLoja(id)
                          }, 0)
                        }
                      }}
                      onSalvarEstadoBusca={salvarEstadoBusca}
                    />
                  )
                ) : homeModo === 'detalheProduto' && selectedProduct ? (
                  <PainelDetalheProduto
                    produto={selectedProduct}
                    onClose={() => {
                      closeProduct()
                      if (busca.trim() && produtos.length > 0) {
                        setHomeModo('resultadoBusca')
                      } else {
                        setHomeModo('exploracao')
                      }
                    }}
                  />
                ) : homeModo === 'resultadoBusca' && produtos.length > 0 ? (
                  <ListaResultadosProdutos
                    produtos={produtos}
                    highlightedEntityId={highlightedEntityId}
                    onEntityHover={setHighlightedEntityId}
                    onProdutoClick={openProduct}
                    userLocation={userLocation}
                  />
                ) : (
                  <ListaEntidadesProdutosLateral
                    key="lista-entidades-default"
                    entidades={entidades}
                    produtos={[]}
                    resultadosBusca={[]}
                    busca=""
                    cidadeId={cidadeId}
                    highlightedEntityId={highlightedEntityId}
                    onEntityHover={setHighlightedEntityId}
                    onEntityClick={(id) => {
                      setHighlightedEntityId(id)
                      salvarEstadoBusca()
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                        setTimeout(() => {
                          navigateToLoja(id)
                        }, 0)
                      }
                    }}
                    onSalvarEstadoBusca={salvarEstadoBusca}
                  />
                )}
                </div>
              </div>

              {/* Mapa - 70% width */}
              <div className="flex-1 min-w-0 h-full">
                {entidadesApi.isLoading && !busca.trim() && produtos.length === 0 ? (
                  <div className="relative w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Carregando lojas no mapa..." />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
                    <Map
                      entidades={homeModo === 'resultadoBusca' && busca.trim() && produtos.length > 0 ? entidades.filter(e => entidadesDestaqueIds.includes(e.id)) : entidades}
                      produtos={homeModo === 'resultadoBusca' && busca.trim() && produtos.length > 0 ? produtos : []}
                      entidadesDestaqueIds={viewMode === 'BEST_PRICE' && top3EntityIds.length > 0 ? top3EntityIds : entidadesDestaqueIds}
                      top3EntityIds={viewMode === 'BEST_PRICE' ? top3EntityIds : []}
                      isLoading={isSearching}
                      highlightedEntityId={highlightedEntityId}
                      onEntityHover={setHighlightedEntityId}
                      onEntityClick={(id) => {
                        setHighlightedEntityId(id)
                        salvarEstadoBusca()
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                          setTimeout(() => {
                            navigateToLoja(id)
                          }, 0)
                        }
                      }}
                      showProductPanel={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Layout Mobile: Mapa full screen + Drawer lateral */}
            <div className="lg:hidden">
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                {entidadesApi.isLoading && !busca.trim() && produtos.length === 0 ? (
                  <div className="relative w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Carregando lojas no mapa..." />
                  </div>
                ) : (
                  <Map
                    entidades={homeModo === 'resultadoBusca' && busca.trim() && produtos.length > 0 ? entidades.filter(e => entidadesDestaqueIds.includes(e.id)) : entidades}
                    produtos={homeModo === 'resultadoBusca' && busca.trim() && produtos.length > 0 ? produtos : []}
                    entidadesDestaqueIds={viewMode === 'BEST_PRICE' && top3EntityIds.length > 0 ? top3EntityIds : entidadesDestaqueIds}
                    top3EntityIds={viewMode === 'BEST_PRICE' ? top3EntityIds : []}
                    isLoading={isSearching}
                    highlightedEntityId={highlightedEntityId}
                    onEntityHover={setHighlightedEntityId}
                    onEntityClick={(id) => {
                      setHighlightedEntityId(id)
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                        setTimeout(() => {
                          navigateToLoja(id)
                        }, 0)
                      }
                    }}
                  />
                )}
              </div>

              {/* Drawer Lateral Mobile - sempre usar drawer no mobile */}
              <DrawerLateral
                entidades={homeModo === 'exploracao' ? entidades : []}
                produtos={homeModo === 'resultadoBusca' ? produtos : []}
                resultadosBusca={homeModo === 'resultadoBusca' ? resultadosBuscaInteligente : []}
                busca={busca}
                cidadeId={cidadeId}
                highlightedEntityId={highlightedEntityId}
                onEntityHover={setHighlightedEntityId}
                onEntityClick={(id) => {
                  setHighlightedEntityId(id)
                  salvarEstadoBusca()
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('lojaReturnUrl', window.location.pathname)
                    setTimeout(() => {
                      navigateToLoja(id)
                    }, 0)
                  }
                }}
                onSalvarEstadoBusca={salvarEstadoBusca}
                homeModo={homeModo}
                produtoSelecionado={selectedProduct}
                onProdutoClick={openProduct}
                onFecharDetalhe={() => {
                  closeProduct()
                  if (busca.trim() && produtos.length > 0) {
                    setHomeModo('resultadoBusca')
                  } else {
                    setHomeModo('exploracao')
                  }
                }}
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
