'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { useApiContext } from '@/contexts/ApiContext'
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
  Filter,
  CheckCircle2,
  XCircle,
  Settings,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type TipoPlano = 'FREE' | 'BASICO' | 'PREMIUM' | 'PREMIUM_MAX'

interface Entidade {
  id: string
  nome: string
  cidade: {
    nome: string
    estado: string
  }
  configuracoes?: Array<{
    chave: string
    valor: any
  }>
  reputacao?: {
    score: number
  }
}

const planosInfo = {
  FREE: { label: 'Gratuito', icon: Store, color: 'bg-gray-500', nivel: 0 },
  BASICO: { label: 'Básico', icon: Zap, color: 'bg-blue-500', nivel: 1 },
  PREMIUM: { label: 'Premium', icon: Star, color: 'bg-yellow-500', nivel: 2 },
  PREMIUM_MAX: { label: 'Premium Max', icon: Crown, color: 'bg-purple-500', nivel: 3 },
}

function obterPlanoEntidade(entidade: Entidade): { tipo: TipoPlano; nivel: number } {
  if (!entidade.configuracoes || entidade.configuracoes.length === 0) {
    return { tipo: 'FREE', nivel: 0 }
  }

  const configPlano = entidade.configuracoes.find((c) => c.chave === 'plano')
  if (!configPlano || !configPlano.valor) {
    return { tipo: 'FREE', nivel: 0 }
  }

  const valor = configPlano.valor as any
  const tipo: TipoPlano = ['FREE', 'BASICO', 'PREMIUM', 'PREMIUM_MAX'].includes(valor.tipo)
    ? valor.tipo
    : 'FREE'
  const nivel = typeof valor.nivel === 'number' && valor.nivel >= 0 && valor.nivel <= 3
    ? valor.nivel
    : 0

  return { tipo, nivel }
}

export default function AdminPlanosPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const api = useApiContext()
  
  // Função para navegar para a página da loja em modo admin
  const handleGerenciarEntidade = (entidadeId: string) => {
    // Salvar flag de que está vindo do admin
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adminEditMode', 'true')
      sessionStorage.setItem('adminReturnUrl', '/admin/planos')
    }
    router.push(`/loja/${entidadeId}?admin=true`)
  }

  const [entidades, setEntidades] = useState<Entidade[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroPlano, setFiltroPlano] = useState<string>('')
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [novoPlano, setNovoPlano] = useState<{ tipo: TipoPlano; nivel: number } | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

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
        `/entidades/planos?${params.toString()}`
      )
      setEntidades(data?.entidades || [])
    } catch (error) {
      console.error('Erro ao carregar entidades:', error)
    } finally {
      setLoading(false)
    }
  }

  async function salvarPlano(entidadeId: string) {
    if (!novoPlano) return

    setSalvando(true)
    try {
      await api.put(`/entidade/${entidadeId}/plano`, {
        tipo: novoPlano.tipo,
        nivel: novoPlano.nivel,
      })

      await carregarEntidades()
      setEditando(null)
      setNovoPlano(null)
    } catch (error) {
      console.error('Erro ao salvar plano:', error)
      alert('Erro ao salvar plano. Tente novamente.')
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" text="Carregando..." />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Planos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os planos das entidades do sistema
          </p>
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
                  value={filtroPlano || undefined} 
                  onValueChange={(value) => setFiltroPlano(value || '')}
                >
                  <SelectTrigger id="filtro-plano">
                    <SelectValue placeholder="Todos os planos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Gratuito</SelectItem>
                    <SelectItem value="BASICO">Básico</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="PREMIUM_MAX">Premium Max</SelectItem>
                  </SelectContent>
                </Select>
                {filtroPlano && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                    onClick={() => setFiltroPlano('')}
                  >
                    Limpar filtro
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de entidades */}
        <div className="space-y-4">
          {entidadesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhuma entidade encontrada</p>
              </CardContent>
            </Card>
          ) : (
            entidadesFiltradas.map((entidade) => {
              const plano = obterPlanoEntidade(entidade)
              const planoInfo = planosInfo[plano.tipo]
              const Icon = planoInfo.icon
              const isEditando = editando === entidade.id

              return (
                <Card key={entidade.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{entidade.nome}</h3>
                          <Badge
                            className={`${planoInfo.color} text-white flex items-center gap-1`}
                          >
                            <Icon className="h-3 w-3" />
                            {planoInfo.label}
                          </Badge>
                          {plano.nivel > 0 && (
                            <Badge variant="outline">Nível {plano.nivel}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entidade.cidade.nome} - {entidade.cidade.estado}
                        </p>
                        {entidade.reputacao && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reputação: {entidade.reputacao.score.toFixed(1)} ⭐
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {isEditando ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Select
                              value={novoPlano?.tipo || plano.tipo}
                              onValueChange={(value) =>
                                setNovoPlano({
                                  tipo: value as TipoPlano,
                                  nivel: planosInfo[value as TipoPlano].nivel,
                                })
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(planosInfo).map(([key, info]) => {
                                  const Icon = info.icon
                                  return (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {info.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => salvarPlano(entidade.id)}
                              disabled={salvando}
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
                                setNovoPlano(null)
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
                                setNovoPlano(plano)
                              }}
                            >
                              Editar Plano
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary-dark text-white"
                              onClick={() => handleGerenciarEntidade(entidade.id)}
                            >
                              <Settings className="h-4 w-4 mr-1.5" />
                              Gerenciar
                            </Button>
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
      </main>
    </div>
  )
}
