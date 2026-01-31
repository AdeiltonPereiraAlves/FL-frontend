/**
 * Funções de máscara para formatação de dados
 */

/**
 * Aplica máscara de CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export function maskCNPJ(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 14 dígitos
  const limited = numbers.slice(0, 14)
  
  // Aplica a máscara
  if (limited.length <= 2) {
    return limited
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`
  }
}

/**
 * Remove máscara de CNPJ (retorna apenas números)
 */
export function unmaskCNPJ(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de telefone brasileiro
 * Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function maskPhone(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos (com DDD + 9 dígitos)
  const limited = numbers.slice(0, 11)
  
  // Aplica a máscara
  if (limited.length === 0) {
    return ''
  } else if (limited.length <= 2) {
    return `(${limited}`
  } else if (limited.length <= 6) {
    // Telefone fixo: (XX) XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else if (limited.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
  } else {
    // Celular: (XX) XXXXX-XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

/**
 * Remove máscara de telefone (retorna apenas números)
 */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de CEP (XXXXX-XXX)
 */
export function maskCEP(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8)
  
  if (numbers.length <= 5) {
    return numbers
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`
  }
}

/**
 * Remove máscara de CEP (retorna apenas números)
 */
export function unmaskCEP(value: string): string {
  return value.replace(/\D/g, '')
}
