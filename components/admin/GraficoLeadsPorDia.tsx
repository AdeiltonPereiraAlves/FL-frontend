'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useLeadsPorDia } from '@/hooks/useDashboard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts'
import { Loader2, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const chartConfig = {
  total: {
    label: 'Leads',
    color: '#15803D',
  },
} as const

export function GraficoLeadsPorDia() {
  const [dias, setDias] = useState(30)
  const { data, loading, error } = useLeadsPorDia(dias)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Crescimento do Uso do Sistema
          </CardTitle>
          <CardDescription>
            Leads gerados por dia - Últimos {dias} dias
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
            <MessageSquare className="h-5 w-5" />
            Crescimento do Uso do Sistema
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
    total: item.total,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#15803D]" />
              Crescimento do Uso do Sistema
            </CardTitle>
            <CardDescription>
              Leads gerados por dia - Últimos {dias} dias
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={dias === 7 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDias(7)}
              className={dias === 7 ? 'bg-[#15803D] text-white' : ''}
            >
              7 dias
            </Button>
            <Button
              variant={dias === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDias(30)}
              className={dias === 30 ? 'bg-[#15803D] text-white' : ''}
            >
              30 dias
            </Button>
            <Button
              variant={dias === 90 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDias(90)}
              className={dias === 90 ? 'bg-[#15803D] text-white' : ''}
            >
              90 dias
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803D" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#15803D" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="total"
              stroke="#15803D"
              strokeWidth={2}
              fill="url(#colorLeads)"
            />
          </AreaChart>
        </ChartContainer>
        {data.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum lead registrado no período selecionado
          </p>
        )}
      </CardContent>
    </Card>
  )
}
