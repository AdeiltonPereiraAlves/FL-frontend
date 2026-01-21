'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useHealthCheck } from '@/hooks/useApi'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react'

type TestStatus = 'idle' | 'loading' | 'success' | 'error'

export function ButtonTestApi() {
  const [status, setStatus] = useState<TestStatus>('idle')
  const [message, setMessage] = useState('')
  const { execute } = useHealthCheck()

  const handleTest = async () => {
    setStatus('loading')
    setMessage('')

    const result = await execute()

    if (result) {
      setStatus('success')
      setMessage(result.message || 'Backend is running!')
    } else {
      setStatus('error')
      setMessage('Failed to connect to backend. Make sure it is running on the configured URL.')
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleTest}
        disabled={status === 'loading'}
        variant={status === 'error' ? 'destructive' : status === 'success' ? 'secondary' : 'outline'}
        className="flex items-center gap-2"
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Server className="h-4 w-4" />
        )}
        Testar Backend
      </Button>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
              status === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
