'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'

interface Produto {
  id: string
  nome: string
  precoFinal: number
}

interface Props {
  produto: Produto
  loja: {
    id: string
    nome: string
  }
}

export default function ProdutoCardLoja({ produto, loja }: Props) {
  const { adicionar } = useCart()

  function handleAdd() {
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: produto.precoFinal,
      entidade: {
        id: loja.id,
        nome: loja.nome,
        contato: {
          redes: [],
        },
      },
    })
  }

  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold">{produto.nome}</h3>
        <p className="text-green-600 font-bold">
          R$ {produto.precoFinal.toFixed(2)}
        </p>
      </div>

      <Button className="mt-4" onClick={handleAdd}>
        Adicionar ao carrinho
      </Button>
    </div>
  )
}
