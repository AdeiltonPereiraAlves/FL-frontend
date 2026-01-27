'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X, Loader2, Package, Image as ImageIcon, Upload, Trash2, Eye, DollarSign, Info, Settings, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useApiContext } from '@/contexts/ApiContext'
import { useImageUpload } from '@/utils/uploadImage'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EditarProdutoFormCompletoProps {
  produto: any
  onSave: (dados: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Formulário profissional para editar produto
 * Layout: 2 colunas (desktop) / 1 coluna (mobile)
 * Coluna esquerda: Imagens
 * Coluna direita: Dados organizados em cards
 */
export function EditarProdutoFormCompleto({
  produto,
  onSave,
  onCancel,
  isLoading = false,
}: EditarProdutoFormCompletoProps) {
  const [formData, setFormData] = useState({
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    sku: produto?.sku || '',
    marca: produto?.marca || '',
    modelo: produto?.modelo || '',
    tipo: produto?.tipo || '',
    visivel: produto?.visivel ?? true,
    ativo: produto?.ativo ?? true,
    destaque: produto?.destaque ?? false,
    perecivel: produto?.perecivel ?? false,
    validade: produto?.validade
      ? new Date(produto.validade).toISOString().split('T')[0]
      : '',
    categoriaId: produto?.categoriaId || '',
    precoAtual: produto?.precoAtual || produto?.precoNormal || produto?.precoFinal || '',
    precoDesconto: produto?.precoDesconto || produto?.precoPromo || '',
    emPromocao: produto?.emPromocao ?? false,
  })

  // Estados para imagem
  const fotoPrincipal = produto?.fotos?.find((f: any) => f.destaque) || produto?.fotos?.[0] || null
  const [fotoAtual, setFotoAtual] = useState<string | null>(fotoPrincipal?.url || null)
  const [fotoId, setFotoId] = useState<string | null>(fotoPrincipal?.id || null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)
  const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null)
  const [imagemModal, setImagemModal] = useState<string | null>(null)

  const [categorias, setCategorias] = useState<any[]>([])
  const { toast } = useToast()
  const api = useApiContext()

  // Carregar categorias
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

  // Sincronizar dados quando produto mudar
  useEffect(() => {
    if (!produto) {
      setFormData({
        nome: '',
        descricao: '',
        sku: '',
        marca: '',
        modelo: '',
        tipo: '',
        visivel: true,
        ativo: true,
        destaque: false,
        perecivel: false,
        validade: '',
        categoriaId: '',
        precoAtual: '',
        precoDesconto: '',
        emPromocao: false,
      })
      setFotoAtual(null)
      setFotoId(null)
      return
    }

    const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || ''
    const precoDesconto = produto.precoDesconto || produto.precoPromo || ''
    const emPromocao = produto.emPromocao ?? false

    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      sku: produto.sku || '',
      marca: produto.marca || '',
      modelo: produto.modelo || '',
      tipo: produto.tipo || '',
      visivel: produto.visivel ?? true,
      ativo: produto.ativo ?? true,
      destaque: produto.destaque ?? false,
      perecivel: produto.perecivel ?? false,
      validade: produto.validade
        ? new Date(produto.validade).toISOString().split('T')[0]
        : '',
      categoriaId: produto.categoriaId || '',
      precoAtual: precoAtual,
      precoDesconto: precoDesconto,
      emPromocao: emPromocao,
    })

    const fotoPrincipal = produto.fotos?.find((f: any) => f.destaque) || produto.fotos?.[0] || null
    if (fotoPrincipal) {
      setFotoAtual(fotoPrincipal.url)
      setFotoId(fotoPrincipal.id)
    } else {
      setFotoAtual(null)
      setFotoId(null)
    }
  }, [produto?.id])

  // Upload imediato de 1 imagem
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use JPG, PNG ou WEBP.',
        variant: 'destructive',
      })
      return
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'Tamanho máximo: 5MB.',
        variant: 'destructive',
      })
      return
    }

    // Criar preview imediato
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewFoto(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)

    setImagemSelecionada(file)

    // Se produto já existe, fazer upload imediato
    if (produto?.id) {
      await fazerUploadImagem(file)
    }
  }

  // Faz upload imediato da imagem
  const fazerUploadImagem = async (file: File) => {
    if (!produto?.id) return

    setUploadingFoto(true)
    try {
      const formData = new FormData()
      formData.append('images', file)
      
      const response = await api.post<{ fotos: Array<{ url: string }> }>(`/produto/${produto.id}/fotos`, formData)
      const url = response.fotos?.[0]?.url || (Array.isArray(response.fotos) && response.fotos[0]) || null
      
      if (!url) {
        throw new Error('URL da imagem não retornada pelo servidor')
      }

      setFotoAtual(url)
      setPreviewFoto(null)
      setImagemSelecionada(null)

      toast({
        title: '✅ Imagem salva!',
        description: 'A imagem foi atualizada com sucesso.',
      })
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error)
      toast({
        title: 'Erro ao salvar imagem',
        description: error.message || 'Ocorreu um erro ao fazer upload.',
        variant: 'destructive',
      })
      setPreviewFoto(null)
      setImagemSelecionada(null)
    } finally {
      setUploadingFoto(false)
    }
  }

  // Remove a imagem atual
  const removerImagem = async () => {
    if (!produto?.id) return

    if (!window.confirm('Tem certeza que deseja remover esta imagem?')) {
      return
    }

    setUploadingFoto(true)
    try {
      // Enviar array vazio diretamente para remover todas as fotos
      await api.put(`/admin/produtos/${produto.id}/fotos`, {
        fotos: [],
      })

      setFotoAtual(null)
      setFotoId(null)
      setPreviewFoto(null)
      setImagemSelecionada(null)

      toast({
        title: 'Imagem removida',
        description: 'A imagem foi removida com sucesso.',
      })
    } catch (error: any) {
      console.error('Erro ao remover imagem:', error)
      toast({
        title: 'Erro ao remover imagem',
        description: error.message || 'Ocorreu um erro ao remover a imagem.',
        variant: 'destructive',
      })
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do produto é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.precoAtual || Number(formData.precoAtual) <= 0) {
      toast({
        title: 'Preço inválido',
        description: 'O preço deve ser maior que zero.',
        variant: 'destructive',
      })
      return
    }

    if (formData.emPromocao && (!formData.precoDesconto || Number(formData.precoDesconto) <= 0)) {
      toast({
        title: 'Preço promocional inválido',
        description: 'Quando em promoção, o preço promocional é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    // Converter preços para números
    const precoAtualNumero = formData.precoAtual ? Number(formData.precoAtual) : null
    const precoDescontoNumero = formData.precoDesconto ? Number(formData.precoDesconto) : null
    const emPromocaoFinal = formData.emPromocao && precoDescontoNumero !== null

    // Preparar dados básicos
    const dadosBasicos = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      sku: formData.sku || null,
      marca: formData.marca || null,
      modelo: formData.modelo || null,
      tipo: formData.tipo || null,
      visivel: formData.visivel,
      ativo: formData.ativo,
      destaque: formData.destaque,
      perecivel: formData.perecivel,
      validade: formData.validade || null,
      categoriaId: formData.categoriaId || null,
      precoAtual: precoAtualNumero,
      precoDesconto: precoDescontoNumero,
      emPromocao: emPromocaoFinal,
      variacoes: [],
      tags: [],
      atributos: [],
    }

    // Criar FormData
    const formDataToSend = new FormData()
    
    // Adicionar imagem selecionada (se houver nova que ainda não foi enviada)
    if (imagemSelecionada && !fotoAtual) {
      formDataToSend.append('images', imagemSelecionada)
    }

    // Adicionar dados básicos como JSON
    formDataToSend.append('data', JSON.stringify(dadosBasicos))

    // Enviar
    await onSave(formDataToSend)
    
    // Limpar preview e seleção após sucesso
    if (imagemSelecionada) {
      setImagemSelecionada(null)
      setPreviewFoto(null)
    }
  }

  // Calcular preço final para exibição
  const precoFinal = formData.emPromocao && formData.precoDesconto
    ? Number(formData.precoDesconto)
    : Number(formData.precoAtual) || 0

  const precoAntigo = formData.emPromocao && formData.precoAtual
    ? Number(formData.precoAtual)
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <form id="produto-form" onSubmit={handleSubmit} className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Layout: 2 colunas desktop, 1 coluna mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA - IMAGENS */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imagem do Produto
                </CardTitle>
                <CardDescription>
                  Adicione uma imagem principal para o produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Imagem atual ou preview */}
                {(fotoAtual || previewFoto) && (
                  <div className="relative">
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 group">
                      <Image
                        src={previewFoto || fotoAtual || ''}
                        alt="Imagem do produto"
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => setImagemModal(previewFoto || fotoAtual || null)}
                      />
                      {uploadingFoto && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                      {/* Overlay com ações */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setImagemModal(previewFoto || fotoAtual || null)}
                          className="h-9"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        {fotoAtual && !uploadingFoto && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={removerImagem}
                            className="h-9"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Área de Upload */}
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-primary/50 transition-colors bg-gray-50 dark:bg-gray-900/50">
                    <div className="text-center space-y-3">
                      {!fotoAtual && !previewFoto && (
                        <>
                          <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Clique para selecionar
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              JPG, PNG ou WEBP • Máximo 5MB
                            </p>
                          </div>
                        </>
                      )}
                      <Label htmlFor="upload-image" className="cursor-pointer">
                        <Button
                          type="button"
                          variant={fotoAtual ? "outline" : "default"}
                          className="bg-[#15803D] hover:bg-[#15803D]/90"
                          disabled={uploadingFoto}
                          asChild
                        >
                          <span>
                            {uploadingFoto ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : fotoAtual ? (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Trocar Imagem
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Selecionar Imagem
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        id="upload-image"
                        disabled={uploadingFoto}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA - DADOS DO PRODUTO */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1 - Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados principais do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="mt-1"
                    placeholder="Ex: Arroz Tipo 1"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="mt-1"
                    placeholder="Descreva o produto..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca || ''}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="mt-1"
                      placeholder="Marca (opcional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo || ''}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="mt-1"
                      placeholder="Modelo (opcional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Input
                      id="tipo"
                      value={formData.tipo || ''}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: alimento, limpeza"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="mt-1"
                      placeholder="Código SKU (opcional)"
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
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2 - Preço (DESTAQUE VISUAL) */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Preço
                </CardTitle>
                <CardDescription>
                  Configure o preço e promoções do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="precoAtual">Preço Normal (R$) *</Label>
                  <Input
                    id="precoAtual"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precoAtual || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ 
                        ...formData, 
                        precoAtual: value,
                      })
                    }}
                    required
                    className="mt-1"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emPromocao"
                      checked={formData.emPromocao}
                      onCheckedChange={(checked) => {
                        setFormData({ 
                          ...formData, 
                          emPromocao: checked,
                          precoDesconto: checked ? formData.precoDesconto : '',
                        })
                      }}
                    />
                    <Label htmlFor="emPromocao" className="font-semibold cursor-pointer">
                      Produto em Promoção
                    </Label>
                  </div>
                </div>

                {formData.emPromocao && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="precoDesconto">Preço Promocional (R$) *</Label>
                      <Input
                        id="precoDesconto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.precoDesconto || ''}
                        onChange={(e) => setFormData({ ...formData, precoDesconto: e.target.value })}
                        required={formData.emPromocao}
                        className="mt-1"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Preview Visual do Preço */}
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                      <Label className="text-sm text-muted-foreground mb-2 block">Preview:</Label>
                      <div className="flex items-baseline gap-3">
                        {precoAntigo && (
                          <span className="text-2xl text-gray-400 line-through">
                            R$ {precoAntigo.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="text-3xl font-bold text-primary">
                          R$ {precoFinal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview quando não está em promoção */}
                {!formData.emPromocao && formData.precoAtual && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <Label className="text-sm text-muted-foreground mb-2 block">Preview:</Label>
                    <span className="text-3xl font-bold">
                      R$ {Number(formData.precoAtual).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 3 - Detalhes do Produto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Detalhes do Produto
                </CardTitle>
                <CardDescription>
                  Informações adicionais sobre o produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label htmlFor="perecivel" className="font-semibold cursor-pointer">
                      Produto Perecível
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Marque se o produto tem validade
                    </p>
                  </div>
                  <Switch
                    id="perecivel"
                    checked={formData.perecivel}
                    onCheckedChange={(checked) => setFormData({ ...formData, perecivel: checked })}
                  />
                </div>

                {formData.perecivel && (
                  <div>
                    <Label htmlFor="validade">Data de Validade</Label>
                    <Input
                      id="validade"
                      type="date"
                      value={formData.validade || ''}
                      onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 4 - Status do Produto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Status do Produto
                </CardTitle>
                <CardDescription>
                  Controle a visibilidade e disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label htmlFor="ativo" className="font-semibold cursor-pointer">
                      Produto Ativo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Produto disponível para venda
                    </p>
                  </div>
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label htmlFor="visivel" className="font-semibold cursor-pointer">
                      Produto Visível
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Produto aparece nas buscas
                    </p>
                  </div>
                  <Switch
                    id="visivel"
                    checked={formData.visivel}
                    onCheckedChange={(checked) => setFormData({ ...formData, visivel: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label htmlFor="destaque" className="font-semibold cursor-pointer">
                      Produto em Destaque
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Destacar na página inicial
                    </p>
                  </div>
                  <Switch
                    id="destaque"
                    checked={formData.destaque}
                    onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
                  />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </form>

      {/* BARRA FIXA INFERIOR - AÇÕES */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Campos marcados com * são obrigatórios</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || uploadingFoto}
                className="min-w-[120px]"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                form="produto-form"
                disabled={isLoading || uploadingFoto}
                className="min-w-[180px] bg-[#15803D] hover:bg-[#15803D]/90"
              >
                {isLoading || uploadingFoto ? (
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
          </div>
        </div>
      </div>

      {/* Modal de Visualização de Imagem */}
      <Dialog open={!!imagemModal} onOpenChange={(open) => !open && setImagemModal(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Visualizar Imagem</DialogTitle>
          </DialogHeader>
          {imagemModal && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={imagemModal}
                alt="Imagem do produto"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
