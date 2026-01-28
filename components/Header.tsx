'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { User, Menu } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { SubHeader } from './SubHeader'
import { BuscaHeader } from './BuscaHeader'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'

export function Header() {
  const router = useRouter()
  const { resetToHome } = useNavigation()
  const { isAuthenticated, user, logoutAndRedirect, isLoading } = useAuth()
  const { isLojista, isAdmin, isDonoSistema } = useRole()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Determina qual dashboard mostrar baseado no role
  const getDashboardLink = () => {
    if (isDonoSistema() || isAdmin()) {
      return '/admin/dashboard'
    }
    if (isLojista()) {
      return '/lojista/dashboard'
    }
    return '/dashboard'
  }

  const getDashboardLabel = () => {
    if (isDonoSistema() || isAdmin()) {
      return 'Dashboard'
    }
    if (isLojista()) {
      return 'Minha Loja'
    }
    return 'Dashboard'
  }

  return (
    <>
      <SubHeader />
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 w-full border-b border-border bg-[#15803D]"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 gap-2">
          {/* Logo */}
          <button
            onClick={(e) => {
              e.preventDefault()
              resetToHome()
            }}
            className="flex items-center gap-1 sm:gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo/logofeiralivre.png"
              alt="Feira Livre - Logo"
              width={40}
              height={24}
              className="rounded-full object-cover"
              priority
            />
            <span className="text-lg sm:text-xl font-semibold text-white hidden sm:inline">Feira Livre</span>
          </button>

          {/* Busca - Na mesma linha da logo */}
          <BuscaHeader 
            onSearch={(query, cidadeId) => {
              // Se estiver na home, não redireciona - a busca será tratada pela própria página
              // Se estiver em produtos, redireciona para produtos com busca
              const pathname = window.location.pathname
              if (pathname === '/') {
                // Na home, dispara evento customizado para a página tratar
                window.dispatchEvent(new CustomEvent('feiralivre:buscar', {
                  detail: { query, cidadeId }
                }))
              } else if (pathname === '/produtos') {
                // Na página de produtos, redireciona com query
                router.push(`/produtos?busca=${encodeURIComponent(query)}`)
              } else {
                // Em outras páginas, vai para produtos
                router.push(`/produtos?busca=${encodeURIComponent(query)}`)
              }
            }}
            initialCidadeId={typeof window !== 'undefined' ? 
              (sessionStorage.getItem('feiralivre:cidadeSelecionada') || '') : ''
            }
          />

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-4 md:flex flex-shrink-0">
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user?.name || user?.nome}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center gap-2">
                      {getDashboardLabel()}
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin() || isDonoSistema()) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          Painel Administrativo
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2">
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutAndRedirect()}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border md:hidden bg-white"
          >
            <div className="space-y-1 px-4 py-3">
              <Link
                href="/produtos"
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produtos
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {getDashboardLabel()}
                  </Link>
                  {(isAdmin() || isDonoSistema()) && (
                    <Link
                      href="/admin"
                      className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Painel Admin
                    </Link>
                  )}
                  <Link
                    href="/perfil"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  <button
                    onClick={() => {
                      logoutAndRedirect()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-destructive hover:bg-accent"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/cadastro"
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cadastre-se
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.header>
    </>
  )
}
