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
import { EditarVariacaoForm } from './EditarVariacaoForm'

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
  })

  const [variacoes, setVariacoes] = useState<any[]>(produto?.variacoes || [])
  const [tags, setTags] = useState<string[]>(produto?.tags?.map((t: any) => t.tag.nome) || [])
  const [atributos, setAtributos] = useState<Array<{ chave: string; valor: string }>>(
    produto?.atributos?.map((a: any) => ({ chave: a.chave, valor: a.valor })) || []
  )
  const [categorias, setCategorias] = useState<any[]>([])
  const [variacaoEditando, setVariacaoEditando] = useState<number | null>(null)
  const [novaTag, setNovaTag] = useState('')

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
    if (produto) {
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
      })
      setVariacoes(produto.variacoes || [])
      setTags(produto.tags?.map((t: any) => t.tag.nome) || [])
      setAtributos(produto.atributos?.map((a: any) => ({ chave: a.chave, valor: a.valor })) || [])
    }
  }, [produto])

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

    const variacoesFormatadas = variacoes.map((v, index) => ({
      nome: v.nome,
      preco: Number(v.preco),
      precoPromocional: v.precoPromocional ? Number(v.precoPromocional) : null,
      estoque: Number(v.estoque),
      quantidade: v.quantidade ? Number(v.quantidade) : null,
      unidadeMedida: v.unidadeMedida || null,
      bateMinimoEntrega: v.bateMinimoEntrega || false,
      validadePromocao: v.validadePromocao || null,
      ordem: v.ordem ?? index,
    }))

    const atributosFormatados = atributos.filter(a => a.chave.trim() && a.valor.trim())

    await onSave({
      ...dadosBasicos,
      tags: tags,
      atributos: atributosFormatados,
      variacoes: variacoesFormatadas,
    })
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
            {formData.perecivel && (
              <div>
                <Label htmlFor="validade">Data de Validade</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
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

      {/* Variações */}
      <Card>
        <CardHeader>
          <CardTitle>Variações do Produto ({variacoes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {variacoes.length > 0 ? (
            <div className="space-y-4">
              {variacoes.map((variacao, index) => (
                <div key={index}>
                  {variacaoEditando === index ? (
                    <EditarVariacaoForm
                      variacao={variacao}
                      onSave={(variacaoAtualizada) => {
                        const novasVariacoes = [...variacoes]
                        novasVariacoes[index] = variacaoAtualizada
                        setVariacoes(novasVariacoes)
                        setVariacaoEditando(null)
                      }}
                      onCancel={() => setVariacaoEditando(null)}
                    />
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{variacao.nome}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            R$ {Number(variacao.preco).toFixed(2)}
                            {variacao.precoPromocional && (
                              <span className="ml-2 text-primary line-through">
                                R$ {Number(variacao.precoPromocional).toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setVariacaoEditando(index)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma variação cadastrada</p>
          )}
          
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
                precoPromocional: null,
                validadePromocao: null,
                ordem: variacoes.length,
              }
              setVariacoes([...variacoes, novaVariacao])
              setVariacaoEditando(variacoes.length)
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Variação
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

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Informações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
