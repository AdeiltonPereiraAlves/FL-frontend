'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useApiContext } from '@/contexts/ApiContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Loader2,
  Check,
  Trash2,
  MessageCircle,
  Eye,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Sugestao {
  id: string
  nome: string | null
  mensagem: string
  createdAt: string
  lida: boolean
}

export default function AdminSugestoesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const api = useApiContext()
  const { toast } = useToast()

  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [loading, setLoading] = useState(true)
  const [marcandoLida, setMarcandoLida] = useState<string | null>(null)
  const [sugestaoParaExcluir, setSugestaoParaExcluir] = useState<Sugestao | null>(null)
  const [sugestaoEmVisualizacao, setSugestaoEmVisualizacao] = useState<Sugestao | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  const temAcessoAdmin = isAuthenticated && (isDonoSistema() || isAdmin())

  useEffect(() => {
    if (!api || !temAcessoAdmin) return
    let cancelled = false
    setLoading(true)
    api
      .get<Sugestao[]>('/admin/sugestoes')
      .then((data) => {
        if (!cancelled) setSugestoes(data || [])
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Erro ao carregar sugestões:', error)
          toast({
            title: 'Erro',
            description: 'Erro ao carregar sugestões',
            variant: 'destructive',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- api é estável; evitar loop com temAcessoAdmin
  }, [temAcessoAdmin])

  const handleMarcarLida = async (id: string) => {
    if (!api) return
    setMarcandoLida(id)
    try {
      await api.patch(`/admin/sugestoes/${id}/lida`)
      setSugestoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, lida: true } : s))
      )
      toast({
        title: 'Sucesso',
        description: 'Sugestão marcada como lida',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao marcar como lida',
        variant: 'destructive',
      })
    } finally {
      setMarcandoLida(null)
    }
  }

  const handleExcluir = async () => {
    if (!api || !sugestaoParaExcluir) return
    setExcluindo(true)
    try {
      await api.delete(`/admin/sugestoes/${sugestaoParaExcluir.id}`)
      setSugestoes((prev) => prev.filter((s) => s.id !== sugestaoParaExcluir.id))
      toast({
        title: 'Sucesso',
        description: 'Sugestão excluída com sucesso',
      })
      setSugestaoParaExcluir(null)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir sugestão',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
    }
  }

  const formatarData = (dataStr: string) => {
    const d = new Date(dataStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-[#15803D]" />
              Sugestões e Melhorias
            </h1>
            <p className="mt-1 text-muted-foreground">
              Sugestões enviadas pelos visitantes da plataforma
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Lista de sugestões
                  {sugestoes.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {sugestoes.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
                  </div>
                ) : sugestoes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma sugestão recebida ainda.</p>
                    <p className="text-sm mt-1">
                      As sugestões enviadas pelo formulário no rodapé aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead className="min-w-[200px]">Mensagem</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sugestoes.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">
                              {s.nome?.trim() || 'Anônimo'}
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <div className="flex items-center gap-2">
                                <span className="truncate flex-1 min-w-0">
                                  {s.mensagem}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSugestaoEmVisualizacao(s)}
                                  className="flex-shrink-0 h-8 px-2 text-muted-foreground hover:text-[#15803D]"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatarData(s.createdAt)}
                            </TableCell>
                            <TableCell>
                              {s.lida ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Lida
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Não lida</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!s.lida && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarcarLida(s.id)}
                                    disabled={marcandoLida === s.id}
                                  >
                                    {marcandoLida === s.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Marcar como lida
                                      </>
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setSugestaoParaExcluir(s)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      <Dialog
        open={!!sugestaoEmVisualizacao}
        onOpenChange={(open) => !open && setSugestaoEmVisualizacao(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Sugestão de {sugestaoEmVisualizacao?.nome?.trim() || 'Anônimo'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {sugestaoEmVisualizacao?.mensagem}
            </p>
            {sugestaoEmVisualizacao && (
              <p className="text-sm text-muted-foreground mt-4">
                Enviada em {formatarData(sugestaoEmVisualizacao.createdAt)}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!sugestaoParaExcluir}
        onOpenChange={(open) => !open && setSugestaoParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sugestão?</AlertDialogTitle>
            <AlertDialogDescription>
              {sugestaoParaExcluir && (
                <>
                  Esta ação não pode ser desfeita. A sugestão de{' '}
                  <strong>{sugestaoParaExcluir.nome?.trim() || 'Anônimo'}</strong>{' '}
                  será permanentemente removida.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleExcluir()
              }}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluindo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir sugestão'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
