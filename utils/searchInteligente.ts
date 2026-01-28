/**
 * Sistema de busca inteligente com scoring de relevância
 */

export interface SearchResult {
  produto?: any
  entidade?: any
  score: number
  matchType: 'produto' | 'tipo' | 'categoria' | 'tag'
  hasPromocao: boolean
  preco?: number
  distancia?: number
}

export interface SearchOptions {
  query: string
  cidadeId: string
  userLocation?: { lat: number; lng: number }
  produtos: any[]
  entidades: any[]
}

/**
 * Calcula distância entre duas coordenadas (Haversine)
 */
function calcularDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Normaliza texto para busca
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Verifica se texto contém query
 */
function contemQuery(texto: string, query: string): boolean {
  const textoNormalizado = normalizarTexto(texto)
  const queryNormalizada = normalizarTexto(query)
  return textoNormalizado.includes(queryNormalizada)
}

/**
 * Verifica se texto começa com query
 */
function comecaComQuery(texto: string, query: string): boolean {
  const textoNormalizado = normalizarTexto(texto)
  const queryNormalizada = normalizarTexto(query)
  return textoNormalizado.startsWith(queryNormalizada)
}

/**
 * Calcula score de relevância para um produto
 */
function calcularScoreProduto(
  produto: any,
  query: string,
  userLocation?: { lat: number; lng: number }
): { score: number; matchType: string; distancia?: number } {
  let score = 0
  let matchType = 'produto'
  let distancia: number | undefined

  const queryNormalizada = normalizarTexto(query)
  const palavras = queryNormalizada.split(' ').filter((p) => p.length > 0)

  // REGRA 1: Busca por nome do produto
  const nomeProduto = normalizarTexto(produto.nome || '')
  
  // Match exato = 100 pontos
  if (nomeProduto === queryNormalizada) {
    score += 100
    matchType = 'produto'
  }
  // Começa com query = 80 pontos
  else if (comecaComQuery(produto.nome, query)) {
    score += 80
    matchType = 'produto'
  }
  // Contém query = 60 pontos
  else if (contemQuery(produto.nome, query)) {
    score += 60
    matchType = 'produto'
  }
  // Contém palavras = 40 pontos
  else if (palavras.some((palavra) => nomeProduto.includes(palavra))) {
    score += 40
    matchType = 'produto'
  }

  // REGRA 2: Busca por tags
  if (produto.tags && Array.isArray(produto.tags)) {
    const tagsMatch = produto.tags.some((pt: any) => {
      const tagNome = normalizarTexto(pt.tag?.nome || '')
      return (
        tagNome === queryNormalizada ||
        comecaComQuery(pt.tag?.nome || '', query) ||
        contemQuery(pt.tag?.nome || '', query) ||
        palavras.some((p) => tagNome.includes(p))
      )
    })
    if (tagsMatch) {
      score += 50
      matchType = 'tag'
    }
  }

  // REGRA 3: Busca por categoria
  if (produto.categoria) {
    const categoriaNome = normalizarTexto(produto.categoria.nome || '')
    if (
      categoriaNome === queryNormalizada ||
      comecaComQuery(produto.categoria.nome, query) ||
      contemQuery(produto.categoria.nome, query)
    ) {
      score += 30
      matchType = 'categoria'
    }
  }

  // REGRA 4: Promoção = +20 pontos
  if (produto.emPromocao && produto.precoDesconto) {
    score += 20
  }

  // REGRA 5: Menor preço = +10 pontos (normalizado)
  if (produto.precoFinal) {
    // Quanto menor o preço, mais pontos (invertido)
    // Preço máximo assumido: R$ 1000
    const precoNormalizado = Math.max(0, 10 - produto.precoFinal / 100)
    score += precoNormalizado
  }

  // REGRA 6: Distância (se houver localização do usuário)
  if (userLocation && produto.entidade?.localizacao) {
    const loc = produto.entidade.localizacao
    if (loc.latitude && loc.longitude) {
      distancia = calcularDistancia(
        userLocation.lat,
        userLocation.lng,
        Number(loc.latitude),
        Number(loc.longitude)
      )
      // Quanto mais perto, mais pontos (máximo 30 pontos para < 1km)
      const pontosDistancia = Math.max(0, 30 - distancia * 2)
      score += pontosDistancia
    }
  }

  return { score, matchType, distancia }
}

/**
 * Calcula score de relevância para uma entidade (busca por tipo)
 */
function calcularScoreEntidade(
  entidade: any,
  query: string,
  userLocation?: { lat: number; lng: number }
): { score: number; matchType: string; distancia?: number } {
  let score = 0
  let matchType = 'tipo'
  let distancia: number | undefined

  const queryNormalizada = normalizarTexto(query)

  // REGRA 2: Busca por tipo da entidade
  if (entidade.tipo) {
    const tipoNormalizado = normalizarTexto(entidade.tipo)
    if (tipoNormalizado === queryNormalizada) {
      score += 70
      matchType = 'tipo'
    } else if (tipoNormalizado.includes(queryNormalizada)) {
      score += 50
      matchType = 'tipo'
    }
  }

  // REGRA 6: Distância
  if (userLocation && entidade.localizacao) {
    const loc = entidade.localizacao
    if (loc.latitude && loc.longitude) {
      distancia = calcularDistancia(
        userLocation.lat,
        userLocation.lng,
        Number(loc.latitude),
        Number(loc.longitude)
      )
      const pontosDistancia = Math.max(0, 30 - distancia * 2)
      score += pontosDistancia
    }
  }

  return { score, matchType, distancia }
}

/**
 * Busca inteligente com scoring
 */
export function buscarInteligente(options: SearchOptions): SearchResult[] {
  const { query, produtos, entidades, userLocation } = options
  const resultados: SearchResult[] = []

  if (!query || query.trim().length === 0) {
    return []
  }

  // Buscar em produtos
  produtos.forEach((produto) => {
    const { score, matchType, distancia } = calcularScoreProduto(
      produto,
      query,
      userLocation
    )

    if (score > 0) {
      resultados.push({
        produto,
        entidade: produto.entidade,
        score,
        matchType: matchType as any,
        hasPromocao: produto.emPromocao || false,
        preco: produto.precoFinal || produto.precoAtual,
        distancia,
      })
    }
  })

  // Buscar em entidades (por tipo)
  entidades.forEach((entidade) => {
    const { score, matchType, distancia } = calcularScoreEntidade(
      entidade,
      query,
      userLocation
    )

    if (score > 0) {
      resultados.push({
        entidade,
        score,
        matchType: matchType as any,
        hasPromocao: false,
        distancia,
      })
    }
  })

  // Ordenar por score (maior primeiro)
  resultados.sort((a, b) => b.score - a.score)

  return resultados
}

/**
 * Agrupa resultados por entidade
 */
export function agruparPorEntidade(
  resultados: SearchResult[]
): Map<string, SearchResult[]> {
  const agrupados = new Map<string, SearchResult[]>()

  resultados.forEach((resultado) => {
    const entidadeId =
      resultado.entidade?.id || resultado.produto?.entidade?.id
    if (entidadeId) {
      if (!agrupados.has(entidadeId)) {
        agrupados.set(entidadeId, [])
      }
      agrupados.get(entidadeId)!.push(resultado)
    }
  })

  return agrupados
}
