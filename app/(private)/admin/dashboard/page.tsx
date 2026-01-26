'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useRouter } from 'next/navigation'
import { Loader2, Crown } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DashboardCards } from '@/components/admin/DashboardCards'
import { GraficoVisitantesUsuarios } from '@/components/admin/GraficoVisitantesUsuarios'
import { GraficoLeadsPorEntidade } from '@/components/admin/GraficoLeadsPorEntidade'
import { GraficoLeadsPorDia } from '@/components/admin/GraficoLeadsPorDia'

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isDonoSistema, isAdmin } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && isAuthenticated && !isDonoSistema() && !isAdmin()) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, isDonoSistema, isAdmin, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!isDonoSistema() && !isAdmin()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="lg:pl-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-8 w-8 text-[#15803D]" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dashboard Administrativo
                </h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo, {user?.name || 'Administrador'}! Acompanhe o crescimento do sistema.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cards de Resumo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8"
          >
            <DashboardCards />
          </motion.div>

          {/* Gráficos */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            {/* Gráfico 1: Visitantes vs Usuários */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <GraficoVisitantesUsuarios />
            </motion.div>

            {/* Gráfico 2: Leads por Entidade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <GraficoLeadsPorEntidade />
            </motion.div>
          </div>

          {/* Gráfico 3: Leads por Dia (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-6"
          >
            <GraficoLeadsPorDia />
          </motion.div>

          {/* Frases Estratégicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                💼 Clientes Enviados para Lojas
              </h3>
              <p className="text-sm text-gray-600">
                Cada lead representa um cliente interessado em comprar. Quanto mais leads, maior o valor gerado para as lojas.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                📈 Crescimento de Usuários
              </h3>
              <p className="text-sm text-gray-600">
                Acompanhe a evolução do número de visitantes e novos usuários cadastrados no sistema.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                🏪 Lojas com Maior Interesse
              </h3>
              <p className="text-sm text-gray-600">
                Identifique quais lojas estão recebendo mais clientes e gerando mais valor através do sistema.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
