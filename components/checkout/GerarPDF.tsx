'use client'

import { jsPDF } from 'jspdf'

interface Item {
  id: string
  nome: string
  quantidade: number
  precoFinal: number
  entidade: {
    id: string
    nome: string
  }
}

interface GrupoLoja {
  loja: {
    id: string
    nome: string
    localizacao?: {
      endereco?: string
      bairro?: string
    }
    cidade?: {
      nome: string
    }
  }
  itens: Item[]
  subtotal: number
}

export function gerarPDFListaCompras(itensPorLoja: Record<string, GrupoLoja>, totalGeral: number) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10 // Reduzido de 20 para 10
  let yPos = margin

  // Título (menor)
  doc.setFontSize(16) // Reduzido de 20 para 16
  doc.setTextColor(254, 98, 51) // #FE6233
  doc.text('Lista de Compras', pageWidth / 2, yPos, { align: 'center' })
  yPos += 8 // Reduzido de 15 para 8

  // Data (menor e mais compacta)
  doc.setFontSize(8) // Reduzido de 10 para 8
  doc.setTextColor(100, 100, 100)
  const data = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Gerado em: ${data}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 8 // Reduzido de 20 para 8

  // Itens por loja
  Object.values(itensPorLoja).forEach((grupo: GrupoLoja, index: number) => {
    // Verificar se precisa de nova página (ajustado para usar mais espaço)
    if (yPos > pageHeight - 40) {
      doc.addPage()
      yPos = margin
    }

    // Nome da loja (menor)
    doc.setFontSize(12) // Reduzido de 16 para 12
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'bold')
    doc.text(grupo.loja.nome, margin, yPos)
    yPos += 6 // Reduzido de 10 para 6

    // Endereço da loja (menor e mais compacto)
    if (grupo.loja.localizacao) {
      doc.setFontSize(8) // Reduzido de 10 para 8
      doc.setFont(undefined, 'normal')
      doc.setTextColor(100, 100, 100)
      const endereco = grupo.loja.localizacao.endereco || 
                      `${grupo.loja.localizacao.bairro || ''} - ${grupo.loja.cidade?.nome || ''}`
      doc.text(endereco, margin, yPos)
      yPos += 5 // Reduzido de 8 para 5
    }

    // Linha divisória (mais fina)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3) // Linha mais fina
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 4 // Reduzido de 8 para 4

    // Itens (mais compactos)
    grupo.itens.forEach((item: Item) => {
      if (yPos > pageHeight - 30) {
        doc.addPage()
        yPos = margin
      }

      // Nome do produto com quantidade
      const nomeCompleto = `${item.quantidade}x ${item.nome}`
      const precoUnitario = item.precoFinal.toFixed(2)
      const precoTotal = (item.precoFinal * item.quantidade).toFixed(2)
      
      // Calcular largura do nome (com fonte 9pt)
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      const larguraNome = doc.getTextWidth(nomeCompleto)
      
      // Calcular largura do preço unitário (com fonte 7pt)
      doc.setFontSize(7)
      const larguraUnitario = doc.getTextWidth(`(R$ ${precoUnitario} cada)`)
      
      // Calcular largura do preço total (com fonte 9pt bold)
      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      const larguraTotal = doc.getTextWidth(`R$ ${precoTotal}`)
      
      // Verificar se cabe tudo na mesma linha
      const espacoNecessario = larguraNome + larguraUnitario + larguraTotal + 10
      const larguraDisponivel = pageWidth - (margin * 2) - 5
      
      if (espacoNecessario > larguraDisponivel) {
        // Se não cabe, quebrar linha para o preço unitário
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text(nomeCompleto, margin, yPos)
        
        doc.setFontSize(7)
        doc.setTextColor(120, 120, 120)
        doc.text(`(R$ ${precoUnitario} cada)`, margin + 5, yPos + 4)
        
        doc.setFontSize(9)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`R$ ${precoTotal}`, pageWidth - margin - 5, yPos, { align: 'right' })
        yPos += 7
      } else {
        // Tudo na mesma linha
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text(nomeCompleto, margin, yPos)
        
        doc.setFontSize(7)
        doc.setTextColor(120, 120, 120)
        doc.text(`(R$ ${precoUnitario} cada)`, margin + larguraNome + 3, yPos)
        
        doc.setFontSize(9)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`R$ ${precoTotal}`, pageWidth - margin - 5, yPos, { align: 'right' })
        yPos += 6
      }
    })

    // Subtotal da loja (mais compacto)
    yPos += 2 // Reduzido de 5 para 2
    doc.setFontSize(9) // Reduzido de 11 para 9
    doc.setFont(undefined, 'bold')
    doc.text(
      `Subtotal: R$ ${grupo.subtotal.toFixed(2)}`,
      pageWidth - margin - 5,
      yPos,
      { align: 'right' }
    )
    yPos += 8 // Reduzido de 15 para 8

    // Espaço entre lojas (menor)
    if (index < Object.keys(itensPorLoja).length - 1) {
      yPos += 3 // Reduzido de 5 para 3
      // Linha divisória entre lojas
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.2)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 3
    }
  })

  // Total geral (mais compacto)
  if (yPos > pageHeight - 25) {
    doc.addPage()
    yPos = margin
  }

  yPos += 4 // Reduzido de 10 para 4
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 6 // Reduzido de 10 para 6

  doc.setFontSize(14) // Reduzido de 16 para 14
  doc.setFont(undefined, 'bold')
  doc.setTextColor(254, 98, 51)
  doc.text(
    `TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  )

  // Rodapé (mais compacto)
  yPos = pageHeight - 8 // Reduzido de 20 para 8
  doc.setFontSize(7) // Reduzido de 8 para 7
  doc.setTextColor(150, 150, 150)
  doc.text(
    'Feira Livre - Lista de Compras',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  )

  // Salvar PDF
  const nomeArquivo = `lista-compras-${Date.now()}.pdf`
  const pdfBlob = doc.output('blob')
  
  // Salvar no localStorage
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result as string
    const pdfsSalvos = JSON.parse(localStorage.getItem('listasCompras') || '[]')
    pdfsSalvos.push({
      nome: nomeArquivo,
      data: new Date().toISOString(),
      base64: base64,
      itensPorLoja: itensPorLoja,
      totalGeral: totalGeral,
    })
    localStorage.setItem('listasCompras', JSON.stringify(pdfsSalvos))
  }
  reader.readAsDataURL(pdfBlob)

  // Download
  doc.save(nomeArquivo)
  
  return nomeArquivo
}
