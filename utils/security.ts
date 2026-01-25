/**
 * Utilitários de segurança para sanitização e validação de dados
 */

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML básicas
    .replace(/javascript:/gi, '') // Remove protocolo javascript
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 10000) // Limita tamanho
}

/**
 * Valida e sanitiza um email
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null
  
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(sanitized)) return null
  if (sanitized.length > 254) return null // RFC 5321
  
  return sanitized
}

/**
 * Valida e sanitiza um ID (UUID ou string alfanumérica segura)
 * Aceita UUIDs e strings alfanuméricas com hífens (formato comum de IDs)
 */
export function sanitizeId(id: string): string | null {
  if (typeof id !== 'string') return null
  
  const sanitized = id.trim()
  
  // Valida formato: UUID v4 ou string alfanumérica com hífens (1-50 caracteres)
  // Previne injeção de caracteres perigosos
  const idRegex = /^[a-zA-Z0-9-]{1,50}$/
  
  if (!idRegex.test(sanitized)) return null
  
  // Previne IDs que são apenas hífens ou muito curtos
  if (sanitized.length < 1 || sanitized.replace(/-/g, '').length === 0) return null
  
  return sanitized
}

/**
 * Valida e sanitiza um número
 */
export function sanitizeNumber(value: unknown, min?: number, max?: number): number | null {
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return null
    if (min !== undefined && value < min) return null
    if (max !== undefined && value > max) return null
    return value
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || !isFinite(parsed)) return null
    if (min !== undefined && parsed < min) return null
    if (max !== undefined && parsed > max) return null
    return parsed
  }
  
  return null
}

/**
 * Valida e sanitiza um telefone brasileiro
 */
export function sanitizePhone(phone: string): string | null {
  if (typeof phone !== 'string') return null
  
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Valida formato brasileiro (10 ou 11 dígitos com DDD)
  if (cleaned.length < 10 || cleaned.length > 11) return null
  
  return cleaned
}

/**
 * Sanitiza um objeto removendo propriedades perigosas
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const sanitized: Partial<T> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    // Remove propriedades que começam com __ (internas)
    if (key.startsWith('__')) continue
    
    // Sanitiza valores baseado no tipo
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T]
    } else if (typeof value === 'number') {
      const num = sanitizeNumber(value)
      if (num !== null) {
        sanitized[key as keyof T] = num as T[keyof T]
      }
    } else if (typeof value === 'boolean') {
      sanitized[key as keyof T] = value as T[keyof T]
    } else if (value === null || value === undefined) {
      // Mantém null/undefined
      sanitized[key as keyof T] = value as T[keyof T]
    }
  }
  
  return sanitized
}

/**
 * Valida se uma URL é segura (mesmo domínio ou protocolo permitido)
 */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== 'string') return false
  
  try {
    const urlObj = new URL(url, window.location.origin)
    
    // Permite apenas http, https e mailto
    const allowedProtocols = ['http:', 'https:', 'mailto:']
    if (!allowedProtocols.includes(urlObj.protocol)) return false
    
    // Para http/https, verifica se é do mesmo domínio ou domínio confiável
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      const allowedDomains = [
        window.location.hostname,
        'api.whatsapp.com',
        'wa.me',
      ]
      
      return allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`))
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Sanitiza uma URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null
  
  const trimmed = url.trim()
  if (!isSafeUrl(trimmed)) return null
  
  return trimmed
}
