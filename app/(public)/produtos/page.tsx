'use client'

import { useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { Header } from '@/components/Header'
export default function ProdutosPage() {
    const { produtos, isLoading, carregarProdutos } = useProducts()

    useEffect(() => {
        console.log(produtos, "produtos")
        carregarProdutos()
    }, [])

    if (isLoading) {
        return <p className="p-4">Carregando produtos...</p>
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <h1 className="text-2xl font-bold mb-6">Produtos</h1>

            {produtos.length === 0 && (
                <p>Nenhum produto encontrado.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {produtos.map(produto => (
                    <div
                        key={produto.id}
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                        <img
                            // src={produto.fotos?.find(f => f.destaque)?.url || '/placeholder.png'}
                            src={produto.fotos?.[0] && produto.fotos[0].url || '/placeholder.png'}
                            alt={produto.nome}
                            className="w-full h-40 object-cover rounded mb-3"
                        />

                        <h2 className="font-semibold text-lg">{produto.nome}</h2>
                        {/* <p className="text-sm text-gray-500">
                            Estoque: {produto.estoque}
                        </p> */}

                        <p className="text-xl font-bold text-green-600 mt-2">
                            R$ {produto.precoFinal}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
