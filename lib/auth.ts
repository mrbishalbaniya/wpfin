import Cookies from 'js-cookie'
import { authAPI } from './api'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: false, // Set to false for localhost development
  sameSite: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
  path: '/' // Ensure cookies are available site-wide
}

export const auth = {
  // Login function
  login: async (username: string, password: string): Promise<AuthState> => {
    try {
      console.log('Auth.login called with:', { username })
      console.log('JWT URL:', process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL)
      
      const response = await authAPI.login(username, password)
      console.log('AuthAPI.login response:', response)
      
      if (response.token) {
        console.log('Token received, storing in cookies...')
        
        // Store token and user data in cookies
        Cookies.set('auth-token', response.token, COOKIE_OPTIONS)
        console.log('Token stored in cookie')
        
        // Get user data - with better error handling
        console.log('Fetching user data...')
        try {
          const userData = await authAPI.getCurrentUser()
          console.log('User data received:', userData)
          
          Cookies.set('user-data', JSON.stringify(userData), COOKIE_OPTIONS)
          console.log('User data stored in cookie')
          
          const authState = {
            user: userData,
            token: response.token,
            isAuthenticated: true,
          }
          
          console.log('Login successful, returning auth state:', authState)
          return authState
        } catch (userError: any) {
          console.error('Failed to get user data, but token is valid:', userError)
          
          // Create minimal user data from token response if available
          const minimalUser = {
            id: 0,
            username: username,
            email: '',
            first_name: '',
            last_name: '',
            display_name: username
          }
          
          Cookies.set('user-data', JSON.stringify(minimalUser), COOKIE_OPTIONS)
          
          return {
            user: minimalUser,
            token: response.token,
            isAuthenticated: true,
          }
        }
      }
      
      throw new Error('Invalid credentials - no token received')
    } catch (error: any) {
      console.error('Auth.login error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Login failed')
    }
  },

  // Register function
  register: async (userData: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
  }): Promise<User> => {
    try {
      console.log('Auth.register called with:', { ...userData, password: '[HIDDEN]' })
      
      // Use our reliable registration API endpoint
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      console.log('Registration API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Registration API error:', errorData)
        throw new Error(errorData.error || 'Registration failed')
      }

      const result = await response.json()
      console.log('Registration successful:', result)
      
      return result.user
    } catch (error: any) {
      console.error('Auth.register error:', error)
      throw new Error(error.message || 'Registration failed')
    }
  },

  // Logout function
  logout: () => {
    Cookies.remove('auth-token')
    Cookies.remove('user-data')
    window.location.href = '/login'
  },

  // Get current auth state
  getAuthState: (): AuthState => {
    if (typeof window === 'undefined') {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      }
    }
    
    const token = Cookies.get('auth-token')
    const userDataString = Cookies.get('user-data')
    
    console.log('Auth.getAuthState debug:', {
      hasToken: !!token,
      hasUserData: !!userDataString,
      tokenPreview: token ? `${token.substring(0, 30)}...` : 'None'
    })
    
    if (token && userDataString) {
      try {
        const user = JSON.parse(userDataString)
        return {
          user,
          token,
          isAuthenticated: true,
        }
      } catch (error) {
        console.error('Failed to parse user data from cookie:', error)
        // Invalid user data, clear cookies
        Cookies.remove('auth-token')
        Cookies.remove('user-data')
      }
    }
    
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    }
  },

  // Validate current token
  validateToken: async (): Promise<boolean> => {
    const token = Cookies.get('auth-token')
    
    if (!token) return false
    
    try {
      await authAPI.validateToken(token)
      return true
    } catch (error) {
      // Token is invalid, clear cookies
      Cookies.remove('auth-token')
      Cookies.remove('user-data')
      return false
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userDataString = Cookies.get('user-data')
    
    if (userDataString) {
      try {
        return JSON.parse(userDataString)
      } catch (error) {
        return null
      }
    }
    
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!Cookies.get('auth-token')
  },
}