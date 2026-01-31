'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Shield, Store, LogOut } from 'lucide-react'

export function SubHeader() {
  const { isAuthenticated, logoutAndRedirect, isLoading } = useAuth()
  const { isLojista, isAdmin, isDonoSistema } = useRole()

  // Não mostrar dashboard para cliente (apenas para admin, dono ou lojista)
  const mostrarDashboard = isDonoSistema() || isAdmin() || isLojista()

  const getDashboardLink = () => {
    if (isDonoSistema() || isAdmin()) {
      return '/admin/dashboard'
    }
    if (isLojista()) {
      return '/lojista/dashboard'
    }
    return '/'
  }

  const getDashboardLabel = () => {
    if (isDonoSistema() || isAdmin()) {
      return 'Painel Admin'
    }
    if (isLojista()) {
      return 'Minha Loja'
    }
    return 'Dashboard'
  }

  if (isLoading) {
    return (
      <div className="bg-[#15803D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="h-6 animate-pulse bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#15803D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between text-sm">
          <nav className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                {mostrarDashboard && (
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    {getDashboardLabel()}
                  </Link>
                )}
                {(isAdmin() || isDonoSistema()) && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </Link>
                )}
                {isLojista() && (
                  <Link
                    href="/lojista/dashboard"
                    className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Minha Loja
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/produtos"
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              Produtos
            </Link>
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutAndRedirect()}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sair
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button size="sm" className="bg-white hover:bg-white/90 text-[#16A34A] font-medium">
                    Cadastre-se
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
