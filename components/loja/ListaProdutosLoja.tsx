'use client'

import ProdutoCardLoja from './ProdutoCardLoja'

interface Produto {
  id: string
  nome: string
  precoFinal: number
}

interface Props {
  produtos: Produto[]
  loja: {
    id: string
    nome: string
  }
}

export default function ListaProdutosLoja({ produtos, loja }: Props) {
  if (produtos.length === 0) {
    return <p className="text-gray-500">Nenhum produto disponível.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {produtos.map((produto) => (
        <ProdutoCardLoja
          key={produto.id}
          produto={produto}
          loja={loja}
        />
      ))}
    </div>
  )
}
