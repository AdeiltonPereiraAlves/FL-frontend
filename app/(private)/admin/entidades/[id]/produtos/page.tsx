'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Loader2, ArrowLeft, Plus, Edit, Trash2, Package, X } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
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
import { useProdutosEntidade } from '@/hooks/useProdutosEntidade'
import { useEntidadesAdmin } from '@/hooks/useEntidadesAdmin'
import { useProdutoAdmin } from '@/hooks/useProdutoAdmin'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { EditarProdutoFormCompleto } from '@/components/admin/EditarProdutoFormCompleto'

type ViewMode = 'list' | 'create' | 'edit'

export default function ProdutosEntidadePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { buscarEntidadePorId } = useEntidadesAdmin()
  const { listarProdutos, excluirProduto, criarProduto, atualizarProduto, isLoading: produtosLoading } = useProdutosEntidade()

  const [entidade, setEntidade] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [produtoEditandoId, setProdutoEditandoId] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const entidadeId = params?.id as string

  // Carregar produto completo quando estiver editando
  const { produto: produtoCompleto, carregarProduto } = useProdutoAdmin(
    viewMode === 'edit' ? produtoEditandoId : null
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  const carregarDados = async () => {
    if (!entidadeId) return
    try {
      const [entidadeData, produtosData] = await Promise.all([
        buscarEntidadePorId(entidadeId),
        listarProdutos(entidadeId),
      ])
      setEntidade(entidadeData)
      setProdutos(produtosData.produtos || [])
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao carregar dados',
        variant: 'destructive',
      })
      router.push('/admin/entidades')
    }
  }

  useEffect(() => {
    if (entidadeId) {
      carregarDados()
    }
  }, [entidadeId])

  const handleExcluir = async () => {
    if (!produtoParaExcluir) return
    setExcluindo(true)
    try {
      await excluirProduto(produtoParaExcluir)
      toast({
        title: 'Sucesso!',
        description: 'Produto excluído com sucesso',
      })
      await carregarDados()
      setProdutoParaExcluir(null)
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error)
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao excluir produto',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
    }
  }

  const handleCriarProduto = () => {
    setViewMode('create')
    setProdutoEditandoId(null)
  }

  const handleEditarProduto = (produtoId: string) => {
    setProdutoEditandoId(produtoId)
    setViewMode('edit')
  }

  const handleVoltarLista = () => {
    setViewMode('list')
    setProdutoEditandoId(null)
  }

  const handleSalvarProduto = async (dados: any) => {
    if (!entidadeId) return
    setSalvando(true)
    try {
      let produtoSalvo: any = null
      
      if (viewMode === 'create') {
        produtoSalvo = await criarProduto(entidadeId, dados)
        toast({
          title: 'Sucesso!',
          description: 'Produto criado com sucesso',
        })
        
        // Atualização otimista: adicionar produto à lista imediatamente
        if (produtoSalvo) {
          setProdutos((prev) => [produtoSalvo, ...prev])
        }
      } else if (viewMode === 'edit' && produtoEditandoId) {
        produtoSalvo = await atualizarProduto(produtoEditandoId, dados)
        toast({
          title: 'Sucesso!',
          description: 'Produto atualizado com sucesso',
        })
        
        // Atualização otimista: atualizar produto na lista imediatamente
        if (produtoSalvo) {
          setProdutos((prev) =>
            prev.map((p) => (p.id === produtoEditandoId ? produtoSalvo : p))
          )
        }
      }
      
      // Voltar para lista imediatamente (sem esperar recarregar tudo)
      handleVoltarLista()
      
      // Recarregar dados em background para garantir sincronização
      carregarDados().catch((err) => {
        console.error('Erro ao recarregar dados em background:', err)
      })
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error)
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao salvar produto',
        variant: 'destructive',
      })
      throw error
    } finally {
      setSalvando(false)
    }
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
          >
            {/* Header sempre visível com botão voltar */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/admin/entidades">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Entidades
                  </Button>
                </Link>
                {viewMode !== 'list' && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleVoltarLista}
                    disabled={salvando}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Lista
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  {authLoading || produtosLoading || !entidade ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#15803D]" />
                      <h1 className="text-3xl font-bold text-foreground">Carregando...</h1>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Package className="h-8 w-8 text-[#15803D]" />
                        Produtos de {entidade.nome}
                      </h1>
                      <p className="mt-1 text-muted-foreground">
                        {viewMode === 'list' 
                          ? 'Gerencie os produtos desta entidade'
                          : viewMode === 'create'
                          ? 'Crie um novo produto'
                          : 'Edite as informações do produto'}
                      </p>
                    </>
                  )}
                </div>
                {viewMode === 'list' && !authLoading && !produtosLoading && entidade && (
                  <Button 
                    className="bg-[#15803D] hover:bg-[#15803D]/90"
                    onClick={handleCriarProduto}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                )}
              </div>
            </div>

            {/* Conteúdo com animação de transição */}
            {authLoading || produtosLoading || !entidade ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#15803D] mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Produtos ({produtos.length})</CardTitle>
                        <CardDescription>
                          Lista de todos os produtos desta entidade
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {produtos.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
                          <Button 
                            className="bg-[#15803D] hover:bg-[#15803D]/90"
                            onClick={handleCriarProduto}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeiro Produto
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Foto</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Destaque</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {produtos.map((produto) => (
                                <TableRow key={produto.id}>
                                  <TableCell>
                                    {produto.foto ? (
                                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                        <Image
                                          src={produto.foto}
                                          alt={produto.nome}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : produto.fotos && produto.fotos.length > 0 ? (
                                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                        <Image
                                          src={produto.fotos[0].url || produto.fotos[0]}
                                          alt={produto.nome}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {produto.nome}
                                  </TableCell>
                                  <TableCell>
                                    {produto.emPromocao && produto.precoDesconto ? (
                                      <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground line-through">
                                          R$ {produto.precoAtual?.toFixed(2) || '0.00'}
                                        </span>
                                        <span className="font-semibold text-[#15803D]">
                                          R$ {produto.precoDesconto?.toFixed(2) || '0.00'}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-semibold">
                                        R$ {produto.precoAtual?.toFixed(2) || '0.00'}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <Badge
                                        className={
                                          produto.ativo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }
                                      >
                                        {produto.ativo ? 'Ativo' : 'Inativo'}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={
                                          produto.visivel
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }
                                      >
                                        {produto.visivel ? 'Visível' : 'Oculto'}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {produto.destaque ? (
                                      <Badge className="bg-yellow-100 text-yellow-800">
                                        Destaque
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">Normal</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditarProduto(produto.id)}
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => setProdutoParaExcluir(produto.id)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Excluir
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Tem certeza que deseja excluir o produto "{produto.nome}"?
                                              Esta ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel
                                              onClick={() => setProdutoParaExcluir(null)}
                                            >
                                              Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={handleExcluir}
                                              disabled={excluindo}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              {excluindo ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                  Excluindo...
                                                </>
                                              ) : (
                                                'Excluir'
                                              )}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
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
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === 'create' ? (
                    <EditarProdutoFormCompleto
                      produto={null}
                      onSave={handleSalvarProduto}
                      onCancel={handleVoltarLista}
                      isLoading={salvando}
                    />
                  ) : viewMode === 'edit' && produtoCompleto ? (
                    <EditarProdutoFormCompleto
                      produto={produtoCompleto}
                      onSave={handleSalvarProduto}
                      onCancel={handleVoltarLista}
                      isLoading={salvando}
                    />
                  ) : viewMode === 'edit' ? (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#15803D] mx-auto mb-4" />
                          <p className="text-muted-foreground">Carregando produto...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </motion.div>
              )}
              </AnimatePresence>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
