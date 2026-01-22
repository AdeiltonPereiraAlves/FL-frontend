'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/useApi'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/mapa/MapaEntidades'), {
  ssr: false,
})

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  const [cidadeId, setCidadeId] = useState('')
  const [busca, setBusca] = useState('')

  const [entidades, setEntidades] = useState<any[]>([])
  const [entidadesDestaqueIds, setEntidadesDestaqueIds] = useState<string[]>([])
  const [produtos, setProdutos] = useState<any[]>([])

  const cidadesApi = useApi<any[]>('/cidades')
  const entidadesApi = useApi<any[]>('/entidades/mapa')
  const produtosApi = useApi<any[]>('/produtos/cidade')

  useEffect(() => {
    cidadesApi.execute()

    entidadesApi.execute().then((data) => {
      if (data) setEntidades(data)
    })
  }, [])


  async function buscar() {
    if (!cidadeId || !busca) return

    const data = await produtosApi.execute({
      params: { cidadeId, query: busca },
    })

    if (!data) return

    setProdutos(data)

    // 🔥 lojas que têm o produto
    const ids = data.map((p: any) => p.entidade.id)
    setEntidadesDestaqueIds(ids)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="py-18 pb-2">
        <div className="mx-auto max-w-4xl px-4 text-center pb-2">
          <h1 className="text-5xl font-bold">
            Encontre os melhores <span className="text-[#E9571C]">produtos pelo melhor preço!!!</span>
          </h1>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <select
              className="h-12 rounded-md border px-3"
              value={cidadeId}
              onChange={(e) => setCidadeId(e.target.value)}
            >
              <option value="">Escolha a cidade</option>
              {cidadesApi.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} - {c.estado}
                </option>
              ))}
            </select>

            <Input
              placeholder="Ex: arroz, carne, refrigerante..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-12"
            />

            <Button onClick={buscar} size="lg" className="h-12">
              <Search className="mr-2 h-5 w-5" />
              Buscar
            </Button>
          </div>
        </div>
      </section>

      {/* MAPA — SEMPRE VISÍVEL */}
      <section className="py-16">
        <div className="px-16">
          <Map
            entidades={entidades}
            produtos={produtos}
            entidadesDestaqueIds={entidadesDestaqueIds}
          />
        </div>
      </section>
    </div>
  )
}
