// 'use client'

// import { createContext, useContext, useState } from 'react'

// interface CartItem {
//     id: string
//     nome: string
//     precoFinal: number
//     quantidade: number
//     entidade: {
//         id: string
//         nome: string
//         whatsapp?: string
//     }
// }

// interface CartContextData {
//     carrinho: CartItem[]
//     adicionar: (item: Omit<CartItem, 'quantidade'>) => void
//     remover: (id: string) => void
//     alterarQuantidade: (id: string, delta: number) => void
//     total: number
//     limpar: () => void
// }

// const CartContext = createContext({} as CartContextData)

// export function CartProvider({ children }: { children: React.ReactNode }) {
//     const [carrinho, setCarrinho] = useState<CartItem[]>([])

//     const adicionar = (item: Omit<CartItem, 'quantidade'>) => {
//         setCarrinho((prev) => {
//             const existente = prev.find((p) => p.id === item.id)

//             if (existente) {
//                 return prev.map((p) =>
//                     p.id === item.id
//                         ? { ...p, quantidade: p.quantidade + 1 }
//                         : p
//                 )
//             }

//             return [...prev, { ...item, quantidade: 1 }]
//         })
//     }

//     function alterarQuantidade(id: string, delta: number) {
//         setCarrinho((prev) =>
//             prev
//                 .map((p) =>
//                     p.id === id ? { ...p, quantidade: p.quantidade + delta } : p
//                 )
//                 .filter((p) => p.quantidade > 0)
//         )
//     }

//     function remover(id: string) {
//         setCarrinho((prev) => prev.filter((p) => p.id !== id))
//     }

//     function limpar() {
//         setCarrinho([])
//     }

//     const total = carrinho.reduce(
//         (acc, item) => acc + item.precoFinal * item.quantidade,
//         0
//     )

//     return (
//         <CartContext.Provider
//             value={{ carrinho, adicionar, remover, alterarQuantidade, total, limpar }}
//         >
//             {children}
//         </CartContext.Provider>
//     )
// }

// export function useCart() {
//     return useContext(CartContext)
// }




'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface CartItem {
  id: string
  nome: string
  precoFinal: number
  quantidade: number
  entidade: {
    id: string
    nome: string
    whatsapp?: string
  }
}

interface CartContextData {
  carrinho: CartItem[]
  adicionar: (item: Omit<CartItem, 'quantidade'>) => void
  remover: (id: string) => void
  alterarQuantidade: (id: string, delta: number) => void
  total: number
  limpar: () => void
}

const CartContext = createContext({} as CartContextData)

const STORAGE_KEY = 'feiralivre:carrinho'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<CartItem[]>([])

  /** 🔁 Carregar do localStorage */
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        setCarrinho(JSON.parse(data))
      }
    } catch (err) {
      console.error('Erro ao carregar carrinho', err)
    }
  }, [])

  /** 💾 Persistir no localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho))
  }, [carrinho])

  function adicionar(item: Omit<CartItem, 'quantidade'>) {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === item.id)

      if (existente) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      }

      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  function alterarQuantidade(id: string, delta: number) {
    setCarrinho((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? { ...p, quantidade: p.quantidade + delta }
            : p
        )
        .filter((p) => p.quantidade > 0)
    )
  }

  function remover(id: string) {
    setCarrinho((prev) => prev.filter((p) => p.id !== id))
  }

  function limpar() {
    setCarrinho([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const total = carrinho.reduce(
    (acc, item) => acc + item.precoFinal * item.quantidade,
    0
  )

  return (
    <CartContext.Provider
      value={{
        carrinho,
        adicionar,
        remover,
        alterarQuantidade,
        total,
        limpar,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
