'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useUsuariosVsVisitantes } from '@/hooks/useDashboard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Loader2, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const chartConfig = {
  visitantes: {
    label: 'Visitantes',
    color: '#16A34A',
  },
  usuarios: {
    label: 'Usuários',
    color: '#15803D',
  },
}

export function GraficoVisitantesUsuarios() {
  const { data, loading, error } = useUsuariosVsVisitantes(7)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Crescimento de Usuários
          </CardTitle>
          <CardDescription>
            Comparação entre visitantes e novos usuários nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Crescimento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-center py-8">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    data: format(new Date(item.data), 'dd/MM', { locale: ptBR }),
    visitantes: item.visitantes,
    usuarios: item.usuarios,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#15803D]" />
          Crescimento de Usuários
        </CardTitle>
        <CardDescription>
          Comparação entre visitantes e novos usuários nos últimos 7 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="data"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="visitantes"
              stroke="var(--color-visitantes)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-visitantes)', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="usuarios"
              stroke="var(--color-usuarios)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-usuarios)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
