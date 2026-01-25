'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { useApiContext } from '@/contexts/ApiContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, Package, Image as ImageIcon, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditarProdutoImagens } from '@/components/admin/EditarProdutoImagens'
import { EditarProdutoInformacoes } from '@/components/admin/EditarProdutoInformacoes'
import { useToast } from '@/hooks/use-toast'
import { useRole } from '@/hooks/useRole'

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

  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'imagens' | 'informacoes'>('imagens')
  const [salvandoImagens, setSalvandoImagens] = useState(false)
  const [salvandoInformacoes, setSalvandoInformacoes] = useState(false)

  // Página anterior para voltar
  const paginaAnterior = searchParams.get('from') || '/admin/planos'

  useEffect(() => {
    // Verificar permissões
    if (!isDonoSistema() && !isAdmin()) {
      router.push('/')
      return
    }

    async function carregarProduto() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.get(`/produto/${resolvedParams.id}/completo`)
        setProduto(data)
      } catch (err: any) {
        console.error('Erro ao carregar produto:', err)
        setError(err.message || 'Erro ao carregar informações do produto')
        toast({
          title: 'Erro ao carregar produto',
          description: err.message || 'Não foi possível carregar as informações do produto.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams.id) {
      carregarProduto()
    }
  }, [resolvedParams.id, api, router, isDonoSistema, isAdmin, toast])

  const handleSalvarImagens = async (fotos: any[]) => {
    setSalvandoImagens(true)
    try {
      await api.put(`/produto/${resolvedParams.id}/fotos`, { fotos })
      
      // Atualizar produto local
      setProduto({ ...produto, fotos })
      
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
    setSalvandoInformacoes(true)
    try {
      const { fotos, tags, atributos, variacoes, ...dadosBasicos } = dados

      // Atualizar dados básicos
      await api.put(`/produto/${resolvedParams.id}`, dadosBasicos)

      // Atualizar relacionamentos
      await api.put(`/produto/${resolvedParams.id}/tags`, { 
        tags: Array.isArray(tags) ? tags : [] 
      })
      await api.put(`/produto/${resolvedParams.id}/atributos`, { 
        atributos: Array.isArray(atributos) ? atributos : [] 
      })
      await api.put(`/produto/${resolvedParams.id}/variacoes`, { 
        variacoes: Array.isArray(variacoes) ? variacoes : [] 
      })

      // Atualizar produto local
      setProduto({ ...produto, ...dadosBasicos, tags, atributos, variacoes })
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" text="Carregando informações do produto..." />
        </div>
      </div>
    )
  }

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Editar Produto
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {produto.nome}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs de navegação */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('imagens')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'imagens'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
      </div>
    </div>
  )
}
