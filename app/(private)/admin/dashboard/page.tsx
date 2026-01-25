'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ButtonTestApi } from '@/components/ButtonTestApi'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Plus,
  Settings,
  BarChart3,
  Loader2,
  Crown,
  Building2,
  TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const stats = [
  {
    title: 'Produtos',
    value: '24',
    description: 'produtos cadastrados',
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Pedidos',
    value: '12',
    description: 'pedidos este mes',
    icon: ShoppingCart,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    title: 'Faturamento',
    value: 'R$ 2.450',
    description: 'receita do mes',
    icon: DollarSign,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    title: 'Clientes',
    value: '89',
    description: 'clientes ativos',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

const adminActions = [
  { 
    title: 'Gerenciar Planos', 
    icon: Crown, 
    href: '/admin/planos',
    description: 'Gerencie os planos das entidades (FREE, BÁSICO, PREMIUM, PREMIUM_MAX)',
    color: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    highlight: true,
  },
  { 
    title: 'Ver Relatórios', 
    icon: BarChart3, 
    href: '#',
    description: 'Acesse relatórios e métricas',
    color: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    highlight: false,
  },
  { 
    title: 'Configurações', 
    icon: Settings, 
    href: '#',
    description: 'Configurações do sistema',
    color: 'bg-gray-500/10',
    iconColor: 'text-gray-500',
    highlight: false,
  },
]

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">
              Painel Administrativo
            </h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Bem-vindo, {user?.name || 'Administrador'}! Gerencie o sistema Feira Livre.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-md p-2 ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ações Administrativas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminActions.map((action) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Link href={action.href}>
                  <Card className={`h-full hover:shadow-lg transition-all cursor-pointer ${
                    action.highlight ? 'border-2 border-purple-500/50 hover:border-purple-500' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`rounded-md p-3 ${action.color}`}>
                          <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                        </div>
                        {action.highlight && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {!action.highlight && (
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {action.title}
                        {action.highlight && (
                          <Badge className="bg-purple-500 text-white text-xs">Novo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Content Placeholder */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Últimos Pedidos</CardTitle>
                <CardDescription>Pedidos recentes do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center rounded-md border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    (Placeholder: Lista de pedidos)
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Desempenho</CardTitle>
                <CardDescription>Métricas dos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center rounded-md border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    (Placeholder: Gráfico de métricas)
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Backend Test Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão</CardTitle>
              <CardDescription>
                Verifique se o backend está funcionando corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ButtonTestApi />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
