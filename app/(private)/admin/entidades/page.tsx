'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Loader2, Plus, Search, Edit, Package, Building2, Filter } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useEntidadesAdmin } from '@/hooks/useEntidadesAdmin'
import { useApiContext } from '@/contexts/ApiContext'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const { listarEntidades, entidades, paginacao, isLoading } = useEntidadesAdmin()

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
                              <Badge variant="outline">{entidade.plano}</Badge>
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
        </main>
      </div>
    </div>
  )
}
