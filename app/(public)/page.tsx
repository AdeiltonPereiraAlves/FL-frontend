'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { ButtonTestApi } from '@/components/ButtonTestApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Search, ShoppingBag, Store, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block">Encontre os melhores</span>
              <span className="block text-primary">produtos locais</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Descubra lojas incriveis perto de voce e compre com facilidade. 
              Conectamos voce aos melhores comerciantes da sua regiao.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="h-12 pl-10"
                />
              </div>
              <Button size="lg" className="h-12">
                Buscar
              </Button>
            </motion.div>

            {/* Test Backend Button */}
            <div className="mt-8">
              <ButtonTestApi />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: MapPin,
                title: 'Descubra Lojas',
                description: 'Encontre comerciantes proximos a voce com nosso mapa interativo.',
              },
              {
                icon: ShoppingBag,
                title: 'Compre Facil',
                description: 'Navegue pelos produtos e faca pedidos de forma simples e rapida.',
              },
              {
                icon: TrendingUp,
                title: 'Melhores Ofertas',
                description: 'Acompanhe promocoes e ofertas exclusivas das lojas parceiras.',
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="h-full border-0 bg-background shadow-sm">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Map Placeholder Section */}
      <section id="products" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-foreground">Explore o Mapa</h2>
            <p className="mt-2 text-muted-foreground">
              Visualize lojas e produtos proximos a voce
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            {/* Map Placeholder */}
            <div className="flex h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  Mapa Interativo
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  (Em breve: integracao com mapa real)
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Store className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-3xl font-bold text-foreground">
              Quer vender seus produtos?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Cadastre sua loja e alcance mais clientes na sua regiao.
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                <Button asChild size="lg">
                  <Link href="/dashboard">Acessar Minha Loja</Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/login">Comece Agora</Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-[#002C53]">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>Marketplace - Conectando voce aos melhores comerciantes locais.</p>
        </div>
      </footer>
    </div>
  )
}
