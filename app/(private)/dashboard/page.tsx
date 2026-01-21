'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ButtonTestApi } from '@/components/ButtonTestApi'
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Plus,
  Settings,
  BarChart3,
  Loader2,
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

const quickActions = [
  { title: 'Adicionar Produto', icon: Plus, href: '#' },
  { title: 'Ver Relatorios', icon: BarChart3, href: '#' },
  { title: 'Configuracoes', icon: Settings, href: '#' },
]

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, requireAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

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
          <h1 className="text-3xl font-bold text-foreground">
            Ola, {user?.name || 'Usuario'}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bem-vindo ao painel da sua loja. Aqui voce pode gerenciar tudo.
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">Acoes Rapidas</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button key={action.title} variant="outline" className="flex items-center gap-2 bg-transparent">
                <action.icon className="h-4 w-4" />
                {action.title}
              </Button>
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
                <CardTitle>Ultimos Pedidos</CardTitle>
                <CardDescription>Pedidos recentes da sua loja</CardDescription>
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
                <CardDescription>Vendas dos ultimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center rounded-md border-2 border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    (Placeholder: Grafico de vendas)
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
              <CardTitle>Teste de Conexao</CardTitle>
              <CardDescription>
                Verifique se o backend esta funcionando corretamente
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
