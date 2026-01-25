'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useApiContext } from '@/contexts/ApiContext'
import { Save, X, Loader2, MapPin, Phone, Mail, Upload } from 'lucide-react'
import { useImageUpload } from '@/utils/uploadImage'

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
    fotoPerfilUrl: entidade?.fotoPerfilUrl || '',
    fazEntrega: entidade?.fazEntrega || false,
    valorMinimoEntrega: entidade?.valorMinimoEntrega
      ? Number(entidade.valorMinimoEntrega)
      : '',
    // Localização
    latitude: entidade?.localizacao?.latitude || '',
    longitude: entidade?.localizacao?.longitude || '',
    endereco: entidade?.localizacao?.endereco || '',
    bairro: entidade?.localizacao?.bairro || '',
    cep: entidade?.localizacao?.cep || '',
    // Contato
    telefone: entidade?.contato?.telefone || '',
    email: entidade?.contato?.email || '',
  })

  const [uploadingFoto, setUploadingFoto] = useState(false)
  const { uploadSingle } = useImageUpload()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const dados = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      fotoPerfilUrl: formData.fotoPerfilUrl || null,
      fazEntrega: formData.fazEntrega,
      valorMinimoEntrega: formData.valorMinimoEntrega
        ? Number(formData.valorMinimoEntrega)
        : null,
      localizacao: {
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        endereco: formData.endereco || null,
        bairro: formData.bairro || null,
        cep: formData.cep || null,
      },
      contato: {
        telefone: formData.telefone || null,
        email: formData.email || null,
      },
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
                        setFormData({ ...formData, fotoPerfilUrl: url })
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
                  value={formData.fotoPerfilUrl}
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
                  value={formData.valorMinimoEntrega}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
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
                  value={formData.bairro}
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
                  value={formData.cep}
                  onChange={(e) =>
                    setFormData({ ...formData, cep: e.target.value })
                  }
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
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
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
