'use client'

import React, { useState } from "react"
import { GoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Store, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

// Função helper para determinar o redirecionamento baseado no papel do usuário
function getRedirectPath(user: any): string {
  if (!user?.papeis || !Array.isArray(user.papeis)) {
    // Se não tem papéis definidos, assume cliente e vai para home
    return '/'
  }

  const papeis = user.papeis.map((p: any) => p.tipo)
  const isDono = papeis.includes('DONO_SISTEMA')
  const isAdminUser = papeis.includes('ADMIN')
  const isLojista = papeis.includes('LOJISTA')
  const isCliente = papeis.includes('CLIENTE')

  if (isDono || isAdminUser) {
    return '/admin/dashboard'
  }

  if (isLojista) {
    return '/lojista/dashboard'
  }

  // Cliente ou usuário sem papel específico vai para home
  if (isCliente || papeis.length === 0) {
    return '/'
  }

  // Fallback: home
  return '/'
}

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !senha) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    try {
      // Fazer login
      await login({ email, senha })
      
      // Aguardar um pouco para o estado ser atualizado no localStorage
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Verificar papel e redirecionar corretamente
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          const redirectPath = getRedirectPath(userData)
          router.push(redirectPath)
        } catch {
          router.push('/')
        }
      } else {
        router.push('/')
      }
    } catch {
      setError('Credenciais inválidas. Tente novamente.')
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
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar sua loja
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="******"
                    value={senha}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* DIVISOR */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ou continue com
                </span>
              </div>
            </div>

            {/* LOGIN GOOGLE REAL */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) {
                    setError('Erro ao autenticar com Google')
                    return
                  }

                  try {
                    await loginWithGoogle(credentialResponse.credential)
                    
                    // Aguardar um pouco para o estado do usuário ser atualizado no localStorage
                    await new Promise(resolve => setTimeout(resolve, 150))
                    
                    // Verificar papel do usuário para redirecionar corretamente
                    const userStr = localStorage.getItem('user')
                    if (userStr) {
                      try {
                        const userData = JSON.parse(userStr)
                        const redirectPath = getRedirectPath(userData)
                        router.push(redirectPath)
                      } catch {
                        router.push('/')
                      }
                    } else {
                      router.push('/')
                    }
                  } catch {
                    setError('Falha no login com Google')
                  }
                }}
                onError={() => {
                  setError('Erro no login com Google')
                }}
              />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Voltar para a Home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
