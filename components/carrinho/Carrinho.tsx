'use client'

import { X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
interface Props {
  onClose: () => void
}

export default function Carrinho({ onClose }: Props) {
  const { carrinho, alterarQuantidade, total } = useCart()

  return (
    <div className="p-4 flex-1 overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">Carrinho</h4>
        <button onClick={onClose}>
          <X />
        </button>
      </div>

      {carrinho.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Carrinho vazio
        </p>
      )}

      {carrinho.map((item: any) => (
        <div
          key={item.id}
          className="flex justify-between items-center mb-3"
        >
          <div>
            <p className="text-sm font-medium">{item.nome}</p>
            <p className="text-xs text-muted-foreground">
              {item.entidade.nome}
            </p>
            {
              item ? (

                <Link href={ item!.entidade!.contato!.redes[0]!.url! } >
                  <p className='text-green'>
                    whatsapp
                    </p>
                </Link>
              ):(
                <p>whatsapp</p>
              )
            }


          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alterarQuantidade(item.id, -1)}
              className="px-2 border rounded"
            >
              -
            </button>
            <span>{item.quantidade}</span>
            <button
              onClick={() => alterarQuantidade(item.id, 1)}
              className="px-2 border rounded"
            >
              +
            </button>
          </div>
        </div>
      ))}

      <div className="mt-4 font-bold">
        Total: R$ {total.toFixed(2)}
      </div>

      <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded">
        Salvar carrinho
      </button>
    </div>
  )
}
