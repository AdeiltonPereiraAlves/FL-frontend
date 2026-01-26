'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, Upload, CheckCircle2, AlertCircle, FileImage, Pencil, Trash2, X, Loader2, Plus, Save } from 'lucide-react'
import Image from 'next/image'
import { useImageUpload } from '@/utils/uploadImage'
import { useToast } from '@/hooks/use-toast'
import { useApiContext } from '@/contexts/ApiContext'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface EditarProdutoImagensProps {
  produto: any
  onSave: (fotos: any[]) => Promise<void>
  isLoading?: boolean
  onFotoRemovida?: () => Promise<void> // Callback opcional para recarregar após remoção
}

/**
 * Componente dedicado para edição de imagens do produto
 * Interface melhorada com visualização clara de todas as imagens
 * Permite upload, edição, exclusão e definição de imagem principal
 */
export function EditarProdutoImagens({
  produto,
  onSave,
  isLoading = false,
  onFotoRemovida,
}: EditarProdutoImagensProps) {
  const [fotos, setFotos] = useState<any[]>([])
  const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [fotoEditando, setFotoEditando] = useState<number | null>(null)
  const [fotoEditandoUrl, setFotoEditandoUrl] = useState('')
  const [novaFotoUrl, setNovaFotoUrl] = useState('')
  const [fotoParaRemover, setFotoParaRemover] = useState<string | null>(null) // Usa URL como identificador único (IDs do banco mudam a cada salvamento)
  const [removendoFoto, setRemovendoFoto] = useState(false)
  const [confirmandoSalvar, setConfirmandoSalvar] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoUpload, setConfirmandoUpload] = useState(false)
  const [imagemUnica, setImagemUnica] = useState<File | null>(null)
  const [previewUnica, setPreviewUnica] = useState<string | null>(null)
  
  const { uploadMultiple } = useImageUpload()
  const { toast } = useToast()
  const api = useApiContext()

  // Sincronizar fotos quando produto mudar
  useEffect(() => {
    console.log('🖼️ [EditarProdutoImagens] Produto recebido:', produto)
    console.log('🖼️ [EditarProdutoImagens] Fotos do produto:', produto?.fotos)
    console.log('🖼️ [EditarProdutoImagens] Tipo de fotos:', typeof produto?.fotos)
    console.log('🖼️ [EditarProdutoImagens] É array?', Array.isArray(produto?.fotos))
    
    if (produto?.fotos) {
      // Garantir que fotos seja um array
      // IMPORTANTE: O backend agora preserva IDs (atualização incremental), então podemos usar o ID do banco
      // Mas mantemos a URL como fallback para garantir compatibilidade
      const fotosArray = Array.isArray(produto.fotos) ? produto.fotos.map((foto: any, index: number) => ({
        ...foto,
        // Usar ID do banco se existir (agora preservado), senão usar URL como fallback
        id: foto.id || foto.url, // ID do banco é preservado agora, URL como fallback
        _indexOriginal: index,
      })) : []
      console.log('🖼️ [EditarProdutoImagens] Atualizando lista de fotos:', fotosArray.length, 'imagens')
      console.log('🖼️ [EditarProdutoImagens] URLs das fotos:', fotosArray.map((f: any) => f.url))
      console.log('🖼️ [EditarProdutoImagens] IDs das fotos:', fotosArray.map((f: any) => f.id))
      
      // Atualizar lista de fotos
      setFotos(fotosArray)
      
      // Limpar previews quando produto for atualizado (após salvar)
      // Isso garante que a lista seja atualizada automaticamente
      setImagensSelecionadas([])
      setPreviews([])
      setImagemUnica(null)
      setPreviewUnica(null)
      
      console.log('✅ [EditarProdutoImagens] Preview limpo, lista de imagens atualizada automaticamente com', fotosArray.length, 'imagens')
    } else {
      console.log('⚠️ [EditarProdutoImagens] Nenhuma foto encontrada no produto')
      setFotos([])
    }
  }, [produto])

  // Valida e processa arquivos selecionados (múltiplas imagens)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const newPreviews: string[] = []

    fileArray.forEach((file) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: `Arquivo ${file.name} não é suportado. Use JPG, PNG ou WEBP.`,
          variant: 'destructive',
        })
        return
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast({
          title: 'Arquivo muito grande',
          description: `Arquivo ${file.name} excede 5MB.`,
          variant: 'destructive',
        })
        return
      }

      validFiles.push(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })

    // Atualizar previews após todos os arquivos serem lidos
    Promise.all(
      validFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.readAsDataURL(file)
          })
      )
    ).then((previewUrls) => {
      setPreviews([...previews, ...previewUrls])
      setImagensSelecionadas([...imagensSelecionadas, ...validFiles])
    })
  }

  const removerImagemSelecionada = (index: number) => {
    const novasImagens = imagensSelecionadas.filter((_, i) => i !== index)
    const novosPreviews = previews.filter((_, i) => i !== index)
    setImagensSelecionadas(novasImagens)
    setPreviews(novosPreviews)
  }

  // Upload de imagem única
  const handleImagemUnicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem válida.',
        variant: 'destructive',
      })
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      })
      return
    }

    setImagemUnica(file)
    
    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUnica(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removerImagemUnica = () => {
    setImagemUnica(null)
    setPreviewUnica(null)
  }

  const confirmarUploadUnica = () => {
    if (!imagemUnica) {
      toast({
        title: 'Nenhuma imagem selecionada',
        description: 'Selecione uma imagem para fazer upload.',
        variant: 'destructive',
      })
      return
    }
    setConfirmandoUpload(true)
  }

  const fazerUploadUnica = async () => {
    setConfirmandoUpload(false)
    if (!imagemUnica) return

    setUploading(true)
    try {
      console.log('📤 [Upload Único] Fazendo upload para Cloudinary...')
      
      // IMPORTANTE: O endpoint POST /produto/:produtoId/fotos já faz upload E salva no banco
      // Não precisa chamar onSave novamente
      const urls = await uploadMultiple([imagemUnica], `/produto/${produto.id}/fotos`)

      console.log('✅ [Upload Único] URLs recebidas do Cloudinary:', urls)

      if (urls && urls.length > 0) {
        // Limpar preview IMEDIATAMENTE após upload bem-sucedido
        setImagemUnica(null)
        setPreviewUnica(null)
        
        // Resetar input de arquivo para permitir nova seleção
        const input = document.getElementById('upload-unica') as HTMLInputElement
        if (input) {
          input.value = ''
        }
        
        // Mostrar toast de sucesso IMEDIATAMENTE
        toast({
          title: '✅ Imagem salva com sucesso!',
          description: `A imagem foi enviada para o Cloudinary e salva no banco. A lista será atualizada automaticamente.`,
        })
        
        console.log('✅ [Upload Único] Upload concluído, recarregando produto...')
        
        // Recarregar produto para atualizar lista automaticamente
        // Como o upload já salvou no banco, apenas recarregamos os dados
        await onSave([]) // Passa array vazio pois já foi salvo, apenas força recarregamento
      } else {
        // Se não retornou URLs, mas o upload pode ter sido bem-sucedido, tenta recarregar mesmo assim
        console.warn('⚠️ [Upload Único] Nenhuma URL retornada, mas tentando recarregar produto...')
        
        // Limpar preview mesmo sem URLs
        setImagemUnica(null)
        setPreviewUnica(null)
        
        // Resetar input de arquivo
        const input = document.getElementById('upload-unica') as HTMLInputElement
        if (input) {
          input.value = ''
        }
        
        // Tentar recarregar produto mesmo assim (pode ter sido salvo no backend)
        await onSave([])
        
        toast({
          title: '⚠️ Upload concluído',
          description: 'A imagem pode ter sido salva. Verifique a lista de imagens.',
        })
      }
    } catch (error: any) {
      console.error('❌ [Upload Único] Erro ao fazer upload:', error)
      console.error('❌ [Upload Único] Erro completo:', JSON.stringify(error, null, 2))
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  // Upload e salvar múltiplas imagens
  const confirmarUploadMultiplas = () => {
    if (imagensSelecionadas.length === 0) {
      toast({
        title: 'Nenhuma imagem selecionada',
        description: 'Selecione pelo menos uma imagem para fazer upload.',
        variant: 'destructive',
      })
      return
    }

    if (imagensSelecionadas.length > 5) {
      toast({
        title: 'Muitas imagens',
        description: 'Você pode fazer upload de no máximo 5 imagens por vez.',
        variant: 'destructive',
      })
      return
    }

    setConfirmandoUpload(true)
  }

  const fazerUploadMultiplas = async () => {
    setConfirmandoUpload(false)
    if (imagensSelecionadas.length === 0) return

    setUploading(true)
    try {
      console.log('📤 [Upload Múltiplo] Fazendo upload para Cloudinary...')
      
      // IMPORTANTE: O endpoint POST /produto/:produtoId/fotos já faz upload E salva no banco
      const urls = await uploadMultiple(imagensSelecionadas, `/produto/${produto.id}/fotos`)

      console.log('✅ [Upload Múltiplo] URLs recebidas do Cloudinary:', urls)

      if (urls && urls.length > 0) {
        // Limpar preview IMEDIATAMENTE após upload bem-sucedido
        setImagensSelecionadas([])
        setPreviews([])
        
        // Resetar input de arquivo para permitir nova seleção
        const input = document.getElementById('upload-images') as HTMLInputElement
        if (input) {
          input.value = ''
        }
        
        // Mostrar toast de sucesso IMEDIATAMENTE
        toast({
          title: '✅ Imagens salvas com sucesso!',
          description: `${urls.length} imagem(ns) foi(foram) enviada(s) para o Cloudinary e salva(s) no banco. A lista será atualizada automaticamente.`,
        })
        
        console.log('✅ [Upload Múltiplo] Upload concluído, recarregando produto...')
        
        // Recarregar produto para atualizar lista automaticamente
        // Como o upload já salvou no banco, apenas recarregamos os dados
        await onSave([]) // Passa array vazio pois já foi salvo, apenas força recarregamento
      } else {
        // Se não retornou URLs, mas o upload pode ter sido bem-sucedido, tenta recarregar mesmo assim
        console.warn('⚠️ [Upload Múltiplo] Nenhuma URL retornada, mas tentando recarregar produto...')
        
        // Limpar preview mesmo sem URLs
        setImagensSelecionadas([])
        setPreviews([])
        
        // Resetar input de arquivo
        const input = document.getElementById('upload-images') as HTMLInputElement
        if (input) {
          input.value = ''
        }
        
        // Tentar recarregar produto mesmo assim (pode ter sido salvo no backend)
        await onSave([])
        
        toast({
          title: '⚠️ Upload concluído',
          description: 'As imagens podem ter sido salvas. Verifique a lista de imagens.',
        })
      }
    } catch (error: any) {
      console.error('❌ [Upload Múltiplo] Erro ao fazer upload:', error)
      console.error('❌ [Upload Múltiplo] Erro completo:', JSON.stringify(error, null, 2))
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Não foi possível fazer upload das imagens.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  // Confirmar antes de salvar
  const confirmarSalvar = () => {
    setConfirmandoSalvar(true)
  }

  // Salvar apenas as alterações nas fotos existentes
  // IMPORTANTE: Envia TODAS as fotos para o backend (não apenas as modificadas)
  const salvarAlteracoes = async () => {
    setConfirmandoSalvar(false)
    setSalvando(true)
    
    try {
      // Garantir que todas as fotos sejam enviadas com a estrutura correta
      const fotosParaEnviar = fotos.map((foto, index) => ({
        url: foto.url,
        destaque: foto.destaque || false,
        ordem: foto.ordem ?? index,
        // Incluir id se existir (para referência, mas não será usado no createMany)
        ...(foto.id && { id: foto.id }),
      }))
      
      console.log('💾 Salvando todas as fotos:', fotosParaEnviar.length, 'imagens')
      console.log('💾 Fotos para enviar:', fotosParaEnviar)
      
      await onSave(fotosParaEnviar)
      
      // Limpar previews após salvar com sucesso
      setImagensSelecionadas([])
      setPreviews([])
      
      toast({
        title: '✅ Salvo com sucesso!',
        description: `As alterações nas imagens foram salvas com sucesso. Total: ${fotosParaEnviar.length} imagem(ns).`,
      })
    } catch (error) {
      console.error('Erro ao salvar alterações:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const abrirEdicaoFoto = (index: number) => {
    setFotoEditando(index)
    setFotoEditandoUrl(fotos[index].url)
  }

  const salvarEdicaoFoto = async () => {
    if (fotoEditando === null) return

    if (!fotoEditandoUrl.trim()) {
      toast({
        title: 'URL inválida',
        description: 'Por favor, informe uma URL válida.',
        variant: 'destructive',
      })
      return
    }

    const novasFotos = [...fotos]
    novasFotos[fotoEditando] = {
      ...novasFotos[fotoEditando],
      url: fotoEditandoUrl.trim(),
    }
    setFotos(novasFotos)
    setFotoEditando(null)
    setFotoEditandoUrl('')

    // Limpar previews ao salvar edição
    setImagensSelecionadas([])
    setPreviews([])

    // Salvar alterações (já tem confirmação e loading)
    await salvarAlteracoes()
  }

  const definirFotoDestaque = async (index: number) => {
    const novasFotos = fotos.map((foto, i) => ({
      ...foto,
      destaque: i === index,
    }))
    setFotos(novasFotos)
    
    // Salvar alterações automaticamente
    await salvarAlteracoes()
  }

  const confirmarRemoverFoto = (fotoId: string) => {
    setFotoParaRemover(fotoId)
  }

  /**
   * Remove UMA foto específica usando o endpoint DELETE individual
   * IMPORTANTE: Usa endpoint específico para deletar apenas uma foto, não todas
   */
  const removerFoto = async () => {
    if (fotoParaRemover === null || !produto?.id) return

    setRemovendoFoto(true)
    
    try {
      console.log('🗑️ [removerFoto] ===== INICIANDO REMOÇÃO INDIVIDUAL =====')
      console.log('🗑️ [removerFoto] Produto ID:', produto.id)
      console.log('🗑️ [removerFoto] Foto ID a remover:', fotoParaRemover)
      console.log('🗑️ [removerFoto] Total de fotos antes:', fotos.length)
      
      // Encontrar a foto a ser removida pelo ID
      const fotoParaRemoverObj = fotos.find(f => f.id === fotoParaRemover || f.url === fotoParaRemover)
      
      if (!fotoParaRemoverObj || !fotoParaRemoverObj.id) {
        console.error('❌ [removerFoto] Foto não encontrada ou sem ID válido')
        toast({
          title: 'Erro ao remover imagem',
          description: 'Foto não encontrada ou sem ID válido.',
          variant: 'destructive',
        })
        return
      }

      const fotoId = fotoParaRemoverObj.id
      console.log('🗑️ [removerFoto] Foto encontrada:', { id: fotoId, url: fotoParaRemoverObj.url })
      
      // Chamar endpoint DELETE específico para remover apenas esta foto
      // Endpoint: DELETE /produto/:produtoId/foto/:fotoId
      await api.delete(`/produto/${produto.id}/foto/${fotoId}`)
      
      console.log('✅ [removerFoto] Foto removida com sucesso do backend')
      
      // Remover da lista local imediatamente (otimista)
      const novasFotos = fotos.filter(f => f.id !== fotoId)
      
      // Se a foto removida era a destacada e ainda há fotos, destacar a primeira
      if (fotoParaRemoverObj.destaque && novasFotos.length > 0) {
        novasFotos[0].destaque = true
        console.log('✅ [removerFoto] Primeira foto definida como destaque')
      }
      
      setFotos(novasFotos)
      setFotoParaRemover(null)
      
      // Recarregar dados do produto para garantir sincronização
      if (onFotoRemovida) {
        await onFotoRemovida()
      }
      
      toast({
        title: '✅ Imagem removida!',
        description: 'A imagem foi removida com sucesso.',
      })
    } catch (error: any) {
      console.error('❌ [removerFoto] Erro ao remover foto:', error)
      toast({
        title: 'Erro ao remover imagem',
        description: error.message || 'Não foi possível remover a imagem.',
        variant: 'destructive',
      })
    } finally {
      setRemovendoFoto(false)
    }
  }

  const adicionarFotoPorUrl = async () => {
    if (!novaFotoUrl.trim()) {
      toast({
        title: 'URL vazia',
        description: 'Por favor, informe uma URL válida.',
        variant: 'destructive',
      })
      return
    }

    const novasFotos = [...fotos, { 
      url: novaFotoUrl.trim(), 
      destaque: fotos.length === 0, 
      ordem: fotos.length 
    }]
    setFotos(novasFotos)
    setNovaFotoUrl('')
    
    // Limpar previews ao adicionar por URL
    setImagensSelecionadas([])
    setPreviews([])
    
    // Salvar alterações automaticamente - ENVIA TODAS AS FOTOS (já tem confirmação e loading)
    await salvarAlteracoes()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagens do Produto ({fotos.length})
          </CardTitle>
          <CardDescription>
            Gerencie as imagens do produto. A imagem destacada será usada como principal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações sobre formatos */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Formatos e Tamanhos Suportados
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Formatos: JPG, PNG, WEBP</li>
                  <li>• Tamanho máximo: 5MB por imagem</li>
                  <li>• Múltiplas imagens podem ser selecionadas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Imagens já salvas */}
          {fotos.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold">
                  Imagens Salvas ({fotos.length})
                </Label>
                <Button
                  type="button"
                  onClick={confirmarSalvar}
                  disabled={isLoading || salvando}
                  size="sm"
                  variant="default"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {fotos.map((foto, index) => {
                  // IMPORTANTE: Usar ID do banco como key (agora preservado), URL como fallback
                  const fotoKey = foto.id || foto.url
                  return (
                  <div key={fotoKey} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={foto.url}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {foto.destaque && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 z-10">
                          <CheckCircle2 className="h-3 w-3" />
                          Principal
                        </div>
                      )}
                      {/* Overlay com ações ao hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => abrirEdicaoFoto(index)}
                          className="h-8 w-8 p-0"
                          title="Editar URL"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={foto.destaque ? "default" : "secondary"}
                          onClick={() => definirFotoDestaque(index)}
                          className="h-8 w-8 p-0"
                          title={foto.destaque ? "Remover destaque" : "Definir como principal"}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            // IMPORTANTE: Usar ID do banco (agora preservado), URL como fallback
                            const fotoId = foto.id || foto.url
                            console.log('🗑️ [onClick] Botão de remover clicado. Foto ID:', fotoId, 'Index:', index, 'URL:', foto.url)
                            if (!fotoId) {
                              console.error('❌ [onClick] Foto sem ID nem URL! Index:', index)
                            }
                            confirmarRemoverFoto(fotoId)
                          }}
                          className="h-8 w-8 p-0"
                          title="Excluir imagem"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => abrirEdicaoFoto(index)}
                        className="flex-1 text-xs"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={foto.destaque ? "default" : "outline"}
                        onClick={() => definirFotoDestaque(index)}
                        className="flex-1 text-xs"
                      >
                        {foto.destaque ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Principal
                          </>
                        ) : (
                          'Destacar'
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          // IMPORTANTE: Usar o ID exato da foto (já definido no useEffect)
                          const fotoId = foto.id
                          console.log('🗑️ [onClick] Botão de remover clicado (mobile). Foto ID:', fotoId, 'Index:', index, 'URL:', foto.url)
                          if (!fotoId) {
                            console.error('❌ [onClick] Foto sem ID! Index:', index, 'URL:', foto.url)
                          }
                          confirmarRemoverFoto(fotoId)
                        }}
                        className="px-2"
                        disabled={removendoFoto}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma imagem cadastrada ainda</p>
            </div>
          )}

          {/* Área de Upload - Dividida em duas seções */}
          <div className="space-y-6 border-t pt-6">
            <Label className="text-base font-semibold">Adicionar Novas Imagens</Label>
            
            {/* Seção 1: Upload de Uma Imagem */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Upload de Uma Imagem</CardTitle>
                <CardDescription className="text-xs">
                  Selecione uma única imagem para fazer upload
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewUnica ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary/50">
                      <Image
                        src={previewUnica}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={removerImagemUnica}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={confirmarUploadUnica}
                      disabled={uploading || salvando}
                      className="w-full"
                    >
                      {uploading || salvando ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {uploading ? 'Fazendo upload...' : 'Salvando...'}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Fazer Upload e Salvar
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImagemUnicaChange}
                      className="hidden"
                      id="upload-unica"
                      disabled={uploading || salvando}
                    />
                    <Label
                      htmlFor="upload-unica"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Clique para selecionar uma imagem
                      </span>
                      <span className="text-xs text-gray-500">
                        Formatos: JPG, PNG, WEBP • Máx: 5MB
                      </span>
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção 2: Upload de Múltiplas Imagens */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Upload de Múltiplas Imagens</CardTitle>
                <CardDescription className="text-xs">
                  Selecione até 5 imagens por vez
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview das imagens selecionadas */}
                {imagensSelecionadas.length > 0 && (
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    {imagensSelecionadas.length} imagem(ns) selecionada(s) - Preview:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagensSelecionadas.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/50">
                          {previews[index] ? (
                            <Image
                              src={previews[index]}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <FileImage className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removerImagemSelecionada(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={confirmarUploadMultiplas}
                    disabled={uploading || salvando || imagensSelecionadas.length === 0}
                    className="flex-1"
                  >
                    {uploading || salvando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploading ? 'Fazendo upload...' : 'Salvando...'}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload e Salvar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImagensSelecionadas([])
                      setPreviews([])
                    }}
                    disabled={uploading || salvando}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            )}

            {/* Seleção de arquivos */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="text-center space-y-2">
                <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <Label htmlFor="upload-images" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Clique para selecionar imagens ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG ou WEBP • Máximo 5MB por imagem
                    </p>
                    <p className="text-xs font-semibold text-primary mt-2">
                      ⚠️ Máximo de 5 imagens por vez
                    </p>
                  </div>
                </Label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                  id="upload-images"
                  disabled={uploading || salvando}
                />
              </div>
            </div>
              </CardContent>
            </Card>

            {/* Adicionar por URL */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label htmlFor="nova-foto-url" className="text-sm font-medium">
                Ou adicione por URL
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="nova-foto-url"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={novaFotoUrl}
                  onChange={(e) => setNovaFotoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarFotoPorUrl()}
                  className="flex-1"
                />
                <Button type="button" onClick={adicionarFotoPorUrl} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Dialog para editar imagem */}
          <Dialog open={fotoEditando !== null} onOpenChange={(open) => {
            if (!open) {
              setFotoEditando(null)
              setFotoEditandoUrl('')
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Imagem</DialogTitle>
                <DialogDescription>
                  Atualize a URL da imagem ou defina como principal.
                </DialogDescription>
              </DialogHeader>
              {fotoEditando !== null && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <Image
                      src={fotoEditandoUrl || fotos[fotoEditando]?.url}
                      alt="Preview"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="foto-url-edit">URL da Imagem</Label>
                    <Input
                      id="foto-url-edit"
                      type="url"
                      value={fotoEditandoUrl}
                      onChange={(e) => setFotoEditandoUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="foto-destaque-edit"
                      checked={fotos[fotoEditando]?.destaque || false}
                      onChange={(e) => {
                        const novasFotos = [...fotos]
                        novasFotos[fotoEditando] = {
                          ...novasFotos[fotoEditando],
                          destaque: e.target.checked,
                        }
                        setFotos(novasFotos)
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="foto-destaque-edit" className="text-sm font-normal cursor-pointer">
                      Definir como imagem principal
                    </Label>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFotoEditando(null)
                    setFotoEditandoUrl('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={salvarEdicaoFoto}
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de confirmação para remover foto */}
          <AlertDialog open={fotoParaRemover !== null} onOpenChange={(open) => {
            if (!open) setFotoParaRemover(null)
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover esta imagem? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {fotoParaRemover !== null && (() => {
                // Encontrar a foto pelo ID ou URL (compatibilidade)
                const fotoParaRemoverObj = fotos.find(f => f.id === fotoParaRemover || f.url === fotoParaRemover)
                return fotoParaRemoverObj ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 my-4">
                    <Image
                      src={fotoParaRemoverObj.url}
                      alt="Imagem a ser removida"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null
              })()}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={removendoFoto}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={removerFoto}
                  disabled={removendoFoto}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {removendoFoto ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removendo...
                    </>
                  ) : (
                    'Remover'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de confirmação para salvar alterações */}
          <AlertDialog open={confirmandoSalvar} onOpenChange={(open) => {
            if (!open) setConfirmandoSalvar(false)
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Salvamento</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja salvar as alterações nas imagens? Esta ação irá atualizar todas as imagens do produto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={salvando}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={salvarAlteracoes}
                  disabled={salvando}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Confirmar e Salvar'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de confirmação para upload */}
          <AlertDialog open={confirmandoUpload} onOpenChange={(open) => {
            if (!open) setConfirmandoUpload(false)
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Upload</AlertDialogTitle>
                <AlertDialogDescription>
                  {imagemUnica 
                    ? 'Tem certeza que deseja fazer upload desta imagem?'
                    : `Tem certeza que deseja fazer upload de ${imagensSelecionadas.length} imagem(ns)? Esta ação irá adicionar as imagens ao produto.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              {imagemUnica && previewUnica && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 my-4">
                  <Image
                    src={previewUnica}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {imagensSelecionadas.length > 0 && (
                <div className="grid grid-cols-3 gap-2 my-4">
                  {previews.slice(0, 6).map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={uploading || salvando}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={imagemUnica ? fazerUploadUnica : fazerUploadMultiplas}
                  disabled={uploading || salvando}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {uploading || salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploading ? 'Fazendo upload...' : 'Salvando...'}
                    </>
                  ) : (
                    'Confirmar e Fazer Upload'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
