'use client'

import { useEffect, useState } from 'react'
import LojaHeader from '@/components/loja/LojaHeader'
import ListaProdutosLoja from '@/components/loja/ListaProdutosLoja'

interface Loja {
  id: string
  nome: string
  fotoPerfilUrl: string
}

interface Produto {
  id: string
  nome: string
  precoFinal: number
}

export default function LojaPage({ params }: { params: { id: string } }) {
  const [loja, setLoja] = useState<Loja | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  console.log(params.id, "fora")
  useEffect(() => {
    async function carregar() {
      setLoading(true)
      console.log(params, "id params")
      const id = params.id
      
      // 🔥 ajuste para sua API real
      const lojaRes = await fetch(`http://localhost:3001/entidade/${id}`)
      const produtosRes = await fetch(`http://localhost:3001/entidade/produto/${id}`)

      const lojaData = await lojaRes.json()
      const produtosData = await produtosRes.json()

      setLoja(lojaData)
      setProdutos(produtosData)
      setLoading(false)
    }

    carregar()
  }, [params.id])

  if (loading) {
    return <div className="p-4">Carregando loja...</div>
  }

  if (!loja) {
    return <div className="p-4">Loja não encontrada</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <LojaHeader loja={loja} />
      <ListaProdutosLoja produtos={produtos} loja={loja} />
    </div>
  )
}
