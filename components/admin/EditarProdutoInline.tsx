'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Image as ImageIcon, X } from 'lucide-react'
import { EditarProdutoImagens } from './EditarProdutoImagens'
import { EditarProdutoInformacoes } from './EditarProdutoInformacoes'
import { useApiContext } from '@/contexts/ApiContext'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface EditarProdutoInlineProps {
  produtoId: string
  onSave: () => Promise<void>
  onCancel: () => void
}

/**
 * Componente inline para edição completa de produto
 * Similar ao EditarEntidadeForm, mas para produtos
 * Dividido em duas tabs: Imagens e Informações
 */
export function EditarProdutoInline({
  produtoId,
  onSave,
  onCancel,
}: EditarProdutoInlineProps) {
  const api = useApiContext()
  const { toast } = useToast()
  
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salvandoImagens, setSalvandoImagens] = useState(false)
  const [salvandoInformacoes, setSalvandoInformacoes] = useState(false)

  useEffect(() => {
    async function carregarProduto() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.get(`/produto/${produtoId}/completo`)
        console.log('📦 [EditarProdutoInline] Dados recebidos do backend:', data)
        console.log('📦 [EditarProdutoInline] Atributos recebidos:', data?.atributos)
        console.log('📦 [EditarProdutoInline] Variações recebidas:', data?.variacoes)
        console.log('📦 [EditarProdutoInline] Tags recebidas:', data?.tags)
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

    if (produtoId) {
      carregarProduto()
    }
  }, [produtoId, api, toast])

  const handleSalvarImagens = async (fotos: any[]) => {
    setSalvandoImagens(true)
    try {
      // Se fotos está vazio, significa que foi apenas um upload (já salvo no banco)
      // Apenas recarregar o produto
      if (fotos.length === 0) {
        console.log('🔄 [EditarProdutoInline] Apenas recarregando produto (upload já foi salvo)...')
      } else {
        console.log('💾 [EditarProdutoInline] Salvando fotos:', fotos.length, 'imagens')
        console.log('💾 [EditarProdutoInline] Fotos para salvar:', fotos)
        
        // Salvar no backend (caso de edição manual de fotos)
        await api.put(`/produto/${produtoId}/fotos`, { fotos })
        console.log('✅ [EditarProdutoInline] Fotos salvas no backend com sucesso')
      }
      
      // Recarregar dados do produto para garantir sincronização e atualizar a lista
      await recarregarProduto()
      
      // Notificar componente pai para recarregar lista (atualização automática)
      await onSave()
      
      console.log('✅ [EditarProdutoInline] Lista de imagens atualizada automaticamente')
      
      // O toast já foi mostrado no EditarProdutoImagens, não precisa duplicar
    } catch (err: any) {
      console.error('❌ [EditarProdutoInline] Erro ao salvar imagens:', err)
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

  /**
   * Recarrega os dados do produto do backend
   * Usado após remoção de foto para garantir sincronização
   */
  const recarregarProduto = async () => {
    console.log('🔄 [EditarProdutoInline] Recarregando dados do produto...')
    const data = await api.get(`/produto/${produtoId}/completo`)
    console.log('✅ [EditarProdutoInline] Produto recarregado:', data?.fotos?.length, 'imagens')
    console.log('✅ [EditarProdutoInline] URLs das fotos:', data?.fotos?.map((f: any) => f.url))
    
    // Atualizar estado do produto (isso vai disparar o useEffect no EditarProdutoImagens)
    setProduto(data)
  }

  /**
   * Callback chamado após remover uma foto individual
   * Recarrega o produto para garantir sincronização
   */
  const handleFotoRemovida = async () => {
    await recarregarProduto()
  }

  const handleSalvarInformacoes = async (dados: any) => {
    setSalvandoInformacoes(true)
    try {
      // MVP: Separar dados básicos, preços, tags e atributos (não usar variações)
      const { fotos, tags, atributos, preco, precoPromo, estoque, ...dadosBasicos } = dados

      console.log('💾 [EditarProdutoInline] Salvando dados:', {
        dadosBasicos,
        preco,
        precoPromo,
        estoque,
        tags: tags?.length || 0,
        atributos: atributos?.length || 0,
      })

      // Atualizar dados básicos + preços (preços serão salvos em ProdutoPrecoHistorico)
      await api.put(`/produto/${produtoId}`, {
        ...dadosBasicos,
        preco, // Será processado no backend para criar ProdutoPrecoHistorico
        precoPromo,
        estoque,
      })

      // Atualizar relacionamentos
      if (Array.isArray(tags)) {
        console.log('🏷️ [EditarProdutoInline] Salvando tags:', tags)
        await api.put(`/produto/${produtoId}/tags`, { tags })
      }
      
      if (Array.isArray(atributos)) {
        console.log('📋 [EditarProdutoInline] Salvando atributos:', atributos)
        await api.put(`/produto/${produtoId}/atributos`, { atributos })
      }

      // MVP: Não atualizar variações (não são usadas no MVP)

      // Recarregar dados do produto
      console.log('🔄 [EditarProdutoInline] Recarregando produto após salvar...')
      const data = await api.get(`/produto/${produtoId}/completo`)
      setProduto(data)
      
      console.log('✅ [EditarProdutoInline] Produto recarregado:', {
        tags: data?.tags?.length || 0,
        atributos: data?.atributos?.length || 0,
        precoAtual: data?.precoAtual,
        precoPromo: data?.precoPromo,
      })
      
      toast({
        title: '✅ Informações salvas com sucesso!',
        description: 'As informações do produto foram atualizadas.',
      })
      
      // Notificar componente pai para recarregar lista
      await onSave()
    } catch (err: any) {
      console.error('❌ [EditarProdutoInline] Erro ao salvar informações:', err)
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
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" text="Carregando informações do produto..." />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !produto) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Produto não encontrado'}</p>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Editar Produto: {produto.nome}
            </CardTitle>
            <CardDescription>
              Gerencie todas as informações e imagens do produto
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="imagens" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="imagens" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="informacoes" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="imagens" className="mt-6">
            {produto && (
              <EditarProdutoImagens
                produto={produto}
                onSave={handleSalvarImagens}
                isLoading={salvandoImagens}
                onFotoRemovida={handleFotoRemovida}
              />
            )}
          </TabsContent>
          
          <TabsContent value="informacoes" className="mt-6">
            <EditarProdutoInformacoes
              produto={produto}
              onSave={handleSalvarInformacoes}
              isLoading={salvandoInformacoes}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
