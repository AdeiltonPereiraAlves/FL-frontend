/**
 * Utilitário para upload de imagens no frontend
 * Envia FormData corretamente para o backend
 * 
 * NOTA: As funções utilitárias não usam hooks para manter compatibilidade
 * Use o hook useImageUpload() nos componentes React
 */

import api from '@/services/api'

export interface UploadImageOptions {
  fieldName?: string
  maxFiles?: number
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  url: string
  publicId?: string
}

/**
 * Faz upload de uma única imagem
 * @param file - Arquivo de imagem
 * @param endpoint - Endpoint do backend (ex: '/entidade/123/foto-perfil')
 * @param options - Opções de upload
 * @returns URL da imagem enviada
 */
export async function uploadSingleImage(
  file: File,
  endpoint: string,
  options: UploadImageOptions = {}
): Promise<string> {
  const { fieldName = 'file' } = options

  const formData = new FormData()
  formData.append(fieldName, file)

  try {
    // IMPORTANTE: Não definir Content-Type manualmente para FormData
    // O navegador define automaticamente com o boundary correto
    const response = await api.post(endpoint, formData)

    console.log('📤 Resposta do upload recebida:', response)

    // IMPORTANTE: O ApiContext já retorna response.data, então response já é o objeto de dados
    const data = response

    // Retorna a URL da imagem
    const url = data.fotoUrl || data.url || data.foto?.url || data.imageUrl
    console.log('✅ URL extraída:', url)
    return url
  } catch (error: any) {
    console.error('=== ERRO NO UPLOAD DE IMAGEM ===')
    console.error('Erro completo:', error)
    console.error('Mensagem:', error.message)
    
    // Log detalhado do erro para debug
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      console.error('Request foi enviada mas não houve resposta')
      console.error('Request:', error.request)
    }
    
    // Tenta extrair mensagem de erro mais específica
    const errorMessage = 
      error.response?.data?.erro || 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'Erro ao fazer upload da imagem'
    
    throw new Error(errorMessage)
  }
}

/**
 * Faz upload de múltiplas imagens
 * @param files - Array de arquivos de imagem
 * @param endpoint - Endpoint do backend (ex: '/produto/123/fotos')
 * @param options - Opções de upload
 * @returns Array de URLs das imagens enviadas
 */
export async function uploadMultipleImages(
  files: File[],
  endpoint: string,
  options: UploadImageOptions = {}
): Promise<string[]> {
  const { fieldName = 'images', maxFiles = 10 } = options

  if (files.length > maxFiles) {
    throw new Error(`Máximo de ${maxFiles} imagens permitidas`)
  }

  const formData = new FormData()
  files.forEach((file) => {
    formData.append(fieldName, file)
  })

  try {
    // IMPORTANTE: Não definir Content-Type manualmente para FormData
    // O navegador define automaticamente com o boundary correto
    const response = await api.post(endpoint, formData)

    console.log('📤 [uploadMultipleImages] Resposta completa do upload:', response)
    console.log('📤 [uploadMultipleImages] Tipo da resposta:', typeof response)
    console.log('📤 [uploadMultipleImages] É array?', Array.isArray(response))
    console.log('📤 [uploadMultipleImages] Chaves do objeto:', response ? Object.keys(response) : 'response é null/undefined')

    // IMPORTANTE: O ApiContext já retorna response.data, então response já é o objeto de dados
    const data = response

    // Retorna array de URLs
    // O backend retorna: { mensagem: string, fotos: Array<{url: string, destaque: boolean, ordem: number}>, totalFotos: number }
    if (data && data.fotos && Array.isArray(data.fotos)) {
      console.log('📸 [uploadMultipleImages] Campo fotos encontrado:', data.fotos.length, 'itens')
      console.log('📸 [uploadMultipleImages] Primeiro item:', data.fotos[0])
      
      const urls = data.fotos.map((foto: any, index: number) => {
        // foto pode ser um objeto {url, destaque, ordem} ou apenas uma string
        let url: string
        if (typeof foto === 'string') {
          url = foto
        } else if (foto && typeof foto === 'object') {
          url = foto.url || foto.path || foto.secure_url || String(foto)
        } else {
          url = String(foto)
        }
        console.log(`📸 [uploadMultipleImages] URL ${index + 1} extraída:`, url)
        return url
      }).filter((url: string) => url && url.trim() !== '') // Remove URLs vazias
      
      console.log('✅ [uploadMultipleImages] URLs extraídas do campo fotos:', urls.length, 'URLs válidas')
      console.log('✅ [uploadMultipleImages] URLs completas:', urls)
      
      if (urls.length > 0) {
        return urls
      }
    }
    
    if (data && data.urls && Array.isArray(data.urls)) {
      console.log('✅ [uploadMultipleImages] URLs extraídas do campo urls:', data.urls.length, 'URLs')
      return data.urls
    }
    
    // Se não encontrou nas estruturas esperadas, tenta extrair de qualquer lugar
    if (data && Array.isArray(data)) {
      console.log('⚠️ [uploadMultipleImages] Resposta é um array direto, tentando extrair URLs...')
      const urls = data.map((item: any) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') return item.url || item.path || item.secure_url
        return null
      }).filter((url: string | null) => url && url.trim() !== '')
      
      if (urls.length > 0) {
        console.log('✅ [uploadMultipleImages] URLs extraídas do array direto:', urls)
        return urls
      }
    }
    
    console.error('❌ [uploadMultipleImages] Nenhuma URL encontrada na resposta!')
    console.error('❌ [uploadMultipleImages] Estrutura completa da resposta:', JSON.stringify(data, null, 2))
    console.error('❌ [uploadMultipleImages] Tipo da resposta:', typeof data)
    console.error('❌ [uploadMultipleImages] É array?', Array.isArray(data))
    
    return []
  } catch (error: any) {
    console.error('=== ERRO NO UPLOAD DE IMAGENS ===')
    console.error('Erro completo:', error)
    console.error('Mensagem:', error.message)
    
    // Log detalhado do erro para debug
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      console.error('Request foi enviada mas não houve resposta')
      console.error('Request:', error.request)
    }
    
    // Tenta extrair mensagem de erro mais específica
    const errorMessage = 
      error.response?.data?.erro || 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      'Erro ao fazer upload das imagens'
    
    throw new Error(errorMessage)
  }
}

/**
 * Hook React para upload de imagens
 * Facilita o uso nos componentes
 * 
 * Exemplo de uso:
 * ```tsx
 * const { uploadSingle, uploadMultiple } = useImageUpload()
 * 
 * const handleUpload = async (file: File) => {
 *   try {
 *     const url = await uploadSingle(file, '/entidade/123/foto-perfil')
 *     console.log('Imagem enviada:', url)
 *   } catch (error) {
 *     console.error('Erro:', error)
 *   }
 * }
 * ```
 */
export function useImageUpload() {
  const uploadSingle = async (
    file: File,
    endpoint: string,
    fieldName: string = 'file'
  ): Promise<string> => {
    return uploadSingleImage(file, endpoint, { fieldName })
  }

  const uploadMultiple = async (
    files: File[],
    endpoint: string,
    fieldName: string = 'images',
    maxFiles: number = 10
  ): Promise<string[]> => {
    return uploadMultipleImages(files, endpoint, { fieldName, maxFiles })
  }

  return {
    uploadSingle,
    uploadMultiple,
  }
}
