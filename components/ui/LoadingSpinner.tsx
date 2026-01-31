'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-[#16A34A]', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  )
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <LoadingSkeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-6 w-1/3" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-9 flex-1" />
          <LoadingSkeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}
