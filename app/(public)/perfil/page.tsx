'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { Loader2, Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PerfilPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#15803D]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="rounded-full bg-amber-100 p-6 mb-6">
            <Construction className="h-16 w-16 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Página em Desenvolvimento
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Estamos trabalhando para trazer uma experiência completa de perfil.
            Em breve você poderá editar seus dados, gerenciar preferências e muito mais.
          </p>
          <Button asChild className="bg-[#15803D] hover:bg-[#15803D]/90">
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </motion.div>
    </div>
  )
}
