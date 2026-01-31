'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          <ShieldX className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso é um erro.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/">Voltar para Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
