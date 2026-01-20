'use client'

import { useState, useEffect } from 'react'
import { auth, User, AuthState } from '@/lib/auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    const currentAuthState = auth.getAuthState()
    setAuthState(currentAuthState)
    setIsLoading(false)
  }, [])

  return {
    ...authState,
    isLoading,
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    const currentUser = auth.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  return {
    user,
    isLoading,
  }
}