'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Store, User, Mail, Lock, MapPin, AlertCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const {cadastroAndRedirect} = useAuth()
    const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    endereco: '',
    bairro: '',
    cep: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.nome || !form.email || !form.senha) {
      setError('Preencha os campos obrigatórios.')
      return
    }

    try {
      setLoading(true)

      await cadastroAndRedirect({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        endereco: form.endereco || undefined,
        bairro: form.bairro || undefined,
        cep: form.cep || undefined,
      })

      
    } catch (err) {
      setError('Erro ao criar conta. Email pode já estar em uso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Feira Livre</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>
              Cadastre-se para usar o marketplace da sua cidade
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              {/* Nome */}
              <div className="space-y-2">
                <Label>Nome *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="nome"
                    placeholder="Seu nome completo"
                    value={form.nome}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label>Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="senha"
                    type="password"
                    placeholder="********"
                    value={form.senha}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Endereço (opcional) */}
              <div className="space-y-2">
                <Label>Endereço (opcional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="endereco"
                    placeholder="Rua, número"
                    value={form.endereco}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bairro */}
              <div className="space-y-2">
                <Label>Bairro (opcional)</Label>
                <Input
                  name="bairro"
                  placeholder="Centro"
                  value={form.bairro}
                  onChange={handleChange}
                />
              </div>

              {/* CEP */}
              <div className="space-y-2">
                <Label>CEP (opcional)</Label>
                <Input
                  name="cep"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Cadastrar'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
