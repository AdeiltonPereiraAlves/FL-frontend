'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { TipoPapel } from '@/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: TipoPapel[]
  requireAnyRole?: boolean // Se true, precisa de qualquer role. Se false, precisa de todos
  redirectTo?: string
}

/**
 * Componente para proteger rotas baseado em autenticação e roles
 * 
 * @param requiredRoles - Lista de roles necessários para acessar a rota
 * @param requireAnyRole - Se true, usuário precisa ter qualquer um dos roles. Se false, precisa ter todos
 * @param redirectTo - Rota para redirecionar se não autorizado (padrão: /login)
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requireAnyRole = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasAnyRole, hasAllRoles } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Verifica autenticação
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Verifica roles se especificados
    if (requiredRoles && requiredRoles.length > 0) {
      const hasAccess = requireAnyRole
        ? hasAnyRole(requiredRoles)
        : hasAllRoles(requiredRoles)

      if (!hasAccess) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, requireAnyRole, hasAnyRole, hasAllRoles, router, redirectTo])

  // Mostra loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
      </div>
    )
  }

  // Não renderiza até verificar permissões
  if (!isAuthenticated) {
    return null
  }

  // Verifica roles antes de renderizar
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAnyRole
      ? hasAnyRole(requiredRoles)
      : hasAllRoles(requiredRoles)

    if (!hasAccess) {
      return null
    }
  }

  return <>{children}</>
}
