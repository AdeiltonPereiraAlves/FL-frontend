'use client'

import { useAuth } from './useAuth'
import { TipoPapel } from '@/types/auth'

/**
 * Hook para verificar roles e permissões do usuário
 * Fornece métodos utilitários para verificação de acesso baseado em roles
 */
export function useRole() {
  const { user, isAuthenticated } = useAuth()

  /**
   * Verifica se o usuário tem um role específico
   */
  const hasRole = (role: TipoPapel): boolean => {
    if (!isAuthenticated || !user?.papeis) return false
    
    return user.papeis.some((papel) => papel.tipo === role)
  }

  /**
   * Verifica se o usuário tem pelo menos um dos roles especificados
   */
  const hasAnyRole = (roles: TipoPapel[]): boolean => {
    if (!isAuthenticated || !user?.papeis) return false
    
    return user.papeis.some((papel) => roles.includes(papel.tipo))
  }

  /**
   * Verifica se o usuário tem todos os roles especificados
   */
  const hasAllRoles = (roles: TipoPapel[]): boolean => {
    if (!isAuthenticated || !user?.papeis) return false
    
    const userRoles = user.papeis.map((papel) => papel.tipo)
    return roles.every((role) => userRoles.includes(role))
  }

  /**
   * Verifica se o usuário é lojista
   */
  const isLojista = (): boolean => {
    return hasRole(TipoPapel.LOJISTA)
  }

  /**
   * Verifica se o usuário é admin
   */
  const isAdmin = (): boolean => {
    return hasRole(TipoPapel.ADMIN) || hasRole(TipoPapel.DONO_SISTEMA)
  }

  /**
   * Verifica se o usuário é cliente
   */
  const isCliente = (): boolean => {
    return hasRole(TipoPapel.CLIENTE)
  }

  /**
   * Verifica se o usuário é trabalhador
   */
  const isTrabalhador = (): boolean => {
    return hasRole(TipoPapel.TRABALHADOR)
  }

  /**
   * Verifica se o usuário é dono do sistema
   */
  const isDonoSistema = (): boolean => {
    return hasRole(TipoPapel.DONO_SISTEMA)
  }

  /**
   * Retorna todos os roles do usuário
   */
  const getUserRoles = (): TipoPapel[] => {
    if (!isAuthenticated || !user?.papeis) return []
    return user.papeis.map((papel) => papel.tipo)
  }

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isLojista,
    isAdmin,
    isCliente,
    isTrabalhador,
    isDonoSistema,
    getUserRoles,
  }
}
