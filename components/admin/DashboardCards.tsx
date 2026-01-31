'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users, UserPlus, TrendingUp, MessageSquare } from 'lucide-react'
import { useDashboardResumo } from '@/hooks/useDashboard'
import { motion } from 'framer-motion'

const cardConfig = [
  {
    key: 'totalVisitantes',
    title: 'Visitantes Totais',
    description: 'Total de visitantes no sistema',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'totalUsuarios',
    title: 'Usuários Cadastrados',
    description: 'Total de usuários registrados',
    icon: UserPlus,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    key: 'visitantesHoje',
    title: 'Visitantes Hoje',
    description: 'Visitantes nas últimas 24h',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    key: 'usuariosHoje',
    title: 'Usuários Hoje',
    description: 'Novos usuários hoje',
    icon: UserPlus,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    key: 'totalLeads',
    title: 'Leads Totais',
    description: 'Clientes enviados para lojas',
    icon: MessageSquare,
    color: 'text-[#15803D]',
    bgColor: 'bg-[#15803D]/10',
  },
  {
    key: 'leadsHoje',
    title: 'Leads Hoje',
    description: 'Leads gerados hoje',
    icon: MessageSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600/10',
  },
]

export function DashboardCards() {
  const { data, loading, error } = useDashboardResumo()

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cardConfig.map((config, index) => {
        const Icon = config.icon
        const value = data[config.key as keyof typeof data] ?? 0

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {config.title}
                </CardTitle>
                <div className={`rounded-md p-2 ${config.bgColor}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
