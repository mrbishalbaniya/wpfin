import axios from 'axios'
import Cookies from 'js-cookie'
import { authErrorHandler } from './auth-error-handler'
import { normalizeTransactions, normalizeTransaction } from './wordpress'

// WordPress API configuration
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost/finance/wp-json/wp/v2'
const WORDPRESS_JWT_URL = process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL || 'http://localhost/finance/wp-json/jwt-auth/v1'

// Create axios instance
const api = axios.create({
  baseURL: WORDPRESS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// JWT API instance
const jwtApi = axios.create({
  baseURL: WORDPRESS_JWT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token')
  console.log('API Request Debug:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
  })
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('No auth token found for API request')
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })
    
    if (error.response?.status === 401) {
      // Use centralized auth error handler
      authErrorHandler.handle401Error({
        url: error.config?.url,
        method: error.config?.method
      })
    }
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  // Login user
  login: async (username: string, password: string) => {
    console.log('AuthAPI.login called with:', { username })
    console.log('JWT API base URL:', jwtApi.defaults.baseURL)
    console.log('Full URL will be:', `${jwtApi.defaults.baseURL}/token`)
    
    try {
      const response = await jwtApi.post('/token', {
        username,
        password,
      })
      console.log('AuthAPI.login success:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AuthAPI.login error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      throw error
    }
  },

  // Register user
  register: async (userData: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => {
    const response = await api.post('/register', userData)
    return response.data
  },

  // Validate token
  validateToken: async (token: string) => {
    const response = await jwtApi.post('/token/validate', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me')
      console.log('AuthAPI.getCurrentUser success:', response.data)
      return response.data
    } catch (error: any) {
      console.error('AuthAPI.getCurrentUser error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  },
}

// Transaction API functions
export const transactionAPI = {
  // Get all transactions for current user
  getTransactions: async (params?: {
    per_page?: number
    page?: number
    search?: string
    category?: string
    type?: 'income' | 'expense'
    date_from?: string
    date_to?: string
  }) => {
    try {
      console.log('TransactionAPI.getTransactions called with params:', params)
      
      // Use our working API endpoint instead of direct WordPress
      const searchParams = new URLSearchParams()
      if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.search) searchParams.set('search', params.search)
      if (params?.category) searchParams.set('category', params.category)
      if (params?.type) searchParams.set('type', params.type)
      if (params?.date_from) searchParams.set('date_from', params.date_from)
      if (params?.date_to) searchParams.set('date_to', params.date_to)
      
      const url = `/api/transactions?${searchParams.toString()}`
      console.log('Fetching from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch transactions')
      }
      
      const data = await response.json()
      console.log('Transactions loaded:', data.data?.length || 0)
      
      return data
    } catch (error: any) {
      console.error('TransactionAPI.getTransactions error:', error)
      throw error
    }
  },

  // Get single transaction
  getTransaction: async (id: number) => {
    const response = await api.get(`/transactions/${id}`)
    return normalizeTransaction(response.data)
  },

  // Create transaction
  createTransaction: async (transactionData: {
    title: string
    content?: string
    acf: {
      amount: number
      type: 'income' | 'expense'
      category: string
      date: string
      note?: string
    }
  }) => {
    try {
      // First try the normal WordPress REST API
      const response = await api.post('/transactions', {
        ...transactionData,
        status: 'publish',
      })
      return normalizeTransaction(response.data)
    } catch (error: any) {
      console.warn('Normal API failed, trying direct endpoint:', error.message)
      
      // Fallback to direct endpoint for testing
      try {
        const directResponse = await fetch('http://localhost/finance/test-transaction-direct.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData)
        })
        
        if (directResponse.ok) {
          const result = await directResponse.json()
          console.log('Direct endpoint success:', result)
          return normalizeTransaction(result)
        } else {
          throw new Error(`Direct endpoint failed: ${directResponse.status}`)
        }
      } catch (directError: any) {
        console.error('Direct endpoint also failed:', directError)
        throw error // Throw original error
      }
    }
  },

  // Update transaction
  updateTransaction: async (id: number, transactionData: any) => {
    const response = await api.put(`/transactions/${id}`, transactionData)
    return normalizeTransaction(response.data)
  },

  // Delete transaction
  deleteTransaction: async (id: number) => {
    const response = await api.delete(`/transactions/${id}`)
    return response.data
  },
}

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/finance_categories')
    return response.data
  },

  // Create category
  createCategory: async (categoryData: {
    title: string
    content?: string
    acf?: {
      type?: 'income' | 'expense' | 'both'
      color?: string
    }
  }) => {
    const response = await api.post('/finance_categories', {
      ...categoryData,
      status: 'publish',
    })
    return response.data
  },
}

// Budget API functions (for future use)
export const budgetAPI = {
  // Get all budgets
  getBudgets: async () => {
    const response = await api.get('/budgets')
    return response.data
  },

  // Create budget
  createBudget: async (budgetData: any) => {
    const response = await api.post('/budgets', {
      ...budgetData,
      status: 'publish',
    })
    return response.data
  },
}

export default api