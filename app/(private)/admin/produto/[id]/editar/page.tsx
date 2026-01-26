'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Package, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRole } from '@/hooks/useRole'
import { useProdutoAdmin } from '@/hooks/useProdutoAdmin'
import { EditarProdutoImagens } from '@/components/admin/EditarProdutoImagens'
import { EditarProdutoInformacoes } from '@/components/admin/EditarProdutoInformacoes'
import { useApiContext } from '@/contexts/ApiContext'

/**
 * Página dedicada para edição completa de produtos
 * Dividida em duas seções principais: Imagens e Informações
 * Permite salvar cada seção independentemente
 */
export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useApiContext()
  const { toast } = useToast()
  const { isDonoSistema, isAdmin } = useRole()

  const produtoId = resolvedParams.id
  const { produto, isLoading, error, carregarProduto, atualizarProduto } = useProdutoAdmin(produtoId)

  const [activeTab, setActiveTab] = useState<'imagens' | 'informacoes'>('imagens')
  const [salvandoImagens, setSalvandoImagens] = useState(false)
  const [salvandoInformacoes, setSalvandoInformacoes] = useState(false)

  // Página anterior para voltar
  const paginaAnterior = searchParams.get('from') || '/admin/entidades'

  // Verificar permissões
  if (!isDonoSistema() && !isAdmin()) {
    router.push('/')
    return null
  }

  const handleSalvarImagens = async (fotos: any[]) => {
    if (!produtoId || !api) return

    setSalvandoImagens(true)
    try {
      await api.put(`/produto/${produtoId}/fotos`, { fotos })
      
      // Atualizar produto local
      atualizarProduto({ fotos })
      
      // Recarregar produto para garantir sincronização
      await carregarProduto()
      
      toast({
        title: '✅ Imagens salvas com sucesso!',
        description: 'As imagens do produto foram atualizadas.',
      })
    } catch (err: any) {
      console.error('Erro ao salvar imagens:', err)
      toast({
        title: 'Erro ao salvar imagens',
        description: err.message || 'Não foi possível salvar as imagens.',
        variant: 'destructive',
      })
      throw err
    } finally {
      setSalvandoImagens(false)
    }
  }

  const handleSalvarInformacoes = async (dados: any) => {
    if (!produtoId || !api) return

    setSalvandoInformacoes(true)
    try {
      const { fotos, tags, atributos, variacoes, ...dadosBasicos } = dados

      // Atualizar dados básicos
      await api.put(`/produto/${produtoId}`, dadosBasicos)

      // Atualizar relacionamentos se existirem
      if (tags !== undefined) {
        await api.put(`/produto/${produtoId}/tags`, { 
          tags: Array.isArray(tags) ? tags : [] 
        })
      }
      
      if (atributos !== undefined) {
        await api.put(`/produto/${produtoId}/atributos`, { 
          atributos: Array.isArray(atributos) ? atributos : [] 
        })
      }
      
      if (variacoes !== undefined) {
        await api.put(`/produto/${produtoId}/variacoes`, { 
          variacoes: Array.isArray(variacoes) ? variacoes : [] 
        })
      }

      // Recarregar produto completo para garantir sincronização
      await carregarProduto()
      
      toast({
        title: '✅ Informações salvas com sucesso!',
        description: 'As informações do produto foram atualizadas.',
      })
    } catch (err: any) {
      console.error('Erro ao salvar informações:', err)
      toast({
        title: 'Erro ao salvar informações',
        description: err.message || 'Não foi possível salvar as informações.',
        variant: 'destructive',
      })
      throw err
    } finally {
      setSalvandoInformacoes(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col lg:pl-64">
          <main className="flex-1 p-4 md:p-8 lg:p-10">
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#15803D] mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando informações do produto...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !produto) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col lg:pl-64">
          <main className="flex-1 p-4 md:p-8 lg:p-10">
            <Button
              variant="ghost"
              onClick={() => router.push(paginaAnterior)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Produto não encontrado'}
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          {/* Header da página */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(paginaAnterior)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Editar Produto
                </h1>
                <p className="text-muted-foreground mt-1">
                  {produto.nome}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs de navegação */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('imagens')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'imagens'
                      ? 'border-[#15803D] text-[#15803D]'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imagens do Produto
                </div>
              </button>
              <button
                onClick={() => setActiveTab('informacoes')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === 'informacoes'
                      ? 'border-[#15803D] text-[#15803D]'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações do Produto
                </div>
              </button>
            </nav>
          </div>

          {/* Conteúdo das tabs */}
          <div className="mt-6">
            {activeTab === 'imagens' && (
              <EditarProdutoImagens
                produto={produto}
                onSave={handleSalvarImagens}
                isLoading={salvandoImagens}
                onFotoRemovida={carregarProduto}
              />
            )}

            {activeTab === 'informacoes' && (
              <EditarProdutoInformacoes
                produto={produto}
                onSave={handleSalvarInformacoes}
                isLoading={salvandoInformacoes}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
