'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/layout/Footer'
import { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <Header />
      </header>

      {/* Conteúdo dinâmico */}
      <main className="flex-1">
        {children}
      </main>

      {/* Rodapé global */}
      <Footer />
    </div>
  )
}
