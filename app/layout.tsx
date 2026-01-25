import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import { ApiProvider } from '@/contexts/ApiContext'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ProductProvider } from "@/contexts/ProductContext"
const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
import 'leaflet/dist/leaflet.css'
import { CartProvider } from "@/contexts/CartContext"
export const metadata: Metadata = {
  title: 'Feira Livre - Encontre os melhores produtos locais',
  description:
    'Descubra os melhores preços perto de voce e compre com facilidade. Conectamos voce aos melhores comerciantes da sua regiao.',
  generator: 'Feira Livre',
  icons: {
    icon: [
      {
        url: '/logofeiralivre.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logofeiralivre.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <Analytics />
          <ApiProvider>
            <AuthProvider>
              <ProductProvider>
                <CartProvider>
                  {children}
                </CartProvider>
              </ProductProvider>
            </AuthProvider>
          </ApiProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
