'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { CadastroCredentials, LoginCredentials } from '@/types/auth'

export function useAuth() {
  const auth = useAuthContext()
  const router = useRouter()

  const loginAndRedirect = useCallback(
    async (credentials: LoginCredentials, redirectTo: string = '/dashboard') => {
      await auth.login(credentials)
      router.push(redirectTo)
    },
    [auth, router]
  )
  const cadastroAndRedirect = useCallback(
    async (credentials: CadastroCredentials, redirectTo: string = '/dashboard') => {
      await auth.cadastro(credentials)
      router.push(redirectTo)
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
