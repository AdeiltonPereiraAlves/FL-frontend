'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useApiContext } from '@/contexts/ApiContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  Crown,
  Star,
  Zap,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Settings,
  Building2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Plano {
  id: string
  nome: string
  descricao?: string
  preco?: number | null
  destaqueNoMapa: boolean
  aparecePrimeiroBusca: boolean
  podeUsarBanner: boolean
  limiteProdutos?: number | null
  seloDestaque: boolean
}

interface Entidade {
  id: string
  nome: string
  cidade: {
    nome: string
    estado: string
  }
  plano?: string
}

const planosInfo: Record<string, { label: string; icon: any; color: string }> = {
  FREE: { label: 'Gratuito', icon: Store, color: 'bg-gray-500' },
  PRO: { label: 'Pro', icon: Zap, color: 'bg-blue-500' },
  PREMIUM: { label: 'Premium', icon: Crown, color: 'bg-purple-500' },
}

export default function AdminPlanosPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const api = useApiContext()
  const { toast } = useToast()

  const [planos, setPlanos] = useState<Plano[]>([])
  const [entidades, setEntidades] = useState<Entidade[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroPlano, setFiltroPlano] = useState<string>('')
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [novoPlanoId, setNovoPlanoId] = useState<string>('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  // Carregar planos disponíveis
  useEffect(() => {
    const carregarPlanos = async () => {
      try {
        const data = await api.get<Plano[]>('/planos')
        setPlanos(data || [])
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
        toast({
          title: 'Erro',
          description: 'Erro ao carregar planos disponíveis',
          variant: 'destructive',
        })
      }
    }
    if (api) {
      carregarPlanos()
    }
  }, [api, toast])

  // Carregar entidades
  useEffect(() => {
    carregarEntidades()
  }, [filtroPlano])

  async function carregarEntidades() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroPlano) params.append('tipoPlano', filtroPlano)
      params.append('limit', '50')

      const data = await api.get<{ entidades: Entidade[] }>(
        `/admin/entidades?${params.toString()}`
      )
      setEntidades(data?.entidades || [])
    } catch (error) {
      console.error('Erro ao carregar entidades:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar entidades',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function salvarPlano(entidadeId: string) {
    if (!novoPlanoId) return

    setSalvando(true)
    try {
      await api.put(`/entidades/${entidadeId}/plano`, {
        planoId: novoPlanoId,
      })

      toast({
        title: 'Sucesso!',
        description: 'Plano alterado com sucesso',
      })

      await carregarEntidades()
      setEditando(null)
      setNovoPlanoId('')
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error)
      toast({
        title: 'Erro',
        description: error?.response?.data?.erro || 'Erro ao salvar plano',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const entidadesFiltradas = entidades.filter((ent) => {
    if (busca) {
      const buscaLower = busca.toLowerCase()
      return (
        ent.nome.toLowerCase().includes(buscaLower) ||
        ent.cidade.nome.toLowerCase().includes(buscaLower)
      )
    }
    return true
  })

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Crown className="h-8 w-8 text-[#15803D]" />
                Gerenciar Planos
              </h1>
              <p className="mt-1 text-muted-foreground">
                Gerencie os planos das entidades do sistema
              </p>
            </div>

            {/* Cards de Planos Disponíveis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {planos.map((plano) => {
                const info = planosInfo[plano.nome] || {
                  label: plano.nome,
                  icon: Store,
                  color: 'bg-gray-500',
                }
                const Icon = info.icon

                return (
                  <Card key={plano.id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${info.color.replace('bg-', 'text-')}`} />
                        {info.label}
                      </CardTitle>
                      <CardDescription>{plano.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {plano.preco && (
                          <p className="text-2xl font-bold">
                            R$ {plano.preco.toFixed(2)}
                          </p>
                        )}
                        {!plano.preco && (
                          <p className="text-2xl font-bold text-muted-foreground">Gratuito</p>
                        )}
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            {plano.destaqueNoMapa ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Destaque no mapa</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {plano.aparecePrimeiroBusca ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Aparece primeiro na busca</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {plano.podeUsarBanner ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Pode usar banner</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {plano.seloDestaque ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Selo de destaque</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Limite de produtos:{' '}
                              {plano.limiteProdutos === null
                                ? 'Ilimitado'
                                : plano.limiteProdutos}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Filtros */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="busca">Buscar entidade</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="busca"
                        placeholder="Nome da entidade ou cidade..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <Label htmlFor="filtro-plano">Filtrar por plano</Label>
                    <Select
                      value={filtroPlano || 'all'}
                      onValueChange={(value) => setFiltroPlano(value === 'all' ? '' : value)}
                    >
                      <SelectTrigger id="filtro-plano">
                        <SelectValue placeholder="Todos os planos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        {planos.map((plano) => (
                          <SelectItem key={plano.id} value={plano.nome}>
                            {planosInfo[plano.nome]?.label || plano.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de entidades */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
              </div>
            ) : (
              <div className="space-y-4">
                {entidadesFiltradas.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma entidade encontrada</p>
                    </CardContent>
                  </Card>
                ) : (
                  entidadesFiltradas.map((entidade) => {
                    const planoNome = entidade.plano || 'FREE'
                    const info = planosInfo[planoNome] || {
                      label: planoNome,
                      icon: Store,
                      color: 'bg-gray-500',
                    }
                    const Icon = info.icon
                    const isEditando = editando === entidade.id

                    return (
                      <Card key={entidade.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{entidade.nome}</h3>
                                <Badge
                                  className={`${info.color} text-white flex items-center gap-1`}
                                >
                                  <Icon className="h-3 w-3" />
                                  {info.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {entidade.cidade.nome} - {entidade.cidade.estado}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {isEditando ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Select
                                    value={novoPlanoId || 'all'}
                                    onValueChange={(value) =>
                                      setNovoPlanoId(value === 'all' ? '' : value)
                                    }
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue placeholder="Selecione o plano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {planos.map((plano) => {
                                        const planoInfo = planosInfo[plano.nome] || {
                                          label: plano.nome,
                                          icon: Store,
                                        }
                                        const PlanoIcon = planoInfo.icon
                                        return (
                                          <SelectItem key={plano.id} value={plano.id}>
                                            <div className="flex items-center gap-2">
                                              <PlanoIcon className="h-4 w-4" />
                                              {planoInfo.label}
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    onClick={() => salvarPlano(entidade.id)}
                                    disabled={salvando || !novoPlanoId}
                                    className="bg-[#15803D] hover:bg-[#15803D]/90"
                                  >
                                    {salvando ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditando(null)
                                      setNovoPlanoId('')
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditando(entidade.id)
                                      // Buscar plano atual da entidade
                                      const planoAtual = planos.find(
                                        (p) => p.nome === entidade.plano
                                      )
                                      setNovoPlanoId(planoAtual?.id || '')
                                    }}
                                  >
                                    Alterar Plano
                                  </Button>
                                  <Link href={`/admin/entidades/${entidade.id}`}>
                                    <Button
                                      size="sm"
                                      className="bg-[#15803D] hover:bg-[#15803D]/90"
                                    >
                                      <Settings className="h-4 w-4 mr-1.5" />
                                      Gerenciar
                                    </Button>
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
