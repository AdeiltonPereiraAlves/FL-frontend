import { useState, useEffect } from 'react'
import { useApiContext } from '@/contexts/ApiContext'

interface ResumoDashboard {
  totalVisitantes: number
  totalUsuarios: number
  visitantesHoje: number
  usuariosHoje: number
  totalLeads: number
  leadsHoje: number
}

interface UsuarioVsVisitante {
  data: string
  visitantes: number
  usuarios: number
}

interface LeadPorEntidade {
  entidade: {
    id: string
    nome: string
  }
  totalLeads: number
  valorMedioEstimado: number | null
}

interface LeadPorDia {
  data: string
  total: number
}

export function useDashboardResumo() {
  const api = useApiContext()
  const [data, setData] = useState<ResumoDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<ResumoDashboard>('/admin/dashboard/resumo')
        setData(response)
      } catch (err: any) {
        const errorMessage = err?.message || err?.response?.data?.erro || 'Erro ao carregar dados'
        setError(errorMessage)
        console.error('Erro ao buscar resumo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])

  return { data, loading, error }
}

export function useUsuariosVsVisitantes(dias: number = 7) {
  const api = useApiContext()
  const [data, setData] = useState<UsuarioVsVisitante[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<UsuarioVsVisitante[]>(
          `/admin/dashboard/usuarios-vs-visitantes?dias=${dias}`
        )
        setData(response)
      } catch (err: any) {
        const errorMessage = err?.message || err?.response?.data?.erro || 'Erro ao carregar dados'
        setError(errorMessage)
        console.error('Erro ao buscar usuários vs visitantes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api, dias])

  return { data, loading, error }
}

export function useLeadsPorEntidade() {
  const api = useApiContext()
  const [data, setData] = useState<LeadPorEntidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<LeadPorEntidade[]>(
          '/admin/dashboard/leads-por-entidade'
        )
        setData(response)
      } catch (err: any) {
        const errorMessage = err?.message || err?.response?.data?.erro || 'Erro ao carregar dados'
        setError(errorMessage)
        console.error('Erro ao buscar leads por entidade:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])

  return { data, loading, error }
}

export function useLeadsPorDia(dias: number = 30) {
  const api = useApiContext()
  const [data, setData] = useState<LeadPorDia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<LeadPorDia[]>(
          `/admin/dashboard/leads-por-dia?dias=${dias}`
        )
        setData(response)
      } catch (err: any) {
        const errorMessage = err?.message || err?.response?.data?.erro || 'Erro ao carregar dados'
        setError(errorMessage)
        console.error('Erro ao buscar leads por dia:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api, dias])

  return { data, loading, error }
}
