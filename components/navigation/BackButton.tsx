'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigation } from '@/contexts/NavigationContext'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function BackButton({ className, variant = 'outline', size = 'default' }: BackButtonProps) {
  const { goBack, canGoBack, state } = useNavigation()
  const router = useRouter()

  const handleBack = () => {
    if (canGoBack()) {
      goBack()
    } else {
      // Fallback: voltar para home
      router.push('/')
    }
  }

  if (!canGoBack() && state.currentView === 'home') {
    return null
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size={size}
      className={`gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors ${className || ''}`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      <span className="text-xs">Voltar</span>
    </Button>
  )
}
