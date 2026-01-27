'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, X, Loader2, MapPin, Phone, Upload } from 'lucide-react'
import { useImageUpload } from '@/utils/uploadImage'
import { useApiContext } from '@/contexts/ApiContext'
import { useToast } from '@/hooks/use-toast'
import { maskPhone, unmaskPhone, maskCEP, unmaskCEP } from '@/utils/masks'

interface EditarEntidadeFormProps {
  entidade: any
  onSave: (dados: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Formulário para editar informações de uma entidade
 * Permite editar nome, descrição, foto, entrega, localização e contato
 */
export function EditarEntidadeForm({
  entidade,
  onSave,
  onCancel,
  isLoading = false,
}: EditarEntidadeFormProps) {
  const [formData, setFormData] = useState({
    nome: entidade?.nome || '',
    descricao: entidade?.descricao || '',
    tipo: entidade?.tipo || 'COMERCIO',
    status: entidade?.status || 'ATIVA',
    categoriaId: entidade?.categoria?.id || '',
    responsavelId: entidade?.responsavel?.id || '',
    fotoPerfilUrl: entidade?.fotoPerfilUrl || '',
    fazEntrega: entidade?.fazEntrega || false,
    valorMinimoEntrega: entidade?.valorMinimoEntrega
      ? String(Number(entidade.valorMinimoEntrega))
      : '',
    // Localização
    latitude: entidade?.localizacao?.latitude ? String(entidade.localizacao.latitude) : '',
    longitude: entidade?.localizacao?.longitude ? String(entidade.localizacao.longitude) : '',
    endereco: entidade?.localizacao?.endereco || '',
    bairro: entidade?.localizacao?.bairro || '',
    cep: entidade?.localizacao?.cep || '',
    // Contato
    telefone: entidade?.contato?.telefone || '',
    email: entidade?.contato?.email || '',
  })

  const [categorias, setCategorias] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const { uploadSingle } = useImageUpload()
  const api = useApiContext()
  const { toast } = useToast()

  // Carregar categorias e usuários
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // TODO: Criar endpoints para listar categorias e usuários admin
        // Por enquanto, deixar vazio
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    carregarDados()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar e preparar localização
    const latitudeStr = formData.latitude?.toString().trim() || ''
    const longitudeStr = formData.longitude?.toString().trim() || ''
    
    const temLatitude = latitudeStr !== ''
    const temLongitude = longitudeStr !== ''
    
    // Converter para número
    const latitudeNum = temLatitude ? Number(latitudeStr) : null
    const longitudeNum = temLongitude ? Number(longitudeStr) : null
    
    // Validar se são números válidos e dentro dos ranges válidos
    const latitudeValida = latitudeNum !== null && 
                          !isNaN(latitudeNum) && 
                          isFinite(latitudeNum) &&
                          latitudeNum >= -90 && 
                          latitudeNum <= 90
    
    const longitudeValida = longitudeNum !== null && 
                           !isNaN(longitudeNum) && 
                           isFinite(longitudeNum) &&
                           longitudeNum >= -180 && 
                           longitudeNum <= 180
    
    const localizacaoValida = temLatitude && temLongitude && 
                              latitudeValida && longitudeValida

    // Validar localização antes de enviar
    if (temLatitude || temLongitude) {
      if (!localizacaoValida) {
        let mensagemErro = 'Erro na localização:\n'
        if (temLatitude && !latitudeValida) {
          mensagemErro += '- Latitude inválida. Deve ser um número entre -90 e 90.\n'
          mensagemErro += `  Valor recebido: ${formData.latitude}\n`
          mensagemErro += '  Exemplo: -6.759 (para Sousa-PB)\n'
        }
        if (temLongitude && !longitudeValida) {
          mensagemErro += '- Longitude inválida. Deve ser um número entre -180 e 180.\n'
          mensagemErro += `  Valor recebido: ${formData.longitude}\n`
          mensagemErro += '  Exemplo: -38.2316 (para Sousa-PB)\n'
        }
        
        toast({
          title: 'Erro de Validação',
          description: mensagemErro.trim(),
          variant: 'destructive',
        })
        return
      }
    }
    
    const dados: any = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      tipo: formData.tipo,
      status: formData.status as any,
      categoriaId: formData.categoriaId || null,
      responsavelId: formData.responsavelId || null,
      fotoPerfilUrl: formData.fotoPerfilUrl || null,
      fazEntrega: formData.fazEntrega,
      valorMinimoEntrega: formData.valorMinimoEntrega
        ? Number(formData.valorMinimoEntrega)
        : null,
      contato: {
        telefone: unmaskPhone(formData.telefone) || null,
        email: formData.email || null,
      },
    }

    // Adicionar localização apenas se válida
    if (localizacaoValida) {
      dados.localizacao = {
        latitude: latitudeNum,
        longitude: longitudeNum,
        endereco: formData.endereco || null,
        bairro: formData.bairro || null,
        cep: unmaskCEP(formData.cep) || null,
      }
    }

    await onSave(dados)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Editar Entidade
        </CardTitle>
        <CardDescription>
          Atualize as informações da entidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações Básicas</h3>
            
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ''}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMERCIO">Comércio</SelectItem>
                    <SelectItem value="SERVICO">Serviço</SelectItem>
                    <SelectItem value="PROFISSIONAL">Profissional</SelectItem>
                    <SelectItem value="INSTITUICAO">Instituição</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVA">Ativa</SelectItem>
                    <SelectItem value="INATIVA">Inativa</SelectItem>
                    <SelectItem value="BLOQUEADA">Bloqueada</SelectItem>
                    <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fotoPerfilUrl">Foto de Perfil</Label>
              
              {/* Upload de arquivo */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !entidade?.id) return

                      setUploadingFoto(true)
                      try {
                        const url = await uploadSingle(
                          file,
                          `/entidade/${entidade.id}/foto-perfil`
                        )
                        setFormData((prev) => ({ ...prev, fotoPerfilUrl: url || '' }))
                      } catch (error: any) {
                        console.error('Erro ao fazer upload:', error)
                        alert(error.message || 'Erro ao fazer upload da foto')
                      } finally {
                        setUploadingFoto(false)
                      }
                    }}
                    className="hidden"
                    id="upload-foto-perfil"
                    disabled={uploadingFoto}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingFoto}
                    onClick={() => document.getElementById('upload-foto-perfil')?.click()}
                  >
                    {uploadingFoto ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload de Foto
                      </>
                    )}
                  </Button>
                </label>
              </div>

              {/* Ou adicionar por URL */}
              <div>
                <Input
                  id="fotoPerfilUrl"
                  type="url"
                  value={formData.fotoPerfilUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, fotoPerfilUrl: e.target.value })
                  }
                  placeholder="Ou cole a URL da foto"
                  className="mt-1"
                />
              </div>

              {/* Preview da foto */}
              {formData.fotoPerfilUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={formData.fotoPerfilUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Entrega */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Entrega</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="fazEntrega">Faz Entrega</Label>
                <p className="text-sm text-muted-foreground">
                  Esta loja oferece serviço de entrega
                </p>
              </div>
              <Switch
                id="fazEntrega"
                checked={formData.fazEntrega}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, fazEntrega: checked })
                }
              />
            </div>

            {formData.fazEntrega && (
              <div>
                <Label htmlFor="valorMinimoEntrega">
                  Valor Mínimo para Entrega (R$)
                </Label>
                <Input
                  id="valorMinimoEntrega"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorMinimoEntrega || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valorMinimoEntrega: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </h3>
            
            <div className="space-y-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📍 Informações sobre Coordenadas
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li><strong>Latitude:</strong> Deve ser um número entre <strong>-90</strong> e <strong>90</strong></li>
                <li><strong>Longitude:</strong> Deve ser um número entre <strong>-180</strong> e <strong>180</strong></li>
                <li>Use ponto (.) como separador decimal, não vírgula</li>
                <li>Exemplo para Sousa-PB: Latitude <strong>-6.759</strong>, Longitude <strong>-38.2316</strong></li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    // Validar em tempo real
                    if (value === '' || (!isNaN(Number(value)) && Number(value) >= -90 && Number(value) <= 90)) {
                      setFormData({ ...formData, latitude: value })
                    }
                  }}
                  placeholder="-6.759"
                  min={-90}
                  max={90}
                  className="mt-1"
                />
                {formData.latitude && (
                  <p className={`text-xs mt-1 ${
                    (() => {
                      const num = Number(formData.latitude)
                      if (isNaN(num)) return 'text-red-600'
                      if (num < -90 || num > 90) return 'text-red-600'
                      return 'text-green-600'
                    })()
                  }`}>
                    {(() => {
                      const num = Number(formData.latitude)
                      if (isNaN(num)) return '⚠️ Deve ser um número'
                      if (num < -90 || num > 90) return '⚠️ Deve estar entre -90 e 90'
                      return '✅ Latitude válida'
                    })()}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    // Validar em tempo real
                    if (value === '' || (!isNaN(Number(value)) && Number(value) >= -180 && Number(value) <= 180)) {
                      setFormData({ ...formData, longitude: value })
                    }
                  }}
                  placeholder="-38.2316"
                  min={-180}
                  max={180}
                  className="mt-1"
                />
                {formData.longitude && (
                  <p className={`text-xs mt-1 ${
                    (() => {
                      const num = Number(formData.longitude)
                      if (isNaN(num)) return 'text-red-600'
                      if (num < -180 || num > 180) return 'text-red-600'
                      return 'text-green-600'
                    })()
                  }`}>
                    {(() => {
                      const num = Number(formData.longitude)
                      if (isNaN(num)) return '⚠️ Deve ser um número'
                      if (num < -180 || num > 180) return '⚠️ Deve estar entre -180 e 180'
                      return '✅ Longitude válida'
                    })()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco || ''}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, bairro: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ''}
                  onChange={(e) => setFormData({ ...formData, cep: maskCEP(e.target.value) })}
                  placeholder="00000-000"
                  maxLength={9}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </h3>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: maskPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-dark"
            >
              {isLoading ? (
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
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
