'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { EditarProdutoFormCompleto } from '@/components/admin/EditarProdutoFormCompleto'
import { useApiContext } from '@/contexts/ApiContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Edit, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DialogProdutoCompletoProps {
  produtoId: string
  onClose: () => void
  onSave: () => Promise<void>
}

/**
 * Dialog que carrega e exibe o formulário completo de edição de produto
 * Busca todas as informações do produto do backend
 */
export function DialogProdutoCompleto({
  produtoId,
  onClose,
  onSave,
}: DialogProdutoCompletoProps) {
  const api = useApiContext()
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    async function carregarProdutoCompleto() {
      setLoading(true)
      setError(null)
      try {
        console.log('🔄 Carregando produto completo:', produtoId)
        const data = await api.get(`/produto/${produtoId}/completo`)
        console.log('✅ Produto carregado:', data)
        console.log('📸 Fotos do produto:', data.fotos)
        setProduto(data)
      } catch (err: any) {
        console.error('❌ Erro ao carregar produto completo:', err)
        setError(err.message || 'Erro ao carregar informações do produto')
      } finally {
        setLoading(false)
      }
    }

    if (produtoId) {
      carregarProdutoCompleto()
    }
  }, [produtoId, api])

  const handleSave = async (dados: any) => {
    setSalvando(true)
    try {
      // Separar dados básicos de fotos, tags, atributos e variações
      const { fotos, tags, atributos, variacoes, ...dadosBasicos } = dados

      // 1. Atualizar dados básicos do produto (incluindo destaque e perecível)
      await api.put(`/produto/${produtoId}`, dadosBasicos)

      // 2. Atualizar fotos (sempre enviar array, mesmo que vazio)
      const fotosParaEnviar = Array.isArray(fotos) ? fotos : []
      await api.put(`/produto/${produtoId}/fotos`, { fotos: fotosParaEnviar })

      // 3. Atualizar variações (sempre enviar array, mesmo que vazio)
      const variacoesParaEnviar = Array.isArray(variacoes) ? variacoes : []
      await api.put(`/produto/${produtoId}/variacoes`, { variacoes: variacoesParaEnviar })

      // 4. Atualizar tags (sempre enviar array, mesmo que vazio)
      const tagsParaEnviar = Array.isArray(tags) ? tags : []
      await api.put(`/produto/${produtoId}/tags`, { tags: tagsParaEnviar })

      // 5. Atualizar atributos (sempre enviar array, mesmo que vazio)
      const atributosParaEnviar = Array.isArray(atributos) ? atributos : []
      await api.put(`/produto/${produtoId}/atributos`, { atributos: atributosParaEnviar })

      await onSave()
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err)
      throw err
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={!!produtoId} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Produto
          </DialogTitle>
          <DialogDescription>
            {produto ? `Atualize as informações do produto ${produto.nome}` : 'Carregando informações do produto...'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Carregando informações completas do produto..." />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && produto && (
          <div className="mt-4">
            <EditarProdutoFormCompleto
              produto={produto}
              onSave={handleSave}
              onCancel={onClose}
              isLoading={salvando}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
