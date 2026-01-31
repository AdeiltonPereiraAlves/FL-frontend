/**
 * Utilitários para cálculo de score de melhor preço
 */

export interface BestPriceScore {
  score: number
  precoNormalizado: number
  distanciaNormalizada: number
  promocao: number
  ranking?: number // 1 | 2 | 3
}

export interface ProductWithLocation {
  produto: any
  entidade: any
  preco: number
  temPromocao: boolean
  distancia?: number
}

/**
 * Calcula distância entre duas coordenadas (Haversine)
 */
export function calcularDistancia(
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
 * Calcula score de melhor preço para um produto
 * Quanto menor o score, melhor
 */
export function calcularBestPriceScore(
  produto: ProductWithLocation,
  maiorPreco: number,
  maiorDistancia: number,
  userLocation?: { lat: number; lng: number }
): BestPriceScore {
  // Pesos
  const pesoPreco = 0.5
  const pesoDistancia = 0.3
  const pesoPromocao = 0.2

  // Normalizações
  const precoNormalizado = maiorPreco > 0 ? produto.preco / maiorPreco : 0
  const distanciaNormalizada =
    maiorDistancia > 0 && produto.distancia
      ? produto.distancia / maiorDistancia
      : 0
  const promocao = produto.temPromocao ? 0 : 1 // 0 = tem promoção (melhor), 1 = não tem

  // Score final (quanto menor, melhor)
  const score =
    pesoPreco * precoNormalizado +
    pesoDistancia * distanciaNormalizada +
    pesoPromocao * promocao

  return {
    score,
    precoNormalizado,
    distanciaNormalizada,
    promocao,
  }
}

/**
 * Ordena produtos por score de melhor preço
 */
export function ordenarPorBestPrice(
  produtos: ProductWithLocation[],
  userLocation?: { lat: number; lng: number }
): Array<ProductWithLocation & BestPriceScore> {
  if (produtos.length === 0) return []

  // Calcular distâncias se necessário
  const produtosComDistancia = produtos.map((p) => {
    if (!p.distancia && userLocation && p.entidade?.localizacao) {
      const loc = p.entidade.localizacao
      if (loc.latitude && loc.longitude) {
        p.distancia = calcularDistancia(
          userLocation.lat,
          userLocation.lng,
          Number(loc.latitude),
          Number(loc.longitude)
        )
      }
    }
    return p
  })

  // Encontrar maiores valores para normalização
  const maiorPreco = Math.max(
    ...produtosComDistancia.map((p) => p.preco),
    1
  )
  const maiorDistancia = Math.max(
    ...produtosComDistancia
      .map((p) => p.distancia || 0)
      .filter((d) => d > 0),
    1
  )

  // Calcular scores
  const produtosComScore = produtosComDistancia.map((produto) => {
    const scoreData = calcularBestPriceScore(
      produto,
      maiorPreco,
      maiorDistancia,
      userLocation
    )
    return {
      ...produto,
      ...scoreData,
    }
  })

  // Ordenar por score (menor primeiro)
  produtosComScore.sort((a, b) => a.score - b.score)

  // Adicionar ranking (TOP 3)
  produtosComScore.forEach((produto, index) => {
    if (index < 3) {
      produto.ranking = (index + 1) as 1 | 2 | 3
    }
  })

  return produtosComScore
}
