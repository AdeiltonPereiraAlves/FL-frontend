'use client'

import { createContext, useContext, ReactNode } from 'react'
import api from '@/services/api'
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiError } from '@/types/auth'

interface ApiContextType {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

interface ApiProviderProps {
  children: ReactNode
}

/**
 * Centraliza todas as chamadas de API com tratamento de erros padronizado
 * e interceptors para autenticação e segurança
 */
export function ApiProvider({ children }: ApiProviderProps) {
  const handleRequest = async <T,>(
    request: Promise<AxiosResponse<T>>
  ): Promise<T> => {
    try {
      const response = await request
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; erro?: string }>
      
      // Tratamento de erros padronizado
      if (axiosError.response) {
        const status = axiosError.response.status
        const message = axiosError.response.data?.message || 
                       axiosError.response.data?.erro || 
                       axiosError.message || 
                       'Erro ao processar requisição'

        // Erros específicos por status
        switch (status) {
          case 401:
            // Token expirado ou inválido - será tratado pelo interceptor
            throw new Error('Sessão expirada. Por favor, faça login novamente.')
          case 403:
            throw new Error('Você não tem permissão para realizar esta ação.')
          case 404:
            throw new Error('Recurso não encontrado.')
          case 422:
            throw new Error(message)
          case 500:
            throw new Error('Erro interno do servidor. Tente novamente mais tarde.')
          default:
            throw new Error(message)
        }
      }

      // Erro de rede
      if (axiosError.request) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
      }

      throw new Error(axiosError.message || 'Erro desconhecido')
    }
  }

  const apiMethods: ApiContextType = {
    get: <T,>(url: string, config?: AxiosRequestConfig) =>
      handleRequest<T>(api.get<T>(url, config)),
    
    post: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      handleRequest<T>(api.post<T>(url, data, config)),
    
    put: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      handleRequest<T>(api.put<T>(url, data, config)),
    
    delete: <T,>(url: string, config?: AxiosRequestConfig) =>
      handleRequest<T>(api.delete<T>(url, config)),
    
    patch: <T,>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      handleRequest<T>(api.patch<T>(url, data, config)),
  }

  return (
    <ApiContext.Provider value={apiMethods}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApiContext() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider')
  }
  return context
}
