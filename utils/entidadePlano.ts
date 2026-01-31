/**
 * Utilitários para gerenciar planos de entidades no frontend
 * 
 * Agora usa o sistema real de planos do backend:
 * - Entidade tem campo `planos` com array de EntidadePlano
 * - Cada EntidadePlano tem um `plano` com as informações
 * - O plano ativo é aquele com `ativa: true`
 */

export interface Plano {
  id: string
  nome: string
  descricao?: string
  preco?: number | null
  destaqueNoMapa: boolean
  aparecePrimeiroBusca: boolean
  podeUsarBanner: boolean
  limiteProdutos?: number | null
  seloDestaque: boolean
}

export interface EntidadePlano {
  id: string
  ativa: boolean
  dataInicio: string
  dataFim?: string | null
  plano: Plano
}

export interface EntidadeComPlano {
  id: string
  nome: string
  planos?: EntidadePlano[]
  plano?: string // Nome do plano (para compatibilidade com listagem)
  [key: string]: any
}

/**
 * Obtém o plano ativo de uma entidade
 * Retorna o plano FREE como padrão se não houver plano ativo
 */
export function obterPlanoAtivo(entidade: EntidadeComPlano): Plano | null {
  // Se a entidade já tem o nome do plano (vindo da listagem)
  if (entidade.plano) {
    // Retornar null aqui, pois precisamos buscar os detalhes do plano
    // O componente deve buscar o plano completo via API
    return null
  }

  // Se tem array de planos, buscar o ativo
  if (entidade.planos && entidade.planos.length > 0) {
    const planoAtivo = entidade.planos.find(
      (ep) => ep.ativa && (!ep.dataFim || new Date(ep.dataFim) >= new Date())
    )

    if (planoAtivo) {
      return planoAtivo.plano
    }
  }

  // Retornar null se não encontrar (o componente deve buscar via API)
  return null
}

/**
 * Verifica se a entidade tem logo no mapa (destaqueNoMapa = true)
 */
export function entidadeTemLogo(entidade: EntidadeComPlano): boolean {
  const plano = obterPlanoAtivo(entidade)
  return plano?.destaqueNoMapa || false
}

/**
 * Verifica se a entidade tem destaque visual (seloDestaque = true)
 */
export function entidadeTemDestaque(entidade: EntidadeComPlano): boolean {
  const plano = obterPlanoAtivo(entidade)
  return plano?.seloDestaque || false
}

/**
 * Obtém o z-index do marcador baseado no plano
 * Planos mais altos aparecem por cima
 */
export function obterZIndexPlano(entidade: EntidadeComPlano): number {
  const plano = obterPlanoAtivo(entidade)
  
  if (!plano) return 100 // FREE padrão

  switch (plano.nome) {
    case 'FREE':
      return 100
    case 'PRO':
      return 200
    case 'PREMIUM':
      return 300
    default:
      return 100
  }
}

/**
 * Verifica se a entidade aparece primeiro na busca
 */
export function entidadeAparecePrimeiroBusca(entidade: EntidadeComPlano): boolean {
  const plano = obterPlanoAtivo(entidade)
  return plano?.aparecePrimeiroBusca || false
}

/**
 * Verifica se a entidade pode usar banner
 */
export function entidadePodeUsarBanner(entidade: EntidadeComPlano): boolean {
  const plano = obterPlanoAtivo(entidade)
  return plano?.podeUsarBanner || false
}
