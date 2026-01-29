'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Loader2, Plus, Search, Edit, Package, Building2, Filter, Save, X, BarChart3 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEntidadesAdmin } from '@/hooks/useEntidadesAdmin'
import { useApiContext } from '@/contexts/ApiContext'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EntidadeAnalyticsPanel } from '@/components/admin/EntidadeAnalyticsPanel'

interface Entidade {
  id: string
  nome: string
  descricao?: string
  status: 'ATIVA' | 'INATIVA' | 'BLOQUEADA' | 'EM_ANALISE'
  tipo: string
  cidade: {
    id: string
    nome: string
    estado: string
  }
  categoria?: {
    id: string
    nome: string
  }
  responsavel?: {
    id: string
    nome: string
    email: string
  }
  fazEntrega: boolean
  valorMinimoEntrega?: number
  quantidadeProdutos: number
  plano: string
  criadaEm: string
}

export default function AdminEntidadesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const api = useApiContext()
  const { toast } = useToast()
  const { listarEntidades, entidades, paginacao, isLoading, atualizarPlanoEntidade } = useEntidadesAdmin()

  const [nomeBusca, setNomeBusca] = useState('') // Estado separado para busca com debounce
  const [filtros, setFiltros] = useState({
    nome: '',
    cidadeId: '',
    status: '',
    tipoPlano: '',
    page: 1,
    limit: 20,
  })
  const [cidades, setCidades] = useState<Array<{ id: string; nome: string; estado: string }>>([])
  const [planosDisponiveis, setPlanosDisponiveis] = useState<Array<{ id: string; nome: string; descricao?: string; preco?: number | null }>>([])
  const [modalPlanoAberto, setModalPlanoAberto] = useState(false)
  const [entidadeSelecionada, setEntidadeSelecionada] = useState<Entidade | null>(null)
  const [planoSelecionado, setPlanoSelecionado] = useState<{ tipo: string; nivel: number }>({
    tipo: 'FREE',
    nivel: 0,
  })
  const [salvandoPlano, setSalvandoPlano] = useState(false)
  const [entidadeParaAnalytics, setEntidadeParaAnalytics] = useState<Entidade | null>(null)

  // Função para normalizar o nome do plano para o tipo esperado pelo backend
  // IMPORTANTE: O backend aceita "PRO" como nome real no banco, mas normaliza para "BASICO" internamente
  const normalizarTipoPlano = (nomePlano: string): 'FREE' | 'BASICO' | 'PREMIUM' | 'PREMIUM_MAX' => {
    const nomeNormalizado = nomePlano.toUpperCase().trim()
    
    // Mapeamento de variações possíveis para os tipos válidos
    if (nomeNormalizado === 'FREE' || nomeNormalizado === 'GRATUITO' || nomeNormalizado === 'GRÁTIS') {
      return 'FREE'
    }
    // PRO e BASICO são tratados como o mesmo tipo (BASICO) pelo backend
    // Mas o banco pode ter "PRO" como nome real do plano
    if (nomeNormalizado === 'BASICO' || nomeNormalizado === 'BÁSICO' || nomeNormalizado === 'BASIC' || nomeNormalizado === 'PRO') {
      return 'BASICO' // Backend normaliza para BASICO, mas busca "PRO" no banco
    }
    if (nomeNormalizado === 'PREMIUM') {
      return 'PREMIUM'
    }
    if (nomeNormalizado === 'PREMIUM_MAX' || nomeNormalizado === 'PREMIUMMAX' || nomeNormalizado === 'PREMIUM-MAX') {
      return 'PREMIUM_MAX'
    }
    
    // Se não corresponder a nenhum, retornar FREE como padrão seguro
    console.warn(`⚠️ Tipo de plano não reconhecido: "${nomePlano}". Usando FREE como padrão.`)
    return 'FREE'
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  // Carregar cidades para filtro
  useEffect(() => {
    const carregarCidades = async () => {
      if (!api) return
      try {
        const response = await api.get('/cidades')
        setCidades(response || [])
      } catch (error) {
        console.error('Erro ao carregar cidades:', error)
      }
    }
    carregarCidades()
  }, [api])

  // Carregar planos disponíveis do banco
  useEffect(() => {
    const carregarPlanos = async () => {
      if (!api) return
      try {
        const response = await api.get('/planos')
        setPlanosDisponiveis(response || [])
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
      }
    }
    carregarPlanos()
  }, [api])

  // Debounce para busca por nome (aguarda 500ms após parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, nome: nomeBusca, page: 1 }))
    }, 500)

    return () => clearTimeout(timer)
  }, [nomeBusca])

  // Carregar entidades
  useEffect(() => {
    listarEntidades({
      nome: filtros.nome || undefined,
      cidadeId: filtros.cidadeId || undefined,
      status: filtros.status as any,
      tipoPlano: filtros.tipoPlano || undefined,
      page: filtros.page,
      limit: filtros.limit,
    })
  }, [filtros, listarEntidades])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ATIVA: 'bg-green-100 text-green-800',
      INATIVA: 'bg-gray-100 text-gray-800',
      BLOQUEADA: 'bg-red-100 text-red-800',
      EM_ANALISE: 'bg-yellow-100 text-yellow-800',
    }
    return variants[status] || 'bg-gray-100 text-gray-800'
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
      </div>
    )
  }

  if (!isAuthenticated || (!isDonoSistema() && !isAdmin())) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          {/* Mostrar painel de analytics se uma entidade estiver selecionada */}
          {entidadeParaAnalytics ? (
            <EntidadeAnalyticsPanel
              entidadeId={entidadeParaAnalytics.id}
              entidadeNome={entidadeParaAnalytics.nome}
              onVoltar={() => setEntidadeParaAnalytics(null)}
            />
          ) : (
            <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-[#15803D]" />
                  Gerenciar Entidades
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Gerencie todas as entidades do sistema
                </p>
              </div>
              <Link href="/admin/entidades/nova">
                <Button className="bg-[#15803D] hover:bg-[#15803D]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Entidade
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nome</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={nomeBusca}
                        onChange={(e) => {
                          e.preventDefault()
                          setNomeBusca(e.target.value)
                        }}
                        onKeyDown={(e) => {
                          // Prevenir submit de formulário se houver
                          if (e.key === 'Enter') {
                            e.preventDefault()
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cidade</label>
                    <Select
                      value={filtros.cidadeId || "all"}
                      onValueChange={(value) =>
                        setFiltros({ ...filtros, cidadeId: value === "all" ? "" : value, page: 1 })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as cidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        {cidades.map((cidade) => (
                          <SelectItem key={cidade.id} value={cidade.id}>
                            {cidade.nome} - {cidade.estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={filtros.status || "all"}
                      onValueChange={(value) =>
                        setFiltros({ ...filtros, status: value === "all" ? "" : value, page: 1 })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="ATIVA">Ativa</SelectItem>
                        <SelectItem value="INATIVA">Inativa</SelectItem>
                        <SelectItem value="BLOQUEADA">Bloqueada</SelectItem>
                        <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plano</label>
                    <Select
                      value={filtros.tipoPlano || "all"}
                      onValueChange={(value) =>
                        setFiltros({ ...filtros, tipoPlano: value === "all" ? "" : value, page: 1 })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os planos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        <SelectItem value="FREE">Free</SelectItem>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabela */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Entidades ({paginacao?.total || 0})</CardTitle>
                <CardDescription>
                  Lista de todas as entidades cadastradas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
                    <span className="ml-2 text-muted-foreground">Carregando entidades...</span>
                  </div>
                ) : entidades.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma entidade encontrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Cidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Produtos</TableHead>
                          <TableHead>Entrega</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entidades.map((entidade) => (
                          <TableRow key={entidade.id}>
                            <TableCell className="font-medium">
                              {entidade.nome}
                            </TableCell>
                            <TableCell>
                              {entidade.cidade.nome} - {entidade.cidade.estado}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(entidade.status)}>
                                {entidade.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{entidade.plano}</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEntidadeSelecionada(entidade)
                                    // Normalizar o plano da entidade antes de definir no estado
                                    const planoNormalizado = normalizarTipoPlano(entidade.plano || 'FREE')
                                    setPlanoSelecionado({
                                      tipo: planoNormalizado,
                                      nivel: 0,
                                    })
                                    setModalPlanoAberto(true)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                {entidade.quantidadeProdutos}
                              </div>
                            </TableCell>
                            <TableCell>
                              {entidade.fazEntrega ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Sim
                                  {entidade.valorMinimoEntrega &&
                                    ` (R$ ${entidade.valorMinimoEntrega.toFixed(2)})`}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Não</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEntidadeParaAnalytics(entidade)
                                  }}
                                  title="Ver Painel de Métricas"
                                >
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Ver Painel
                                </Button>
                                <Link href={`/admin/entidades/${entidade.id}/editar`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                </Link>
                                <Link href={`/admin/entidades/${entidade.id}/produtos`}>
                                  <Button variant="outline" size="sm">
                                    <Package className="h-4 w-4 mr-1" />
                                    Produtos
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Paginação */}
                {paginacao && paginacao.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {paginacao.page} de {paginacao.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFiltros({ ...filtros, page: filtros.page - 1 })
                        }
                        disabled={filtros.page === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFiltros({ ...filtros, page: filtros.page + 1 })
                        }
                        disabled={filtros.page >= paginacao.totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
            </>
          )}
        </main>

      {/* Modal de Edição de Plano */}
      <Dialog open={modalPlanoAberto} onOpenChange={setModalPlanoAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alterar Plano da Entidade</DialogTitle>
            <DialogDescription>
              {entidadeSelecionada && (
                <>
                  Alterando o plano de <strong>{entidadeSelecionada.nome}</strong>
                  <br />
                  Plano atual: <strong>{entidadeSelecionada.plano}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {entidadeSelecionada && (
            <div className="space-y-4 py-4">
              {/* Seleção do Tipo de Plano */}
              <div className="space-y-2">
                <Label htmlFor="tipo-plano">Tipo de Plano *</Label>
                <Select
                  value={planoSelecionado.tipo}
                  onValueChange={(value) => {
                    // Normalizar o valor antes de definir no estado
                    const tipoNormalizado = normalizarTipoPlano(value)
                    setPlanoSelecionado({
                      ...planoSelecionado,
                      tipo: tipoNormalizado,
                    })
                  }}
                >
                  <SelectTrigger id="tipo-plano">
                    <SelectValue placeholder="Selecione o tipo de plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planosDisponiveis.length > 0 ? (
                      planosDisponiveis.map((plano) => {
                        const getBadgeColor = (nome: string) => {
                          if (nome.includes('PREMIUM')) return 'bg-yellow-100 text-yellow-800'
                          if (nome.includes('PREMIUM') || nome === 'PREMIUM') return 'bg-purple-100 text-purple-800'
                          if (nome === 'FREE') return 'bg-gray-100 text-gray-800'
                          return ''
                        }
                        return (
                          <SelectItem key={plano.id} value={plano.nome}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{plano.nome}</span>
                                {plano.descricao && (
                                  <span className="text-xs text-muted-foreground">
                                    - {plano.descricao}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {plano.preco ? (
                                  <Badge variant="outline" className={getBadgeColor(plano.nome)}>
                                    R$ {plano.preco.toFixed(2)}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className={getBadgeColor(plano.nome)}>
                                    Gratuito
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })
                    ) : (
                      // Fallback se não houver planos carregados
                      <>
                        <SelectItem value="FREE">FREE - Gratuito</SelectItem>
                        <SelectItem value="BASICO">BASICO</SelectItem>
                        <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                        <SelectItem value="PREMIUM_MAX">PREMIUM_MAX</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção do Nível */}
              <div className="space-y-2">
                <Label htmlFor="nivel-plano">Nível (0-3) *</Label>
                <Input
                  id="nivel-plano"
                  type="number"
                  min="0"
                  max="3"
                  value={planoSelecionado.nivel}
                  onChange={(e) =>
                    setPlanoSelecionado({
                      ...planoSelecionado,
                      nivel: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Digite o nível (0-3)"
                />
                <p className="text-xs text-muted-foreground">
                  O nível determina as funcionalidades disponíveis no plano (0 = básico, 3 = máximo)
                </p>
              </div>

              {/* Preview do Plano Selecionado */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <p className="text-sm font-semibold mb-2">Plano Selecionado:</p>
                {(() => {
                  const planoInfo = planosDisponiveis.find(p => p.nome === planoSelecionado.tipo)
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-base">
                          {planoSelecionado.tipo}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Nível {planoSelecionado.nivel}
                        </span>
                      </div>
                      {planoInfo && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {planoInfo.descricao && (
                            <p>{planoInfo.descricao}</p>
                          )}
                          {planoInfo.preco ? (
                            <p className="font-semibold text-foreground">
                              Preço: R$ {planoInfo.preco.toFixed(2)}
                            </p>
                          ) : (
                            <p className="font-semibold text-green-600">Gratuito</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalPlanoAberto(false)
                setEntidadeSelecionada(null)
                setPlanoSelecionado({ tipo: 'FREE', nivel: 0 })
              }}
              disabled={salvandoPlano}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!entidadeSelecionada) return

                setSalvandoPlano(true)
                try {
                  // Normalizar o tipo de plano antes de enviar
                  const tipoNormalizado = normalizarTipoPlano(planoSelecionado.tipo)
                  
                  // Validar se o plano existe no banco (comparar com nome normalizado)
                  const planoExiste = planosDisponiveis.find(p => 
                    normalizarTipoPlano(p.nome) === tipoNormalizado
                  )
                  if (!planoExiste && planosDisponiveis.length > 0) {
                    throw new Error(`Plano "${tipoNormalizado}" não encontrado no banco de dados`)
                  }

                  // Garantir que o tipo seja um dos valores válidos antes de enviar
                  const tiposValidos: Array<'FREE' | 'BASICO' | 'PREMIUM' | 'PREMIUM_MAX'> = ['FREE', 'BASICO', 'PREMIUM', 'PREMIUM_MAX']
                  if (!tiposValidos.includes(tipoNormalizado)) {
                    throw new Error(`Tipo de plano inválido: "${tipoNormalizado}". Deve ser um dos: ${tiposValidos.join(', ')}`)
                  }

                  await atualizarPlanoEntidade(
                    entidadeSelecionada.id,
                    tipoNormalizado,
                    planoSelecionado.nivel
                  )
                  toast({
                    title: 'Plano atualizado!',
                    description: `O plano da entidade "${entidadeSelecionada.nome}" foi alterado para ${tipoNormalizado} (nível ${planoSelecionado.nivel}).`,
                  })
                  setModalPlanoAberto(false)
                  setEntidadeSelecionada(null)
                  setPlanoSelecionado({ tipo: 'FREE', nivel: 0 })
                  
                  // Recarregar lista
                  await listarEntidades({
                    nome: filtros.nome || undefined,
                    cidadeId: filtros.cidadeId || undefined,
                    status: filtros.status as any,
                    tipoPlano: filtros.tipoPlano || undefined,
                    page: filtros.page,
                    limit: filtros.limit,
                  })
                } catch (error: any) {
                  console.error('Erro ao atualizar plano:', error)
                  toast({
                    title: 'Erro ao atualizar plano',
                    description: error.message || 'Ocorreu um erro ao atualizar o plano.',
                    variant: 'destructive',
                  })
                } finally {
                  setSalvandoPlano(false)
                }
              }}
              disabled={salvandoPlano}
              className="bg-[#15803D] hover:bg-[#15803D]/90"
            >
              {salvandoPlano ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Plano
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
