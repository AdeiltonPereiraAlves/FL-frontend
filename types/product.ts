export interface FotoProduto {
  id: string
  url: string
  ordem: number
  destaque: boolean
}

export interface Produto {
  id: string
  nome: string
  preco: number
  estoque: number
  entidadeId: string
  fotos?: FotoProduto[]
}

export interface ProductContextType {
  produtos: Produto[]
  isLoading: boolean
  listarProdutos: () => Promise<void>
}
