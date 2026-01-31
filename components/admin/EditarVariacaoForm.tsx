'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { X, Save, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EditarVariacaoFormProps {
  variacao: any
  index: number
  produtoId?: string // ID do produto para salvar no backend
  onSave: (variacao: any) => void | Promise<void>
  onDelete: () => void | Promise<void>
  onCancel: () => void
}

/**
 * Formulário para editar uma variação de produto
 */
export function EditarVariacaoForm({
  variacao,
  index,
  onSave,
  onDelete,
  onCancel,
}: EditarVariacaoFormProps) {
  const { toast } = useToast()
  const [salvando, setSalvando] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: variacao?.nome || '',
    preco: variacao?.preco ? Number(variacao.preco).toFixed(2) : '',
    precoPromo: variacao?.precoPromo ? Number(variacao.precoPromo).toFixed(2) : '',
    descontoPerc: variacao?.descontoPerc || '',
    descontoValor: variacao?.descontoValor ? Number(variacao.descontoValor).toFixed(2) : '',
    validadePromocao: variacao?.validadePromocao
      ? new Date(variacao.validadePromocao).toISOString().split('T')[0]
      : '',
    estoque: variacao?.estoque || 0,
    quantidade: variacao?.quantidade || '',
    unidadeMedida: variacao?.unidadeMedida || '',
    bateMinimoEntrega: variacao?.bateMinimoEntrega || false,
  })

  // Sincronizar formData quando variacao mudar (após salvar no backend)
  useEffect(() => {
    if (variacao) {
      setFormData({
        nome: variacao.nome || '',
        preco: variacao.preco ? Number(variacao.preco).toFixed(2) : '',
        precoPromo: variacao.precoPromo ? Number(variacao.precoPromo).toFixed(2) : '',
        descontoPerc: variacao.descontoPerc || '',
        descontoValor: variacao.descontoValor ? Number(variacao.descontoValor).toFixed(2) : '',
        validadePromocao: variacao.validadePromocao
          ? new Date(variacao.validadePromocao).toISOString().split('T')[0]
          : '',
        estoque: variacao.estoque || 0,
        quantidade: variacao.quantidade || '',
        unidadeMedida: variacao.unidadeMedida || '',
        bateMinimoEntrega: variacao.bateMinimoEntrega || false,
      })
    }
  }, [variacao])

  const handleSubmit = async () => {
    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro ao salvar',
        description: 'O nome da variação é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    
    if (!formData.preco || Number(formData.preco) <= 0) {
      toast({
        title: 'Erro ao salvar',
        description: 'O preço deve ser maior que zero.',
        variant: 'destructive',
      })
      return
    }
    
    // Validar data de validade da promoção
    if (formData.validadePromocao && new Date(formData.validadePromocao) < new Date()) {
      toast({
        title: 'Erro ao salvar',
        description: 'A data de validade da promoção não pode ser no passado.',
        variant: 'destructive',
      })
      return
    }
    
    setSalvando(true)
    
    try {
      const variacaoAtualizada = {
        ...variacao,
        ...formData,
        preco: Number(formData.preco),
        precoPromo: formData.precoPromo ? Number(formData.precoPromo) : null,
        descontoPerc: formData.descontoPerc ? Number(formData.descontoPerc) : null,
        descontoValor: formData.descontoValor ? Number(formData.descontoValor) : null,
        estoque: Number(formData.estoque),
        quantidade: formData.quantidade ? Number(formData.quantidade) : null,
        validadePromocao: formData.validadePromocao && formData.validadePromocao.trim() !== '' 
          ? formData.validadePromocao 
          : null,
      }
      
      await onSave(variacaoAtualizada)
      
      // Toast será mostrado pelo componente pai (EditarProdutoInformacoes)
      // que tem acesso ao produtoId e pode salvar no backend
      // O loading será desativado pelo finally abaixo
    } catch (error: any) {
      console.error('❌ [EditarVariacaoForm] Erro ao salvar:', error)
      toast({
        title: 'Erro ao salvar variação',
        description: error.message || 'Não foi possível salvar a variação.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-lg">Editar Variação: {formData.nome || `Variação ${index + 1}`}</h4>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`variacao-nome-${index}`}>Nome da Variação *</Label>
          <Input
            id={`variacao-nome-${index}`}
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            className="mt-1"
            placeholder="Ex: Tamanho M, 1kg, Fardo 30kg"
          />
        </div>

        <div>
          <Label htmlFor={`variacao-estoque-${index}`}>Estoque *</Label>
          <Input
            id={`variacao-estoque-${index}`}
            type="number"
            min="0"
            value={formData.estoque}
            onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`variacao-preco-${index}`}>Preço (R$) *</Label>
          <Input
            id={`variacao-preco-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={formData.preco}
            onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`variacao-precoPromo-${index}`}>Preço Promoção (R$)</Label>
          <Input
            id={`variacao-precoPromo-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={formData.precoPromo}
            onChange={(e) => setFormData({ ...formData, precoPromo: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`variacao-quantidade-${index}`}>Quantidade</Label>
          <Input
            id={`variacao-quantidade-${index}`}
            type="number"
            min="0"
            value={formData.quantidade}
            onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
            className="mt-1"
            placeholder="Ex: 30 para fardo de 30kg"
          />
        </div>

        <div>
          <Label htmlFor={`variacao-unidadeMedida-${index}`}>Unidade de Medida</Label>
          <Select
            value={formData.unidadeMedida || undefined}
            onValueChange={(value) => setFormData({ ...formData, unidadeMedida: value || null })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a unidade (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNIDADE">Unidade</SelectItem>
              <SelectItem value="KG">Quilograma (KG)</SelectItem>
              <SelectItem value="LITRO">Litro</SelectItem>
              <SelectItem value="FARDO">Fardo</SelectItem>
              <SelectItem value="CAIXA">Caixa</SelectItem>
            </SelectContent>
          </Select>
          {formData.unidadeMedida && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData({ ...formData, unidadeMedida: null })}
              className="mt-1 text-xs"
            >
              Remover unidade
            </Button>
          )}
        </div>

        {formData.precoPromo && (
          <div className="sm:col-span-2">
            <Label htmlFor={`variacao-validadePromocao-${index}`}>
              Validade da Promoção {formData.validadePromocao && `(até ${new Date(formData.validadePromocao).toLocaleDateString('pt-BR')})`}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id={`variacao-validadePromocao-${index}`}
                type="date"
                value={formData.validadePromocao}
                onChange={(e) => setFormData({ ...formData, validadePromocao: e.target.value })}
                min={new Date().toISOString().split('T')[0]} // Não permite datas no passado
                className="flex-1"
              />
              {formData.validadePromocao && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, validadePromocao: '' })}
                  className="text-xs"
                >
                  Limpar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.validadePromocao 
                ? `A promoção será válida até ${new Date(formData.validadePromocao).toLocaleDateString('pt-BR')}`
                : 'Defina até quando a promoção será válida (opcional)'}
            </p>
            {formData.validadePromocao && new Date(formData.validadePromocao) < new Date() && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ A data de validade da promoção não pode ser no passado
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor={`variacao-bateMinimoEntrega-${index}`}>Bate Mínimo de Entrega</Label>
            <p className="text-xs text-muted-foreground">
              Esta variação sozinha atinge o valor mínimo para frete grátis
            </p>
          </div>
          <Switch
            id={`variacao-bateMinimoEntrega-${index}`}
            checked={formData.bateMinimoEntrega}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, bateMinimoEntrega: checked })
            }
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          type="button" 
          size="sm" 
          className="flex-1"
          onClick={handleSubmit}
          disabled={salvando}
        >
          {salvando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Variação
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
