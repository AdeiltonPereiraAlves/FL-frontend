import { jsPDF } from 'jspdf'

interface ItemLista {
  id: string
  nome: string
  quantidade: number
  precoFinal: number
  entidade?: {
    nome: string
  }
}

export function gerarPdfLista(itens: ItemLista[], total: number) {
  const doc = new jsPDF()
  
  // Configurações
  const marginLeft = 20
  const marginTop = 20
  const lineHeight = 7
  let yPos = marginTop

  // Título
  doc.setFontSize(18)
  doc.setTextColor(22, 163, 74) // Verde #16A34A
  doc.text('Lista de Compras', marginLeft, yPos)
  yPos += lineHeight * 2

  // Data
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Gerado em: ${dataAtual}`, marginLeft, yPos)
  yPos += lineHeight * 2

  // Linha separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(marginLeft, yPos, 190, yPos)
  yPos += lineHeight * 1.5

  // Cabeçalho da tabela
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'bold')
  doc.text('Item', marginLeft, yPos)
  doc.text('Quantidade', 80, yPos)
  doc.text('Preço Unit.', 120, yPos)
  doc.text('Total', 160, yPos)
  yPos += lineHeight

  // Linha separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(marginLeft, yPos, 190, yPos)
  yPos += lineHeight * 1.5

  // Itens
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  
  itens.forEach((item, index) => {
    // Verificar se precisa de nova página
    if (yPos > 270) {
      doc.addPage()
      yPos = marginTop
    }

    // Nome do produto
    doc.setTextColor(0, 0, 0)
    const nomeProduto = item.nome.length > 30 ? item.nome.substring(0, 30) + '...' : item.nome
    doc.text(nomeProduto, marginLeft, yPos)
    
    // Nome da loja (se houver)
    if (item.entidade?.nome) {
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      const nomeLoja = item.entidade.nome.length > 25 ? item.entidade.nome.substring(0, 25) + '...' : item.entidade.nome
      doc.text(`Loja: ${nomeLoja}`, marginLeft + 2, yPos + 4)
      doc.setFontSize(10)
    }
    
    // Quantidade
    doc.setTextColor(0, 0, 0)
    doc.text(item.quantidade.toString(), 80, yPos)
    
    // Preço unitário
    doc.text(`R$ ${item.precoFinal.toFixed(2)}`, 120, yPos)
    
    // Total do item
    const totalItem = item.precoFinal * item.quantidade
    doc.text(`R$ ${totalItem.toFixed(2)}`, 160, yPos)
    
    yPos += lineHeight * 2.5
  })

  // Linha separadora antes do total
  yPos += lineHeight
  doc.setDrawColor(200, 200, 200)
  doc.line(marginLeft, yPos, 190, yPos)
  yPos += lineHeight * 1.5

  // Total geral
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(22, 163, 74) // Verde
  doc.text('Total Geral:', marginLeft, yPos)
  doc.text(`R$ ${total.toFixed(2)}`, 160, yPos)

  // Rodapé
  yPos = 280
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Feira Livre - Lista de Compras', marginLeft, yPos)
  doc.text('www.feiralivre.com.br', 150, yPos)

  // Salvar PDF
  const nomeArquivo = `lista-compras-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nomeArquivo)
}
