'use client'

import { useState, useCallback } from 'react'
import api from '@/services/api'
import { AxiosError, AxiosRequestConfig } from 'axios'
import { ApiError } from '@/types/auth'



interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: ApiError | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
}

export function useApi<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (config?: AxiosRequestConfig): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await api.request<T>({
          url: endpoint,
          method,
          ...config,
        })

        setState({
          data: response.data,
          isLoading: false,
          error: null,
        })

        return response.data
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>
        const apiError: ApiError = {
          message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
          status: axiosError.response?.status,
        }

        setState({
          data: null,
          isLoading: false,
          error: apiError,
        })

        return null
      }
    },
    [endpoint, method]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
      isLoading: false,
      error: null,
    }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

// Health check hook
export function useHealthCheck() {
  return useApi<{ status: string; message?: string }>('/health', 'GET')
}
