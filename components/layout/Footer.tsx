'use client'

import { useState } from 'react'
import { Instagram, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApiContext } from '@/contexts/ApiContext'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export function Footer() {
  const api = useApiContext()
  const { toast } = useToast()
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mensagem.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, preencha sua sugestão ou melhoria.',
        variant: 'destructive',
      })
      return
    }

    setEnviando(true)
    try {
      await api.post('/sugestoes', {
        nome: nome.trim() || undefined,
        mensagem: mensagem.trim(),
      })
      toast({
        title: 'Obrigado pela sua sugestão 💚',
        description: 'Sua mensagem foi enviada com sucesso.',
      })
      setNome('')
      setMensagem('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar sugestão. Tente novamente.'
      toast({
        title: 'Erro ao enviar',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <footer className="mt-auto border-t border-[#15803D]/30 bg-[#15803D] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Seção 1 — Sobre a plataforma */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logo/logofeiralivre.png"
                alt="Feira Livre"
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <h3 className="font-semibold text-white">Feira Livre</h3>
            </div>
            <p className="text-sm text-white/90">Criado em 2025</p>
            <p className="text-sm text-white/80 mt-1">Todos os direitos reservados</p>
          </div>

          {/* Seção 2 — Redes sociais */}
          <div>
            <h3 className="font-semibold text-white mb-3">Redes sociais</h3>
            <a
              href="https://instagram.com/feira_livr3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors"
            >
              <Instagram className="h-4 w-4" />
              Instagram: @feira_livr3
            </a>
          </div>

          {/* Seção 3 — Sugestões e melhorias */}
          <div>
            <h3 className="font-semibold text-white mb-3">Sugestões e melhorias</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="footer-nome" className="text-xs text-white/90">
                  Nome (opcional)
                </Label>
                <Input
                  id="footer-nome"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 h-9 text-sm bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  disabled={enviando}
                />
              </div>
              <div>
                <Label htmlFor="footer-mensagem" className="text-xs text-white/90">
                  Sugestão ou melhoria *
                </Label>
                <Textarea
                  id="footer-mensagem"
                  placeholder="Conte-nos sua ideia..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="mt-1 min-h-[80px] text-sm resize-none bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  required
                  disabled={enviando}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="bg-white text-[#15803D] hover:bg-white/90"
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-2" />
                    Enviar sugestão
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  )
}
