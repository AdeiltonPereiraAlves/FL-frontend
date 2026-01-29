'use client'

import { useEffect, useState } from 'react'
import { useApiContext } from '@/contexts/ApiContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Users, Eye, Target, BarChart3, Package, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  totalVisitas: number
  visitantesUnicos: number
  totalLeads: number
  leadsUsuarios: number
  leadsVisitantes: number
  taxaConversao: number
  produtoMaisVisto: {
    id: string
    nome: string
    fotoPerfilUrl?: string
    totalVisualizacoes: number
  } | null
  produtoTopLead: {
    id: string
    nome: string
    fotoPerfilUrl?: string
    totalLeads: number
  } | null
  topProdutosVistos?: Array<{
    id: string
    nome: string
    fotoPerfilUrl?: string
    totalVisualizacoes: number
  }>
  visitasPorDia: Array<{
    data: string
    total: number
  }>
  periodo: {
    inicio: string
    fim: string
  }
}

const chartConfig = {
  visitas: {
    label: 'Visitas',
    color: 'hsl(var(--chart-1))',
  },
}

interface EntidadeAnalyticsPanelProps {
  entidadeId: string
  entidadeNome: string
  onVoltar: () => void
}

export function EntidadeAnalyticsPanel({
  entidadeId,
  entidadeNome,
  onVoltar,
}: EntidadeAnalyticsPanelProps) {
  const api = useApiContext()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarAnalytics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.get<AnalyticsData>(
          `/admin/entidades/${entidadeId}/analytics`
        )
        console.log('📊 [Analytics] Dados recebidos:', data)
        console.log('📊 [Analytics] Produto mais visto:', data.produtoMaisVisto)
        console.log('📊 [Analytics] Top produtos vistos:', data.topProdutosVistos)
        setAnalytics(data)
      } catch (err) {
        console.error('Erro ao carregar analytics:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar métricas')
      } finally {
        setIsLoading(false)
      }
    }

    carregarAnalytics()
  }, [entidadeId, api])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Erro ao carregar métricas</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onVoltar}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Métricas</h1>
            <p className="text-sm text-gray-600 mt-1">{entidadeNome}</p>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVisitas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visitas na loja
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.visitantesUnicos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pessoas diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.leadsUsuarios} usuários • {analytics.leadsVisitantes} visitantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.taxaConversao.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads / Visitas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Produto Mais Visto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-600" />
              Produto Mais Visto
            </CardTitle>
            <CardDescription>
              Produto com maior número de visualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.produtoMaisVisto ? (
              <div className="flex items-center gap-4">
                {analytics.produtoMaisVisto.fotoPerfilUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={analytics.produtoMaisVisto.fotoPerfilUrl}
                      alt={analytics.produtoMaisVisto.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{analytics.produtoMaisVisto.nome}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analytics.produtoMaisVisto.totalVisualizacoes.toLocaleString()} visualizações
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum produto visualizado ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Produto Top Lead */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Produto que Mais Gera Lead
            </CardTitle>
            <CardDescription>
              Produto que mais gera interesse
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.produtoTopLead ? (
              <div className="flex items-center gap-4">
                {analytics.produtoTopLead.fotoPerfilUrl && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={analytics.produtoTopLead.fotoPerfilUrl}
                      alt={analytics.produtoTopLead.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{analytics.produtoTopLead.nome}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analytics.produtoTopLead.totalLeads.toLocaleString()} leads gerados
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Dados de leads por produto não disponíveis
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Visitas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visitas ao Longo do Tempo
          </CardTitle>
          <CardDescription>
            Período: {new Date(analytics.periodo.inicio).toLocaleDateString('pt-BR')} até{' '}
            {new Date(analytics.periodo.fim).toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.visitasPorDia.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart
                data={analytics.visitasPorDia.map((dia) => ({
                  data: new Date(dia.data).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  }),
                  visitas: dia.total,
                  fullDate: dia.data,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="data" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]?.payload?.fullDate) {
                      return new Date(payload[0].payload.fullDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    }
                    return value
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitas"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma visita registrada no período
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Produtos Mais Vistos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Top 5 Produtos Mais Vistos
          </CardTitle>
          <CardDescription>
            Ranking dos produtos com mais visualizações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topProdutosVistos && analytics.topProdutosVistos.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart
                data={analytics.topProdutosVistos.map((produto) => ({
                  nome: produto.nome.length > 20 
                    ? produto.nome.substring(0, 20) + '...' 
                    : produto.nome,
                  visualizacoes: produto.totalVisualizacoes,
                  fullName: produto.nome,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  type="category"
                  dataKey="nome"
                  tick={{ fontSize: 12 }}
                  width={150}
                  className="text-muted-foreground"
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]?.payload?.fullName) {
                      return payload[0].payload.fullName
                    }
                    return value
                  }}
                />
                <Bar 
                  dataKey="visualizacoes" 
                  fill="hsl(var(--chart-1))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum produto visualizado ainda. As visualizações aparecerão aqui quando os produtos forem visualizados.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
