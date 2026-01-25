'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, AuthContextType, LoginCredentials, TipoPapel } from '@/types/auth'
import api from '@/services/api'
import { CadastroCredentials } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for development
const MOCK_USER: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
}

const MOCK_TOKEN = 'mock-jwt-token-12345'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch {
        // limpa dados corrompidos
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
      }
    }

    setIsLoading(false)
  }, [])

  // Funções de verificação de roles
  const hasRole = useCallback((role: TipoPapel): boolean => {
    if (!user?.papeis) return false
    return user.papeis.some((papel) => papel.tipo === role)
  }, [user])

  const hasAnyRole = useCallback((roles: TipoPapel[]): boolean => {
    if (!user?.papeis) return false
    return user.papeis.some((papel) => roles.includes(papel.tipo))
  }, [user])

  const isLojista = useCallback((): boolean => {
    return hasRole(TipoPapel.LOJISTA)
  }, [hasRole])

  const isAdmin = useCallback((): boolean => {
    return hasRole(TipoPapel.ADMIN) || hasRole(TipoPapel.DONO_SISTEMA)
  }, [hasRole])

  const isCliente = useCallback((): boolean => {
    return hasRole(TipoPapel.CLIENTE)
  }, [hasRole])


  //cadastro
  const cadastro = useCallback(async (credentials: CadastroCredentials) => {
    setIsLoading(true)
    try {
      const response = await api.post<{ usuario: User; token: string }>('/registrar', credentials)
      const { usuario, token } = response.data

      if (!usuario || !token) {
        throw new Error("Erro no cadastro")
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(usuario))

      setToken(token)
      setUser(usuario)
    } catch (error) {
      console.error('Cadastro error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login with email/password
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await api.post<{ usuario: User; token: string }>('/login', credentials)
      const { usuario, token } = response.data

      if (!usuario || !token) {
        throw new Error("Erro no login")
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(usuario))

      setToken(token)
      setUser(usuario)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])


  // // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])


  const loginWithGoogle = useCallback(async (idToken: string) => {
    setIsLoading(true)
    try {
      const response = await api.post<{ usuario: User; token: string }>('/auth/google', {
        credential: idToken,
      })

      const { usuario, token } = response.data
      if (!usuario || !token) {
        throw new Error("Erro no login")
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(usuario))

      setToken(token)
      setUser(usuario)
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    cadastro,
    hasRole,
    hasAnyRole,
    isLojista,
    isAdmin,
    isCliente,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
