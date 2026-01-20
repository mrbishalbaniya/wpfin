'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, User, AuthState } from '@/lib/auth'

interface AuthContextType extends AuthState {
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state on client side only
    const initializeAuth = () => {
      try {
        const currentAuthState = auth.getAuthState()
        setAuthState(currentAuthState)
      } catch (error) {
        console.error('Failed to initialize auth state:', error)
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const newAuthState = await auth.login(username, password)
      setAuthState(newAuthState)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    auth.logout()
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  }

  const refreshUser = async () => {
    try {
      const currentAuthState = auth.getAuthState()
      setAuthState(currentAuthState)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    ...authState,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}