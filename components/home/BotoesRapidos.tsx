'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  UtensilsCrossed, 
  Beef, 
  Apple, 
  Sparkles,
  ShoppingBag,
  GlassWater,
  IceCream
} from 'lucide-react'

interface BotaoRapido {
  label: string
  query: string
}

interface CategoriaRapida {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  produtos: BotaoRapido[]
  color: string
  bgColor: string
  hoverBgColor: string
}

const CATEGORIAS_RAPIDAS: CategoriaRapida[] = [
  {
    id: 'alimentos',
    label: 'Alimentos',
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverBgColor: 'hover:bg-orange-100',
    produtos: [
      { label: 'Arroz', query: 'arroz' },
      { label: 'Feijão', query: 'feijão' },
      { label: 'Macarrão', query: 'macarrão' },
      { label: 'Açúcar', query: 'açúcar' },
      { label: 'Farinha', query: 'farinha' },
      { label: 'Café', query: 'café' },
      { label: 'Óleo', query: 'óleo' },
    ],
  },
  {
    id: 'acougue',
    label: 'Açougue',
    icon: Beef,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverBgColor: 'hover:bg-red-100',
    produtos: [
      { label: 'Carne', query: 'carne' },
      { label: 'Frango', query: 'frango' },
      { label: 'Suíno', query: 'suíno' },
      { label: 'Peixe', query: 'peixe' },
    ],
  },
  {
    id: 'hortifrute',
    label: 'Hortifrute',
    icon: Apple,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverBgColor: 'hover:bg-green-100',
    produtos: [
      { label: 'Frutas', query: 'frutas' },
      { label: 'Legumes', query: 'legumes' },
      { label: 'Verduras', query: 'verduras' },
      { label: 'Hortaliças', query: 'hortaliças' },
    ],
  },
  {
    id: 'limpeza',
    label: 'Limpeza',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverBgColor: 'hover:bg-blue-100',
    produtos: [
      { label: 'Detergente', query: 'detergente' },
      { label: 'Sabonete', query: 'sabonete' },
      { label: 'Sabão', query: 'sabão' },
      { label: 'Água Sanitária', query: 'água sanitária' },
      { label: 'Desinfetante', query: 'desinfetante' },
      { label: 'Esponja', query: 'esponja' },
    ],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    icon: GlassWater,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    hoverBgColor: 'hover:bg-cyan-100',
    produtos: [
      { label: 'Refrigerante', query: 'refrigerante' },
      { label: 'Bebida Alcoólica', query: 'bebida alcoólica' },
    ],
  },
  {
    id: 'gelados',
    label: 'Gelados',
    icon: IceCream,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverBgColor: 'hover:bg-purple-100',
    produtos: [
      { label: 'Sorvete', query: 'sorvete' },
    ],
  },
]

interface BotoesRapidosProps {
  cidadeId?: string
  onBuscar?: (query: string, cidadeId?: string) => void
}

export function BotoesRapidos({ cidadeId, onBuscar }: BotoesRapidosProps) {
  const router = useRouter()
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null)

  const handleClickProduto = (query: string) => {
    if (onBuscar && cidadeId) {
      onBuscar(query, cidadeId)
      // Fechar categoria após selecionar produto
      setCategoriaAberta(null)
    } else {
      router.push(`/produtos?busca=${encodeURIComponent(query)}`)
      setCategoriaAberta(null)
    }
  }

  const toggleCategoria = (categoriaId: string) => {
    setCategoriaAberta(categoriaId === categoriaAberta ? null : categoriaId)
  }

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <ShoppingBag className="h-3.5 w-3.5 text-[#16A34A]" />
        <span>Busca Rápida</span>
      </h3>
      
      {/* Categorias em linha horizontal */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {CATEGORIAS_RAPIDAS.map((categoria) => {
          const Icon = categoria.icon
          const isAberta = categoriaAberta === categoria.id

          return (
            <button
              key={categoria.id}
              onClick={() => toggleCategoria(categoria.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
                isAberta 
                  ? `border-[#16A34A] shadow-sm ${categoria.bgColor}` 
                  : `border-gray-200 ${categoria.bgColor} ${categoria.hoverBgColor}`
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${categoria.color} flex-shrink-0`} />
              <span className="font-medium text-gray-900 text-[11px] sm:text-xs whitespace-nowrap">
                {categoria.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Área de produtos expandidos */}
      {categoriaAberta && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">
              {CATEGORIAS_RAPIDAS.find(c => c.id === categoriaAberta)?.label}
            </span>
            <button
              onClick={() => setCategoriaAberta(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
            {CATEGORIAS_RAPIDAS.find(c => c.id === categoriaAberta)?.produtos.map((produto) => (
              <Button
                key={produto.query}
                variant="outline"
                size="sm"
                onClick={() => handleClickProduto(produto.query)}
                className="text-[11px] sm:text-xs bg-white hover:bg-[#16A34A] hover:text-white border-gray-300 transition-all duration-200 h-7 px-2 whitespace-nowrap"
              >
                {produto.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
