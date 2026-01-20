'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Loading } from '@/components/ui/loading'

interface AuthCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthCheck({ children, fallback }: AuthCheckProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authState = auth.getAuthState()
        
        if (!authState.isAuthenticated) {
          setIsAuthenticated(false)
          setIsValidating(false)
          return
        }

        // Validate the token
        const isValid = await auth.validateToken()
        setIsAuthenticated(isValid)
        
        if (!isValid) {
          // Token is invalid, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsValidating(false)
      }
    }

    checkAuth()
  }, [router])

  if (isValidating) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loading size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this feature.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}