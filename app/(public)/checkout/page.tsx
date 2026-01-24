'use client'

import { Header } from '@/components/Header'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, FileText, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gerarPDFListaCompras } from '@/components/checkout/GerarPDF'
import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CheckoutPage() {
  const { carrinho, alterarQuantidade, remover, total, limpar } = useCart()
  const router = useRouter()
  
  // Estado do formulário
  const [dadosCliente, setDadosCliente] = useState({
    nome: '',
    endereco: '',
    bairro: '',
    contato: '',
    referencia: '',
  })

  // Estado de erros de validação
  const [erros, setErros] = useState<Record<string, string>>({})
  
  // Estado do modal de confirmação
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showConfirmDialogTodos, setShowConfirmDialogTodos] = useState(false)
  const [lojaSelecionada, setLojaSelecionada] = useState<any>(null)

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dadosClienteCheckout')
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos)
        setDadosCliente(dados)
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error)
      }
    }
  }, [])

  // Salvar dados no localStorage sempre que mudarem
  useEffect(() => {
    if (dadosCliente.nome || dadosCliente.endereco || dadosCliente.bairro || dadosCliente.contato || dadosCliente.referencia) {
      localStorage.setItem('dadosClienteCheckout', JSON.stringify(dadosCliente))
    }
  }, [dadosCliente])

  // Validar telefone (apenas números, 10 ou 11 dígitos)
  const validarTelefone = (telefone: string) => {
    const apenasNumeros = telefone.replace(/\D/g, '')
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11
  }

  // Formatar telefone enquanto digita
  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    
    if (apenasNumeros.length <= 2) {
      return apenasNumeros
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`
    } else if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`
    }
  }

  // Validar campo individual
  const validarCampo = (nome: string, valor: string) => {
    const novosErros = { ...erros }
    
    switch (nome) {
      case 'nome':
        if (!valor.trim()) {
          novosErros.nome = 'Nome é obrigatório'
        } else if (valor.trim().length < 3) {
          novosErros.nome = 'Nome deve ter pelo menos 3 caracteres'
        } else {
          delete novosErros.nome
        }
        break
      
      case 'endereco':
        if (!valor.trim()) {
          novosErros.endereco = 'Endereço é obrigatório'
        } else if (valor.trim().length < 5) {
          novosErros.endereco = 'Endereço deve ter pelo menos 5 caracteres'
        } else {
          delete novosErros.endereco
        }
        break
      
      case 'bairro':
        if (!valor.trim()) {
          novosErros.bairro = 'Bairro é obrigatório'
        } else {
          delete novosErros.bairro
        }
        break
      
      case 'contato':
        if (!valor.trim()) {
          novosErros.contato = 'Telefone é obrigatório'
        } else if (!validarTelefone(valor)) {
          novosErros.contato = 'Telefone inválido. Use DDD + número (10 ou 11 dígitos)'
        } else {
          delete novosErros.contato
        }
        break
      
      case 'referencia':
        if (!valor.trim()) {
          novosErros.referencia = 'Referência é obrigatória'
        } else if (valor.trim().length < 5) {
          novosErros.referencia = 'Referência deve ter pelo menos 5 caracteres'
        } else {
          delete novosErros.referencia
        }
        break
    }
    
    setErros(novosErros)
  }

  // Handler para mudança de campo
  const handleCampoChange = (campo: string, valor: string) => {
    if (campo === 'contato') {
      const formatado = formatarTelefone(valor)
      setDadosCliente({ ...dadosCliente, [campo]: formatado })
      validarCampo(campo, formatado)
    } else {
      setDadosCliente({ ...dadosCliente, [campo]: valor })
      validarCampo(campo, valor)
    }
  }

  const whatsappUrl = (item: any) => {
    const whatsapp = item.entidade?.contato?.redes?.find(
      (r: any) => r.tipo === 'WHATSAPP'
    )
    return whatsapp?.url
  }

  if (carrinho.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Carrinho vazio
            </h2>
            <p className="text-gray-500 mb-6">
              Adicione produtos ao carrinho para continuar
            </p>
            <Link href="/">
              <Button className="bg-[#FE6233] hover:bg-[#E9571C] text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a busca
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Agrupar por loja e calcular totais
  const itensPorLoja = carrinho.reduce((acc: any, item: any) => {
    const lojaId = item.entidade?.id
    if (!acc[lojaId]) {
      acc[lojaId] = {
        loja: item.entidade,
        itens: [],
        subtotal: 0,
      }
    }
    acc[lojaId].itens.push(item)
    acc[lojaId].subtotal += item.precoFinal * item.quantidade
    return acc
  }, {})

  // Validar valor mínimo de entrega para cada loja
  const validarEntrega = (grupo: any) => {
    const loja = grupo.loja
    if (!loja.fazEntrega) {
      return {
        podeEntregar: false,
        mensagem: 'Esta loja não faz entrega',
        falta: null,
      }
    }

    const valorMinimo = loja.valorMinimoEntrega ? Number(loja.valorMinimoEntrega) : 0
    if (grupo.subtotal >= valorMinimo) {
      return {
        podeEntregar: true,
        mensagem: 'Valor mínimo atingido! Entrega disponível.',
        falta: null,
      }
    }

    const falta = valorMinimo - grupo.subtotal
    return {
      podeEntregar: false,
      mensagem: `Faltam R$ ${falta.toFixed(2)} para atingir o valor mínimo de entrega (R$ ${valorMinimo.toFixed(2)})`,
      falta: falta,
    }
  }

  // Verificar se todas as lojas podem entregar
  const todasLojasPodemEntregar = Object.values(itensPorLoja).every((grupo: any) => {
    const validacao = validarEntrega(grupo)
    return validacao.podeEntregar
  })

  // Obter lojas que podem entregar
  const lojasHabilitadas = Object.values(itensPorLoja).filter((grupo: any) => {
    const validacao = validarEntrega(grupo)
    return validacao.podeEntregar && whatsappUrl({ entidade: grupo.loja })
  })

  // Validar se os dados do cliente estão preenchidos
  const validarDadosCliente = () => {
    // Validar todos os campos e coletar erros
    const novosErros: Record<string, string> = {}
    
    if (!dadosCliente.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    } else if (dadosCliente.nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres'
    }
    
    if (!dadosCliente.endereco.trim()) {
      novosErros.endereco = 'Endereço é obrigatório'
    } else if (dadosCliente.endereco.trim().length < 5) {
      novosErros.endereco = 'Endereço deve ter pelo menos 5 caracteres'
    }
    
    if (!dadosCliente.bairro.trim()) {
      novosErros.bairro = 'Bairro é obrigatório'
    }
    
    if (!dadosCliente.contato.trim()) {
      novosErros.contato = 'Telefone é obrigatório'
    } else if (!validarTelefone(dadosCliente.contato)) {
      novosErros.contato = 'Telefone inválido. Use DDD + número (10 ou 11 dígitos)'
    }
    
    if (!dadosCliente.referencia.trim()) {
      novosErros.referencia = 'Referência é obrigatória'
    } else if (dadosCliente.referencia.trim().length < 5) {
      novosErros.referencia = 'Referência deve ter pelo menos 5 caracteres'
    }
    
    // Atualizar erros
    setErros(novosErros)
    
    // Se houver erros, scroll para o primeiro
    if (Object.keys(novosErros).length > 0) {
      const primeiroErro = Object.keys(novosErros)[0]
      setTimeout(() => {
        const elemento = document.getElementById(primeiroErro)
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
          elemento.focus()
        }
      }, 100)
      
      return false
    }

    return true
  }

  // Gerar mensagem para WhatsApp
  const gerarMensagemWhatsApp = (grupo: any) => {
    const itensTexto = grupo.itens.map((item: any) => 
      `• ${item.quantidade}x ${item.nome} - R$ ${(item.precoFinal * item.quantidade).toFixed(2)}`
    ).join('\n')

    const enderecoCompleto = `${dadosCliente.endereco}, ${dadosCliente.bairro}`
    const referenciaTexto = dadosCliente.referencia ? `\n📍 *Referência:* ${dadosCliente.referencia}` : ''

    return `Olá! Gostaria de fazer um pedido:

👤 *Cliente:* ${dadosCliente.nome}
📞 *Contato:* ${dadosCliente.contato}
📍 *Endereço:* ${enderecoCompleto}${referenciaTexto}

🛒 *Itens do Pedido:*
${itensTexto}

💰 *Total:* R$ ${grupo.subtotal.toFixed(2)}

Por favor, confirme a disponibilidade e o prazo de entrega. Obrigado!`
  }

  // Abrir WhatsApp com mensagem
  const abrirWhatsApp = (grupo: any) => {
    if (!validarDadosCliente()) {
      return
    }

    const validacao = validarEntrega(grupo)
    if (!validacao.podeEntregar) {
      alert('Não é possível comprar via WhatsApp. Valor mínimo não atingido ou loja não faz entrega.')
      return
    }

    setLojaSelecionada(grupo)
    setShowConfirmDialog(true)
  }

  // Confirmar e redirecionar para WhatsApp
  const confirmarCompraWhatsApp = () => {
    if (!lojaSelecionada) return

    const whatsapp = whatsappUrl({ entidade: lojaSelecionada.loja })
    if (!whatsapp) {
      alert('WhatsApp não disponível para esta loja')
      return
    }

    const mensagem = gerarMensagemWhatsApp(lojaSelecionada)
    const mensagemEncoded = encodeURIComponent(mensagem)
    
    // Extrair número do WhatsApp da URL
    const numeroMatch = whatsapp.match(/wa\.me\/(\d+)/)
    if (numeroMatch) {
      const numero = numeroMatch[1]
      const urlWhatsApp = `https://wa.me/${numero}?text=${mensagemEncoded}`
      
      // Abrir em nova aba
      window.open(urlWhatsApp, '_blank')
    } else {
      // Fallback: usar a URL original com mensagem
      const urlWhatsApp = `${whatsapp}?text=${mensagemEncoded}`
      window.open(urlWhatsApp, '_blank')
    }

    setShowConfirmDialog(false)
  }

  // Abrir WhatsApp para todas as lojas habilitadas
  const abrirTodosWhatsApps = () => {
    if (!validarDadosCliente()) {
      return
    }

    if (lojasHabilitadas.length === 0) {
      alert('Nenhuma loja habilitada para entrega')
      return
    }

    setShowConfirmDialogTodos(true)
  }

  // Confirmar e abrir todos os WhatsApps
  const confirmarCompraTodosWhatsApps = () => {
    lojasHabilitadas.forEach((grupo: any, index: number) => {
      const whatsapp = whatsappUrl({ entidade: grupo.loja })
      if (!whatsapp) return

      const mensagem = gerarMensagemWhatsApp(grupo)
      const mensagemEncoded = encodeURIComponent(mensagem)
      
      // Extrair número do WhatsApp da URL
      const numeroMatch = whatsapp.match(/wa\.me\/(\d+)/)
      if (numeroMatch) {
        const numero = numeroMatch[1]
        const urlWhatsApp = `https://wa.me/${numero}?text=${mensagemEncoded}`
        
        // Abrir cada WhatsApp com um pequeno delay para não bloquear
        setTimeout(() => {
          window.open(urlWhatsApp, '_blank')
        }, index * 500) // Delay de 500ms entre cada abertura
      } else {
        // Fallback: usar a URL original com mensagem
        const urlWhatsApp = `${whatsapp}?text=${mensagemEncoded}`
        setTimeout(() => {
          window.open(urlWhatsApp, '_blank')
        }, index * 500)
      }
    })

    setShowConfirmDialogTodos(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-2">
            Revise seus itens antes de finalizar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de itens */}
          <div className="lg:col-span-2 space-y-4">
            {Object.values(itensPorLoja).map((grupo: any) => (
              <div key={grupo.loja.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {grupo.loja.nome}
                      </h3>
                      {grupo.loja.localizacao && (
                        <p className="text-sm text-gray-500">
                          {grupo.loja.localizacao.endereco ||
                            `${grupo.loja.localizacao.bairro || ''} - ${grupo.loja.cidade?.nome || ''}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Validação de entrega */}
                  {(() => {
                    const validacao = validarEntrega(grupo)
                    return (
                      <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                        validacao.podeEntregar
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        {validacao.podeEntregar ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            validacao.podeEntregar ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {validacao.mensagem}
                          </p>
                          {grupo.loja.valorMinimoEntrega && (
                            <p className="text-xs text-gray-600 mt-1">
                              Valor mínimo para entrega: R$ {Number(grupo.loja.valorMinimoEntrega).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Contato - WhatsApp se pode entregar, telefone/email se não */}
                  {(() => {
                    const validacao = validarEntrega(grupo)
                    const whatsapp = whatsappUrl({ entidade: grupo.loja })
                    const telefone = grupo.loja.contato?.telefone
                    const email = grupo.loja.contato?.email
                    
                    if (validacao.podeEntregar && whatsapp) {
                      return (
                        <div className="mt-3">
                          <Button
                            onClick={() => abrirWhatsApp(grupo)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Comprar Itens via WhatsApp
                          </Button>
                        </div>
                      )
                    }

                    // Se não pode entregar, mostrar contatos alternativos
                    return (
                      <div className="mt-3 space-y-2">
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-2 font-medium">
                            Valor mínimo não atingido. Entre em contato para tirar dúvidas:
                          </p>
                          <div className="space-y-1">
                            {telefone && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="font-medium">Telefone:</span>
                                <a 
                                  href={`tel:${telefone}`}
                                  className="text-[#FE6233] hover:underline"
                                >
                                  {telefone}
                                </a>
                              </div>
                            )}
                            {email && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="font-medium">Email:</span>
                                <a 
                                  href={`mailto:${email}`}
                                  className="text-[#FE6233] hover:underline"
                                >
                                  {email}
                                </a>
                              </div>
                            )}
                            {!telefone && !email && (
                              <p className="text-xs text-gray-500">
                                Contato não disponível
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="space-y-3">
                  {grupo.itens.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {item.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          R$ {item.precoFinal.toFixed(2)} cada
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border rounded-lg">
                          <button
                            onClick={() => alterarQuantidade(item.id, -1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            disabled={item.quantidade <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 font-semibold min-w-[2rem] text-center">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => alterarQuantidade(item.id, 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-[#FE6233]">
                            R$ {(item.precoFinal * item.quantidade).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => remover(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-gray-700">
                    Subtotal desta loja:
                  </span>
                  <span className="font-bold text-lg text-[#FE6233]">
                    R$ {grupo.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Formulário e Resumo */}
          <div className="lg:col-span-1 space-y-4">
            {/* Formulário de Dados do Cliente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Seus Dados
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={dadosCliente.nome}
                    onChange={(e) => handleCampoChange('nome', e.target.value)}
                    onBlur={(e) => validarCampo('nome', e.target.value)}
                    className={`mt-1 ${erros.nome ? 'border-red-500' : ''}`}
                  />
                  {erros.nome && (
                    <p className="text-xs text-red-500 mt-1">{erros.nome}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço (Rua/Avenida) *</Label>
                  <Input
                    id="endereco"
                    type="text"
                    placeholder="Rua, número"
                    value={dadosCliente.endereco}
                    onChange={(e) => handleCampoChange('endereco', e.target.value)}
                    onBlur={(e) => validarCampo('endereco', e.target.value)}
                    className={`mt-1 ${erros.endereco ? 'border-red-500' : ''}`}
                  />
                  {erros.endereco && (
                    <p className="text-xs text-red-500 mt-1">{erros.endereco}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    type="text"
                    placeholder="Seu bairro"
                    value={dadosCliente.bairro}
                    onChange={(e) => handleCampoChange('bairro', e.target.value)}
                    onBlur={(e) => validarCampo('bairro', e.target.value)}
                    className={`mt-1 ${erros.bairro ? 'border-red-500' : ''}`}
                  />
                  {erros.bairro && (
                    <p className="text-xs text-red-500 mt-1">{erros.bairro}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contato">Telefone/WhatsApp *</Label>
                  <Input
                    id="contato"
                    type="tel"
                    placeholder="(83) 99999-9999"
                    value={dadosCliente.contato}
                    onChange={(e) => handleCampoChange('contato', e.target.value)}
                    onBlur={(e) => validarCampo('contato', e.target.value)}
                    maxLength={15}
                    className={`mt-1 ${erros.contato ? 'border-red-500' : ''}`}
                  />
                  {erros.contato && (
                    <p className="text-xs text-red-500 mt-1">{erros.contato}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Digite apenas números (DDD + número)
                  </p>
                </div>

                <div>
                  <Label htmlFor="referencia">Ponto de Referência *</Label>
                  <Input
                    id="referencia"
                    type="text"
                    placeholder="Ex: Próximo ao mercado, casa amarela, etc."
                    value={dadosCliente.referencia}
                    onChange={(e) => handleCampoChange('referencia', e.target.value)}
                    onBlur={(e) => validarCampo('referencia', e.target.value)}
                    className={`mt-1 ${erros.referencia ? 'border-red-500' : ''}`}
                  />
                  {erros.referencia && (
                    <p className="text-xs text-red-500 mt-1">{erros.referencia}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Ajude o entregador a encontrar sua casa
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="text-gray-900">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-[#FE6233]">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {/* Botão Comprar Todos - só aparece se todas as lojas podem entregar */}
                {todasLojasPodemEntregar && lojasHabilitadas.length > 0 && (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                    onClick={abrirTodosWhatsApps}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comprar Todos via WhatsApp
                  </Button>
                )}

                {!todasLojasPodemEntregar && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      Complete o valor mínimo de todas as lojas para comprar tudo de uma vez
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full border-[#FE6233] text-[#FE6233] hover:bg-[#FE6233] hover:text-white"
                  onClick={() => {
                    gerarPDFListaCompras(itensPorLoja, total)
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar PDF da Lista
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    limpar()
                    router.push('/')
                  }}
                >
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação - Loja Individual */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Compra via WhatsApp</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja comprar esses itens via WHATSAPP?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {lojaSelecionada && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-sm text-gray-900 mb-2">
                Loja: {lojaSelecionada.loja.nome}
              </p>
              <p className="text-sm text-gray-600">
                Total: R$ {lojaSelecionada.subtotal.toFixed(2)}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCompraWhatsApp}
              className="bg-green-500 hover:bg-green-600"
            >
              Sim, Comprar via WhatsApp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação - Comprar Todos */}
      <AlertDialog open={showConfirmDialogTodos} onOpenChange={setShowConfirmDialogTodos}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Compra de Todos os Itens</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja comprar todos os itens via WHATSAPP?
              <br />
              <span className="font-semibold text-green-600">
                {lojasHabilitadas.length} {lojasHabilitadas.length === 1 ? 'loja' : 'lojas'} serão abertas.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
            <p className="font-semibold text-sm text-gray-900 mb-3">
              Lojas que receberão o pedido:
            </p>
            <div className="space-y-2">
              {lojasHabilitadas.map((grupo: any, index: number) => (
                <div key={grupo.loja.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{index + 1}. {grupo.loja.nome}</span>
                  <span className="font-semibold text-[#FE6233]">
                    R$ {grupo.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Geral:</span>
                <span className="text-lg font-bold text-[#FE6233]">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCompraTodosWhatsApps}
              className="bg-green-500 hover:bg-green-600"
            >
              Sim, Comprar Todos via WhatsApp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
