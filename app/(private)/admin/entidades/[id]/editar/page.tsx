'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { useEntidadesAdmin } from '@/hooks/useEntidadesAdmin'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { EditarEntidadeForm } from '@/components/admin/EditarEntidadeForm'
import { useImageUpload } from '@/utils/uploadImage'

export default function EditarEntidadePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { buscarEntidadePorId, atualizarEntidade, isLoading } = useEntidadesAdmin()
  const { uploadSingle } = useImageUpload()

  const [entidade, setEntidade] = useState<any>(null)
  const [salvando, setSalvando] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState(false)

  const entidadeId = params?.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  useEffect(() => {
    const carregarEntidade = async () => {
      if (!entidadeId) return
      try {
        const data = await buscarEntidadePorId(entidadeId)
        setEntidade(data)
      } catch (error: any) {
        console.error('Erro ao carregar entidade:', error)
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao carregar entidade',
          variant: 'destructive',
        })
        router.push('/admin/entidades')
      }
    }
    if (entidadeId) {
      carregarEntidade()
    }
  }, [entidadeId, buscarEntidadePorId, router, toast])

  const handleSave = async (dados: any) => {
    if (!entidadeId) return
    setSalvando(true)
    try {
      await atualizarEntidade(entidadeId, dados)
      toast({
        title: 'Sucesso!',
        description: 'Entidade atualizada com sucesso',
      })
      router.push('/admin/entidades')
    } catch (error: any) {
      console.error('Erro ao salvar entidade:', error)
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao salvar entidade',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  if (authLoading || isLoading || !entidade) {
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
              <h1 className="text-3xl font-bold text-foreground">Editar Entidade</h1>
              <p className="mt-1 text-muted-foreground">
                Atualize as informações da entidade: {entidade.nome}
              </p>
            </div>

            <EditarEntidadeForm
              entidade={entidade}
              onSave={handleSave}
              onCancel={() => router.push('/admin/entidades')}
              isLoading={salvando}
            />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
