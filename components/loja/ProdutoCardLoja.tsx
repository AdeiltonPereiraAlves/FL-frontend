'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'

interface Produto {
  id: string
  nome: string
  precoAtual?: number
  precoDesconto?: number
  precoAntigo?: number
  precoFinal?: number
  precoNormal?: number
  precoPromo?: number
  emPromocao?: boolean
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

  // MVP: Usar campos diretos do produto
  const precoAtual = produto.precoAtual || produto.precoFinal || produto.precoNormal || 0
  const precoDesconto = produto.precoDesconto || produto.precoPromo || null
  const emPromocao = produto.emPromocao && precoDesconto !== null
  const precoAntigo = emPromocao ? precoAtual : null
  const precoFinal = emPromocao ? precoDesconto : precoAtual

  function handleAdd() {
      adicionar({
        id: produto.id,
        nome: produto.nome,
        precoFinal: precoFinal,
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
        {emPromocao && precoAntigo ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-400 line-through">
              R$ {precoAntigo.toFixed(2)}
            </p>
            <p className="text-green-600 font-bold">
              R$ {precoFinal.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="text-green-600 font-bold">
            R$ {precoFinal.toFixed(2)}
          </p>
        )}
      </div>

      <Button className="mt-4" onClick={handleAdd}>
        Adicionar ao carrinho
      </Button>
    </div>
  )
}
