'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

interface Props {
  produto: any
  onClose: () => void
}

export default function ProdutoDetalhes({ produto, onClose }: Props) {
  const { adicionar } = useCart()

  return (
    <div className="p-4 border-b h-[45%] overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">{produto.nome}</h3>
        <button onClick={onClose}>
          <X />
        </button>
      </div>

      {produto.fotos?.[0] && (
        <Image
          src={produto.fotos[0].url}
          alt={produto.nome}
          width={300}
          height={200}
          className="rounded mb-2"
        />
      )}

      <p className="text-sm mb-2">{produto.descricao}</p>

      {produto.peso && <p className="text-sm">Peso: {produto.peso}kg</p>}
      {produto.validade && (
        <p className="text-sm">
          Validade:{' '}
          {new Date(produto.validade).toLocaleDateString()}
        </p>
      )}

      <p className="font-bold text-green-600 mt-2">
        {produto.precoFinal.toFixed(2)}
      </p>

      <Link href={produto.entidade.contato.redes[0].url}>
        <p className="font-bold text-green-600 mt-2">

          contato:  {produto.entidade.contato.redes[0].url}
        </p>
      </Link>

      <button
        onClick={() =>
          adicionar({
            id: produto.id,
            nome: produto.nome,
            precoFinal: produto.precoFinal,
            entidade: produto.entidade,
            
          })
        }
        className="mt-3 w-full bg-green-600 text-white py-2 rounded"
      >
        Adicionar ao carrinho
      </button>
    </div>
  )
}
