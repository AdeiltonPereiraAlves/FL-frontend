/**
 * Utilitários para gerenciar planos de entidades no frontend
 * 
 * Estrutura esperada em EntidadeConfiguracao:
 * {
 *   "chave": "plano",
 *   "valor": {
 *     "tipo": "FREE" | "BASICO" | "PREMIUM" | "PREMIUM_MAX",
 *     "nivel": 0 | 1 | 2 | 3
 *   }
 * }
 */

export type TipoPlano = 'FREE' | 'BASICO' | 'PREMIUM' | 'PREMIUM_MAX'

export interface PlanoInfo {
  tipo: TipoPlano
  nivel: number
}

export interface EntidadeComPlano {
  id: string
  nome: string
  configuracoes?: Array<{
    chave: string
    valor: any
  }>
  [key: string]: any
}

/**
 * Extrai informações do plano de uma entidade
 */
export function obterPlanoEntidade(entidade: EntidadeComPlano): PlanoInfo {
  if (!entidade.configuracoes || entidade.configuracoes.length === 0) {
    return { tipo: 'FREE', nivel: 0 }
  }

  const configPlano = entidade.configuracoes.find(
    (config) => config.chave === 'plano'
  )

  if (!configPlano || !configPlano.valor) {
    return { tipo: 'FREE', nivel: 0 }
  }

  const valor = configPlano.valor as any

  const tipo: TipoPlano = 
    ['FREE', 'BASICO', 'PREMIUM', 'PREMIUM_MAX'].includes(valor.tipo)
      ? valor.tipo
      : 'FREE'

  const nivel = typeof valor.nivel === 'number' && valor.nivel >= 0 && valor.nivel <= 3
    ? valor.nivel
    : 0

  return { tipo, nivel }
}

/**
 * Verifica se a entidade tem logo no mapa
 */
export function entidadeTemLogo(entidade: EntidadeComPlano): boolean {
  const plano = obterPlanoEntidade(entidade)
  return plano.nivel > 0
}

/**
 * Verifica se a entidade tem destaque visual
 */
export function entidadeTemDestaque(entidade: EntidadeComPlano): boolean {
  const plano = obterPlanoEntidade(entidade)
  return plano.tipo === 'PREMIUM' || plano.tipo === 'PREMIUM_MAX'
}

/**
 * Obtém o z-index do marcador baseado no plano
 */
export function obterZIndexPlano(entidade: EntidadeComPlano): number {
  const plano = obterPlanoEntidade(entidade)
  
  switch (plano.tipo) {
    case 'FREE':
      return 100
    case 'BASICO':
      return 200
    case 'PREMIUM':
      return 300
    case 'PREMIUM_MAX':
      return 400
    default:
      return 100
  }
}
