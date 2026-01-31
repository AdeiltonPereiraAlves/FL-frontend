'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save, X, Loader2 } from 'lucide-react'

interface EditarProdutoFormProps {
  produto: any
  onSave: (dados: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Formulário para editar informações de um produto
 * Permite editar nome, descrição, SKU, visibilidade e status
 */
export function EditarProdutoForm({
  produto,
  onSave,
  onCancel,
  isLoading = false,
}: EditarProdutoFormProps) {
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const dados = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      sku: formData.sku || null,
      visivel: formData.visivel,
      ativo: formData.ativo,
      destaque: formData.destaque,
      perecivel: formData.perecivel,
      peso: formData.peso ? Number(formData.peso) : null,
      validade: formData.validade || null,
    }

    await onSave(dados)
  }

  return (
    <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações Básicas */}
          <div className="space-y-3">
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
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Status e Configurações */}
          <div className="space-y-3 border-t pt-3">
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
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-3 border-t pt-3">
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
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-3 border-t">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-dark"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </span>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </div>
        </form>
    </div>
  )
}
