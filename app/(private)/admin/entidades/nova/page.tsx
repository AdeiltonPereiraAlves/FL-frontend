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
import Link from 'next/link'

export default function NovaEntidadePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const api = useApiContext()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [cidades, setCidades] = useState<Array<{ id: string; nome: string; estado: string }>>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cnpj: '',
    tipo: 'COMERCIO',
    cidadeId: '',
    categoriaId: '',
    responsavelId: '',
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
      router.push('/dashboard')
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
      const dados = {
        nome: formData.nome,
        descricao: formData.descricao || null,
        cnpj: formData.cnpj,
        tipo: formData.tipo,
        cidadeId: formData.cidadeId,
        categoriaId: formData.categoriaId || null,
        responsavelId: formData.responsavelId || null,
        fazEntrega: formData.fazEntrega,
        valorMinimoEntrega: formData.valorMinimoEntrega
          ? Number(formData.valorMinimoEntrega)
          : null,
        localizacao: formData.latitude && formData.longitude
          ? {
              latitude: Number(formData.latitude),
              longitude: Number(formData.longitude),
              endereco: formData.endereco || null,
              bairro: formData.bairro || null,
              cep: formData.cep || null,
            }
          : null,
        contato: formData.telefone || formData.email
          ? {
              telefone: formData.telefone || null,
              email: formData.email || null,
            }
          : null,
      }

      await api.post('/admin/entidades', dados)

      toast({
        title: 'Sucesso!',
        description: 'Entidade criada com sucesso.',
      })

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
    <div className="flex min-h-screen bg-background">
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
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
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
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      />
                    </div>
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
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
