'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Tag, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { useApiContext } from '@/contexts/ApiContext'
import { useToast } from '@/hooks/use-toast'
// MVP: Removido EditarVariacaoForm - não usar variações no MVP

interface EditarProdutoInformacoesProps {
  produto: any
  onSave: (dados: any) => Promise<void>
  isLoading?: boolean
}

/**
 * Componente dedicado para edição de informações do produto
 * Inclui: dados básicos, variações, tags, atributos
 */
export function EditarProdutoInformacoes({
  produto,
  onSave,
  isLoading = false,
}: EditarProdutoInformacoesProps) {
  const api = useApiContext()
  const { toast } = useToast()
  
  // MVP: Inicializar formData com dados reais do backend (sem mock)
  const [formData, setFormData] = useState({
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
    categoriaId: produto?.categoriaId || null,
    // MVP: Preços baseados em ProdutoPrecoHistorico (não variações)
    preco: produto?.precoAtual || produto?.precoNormal || produto?.precoFinal || '',
    precoPromo: produto?.precoPromo || '',
    estoque: produto?.estoque || 0,
  })

  // MVP: Estados para tags e atributos (não usar variações)
  const [tags, setTags] = useState<string[]>([])
  const [atributos, setAtributos] = useState<Array<{ chave: string; valor: string; id?: string | null }>>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [novaTag, setNovaTag] = useState('')

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const data = await api.get('/categorias-produto') as any[]
        setCategorias(data || [])
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    carregarCategorias()
  }, [api])

  // Inicializar dados do produto quando mudar (apenas quando ID mudar para evitar loops)
  useEffect(() => {
    if (!produto?.id) return

    // Calcular preços corretamente
    const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || ''
    const precoPromo = produto.emPromocao && produto.precoAntigo 
      ? produto.precoAtual
      : (produto.precoPromo || '')
    const precoNormalParaEdicao = produto.emPromocao && produto.precoAntigo
      ? produto.precoAntigo
      : precoAtual

    // Atualizar formData quando produto mudar
    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      sku: produto.sku || '',
      visivel: produto.visivel ?? true,
      ativo: produto.ativo ?? true,
      destaque: produto.destaque ?? false,
      perecivel: produto.perecivel ?? false,
      peso: produto.peso || '',
      validade: produto.validade
        ? new Date(produto.validade).toISOString().split('T')[0]
        : '',
      largura: produto.largura || '',
      altura: produto.altura || '',
      profundidade: produto.profundidade || '',
      dimensoesStr: produto.dimensoesStr || '',
      categoriaId: produto.categoriaId || null,
      preco: precoNormalParaEdicao,
      precoPromo: precoPromo || '',
      estoque: produto.estoque || 0,
    })

    // Carregar tags se existirem
    if (produto.tags && Array.isArray(produto.tags)) {
      setTags(produto.tags.map((t: any) => t.tag?.nome || t.nome || '').filter(Boolean))
    }

    // Carregar atributos se existirem
    if (produto.atributos && Array.isArray(produto.atributos) && produto.atributos.length > 0) {
      setAtributos(produto.atributos.map((a: any) => ({
        chave: a.chave || '',
        valor: a.valor || '',
        id: a.id || null,
      })))
    } else {
      // Tentar carregar atributos separadamente apenas uma vez
      const carregarAtributos = async () => {
        try {
          const data = await api.get(`/produto/${produto.id}/atributos`) as { atributos?: Array<{ id?: string; chave: string; valor: string }> }
          if (data?.atributos && data.atributos.length > 0) {
            setAtributos(data.atributos.map((a: any) => ({
              chave: a.chave || '',
              valor: a.valor || '',
              id: a.id || null,
            })))
          }
        } catch (error) {
          // Não é crítico, pode não ter atributos
        }
      }
      carregarAtributos()
    }
  }, [produto?.id, api]) // Apenas quando o ID mudar


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const dadosBasicos = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      sku: formData.sku || null,
      visivel: formData.visivel,
      ativo: formData.ativo,
      destaque: formData.destaque,
      perecivel: formData.perecivel,
      peso: formData.peso ? Number(formData.peso) : null,
      validade: formData.validade || null,
      largura: formData.largura ? Number(formData.largura) : null,
      altura: formData.altura ? Number(formData.altura) : null,
      profundidade: formData.profundidade ? Number(formData.profundidade) : null,
      dimensoesStr: formData.dimensoesStr || null,
      categoriaId: formData.categoriaId || null,
    }

    // MVP: Incluir preços e estoque (será salvo em ProdutoPrecoHistorico)
    const precoNumero = formData.preco ? Number(formData.preco) : null
    const precoPromoNumero = formData.precoPromo && formData.precoPromo !== '' 
      ? Number(formData.precoPromo) 
      : null
    const estoqueNumero = formData.estoque ? Number(formData.estoque) : 0

    console.log('💾 [EditarProdutoInformacoes] Salvando preços:', {
      preco: precoNumero,
      precoPromo: precoPromoNumero,
      estoque: estoqueNumero,
      formDataPreco: formData.preco,
      formDataPrecoPromo: formData.precoPromo,
      formDataEstoque: formData.estoque,
    })

    const dadosCompletos = {
      ...dadosBasicos,
      // Preços serão salvos em ProdutoPrecoHistorico
      preco: precoNumero,
      precoPromo: precoPromoNumero,
      estoque: estoqueNumero,
      tags: tags,
      // Formatar atributos removendo IDs e filtrando vazios
      atributos: atributos
        .filter(a => a.chave && a.valor && a.chave.trim() && a.valor.trim())
        .map(a => ({ chave: a.chave.trim(), valor: a.valor.trim() })),
    }

    console.log('💾 [EditarProdutoInformacoes] Dados completos a enviar:', {
      ...dadosCompletos,
      tags: dadosCompletos.tags.length,
      atributos: dadosCompletos.atributos.length,
    })

    await onSave(dadosCompletos)
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
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mt-1"
                placeholder="Código SKU do produto"
              />
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria</Label>
              <Select
                value={formData.categoriaId || undefined}
                onValueChange={(value) => setFormData({ ...formData, categoriaId: value || null })}
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
                  className="mt-1"
                >
                  Remover categoria
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="visivel"
                checked={formData.visivel}
                onCheckedChange={(checked) => setFormData({ ...formData, visivel: checked })}
              />
              <Label htmlFor="visivel" className="cursor-pointer">
                Produto visível
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Produto ativo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="destaque"
                checked={formData.destaque}
                onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
              />
              <Label htmlFor="destaque" className="cursor-pointer">
                Produto em destaque
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="perecivel"
                checked={formData.perecivel}
                onCheckedChange={(checked) => setFormData({ ...formData, perecivel: checked })}
              />
              <Label htmlFor="perecivel" className="cursor-pointer">
                Produto perecível
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                min="0"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="validade">Data de Validade</Label>
              <Input
                id="validade"
                type="date"
                value={formData.validade}
                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]} // Não permite datas no passado
              />
              {formData.validade && (
                <p className="text-xs text-primary mt-1">
                  Validade: {new Date(formData.validade).toLocaleDateString('pt-BR')}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.perecivel 
                  ? 'Produto perecível - informe a data de validade'
                  : 'Data de validade opcional (não é perecível)'}
              </p>
              {formData.validade && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, validade: '' })}
                  className="mt-1 text-xs"
                >
                  Limpar data de validade
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                type="number"
                step="0.01"
                min="0"
                value={formData.largura}
                onChange={(e) => setFormData({ ...formData, largura: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, profundidade: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dimensoesStr">Dimensões (texto livre)</Label>
            <Input
              id="dimensoesStr"
              value={formData.dimensoesStr}
              onChange={(e) => setFormData({ ...formData, dimensoesStr: e.target.value })}
              className="mt-1"
              placeholder="Ex: 30x20x15cm"
            />
          </div>
        </CardContent>
      </Card>

      {/* MVP: Preços e Estoque (não usar variações) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Preço e Estoque
          </CardTitle>
          <CardDescription>
            Os preços serão salvos no histórico. Se houver preço promocional, o preço antigo aparecerá riscado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="preco">Preço Atual (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                required
                className="mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="precoPromo">Preço Promocional (R$)</Label>
              <Input
                id="precoPromo"
                type="number"
                step="0.01"
                min="0"
                value={formData.precoPromo || ''}
                onChange={(e) => setFormData({ ...formData, precoPromo: e.target.value || '' })}
                className="mt-1"
                placeholder="Opcional"
              />
              {formData.precoPromo && Number(formData.precoPromo) > 0 && (
                <p className="text-xs text-primary mt-1">
                  {formData.preco && Number(formData.precoPromo) < Number(formData.preco) 
                    ? `Economia de R$ ${(Number(formData.preco) - Number(formData.precoPromo)).toFixed(2)}`
                    : 'Preço promocional deve ser menor que o preço atual'}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="estoque">Estoque *</Label>
              <Input
                id="estoque"
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                required
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Preview de como aparecerá */}
          {formData.preco && Number(formData.preco) > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <p className="text-sm font-medium mb-2">Preview do preço:</p>
              <div className="flex items-center gap-2">
                {formData.precoPromo && Number(formData.precoPromo) > 0 && Number(formData.precoPromo) < Number(formData.preco) ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      R$ {Number(formData.precoPromo).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      R$ {Number(formData.preco).toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                      Promoção
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">
                    R$ {Number(formData.preco).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
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
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removerTag(tag)}
                    className="hover:text-primary/70"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar tag"
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())}
              className="flex-1"
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
          <CardTitle>Atributos ({atributos.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {atributos.length > 0 ? (
            <div className="space-y-2">
              {atributos.map((atributo, index) => (
                <div key={atributo.id || `atributo-${index}-${atributo.chave}`} className="flex gap-2">
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
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum atributo cadastrado. Clique em "Adicionar Atributo" para criar um novo.</p>
          )}
          <Button type="button" onClick={adicionarAtributo} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Atributo
          </Button>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t">
        {isLoading ? (
          <Button type="submit" disabled={isLoading} className="min-w-[140px]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading} className="min-w-[140px]">
            <Save className="h-4 w-4" />
            Salvar Informações
          </Button>
        )}
      </div>
    </form>
  )
}
