import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { sanitizeObject } from '@/utils/security'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000, // Aumentado para 30s para carregar produtos completos com muitas relações
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token and sanitize data
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Adiciona token de autenticação
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // IMPORTANTE: Se for FormData, remove Content-Type para o navegador definir automaticamente
      // com o boundary correto
      if (config.data instanceof FormData) {
        // Remove Content-Type para permitir que o navegador defina com boundary
        if (config.headers) {
          delete config.headers['Content-Type']
        }
      } else {
        // Sanitiza dados do body para POST/PUT/PATCH (apenas se não for FormData)
        if (config.data && typeof config.data === 'object') {
          config.data = sanitizeObject(config.data)
        }
      }

      // Sanitiza parâmetros da URL
      if (config.params && typeof config.params === 'object') {
        config.params = sanitizeObject(config.params)
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Evita redirecionamento em loops
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    } else if (error.response?.status === 403) {
      // Forbidden - usuário não tem permissão
      if (typeof window !== 'undefined' && window.location.pathname !== '/unauthorized') {
        window.location.href = '/unauthorized'
      }
    }
    return Promise.reject(error)
  }
)

export default api
