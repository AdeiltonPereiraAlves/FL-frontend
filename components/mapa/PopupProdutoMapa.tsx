import { useCart } from '@/contexts/CartContext'

export function PopupProdutoMapa({
  produto,
  onVerProduto,
}: {
  produto: any
  onVerProduto: () => void
}) {
  const { adicionar } = useCart()

  function handleAdd() {
    adicionar({
      id: produto.id,
      nome: produto.nome,
      precoFinal: produto.precoFinal,
      entidade: produto.entidade,
      
    })
  }

  return (
    <div className="space-y-2 text-center">
      <strong className="block">{produto.nome}</strong>

      <p className="text-green-600 font-semibold">
        R$ {produto.precoFinal.toFixed(2)}
      </p>

      <div className="flex gap-2">
        <button
          onClick={onVerProduto}
          className="flex-1 border rounded py-1 text-sm"
        >
          Ver produto
        </button>

        <button
          onClick={handleAdd}
          className="flex-1 bg-green-600 text-white rounded py-1 text-sm"
        >
          Add
        </button>
      </div>
    </div>
  )
}
