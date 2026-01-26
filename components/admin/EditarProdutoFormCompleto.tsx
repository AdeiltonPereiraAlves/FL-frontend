'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X, Loader2, Package, Image as ImageIcon, Tag, Plus, Trash2, Edit, Upload, CheckCircle2, AlertCircle, FileImage, Pencil } from 'lucide-react'
import Image from 'next/image'
import { useApiContext } from '@/contexts/ApiContext'
import { EditarVariacaoForm } from './EditarVariacaoForm'
import { useImageUpload } from '@/utils/uploadImage'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface EditarProdutoFormCompletoProps {
  produto: any
  onSave: (dados: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Formulário completo para editar TODAS as informações de um produto
 * Inclui: dados básicos, imagens, variações, tags, atributos
 */
export function EditarProdutoFormCompleto({
  produto,
  onSave,
  onCancel,
  isLoading = false,
}: EditarProdutoFormCompletoProps) {
  const [formData, setFormData] = useState({
    // Dados básicos
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    sku: produto?.sku || '',
    visivel: produto?.visivel ?? true,
    ativo: produto?.ativo ?? true,
    destaque: produto?.destaque ?? false,
    perecivel: produto?.perecivel ?? false,
    peso: produto?.peso || '',
    validade: produto?.validade
      ? new Date(produto.validade).toISOString().split('T')[0]
      : '',
    largura: produto?.largura || '',
    altura: produto?.altura || '',
    profundidade: produto?.profundidade || '',
    dimensoesStr: produto?.dimensoesStr || '',
    categoriaId: produto?.categoriaId || '',
  })

  // Estados para imagens, variações, tags e atributos
  const [fotos, setFotos] = useState<any[]>(produto?.fotos || [])
  const [variacoes, setVariacoes] = useState<any[]>(produto?.variacoes || [])
  const [tags, setTags] = useState<string[]>(produto?.tags?.map((t: any) => t.tag.nome) || [])
  const [atributos, setAtributos] = useState<Array<{ chave: string; valor: string }>>(
    produto?.atributos?.map((a: any) => ({ chave: a.chave, valor: a.valor })) || []
  )

  const [novaFotoUrl, setNovaFotoUrl] = useState('')
  const [novaTag, setNovaTag] = useState('')
  const [categorias, setCategorias] = useState<any[]>([])
  const [variacaoEditando, setVariacaoEditando] = useState<number | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [salvandoImagens, setSalvandoImagens] = useState(false)
  const [fotoEditando, setFotoEditando] = useState<number | null>(null)
  const [fotoEditandoUrl, setFotoEditandoUrl] = useState('')
  const { toast } = useToast()
  const api = useApiContext()
  const { uploadMultiple } = useImageUpload()

  // Carregar categorias ao montar o componente
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const data = await api.get('/categorias-produto')
        setCategorias(data || [])
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    carregarCategorias()
  }, [api])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Se houver imagens selecionadas, fazer upload primeiro
    if (imagensSelecionadas.length > 0) {
      const produtoId = produto?.id
      if (produtoId) {
        try {
          setSalvandoImagens(true)
          const urls = await uploadMultiple(imagensSelecionadas, `/produto/${produtoId}/fotos`)
          
          if (urls && urls.length > 0) {
            const novasFotos = urls.map((url, index) => ({
              url,
              destaque: fotos.length === 0 && index === 0,
              ordem: fotos.length + index,
            }))
            setFotos([...fotos, ...novasFotos])
            // Limpar preview e seleção
            setImagensSelecionadas([])
            setPreviews([])
            
            // Mostrar toast de sucesso
            toast({
              title: '✅ Imagens salvas com sucesso!',
              description: `${urls.length} imagem(ns) foi(foram) adicionada(s) ao produto.`,
            })
          }
        } catch (error: any) {
          console.error('Erro ao fazer upload das imagens:', error)
          toast({
            title: 'Erro ao fazer upload',
            description: error.message || 'Ocorreu um erro ao fazer upload das imagens.',
            variant: 'destructive',
          })
          setSalvandoImagens(false)
          return // Não continua se o upload falhar
        } finally {
          setSalvandoImagens(false)
        }
      }
    }
    
    // Preparar dados básicos
    const dadosBasicos = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      sku: formData.sku || null,
      visivel: formData.visivel,
      ativo: formData.ativo,
      destaque: formData.destaque, // ✅ Incluído
      perecivel: formData.perecivel, // ✅ Incluído
      peso: formData.peso ? Number(formData.peso) : null,
      validade: formData.validade || null,
      largura: formData.largura ? Number(formData.largura) : null,
      altura: formData.altura ? Number(formData.altura) : null,
      profundidade: formData.profundidade ? Number(formData.profundidade) : null,
      dimensoesStr: formData.dimensoesStr || null,
      categoriaId: formData.categoriaId || null,
    }

    // Preparar fotos (com destaque e ordem)
    // Garantir que fotos seja sempre um array válido
    const fotosFormatadas = (Array.isArray(fotos) ? fotos : []).map((foto, index) => ({
      url: foto.url,
      destaque: foto.destaque || false,
      ordem: foto.ordem ?? index,
    }))

    // Preparar variações (com todos os campos)
    // Garantir que variacoes seja sempre um array válido
    const variacoesFormatadas = (Array.isArray(variacoes) ? variacoes : []).map((variacao) => ({
      id: variacao.id,
      nome: variacao.nome,
      preco: Number(variacao.preco),
      precoPromo: variacao.precoPromo ? Number(variacao.precoPromo) : null,
      descontoPerc: variacao.descontoPerc ? Number(variacao.descontoPerc) : null,
      descontoValor: variacao.descontoValor ? Number(variacao.descontoValor) : null,
      validadePromocao: variacao.validadePromocao || null,
      estoque: Number(variacao.estoque),
      quantidade: variacao.quantidade ? Number(variacao.quantidade) : null,
      unidadeMedida: variacao.unidadeMedida || null,
      bateMinimoEntrega: variacao.bateMinimoEntrega || false,
    }))

    // Preparar tags (array de strings)
    // Garantir que tags seja sempre um array válido
    const tagsFormatadas = (Array.isArray(tags) ? tags : []).filter(tag => tag.trim())

    // Preparar atributos (array de objetos chave-valor)
    // Garantir que atributos seja sempre um array válido
    const atributosFormatados = (Array.isArray(atributos) ? atributos : []).filter(attr => attr.chave && attr.valor)

    // Enviar todos os dados juntos
    await onSave({
      ...dadosBasicos,
      fotos: fotosFormatadas,
      variacoes: variacoesFormatadas,
      tags: tagsFormatadas,
      atributos: atributosFormatados,
    })
  }

  const adicionarFoto = () => {
    if (novaFotoUrl.trim()) {
      setFotos([...fotos, { url: novaFotoUrl, destaque: false, ordem: fotos.length }])
      setNovaFotoUrl('')
    }
  }

  // Valida e processa arquivos selecionados
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const newPreviews: string[] = []

    // Validação de arquivos
    fileArray.forEach((file) => {
      // Validar tipo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name} não é suportado. Use JPG, PNG ou WEBP.`)
        return
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert(`Arquivo ${file.name} é muito grande. Tamanho máximo: 5MB.`)
        return
      }

      validFiles.push(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string)
          setPreviews([...previews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })

    setImagensSelecionadas([...imagensSelecionadas, ...validFiles])
  }

  // Remove imagem selecionada antes do upload
  const removerImagemSelecionada = (index: number) => {
    const novasImagens = imagensSelecionadas.filter((_, i) => i !== index)
    const novosPreviews = previews.filter((_, i) => i !== index)
    setImagensSelecionadas(novasImagens)
    setPreviews(novosPreviews)
  }

  // Faz upload apenas das imagens (salvar imagens separadamente)
  const salvarApenasImagens = async () => {
    if (imagensSelecionadas.length === 0) {
      toast({
        title: 'Nenhuma imagem selecionada',
        description: 'Selecione pelo menos uma imagem para fazer upload.',
        variant: 'destructive',
      })
      return
    }

    const produtoId = produto?.id
    if (!produtoId) {
      toast({
        title: 'Erro',
        description: 'ID do produto não encontrado',
        variant: 'destructive',
      })
      return
    }

    setSalvandoImagens(true)
    try {
      const urls = await uploadMultiple(imagensSelecionadas, `/produto/${produtoId}/fotos`)

      if (urls && urls.length > 0) {
        const novasFotos = urls.map((url, index) => ({
          url,
          destaque: fotos.length === 0 && index === 0,
          ordem: fotos.length + index,
        }))
        
        setFotos([...fotos, ...novasFotos])
        // Limpar preview e seleção
        setImagensSelecionadas([])
        setPreviews([])
        
        // Mostrar toast de sucesso
        toast({
          title: '✅ Imagens salvas com sucesso!',
          description: `${urls.length} imagem(ns) foi(foram) adicionada(s) ao produto.`,
        })
      }
    } catch (error: any) {
      console.error('Erro ao salvar imagens:', error)
      toast({
        title: 'Erro ao salvar imagens',
        description: error.message || 'Ocorreu um erro ao fazer upload das imagens.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoImagens(false)
    }
  }

  // Abre dialog para editar uma imagem
  const abrirEdicaoFoto = (index: number) => {
    setFotoEditando(index)
    setFotoEditandoUrl(fotos[index].url)
  }

  // Salva a edição da imagem
  const salvarEdicaoFoto = () => {
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

    toast({
      title: 'Imagem atualizada',
      description: 'A URL da imagem foi atualizada com sucesso.',
    })
  }

  // Remove uma imagem
  const confirmarRemoverFoto = (index: number) => {
    if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
      const novasFotos = fotos.filter((_, i) => i !== index)
      setFotos(novasFotos)
      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida com sucesso.',
      })
    }
  }

  const removerFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index))
  }

  const definirFotoDestaque = (index: number) => {
    setFotos(fotos.map((foto, i) => ({ ...foto, destaque: i === index })))
  }

  const adicionarTag = () => {
    if (novaTag.trim() && !tags.includes(novaTag.trim())) {
      setTags([...tags, novaTag.trim()])
      setNovaTag('')
    }
  }

  const removerTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const adicionarAtributo = () => {
    setAtributos([...atributos, { chave: '', valor: '' }])
  }

  const atualizarAtributo = (index: number, campo: 'chave' | 'valor', valor: string) => {
    const novosAtributos = [...atributos]
    novosAtributos[index][campo] = valor
    setAtributos(novosAtributos)
  }

  const removerAtributo = (index: number) => {
    setAtributos(atributos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Código SKU do produto"
                />
              </div>
              <div>
                <Label htmlFor="categoriaId">Categoria</Label>
                <Select
                  value={formData.categoriaId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoriaId: value || null })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                        {categoria.descricao && ` - ${categoria.descricao}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.categoriaId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, categoriaId: null })}
                    className="mt-1 text-xs"
                  >
                    Remover categoria
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status e Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Status e Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="visivel">Visível</Label>
                <p className="text-xs text-muted-foreground">
                  Produto aparece nas buscas
                </p>
              </div>
              <Switch
                id="visivel"
                checked={formData.visivel}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, visivel: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ativo">Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Produto está disponível para venda
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, ativo: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="destaque">Destaque</Label>
                <p className="text-xs text-muted-foreground">
                  Produto em destaque
                </p>
              </div>
              <Switch
                id="destaque"
                checked={formData.destaque}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, destaque: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="perecivel">Perecível</Label>
                <p className="text-xs text-muted-foreground">
                  Produto tem validade
                </p>
              </div>
              <Switch
                id="perecivel"
                checked={formData.perecivel}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, perecivel: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Dimensões e Peso */}
        <Card>
          <CardHeader>
            <CardTitle>Dimensões e Peso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.peso}
                  onChange={(e) =>
                    setFormData({ ...formData, peso: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="largura">Largura (cm)</Label>
                <Input
                  id="largura"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.largura}
                  onChange={(e) =>
                    setFormData({ ...formData, largura: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.altura}
                  onChange={(e) =>
                    setFormData({ ...formData, altura: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="profundidade">Profundidade (cm)</Label>
                <Input
                  id="profundidade"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.profundidade}
                  onChange={(e) =>
                    setFormData({ ...formData, profundidade: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dimensoesStr">Dimensões (texto livre)</Label>
              <Input
                id="dimensoesStr"
                value={formData.dimensoesStr}
                onChange={(e) =>
                  setFormData({ ...formData, dimensoesStr: e.target.value })
                }
                className="mt-1"
                placeholder="Ex: 30x20x15cm"
              />
            </div>
            <div>
              <Label htmlFor="validade">Data de Validade</Label>
              <Input
                id="validade"
                type="date"
                value={formData.validade}
                onChange={(e) =>
                  setFormData({ ...formData, validade: e.target.value })
                }
                className="mt-1"
                placeholder="Selecione a data de validade"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.perecivel 
                  ? 'Produto perecível - informe a data de validade'
                  : 'Data de validade opcional (não é perecível)'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Imagens do Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagens do Produto ({fotos.length})
            </CardTitle>
            <CardDescription>
              Gerencie as imagens do produto. A primeira imagem destacada será usada como principal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações sobre formatos suportados */}
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
            {fotos.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">Imagens Salvas ({fotos.length})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group">
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
                            onClick={() => confirmarRemoverFoto(index)}
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
                          onClick={() => confirmarRemoverFoto(index)}
                          className="px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Área de Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Adicionar Novas Imagens</Label>
              
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

                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={salvarApenasImagens}
                      disabled={salvandoImagens}
                      className="flex-1"
                    >
                      {salvandoImagens ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando Imagens...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Salvar Apenas Imagens
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
                      disabled={salvandoImagens}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              )}

              {/* Seleção de arquivos */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <Label htmlFor="upload-images" className="cursor-pointer">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clique para selecionar imagens ou arraste e solte
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG ou WEBP • Máximo 5MB por imagem
                      </p>
                    </div>
                  </Label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    id="upload-images"
                    disabled={salvandoImagens}
                  />
                </div>
              </div>

              {/* Adicionar por URL (alternativa) */}
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
                    onKeyPress={(e) => e.key === 'Enter' && adicionarFoto()}
                    className="flex-1"
                  />
                  <Button type="button" onClick={adicionarFoto} variant="outline">
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
                    {/* Preview da imagem atual */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={fotoEditandoUrl || fotos[fotoEditando]?.url}
                        alt="Preview"
                        fill
                        className="object-contain"
                        onError={(e) => {
                          // Se a imagem falhar ao carregar, mostra placeholder
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    
                    {/* Campo de URL */}
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

                    {/* Checkbox para destacar */}
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
          </CardContent>
        </Card>

        {/* Variações do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Variações do Produto ({variacoes.length})</CardTitle>
            <CardDescription>
              Gerencie as variações de preço, estoque e unidades de medida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {variacoes.length > 0 ? (
              <div className="space-y-4">
                {variacoes.map((variacao, index) => {
                  const isEditando = variacaoEditando === index
                  
                  return isEditando ? (
                    <EditarVariacaoForm
                      key={variacao.id || index}
                      variacao={variacao}
                      index={index}
                      onSave={(variacaoAtualizada) => {
                        const novasVariacoes = [...variacoes]
                        novasVariacoes[index] = variacaoAtualizada
                        setVariacoes(novasVariacoes)
                        setVariacaoEditando(null)
                      }}
                      onDelete={() => {
                        setVariacoes(variacoes.filter((_, i) => i !== index))
                        setVariacaoEditando(null)
                      }}
                      onCancel={() => setVariacaoEditando(null)}
                    />
                  ) : (
                    <div key={variacao.id || index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{variacao.nome}</h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setVariacaoEditando(index)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Preço: </span>
                          <span className="font-semibold">R$ {Number(variacao.preco).toFixed(2)}</span>
                        </div>
                        {variacao.precoPromo && (
                          <div>
                            <span className="text-muted-foreground">Promoção: </span>
                            <span className="font-semibold text-green-600">R$ {Number(variacao.precoPromo).toFixed(2)}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Estoque: </span>
                          <span className="font-semibold">{variacao.estoque}</span>
                        </div>
                        {variacao.quantidade && variacao.unidadeMedida && (
                          <div>
                            <span className="text-muted-foreground">Quantidade: </span>
                            <span className="font-semibold">{variacao.quantidade} {variacao.unidadeMedida}</span>
                          </div>
                        )}
                        {variacao.bateMinimoEntrega && (
                          <div className="text-green-600 font-semibold">
                            ✓ Bate mínimo de entrega
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma variação cadastrada</p>
            )}
            
            {/* Botão para adicionar nova variação */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const novaVariacao = {
                  nome: '',
                  preco: 0,
                  estoque: 0,
                  quantidade: null,
                  unidadeMedida: null,
                  bateMinimoEntrega: false,
                }
                setVariacoes([...variacoes, novaVariacao])
                setVariacaoEditando(variacoes.length)
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Variação
            </Button>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags ({tags.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removerTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Nova tag"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    adicionarTag()
                  }
                }}
              />
              <Button type="button" onClick={adicionarTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atributos */}
        <Card>
          <CardHeader>
            <CardTitle>Atributos do Produto ({atributos.length})</CardTitle>
            <CardDescription>
              Adicione atributos personalizados como marca, origem, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {atributos.length > 0 && (
              <div className="space-y-2">
                {atributos.map((atributo, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Chave (ex: Marca)"
                      value={atributo.chave}
                      onChange={(e) => atualizarAtributo(index, 'chave', e.target.value)}
                    />
                    <Input
                      placeholder="Valor (ex: Nestlé)"
                      value={atributo.valor}
                      onChange={(e) => atualizarAtributo(index, 'valor', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removerAtributo(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button type="button" onClick={adicionarAtributo} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Atributo
            </Button>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || salvandoImagens}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || salvandoImagens}
            className="flex-1 bg-primary hover:bg-primary-dark min-w-[140px]"
          >
            {isLoading || salvandoImagens ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {salvandoImagens ? 'Salvando Imagens...' : 'Salvando...'}
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Salvar Tudo
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
