'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, AuthContextType, LoginCredentials } from '@/types/auth'
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
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
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


  //cadastro
  const cadastro = useCallback(async (credentials: CadastroCredentials) => {
    setIsLoading(true)
    try {
      // TODO: Replace with real API call when backend is ready
      // const response = await api.post('/auth/login', credentials)
      // const { user, token } = response.data
      const response = await api.post('/registrar', credentials)
      const { usuario, token } = response.data;

      // Mock login - simulating API delay

      if (!usuario || !token) {
        throw new Error("Erro no cadastro")
      }
      // Validate mock credentials (for demo purposes)


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
  // Login with email/password
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      // TODO: Replace with real API call when backend is ready
      // const response = await api.post('/auth/login', credentials)
      // const { user, token } = response.data
      const response = await api.post('/login', credentials)
      const { usuario, token } = response.data;

      console.log(usuario, token,"usuario no login")
      if (!usuario || !token) {
        throw new Error("Erro no login")
      }
      // Mock login - simulating API delay


      // Validate mock credentials (for demo purposes)


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
      const response = await api.post('/auth/google', {
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
    cadastro
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
