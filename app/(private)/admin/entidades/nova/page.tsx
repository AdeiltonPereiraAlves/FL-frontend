'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
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
import { useApiContext } from '@/contexts/ApiContext'
import { useToast } from '@/hooks/use-toast'
import { useImageUpload } from '@/utils/uploadImage'
import { maskCNPJ, unmaskCNPJ, maskPhone, unmaskPhone, maskCEP, unmaskCEP } from '@/utils/masks'
import { Upload } from 'lucide-react'
import Link from 'next/link'

export default function NovaEntidadePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const api = useApiContext()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [cidades, setCidades] = useState<Array<{ id: string; nome: string; estado: string }>>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
  const { uploadSingle } = useImageUpload()

  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cnpj: '',
    tipo: 'COMERCIO',
    cidadeId: '',
    categoriaId: '',
    responsavelId: '',
    fotoPerfilUrl: '',
    fazEntrega: false,
    valorMinimoEntrega: '',
    // Localização
    latitude: '',
    longitude: '',
    endereco: '',
    bairro: '',
    cep: '',
    // Contato
    telefone: '',
    email: '',
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  // Carregar dados para selects
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const cidadesRes = await api.get('/cidades')
        setCidades(cidadesRes || [])
        // TODO: Carregar usuários quando houver rota admin para listar usuários
        // TODO: Carregar categorias quando houver rota
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    if (api) {
      carregarDados()
    }
  }, [api])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar e preparar localização
      console.log('🔍 [NovaEntidadePage] Validação de localização - Valores do formData:', {
        latitude: formData.latitude,
        longitude: formData.longitude,
        latitudeType: typeof formData.latitude,
        longitudeType: typeof formData.longitude,
        latitudeLength: formData.latitude?.length,
        longitudeLength: formData.longitude?.length,
      })
      
      // Verificar se os campos têm valores (mesmo que sejam strings vazias)
      const latitudeStr = formData.latitude?.toString().trim() || ''
      const longitudeStr = formData.longitude?.toString().trim() || ''
      
      const temLatitude = latitudeStr !== ''
      const temLongitude = longitudeStr !== ''
      
      console.log('🔍 [NovaEntidadePage] Após trim:', {
        latitudeStr,
        longitudeStr,
        temLatitude,
        temLongitude,
      })
      
      // Converter para número
      const latitudeNum = temLatitude ? Number(latitudeStr) : null
      const longitudeNum = temLongitude ? Number(longitudeStr) : null
      
      console.log('🔍 [NovaEntidadePage] Após conversão:', {
        latitudeNum,
        longitudeNum,
        latitudeIsNaN: latitudeNum !== null ? isNaN(latitudeNum) : 'N/A',
        longitudeIsNaN: longitudeNum !== null ? isNaN(longitudeNum) : 'N/A',
        latitudeIsFinite: latitudeNum !== null ? isFinite(latitudeNum) : 'N/A',
        longitudeIsFinite: longitudeNum !== null ? isFinite(longitudeNum) : 'N/A',
      })
      
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

      console.log('🔍 [NovaEntidadePage] Validação final:', {
        latitudeValida,
        longitudeValida,
        localizacaoValida,
        temLatitude,
        temLongitude,
        motivoFalha: !localizacaoValida ? {
          naoTemLatitude: !temLatitude,
          naoTemLongitude: !temLongitude,
          latitudeInvalida: temLatitude && !latitudeValida,
          longitudeInvalida: temLongitude && !longitudeValida,
        } : null,
      })

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
          
          console.error('❌ [NovaEntidadePage] Localização inválida:', {
            latitude: formData.latitude,
            longitude: formData.longitude,
            latitudeValida,
            longitudeValida,
          })
          
          toast({
            title: 'Erro de Validação',
            description: mensagemErro.trim(),
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
      } else {
        console.warn('⚠️ [NovaEntidadePage] Latitude ou longitude não preenchidas:', {
          temLatitude,
          temLongitude,
        })
      }

      const dados: any = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        cnpj: unmaskCNPJ(formData.cnpj), // Remove máscara antes de enviar
        tipo: formData.tipo,
        cidadeId: formData.cidadeId,
        categoriaId: formData.categoriaId || null,
        responsavelId: formData.responsavelId || null,
        fotoPerfilUrl: formData.fotoPerfilUrl || null,
        fazEntrega: formData.fazEntrega,
        valorMinimoEntrega: formData.valorMinimoEntrega
          ? Number(formData.valorMinimoEntrega)
          : null,
      }

      // Adicionar localização apenas se válida (não usar undefined, usar null ou omitir)
      if (localizacaoValida) {
        dados.localizacao = {
          latitude: latitudeNum,
          longitude: longitudeNum,
          endereco: formData.endereco || null,
          bairro: formData.bairro || null,
          cep: unmaskCEP(formData.cep) || null,
        }
        console.log('✅ [NovaEntidadePage] Localização adicionada aos dados:', dados.localizacao)
      } else {
        console.warn('⚠️ [NovaEntidadePage] Localização NÃO adicionada aos dados porque localizacaoValida =', localizacaoValida)
      }

      console.log('📤 [NovaEntidadePage] Dados FINAIS sendo enviados:', JSON.stringify({
        ...dados,
        localizacaoValida,
        temLocalizacao: !!dados.localizacao,
      }, null, 2))

      // Adicionar contato se fornecido
      if (formData.telefone || formData.email) {
        dados.contato = {
          telefone: unmaskPhone(formData.telefone) || null,
          email: formData.email || null,
        }
      }

      const response = await api.post('/admin/entidades', dados)
      const entidadeCriada = response.entidade || response
      const entidadeId = entidadeCriada?.id || entidadeCriada?.id

      // Se há um arquivo de foto selecionado, fazer upload após criar a entidade
      if (fotoFile && entidadeId) {
        try {
          setUploadingFoto(true)
          const url = await uploadSingle(
            fotoFile,
            `/entidade/${entidadeId}/foto-perfil`
          )
          
          // Atualizar a entidade com a URL da foto
          await api.put(`/admin/entidades/${entidadeId}`, {
            fotoPerfilUrl: url,
          })
          
          toast({
            title: 'Sucesso!',
            description: 'Entidade criada e foto enviada com sucesso.',
          })
        } catch (error: any) {
          console.error('Erro ao fazer upload da foto:', error)
          toast({
            title: 'Aviso',
            description: 'Entidade criada, mas houve erro ao enviar a foto. Você pode fazer upload na página de edição.',
          })
        } finally {
          setUploadingFoto(false)
        }
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Entidade criada com sucesso.',
        })
      }

      router.push('/admin/entidades')
    } catch (error: any) {
      console.error('Erro ao criar entidade:', error)
      toast({
        title: 'Erro',
        description: error?.response?.data?.erro || 'Erro ao criar entidade',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
      </div>
    )
  }

  if (!isAuthenticated || (!isDonoSistema() && !isAdmin())) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <Link href="/admin/entidades">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">Nova Entidade</h1>
              <p className="mt-1 text-muted-foreground">
                Preencha os dados para criar uma nova entidade
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                  <CardDescription>Informações principais da entidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger>
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cidadeId">Cidade *</Label>
                      <Select
                        value={formData.cidadeId}
                        onValueChange={(value) => setFormData({ ...formData, cidadeId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cidades.map((cidade) => (
                            <SelectItem key={cidade.id} value={cidade.id}>
                              {cidade.nome} - {cidade.estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="responsavelId">Responsável (ID)</Label>
                      <Input
                        id="responsavelId"
                        value={formData.responsavelId}
                        onChange={(e) =>
                          setFormData({ ...formData, responsavelId: e.target.value })
                        }
                        placeholder="ID do usuário responsável (opcional)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe em branco se não houver responsável
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Localização */}
              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                  <CardDescription>Endereço e coordenadas da entidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
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
                        value={formData.longitude}
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
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>⚠️ Importante:</strong> Latitude e Longitude são obrigatórias para que a entidade apareça no mapa. 
                      Se não preencher, a entidade será criada mas não será exibida no mapa.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: maskCEP(e.target.value) })}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Foto de Perfil */}
              <Card>
                <CardHeader>
                  <CardTitle>Foto de Perfil</CardTitle>
                  <CardDescription>Imagem que será exibida no perfil da entidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            if (!file) return

                            // Validar tipo de arquivo
                            if (!file.type.startsWith('image/')) {
                              toast({
                                title: 'Erro',
                                description: 'Por favor, selecione um arquivo de imagem.',
                                variant: 'destructive',
                              })
                              return
                            }

                            // Validar tamanho (máximo 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              toast({
                                title: 'Erro',
                                description: 'A imagem deve ter no máximo 5MB.',
                                variant: 'destructive',
                              })
                              return
                            }

                            setUploadingFoto(true)
                            try {
                              // Criar preview local para mostrar ao usuário
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setFormData((prev) => ({ 
                                  ...prev, 
                                  fotoPerfilUrl: reader.result as string
                                }))
                                setFotoFile(file) // Armazenar arquivo separadamente
                              }
                              reader.readAsDataURL(file)
                              
                              toast({
                                title: 'Foto selecionada',
                                description: 'A foto será enviada após criar a entidade.',
                              })
                            } catch (error: any) {
                              console.error('Erro ao preparar foto:', error)
                              toast({
                                title: 'Erro',
                                description: error.message || 'Erro ao preparar foto',
                                variant: 'destructive',
                              })
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
                              Processando...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar Foto
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
                          onError={(e) => {
                            // Se a imagem falhar ao carregar, limpar a URL
                            setFormData((prev) => ({ ...prev, fotoPerfilUrl: '' }))
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                  <CardDescription>Informações de contato da entidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: maskPhone(e.target.value) })}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle>Entrega</CardTitle>
                  <CardDescription>Configurações de entrega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="fazEntrega">Faz entrega</Label>
                      <p className="text-sm text-muted-foreground">
                        Esta entidade oferece serviço de entrega?
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
                      <Label htmlFor="valorMinimoEntrega">Valor Mínimo de Entrega (R$)</Label>
                      <Input
                        id="valorMinimoEntrega"
                        type="number"
                        step="0.01"
                        value={formData.valorMinimoEntrega}
                        onChange={(e) =>
                          setFormData({ ...formData, valorMinimoEntrega: e.target.value })
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botões */}
              <div className="flex justify-end gap-4">
                <Link href="/admin/entidades">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="bg-[#15803D] hover:bg-[#15803D]/90">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Entidade
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
