'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Loader2, ArrowLeft, Package } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEntidadesAdmin } from '@/hooks/useEntidadesAdmin'
import { useProdutosEntidade } from '@/hooks/useProdutosEntidade'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { EditarProdutoFormCompleto } from '@/components/admin/EditarProdutoFormCompleto'

export default function NovoProdutoEntidadePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { buscarEntidadePorId } = useEntidadesAdmin()
  const { criarProduto, isLoading } = useProdutosEntidade()

  const [entidade, setEntidade] = useState<any>(null)

  const entidadeId = params?.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/')
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
    try {
      // O componente já envia os dados no formato correto
      // Não precisa adicionar entidadeId, pois o endpoint já recebe no path
      const produto = await criarProduto(entidadeId, dados)
      toast({
        title: 'Sucesso!',
        description: 'Produto criado com sucesso',
      })
      router.push(`/admin/entidades/${entidadeId}/produtos`)
    } catch (error: any) {
      console.error('Erro ao criar produto:', error)
      toast({
        title: 'Erro',
        description: error?.message || 'Erro ao criar produto',
        variant: 'destructive',
      })
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
              <Link href={`/admin/entidades/${entidadeId}/produtos`}>
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-8 w-8 text-[#15803D]" />
                Novo Produto - {entidade.nome}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Crie um novo produto para esta entidade
              </p>
            </div>

            <EditarProdutoFormCompleto
              produto={null}
              onSave={handleSave}
              onCancel={() => router.push(`/admin/entidades/${entidadeId}/produtos`)}
              isLoading={isLoading}
            />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
