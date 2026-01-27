'use client'

import { Header } from '@/components/Header'
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

      {/* Footer fixo (se necessário no futuro) */}
      {/* <footer className="mt-auto border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground text-sm">
            © 2024 Feira Livre. Todos os direitos reservados.
          </p>
        </div>
      </footer> */}
    </div>
  )
}
