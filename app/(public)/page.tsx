'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Search, ShoppingBag, Store, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/useApi'

import dynamic from 'next/dynamic'
import { useUserLocation } from '@/hooks/useUserLocation'
const Map = dynamic(() => import('@/components/mapa/MapaEntidades'), {
  ssr: false,
})
const DEFAULT_LOCATION: [number, number] = [-6.89, -38.56]
const SOUSA_PB: [number, number] = [-6.7590, -38.2316]

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const userLocation = useUserLocation()
  const [cidadeId, setCidadeId] = useState('')
  const [busca, setBusca] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])

  const cidadesApi = useApi<any[]>('/cidades')
  const produtosApi = useApi<any[]>('/produtos/cidade')

  useEffect(() => {
    console.log(produtos, "produtos")
    cidadesApi.execute()
  }, [])

  async function buscar() {
    if (!cidadeId || !busca) return

    const data = await produtosApi.execute({
      params: {
        cidadeId,
        query: busca,
      },
    })

    if (data) setProdutos(data)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl font-bold">
            Encontre os melhores <span className="text-primary">produtos locais</span>
          </h1>

          <p className="mt-4 text-muted-foreground">
            Compare preços, descubra lojas e economize perto de você.
          </p>

          {/* BUSCA */}
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
              placeholder="Ex: carne, arroz, refrigerante..."
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

      {/* MAPA */}
      
        <section className="py-16  ">
          <div className=" px-4 h-screen w-full">
            <h2 className="mb-4 text-2xl font-bold">
              Melhores preços encontrados
            </h2>
            <Map produtos={produtos} />
          </div>
        </section>
      

      {/* CTA
      <section className="border-t py-20 text-center">
        <Store className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-3xl font-bold">Quer vender seus produtos?</h2>
        <p className="mt-2 text-muted-foreground">
          Cadastre sua loja e alcance mais clientes.
        </p>

        <div className="mt-6">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Acessar painel</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/login">Começar agora</Link>
            </Button>
          )}
        </div>
      </section> */}
    </div>
  )
}
