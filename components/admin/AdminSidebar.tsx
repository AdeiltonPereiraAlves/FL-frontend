'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  CreditCard,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Menu simplificado - apenas banners com preços
const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Gerenciar Entidades',
    href: '/admin/entidades',
    icon: Building2,
  },
  {
    title: 'Planos e Preços',
    href: '/admin/planos',
    icon: CreditCard,
  },
  {
    title: 'Sugestões',
    href: '/admin/sugestoes',
    icon: MessageSquare,
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-md"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#15803D]">Feira Livre</h2>
            <p className="text-sm text-gray-500 mt-1">Painel Admin</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-[#15803D] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Feira Livre
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
