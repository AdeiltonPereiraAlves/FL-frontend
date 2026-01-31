'use client'

interface Props {
  loja: {
    nome: string
    fotoPerfilUrl: string
  }
}

export default function LojaHeader({ loja }: Props) {
  return (
    <div className="flex items-center gap-4 border-b pb-4">
      <img
        src={loja.fotoPerfilUrl}
        alt={loja.nome}
        className="w-20 h-20 rounded-full object-cover border"
      />

      <h1 className="text-2xl font-bold">{loja.nome}</h1>
    </div>
  )
}
