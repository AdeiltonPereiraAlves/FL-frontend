/**
 * Utilitários para trabalhar com WhatsApp
 */

/**
 * Normaliza um número de telefone removendo caracteres não numéricos
 */
export function normalizarNumeroTelefone(numero: string): string {
  return numero.replace(/\D/g, '')
}

/**
 * Extrai o número do WhatsApp de uma URL ou string
 * Suporta formatos:
 * - https://wa.me/5583999999999
 * - wa.me/5583999999999
 * - 5583999999999
 * - (83) 99999-9999
 * - 83999999999
 */
export function extrairNumeroWhatsApp(urlOuNumero: string): string | null {
  if (!urlOuNumero) return null

  // Se já é apenas números, retornar
  const apenasNumeros = normalizarNumeroTelefone(urlOuNumero)
  if (apenasNumeros.length >= 10 && apenasNumeros.length <= 15) {
    return apenasNumeros
  }

  // Tentar extrair de URL wa.me
  const matchWaMe = urlOuNumero.match(/wa\.me\/(\d+)/i)
  if (matchWaMe) {
    return matchWaMe[1]
  }

  // Tentar extrair de URL completa
  const matchUrl = urlOuNumero.match(/whatsapp\.com\/send\?phone=(\d+)/i)
  if (matchUrl) {
    return matchUrl[1]
  }

  // Tentar extrair número de qualquer URL
  const matchNumero = urlOuNumero.match(/(\d{10,15})/)
  if (matchNumero) {
    return matchNumero[1]
  }

  return null
}

/**
 * Cria uma URL válida do WhatsApp a partir de uma URL ou número
 * @param urlOuNumero - URL do WhatsApp ou número de telefone
 * @param mensagem - Mensagem opcional para pré-preencher
 * @returns URL válida do WhatsApp ou null se não conseguir criar
 */
export function criarUrlWhatsApp(urlOuNumero: string | null | undefined, mensagem?: string): string | null {
  if (!urlOuNumero) return null

  const numero = extrairNumeroWhatsApp(urlOuNumero)
  if (!numero) return null

  // Garantir que o número tenha código do país (se não tiver, assumir Brasil +55)
  let numeroFormatado = numero
  if (numero.length <= 11 && !numero.startsWith('55')) {
    // Número brasileiro sem código do país
    numeroFormatado = `55${numero}`
  }

  // Criar URL base
  let url = `https://wa.me/${numeroFormatado}`

  // Adicionar mensagem se fornecida
  if (mensagem) {
    const mensagemEncoded = encodeURIComponent(mensagem)
    url += `?text=${mensagemEncoded}`
  }

  return url
}

/**
 * Busca a URL do WhatsApp de uma entidade
 * @param entidade - Objeto da entidade com contato e redes
 * @returns URL do WhatsApp ou null se não encontrar
 */
export function buscarWhatsAppEntidade(entidade: any): string | null {
  if (!entidade) return null

  // Tentar buscar em contato.redes
  const redes = entidade.contato?.redes || []
  const whatsappRede = redes.find(
    (r: any) => r.tipo === 'WHATSAPP' || r.tipo === 'whatsapp' || r.tipo?.toUpperCase() === 'WHATSAPP'
  )

  if (whatsappRede?.url) {
    return whatsappRede.url
  }

  // Fallback: tentar usar o telefone do contato se não houver rede social
  const telefone = entidade.contato?.telefone
  if (telefone) {
    const numeroNormalizado = normalizarNumeroTelefone(telefone)
    if (numeroNormalizado.length >= 10) {
      return criarUrlWhatsApp(numeroNormalizado) || null
    }
  }

  return null
}

/**
 * Verifica se uma URL ou número é válido para WhatsApp
 */
export function isValidWhatsApp(urlOuNumero: string | null | undefined): boolean {
  if (!urlOuNumero) return false
  const numero = extrairNumeroWhatsApp(urlOuNumero)
  return numero !== null && numero.length >= 10 && numero.length <= 15
}
