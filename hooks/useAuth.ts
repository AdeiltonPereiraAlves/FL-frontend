'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { CadastroCredentials, LoginCredentials, TipoPapel } from '@/types/auth'

// Função helper para determinar o redirecionamento baseado no papel do usuário
function getRedirectPath(user: any): string {
  if (!user?.papeis || !Array.isArray(user.papeis)) {
    // Se não tem papéis definidos, assume cliente e vai para home
    return '/'
  }

  const papeis = user.papeis.map((p: any) => p.tipo)
  const isDono = papeis.includes(TipoPapel.DONO_SISTEMA)
  const isAdminUser = papeis.includes(TipoPapel.ADMIN)
  const isLojista = papeis.includes(TipoPapel.LOJISTA)
  const isCliente = papeis.includes(TipoPapel.CLIENTE)

  if (isDono || isAdminUser) {
    return '/admin/dashboard'
  }

  if (isLojista) {
    return '/lojista/dashboard'
  }

  // Cliente ou usuário sem papel específico vai para home
  if (isCliente || papeis.length === 0) {
    return '/'
  }

  // Fallback: home
  return '/'
}

export function useAuth() {
  const auth = useAuthContext()
  const router = useRouter()

  const loginAndRedirect = useCallback(
    async (credentials: LoginCredentials, redirectTo?: string) => {
      await auth.login(credentials)
      
      // Aguardar um pouco para o estado ser atualizado no localStorage
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Se não especificar redirectTo, determina baseado no papel do usuário
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          const path = redirectTo || getRedirectPath(userData)
          router.push(path)
        } catch {
          router.push(redirectTo || '/')
        }
      } else {
        router.push(redirectTo || '/')
      }
    },
    [auth, router]
  )
  
  const cadastroAndRedirect = useCallback(
    async (credentials: CadastroCredentials, redirectTo?: string) => {
      await auth.cadastro(credentials)
      
      // Aguardar um pouco para o estado ser atualizado no localStorage
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Verificar papel e redirecionar corretamente
      // Clientes vão para home (/), admins/lojistas para seus dashboards
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          const path = redirectTo || getRedirectPath(userData)
          router.push(path)
        } catch {
          // Se não conseguir parsear, vai para home (cliente padrão)
          router.push(redirectTo || '/')
        }
      } else {
        // Se não houver usuário, vai para home (cliente padrão)
        router.push(redirectTo || '/')
      }
    },
    [auth, router]
  )

  const logoutAndRedirect = useCallback(
    (redirectTo: string = '/') => {
      auth.logout()
      router.push(redirectTo)
    },
    [auth, router]
  )

  const requireAuth = useCallback(
    (redirectTo: string = '/login') => {
      if (!auth.isLoading && !auth.isAuthenticated) {
        router.push(redirectTo)
        return false
      }
      return true
    },
    [auth.isAuthenticated, auth.isLoading, router]
  )

  return {
    ...auth,
    loginAndRedirect,
    logoutAndRedirect,
    requireAuth,
    cadastroAndRedirect,
    // Métodos de role do contexto
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    isLojista: auth.isLojista,
    isAdmin: auth.isAdmin,
    isCliente: auth.isCliente,
  }
}
