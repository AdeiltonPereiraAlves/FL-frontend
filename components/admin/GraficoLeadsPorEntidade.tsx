'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useLeadsPorEntidade } from '@/hooks/useDashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Loader2, Building2 } from 'lucide-react'

const chartConfig = {
  leads: {
    label: 'Leads',
    color: '#15803D',
  },
}

export function GraficoLeadsPorEntidade() {
  const { data, loading, error } = useLeadsPorEntidade()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lojas com Maior Interesse de Compra
          </CardTitle>
          <CardDescription>
            Entidades que mais recebem clientes (Leads)
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
            <Building2 className="h-5 w-5" />
            Lojas com Maior Interesse de Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-center py-8">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Limitar a top 10 e formatar para o gráfico
  const topEntidades = data.slice(0, 10)
  const chartData = topEntidades.map((item) => ({
    nome: item.entidade.nome.length > 20 
      ? item.entidade.nome.substring(0, 20) + '...' 
      : item.entidade.nome,
    leads: item.totalLeads,
    valorMedio: item.valorMedioEstimado ? Number(item.valorMedioEstimado.toFixed(2)) : 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#15803D]" />
          Lojas com Maior Interesse de Compra
        </CardTitle>
        <CardDescription>
          Clientes enviados para lojas (Leads) - Top 10
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              type="category"
              dataKey="nome"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={150}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'rgba(21, 128, 61, 0.1)' }}
            />
            <Bar
              dataKey="leads"
              fill="var(--color-leads)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
        {topEntidades.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum lead registrado ainda
          </p>
        )}
      </CardContent>
    </Card>
  )
}
