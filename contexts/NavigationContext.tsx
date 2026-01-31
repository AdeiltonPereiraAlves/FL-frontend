'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationState {
  currentView: 'home' | 'loja' | 'produto' | 'checkout' | 'produtos'
  lojaId: string | null
  produtoId: string | null
  previousView: 'home' | 'loja' | 'produto' | 'checkout' | 'produtos' | null
  scrollPosition?: number
}

interface NavigationHistoryItem {
  view: 'home' | 'loja' | 'produto' | 'checkout' | 'produtos'
  lojaId?: string | null
  produtoId?: string | null
  url: string
}

interface NavigationContextType {
  state: NavigationState
  navigateToLoja: (lojaId: string) => void
  navigateToHome: () => void
  resetToHome: () => void
  navigateToProduto: (produtoId: string) => void
  navigateToCheckout: () => void
  navigateToProdutos: () => void
  goBack: () => void
  canGoBack: () => boolean
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [historyStack, setHistoryStack] = useState<NavigationHistoryItem[]>(() => {
    // Inicializar pilha baseado na URL atual
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const initialItem: NavigationHistoryItem = {
        view: 'home',
        lojaId: null,
        produtoId: null,
        url: '/',
      }
      
      if (path.startsWith('/loja/')) {
        const lojaId = path.split('/loja/')[1]?.split('/')[0]
        if (lojaId) {
          return [
            { view: 'home', lojaId: null, produtoId: null, url: '/' },
            { view: 'loja', lojaId, produtoId: null, url: `/loja/${lojaId}` },
          ]
        }
      } else if (path === '/checkout') {
        return [
          { view: 'home', lojaId: null, produtoId: null, url: '/' },
          { view: 'checkout', lojaId: null, produtoId: null, url: '/checkout' },
        ]
      } else if (path === '/produtos') {
        return [
          { view: 'home', lojaId: null, produtoId: null, url: '/' },
          { view: 'produtos', lojaId: null, produtoId: null, url: '/produtos' },
        ]
      }
      
      return [initialItem]
    }
    return [{ view: 'home', lojaId: null, produtoId: null, url: '/' }]
  })

  const [state, setState] = useState<NavigationState>(() => {
    // Inicializar estado baseado na pilha
    const current = historyStack[historyStack.length - 1] || { view: 'home', lojaId: null, produtoId: null, url: '/' }
    const previous = historyStack.length > 1 ? historyStack[historyStack.length - 2] : null
    
    return {
      currentView: current.view,
      lojaId: current.lojaId || null,
      produtoId: current.produtoId || null,
      previousView: previous?.view || null,
    }
  })

  // Listener para botão voltar/avançar do navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state
      if (state) {
        if (state.view === 'home') {
          setState({
            currentView: 'home',
            lojaId: null,
            produtoId: null,
            previousView: null,
          })
          setTimeout(() => {
            const mapaElement = document.getElementById('mapa-container')
            if (mapaElement) {
              mapaElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 150)
        } else if (state.view === 'loja' && state.lojaId) {
          setState({
            currentView: 'loja',
            lojaId: state.lojaId,
            produtoId: null,
            previousView: 'home',
          })
        }
      } else {
        // Se não há state, verificar URL
        const path = window.location.pathname
        if (path === '/') {
          setState({
            currentView: 'home',
            lojaId: null,
            produtoId: null,
            previousView: null,
          })
        } else if (path.startsWith('/loja/')) {
          const lojaId = path.split('/loja/')[1]?.split('/')[0]
          if (lojaId) {
            setState({
              currentView: 'loja',
              lojaId,
              produtoId: null,
              previousView: 'home',
            })
          }
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToLoja = useCallback((lojaId: string) => {
    const newItem: NavigationHistoryItem = {
      view: 'loja',
      lojaId,
      produtoId: null,
      url: `/loja/${lojaId}`,
    }
    
    setHistoryStack((prev) => [...prev, newItem])
    setState((prev) => ({
      currentView: 'loja',
      lojaId,
      produtoId: null,
      previousView: prev.currentView,
      scrollPosition: typeof window !== 'undefined' ? window.scrollY : 0,
    }))
    
    // Usar router.push para navegação real no Next.js (deferido para evitar update durante render)
    setTimeout(() => {
      router.push(`/loja/${lojaId}`)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      }
    }, 0)
  }, [router])

  const navigateToHome = useCallback(() => {
    const newItem: NavigationHistoryItem = {
      view: 'home',
      lojaId: null,
      produtoId: null,
      url: '/',
    }
    
    setHistoryStack((prev) => [...prev, newItem])
    setState((prev) => ({
      currentView: 'home',
      lojaId: null,
      produtoId: null,
      previousView: prev.currentView,
    }))
    
    // Usar router.push para navegação real no Next.js (deferido para evitar update durante render)
    setTimeout(() => {
      router.push('/')
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const mapaElement = document.getElementById('mapa-container')
          if (mapaElement) {
            mapaElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 200)
      }
    }, 0)
  }, [router])

  // Função para resetar para home (usada quando clica na logo - limpa o histórico)
  const resetToHome = useCallback(() => {
    const homeItem: NavigationHistoryItem = {
      view: 'home',
      lojaId: null,
      produtoId: null,
      url: '/',
    }
    
    // Resetar histórico para apenas a home
    setHistoryStack([homeItem])
    setState({
      currentView: 'home',
      lojaId: null,
      produtoId: null,
      previousView: null,
    })
    
    // Usar router.push para navegação real no Next.js (deferido para evitar update durante render)
    setTimeout(() => {
      router.push('/')
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const mapaElement = document.getElementById('mapa-container')
          if (mapaElement) {
            mapaElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 200)
      }
    }, 0)
  }, [router])

  const navigateToCheckout = useCallback(() => {
    const newItem: NavigationHistoryItem = {
      view: 'checkout',
      lojaId: null,
      produtoId: null,
      url: '/checkout',
    }
    
    setHistoryStack((prev) => [...prev, newItem])
    setState((prev) => ({
      currentView: 'checkout',
      lojaId: null,
      produtoId: null,
      previousView: prev.currentView,
    }))
    
    // Usar router.push para navegação real no Next.js (deferido para evitar update durante render)
    setTimeout(() => {
      router.push('/checkout')
    }, 0)
  }, [router])

  const navigateToProdutos = useCallback(() => {
    const newItem: NavigationHistoryItem = {
      view: 'produtos',
      lojaId: null,
      produtoId: null,
      url: '/produtos',
    }
    
    setHistoryStack((prev) => [...prev, newItem])
    setState((prev) => ({
      currentView: 'produtos',
      lojaId: null,
      produtoId: null,
      previousView: prev.currentView,
    }))
    
    // Usar router.push para navegação real no Next.js (deferido para evitar update durante render)
    setTimeout(() => {
      router.push('/produtos')
    }, 0)
  }, [router])

  const navigateToProduto = useCallback((produtoId: string) => {
    setState((prev) => ({
      currentView: 'produto',
      lojaId: prev.lojaId,
      produtoId,
      previousView: prev.currentView,
    }))
  }, [])

  const goBack = useCallback(() => {
    setHistoryStack((prev) => {
      if (prev.length <= 1) {
        return prev // Não pode voltar se só tem um item na pilha
      }
      
      const newStack = prev.slice(0, -1) // Remove o último item
      const previousItem = newStack[newStack.length - 1] || { view: 'home', lojaId: null, produtoId: null, url: '/' }
      const previousPrevious = newStack.length > 1 ? newStack[newStack.length - 2] : null
      
      setState({
        currentView: previousItem.view,
        lojaId: previousItem.lojaId || null,
        produtoId: previousItem.produtoId || null,
        previousView: previousPrevious?.view || null,
      })
      
      // Usar router.push para navegação real no Next.js (deferido para evitar update durante render)
      setTimeout(() => {
        router.push(previousItem.url)
        
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            if (previousItem.view === 'home') {
              setTimeout(() => {
                const mapaElement = document.getElementById('mapa-container')
                if (mapaElement) {
                  mapaElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }, 200)
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }, 100)
        }
      }, 0)
      
      return newStack
    })
  }, [router])

  const canGoBack = useCallback(() => {
    return historyStack.length > 1
  }, [historyStack.length])

  return (
    <NavigationContext.Provider
      value={{
        state,
        navigateToLoja,
        navigateToHome,
        resetToHome,
        navigateToProduto,
        navigateToCheckout,
        navigateToProdutos,
        goBack,
        canGoBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
