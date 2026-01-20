import axios from 'axios'
import Cookies from 'js-cookie'
import { DebtLoanItem } from './debt-loan'

const API_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || 'http://localhost/finance'

// Create axios instance with auth
const createAuthenticatedRequest = () => {
  // Try to get token from cookies first (new auth system), then localStorage (legacy)
  const token = Cookies.get('auth-token') || 
                (typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null)
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Debt-loan API auth debug:', {
      cookieToken: Cookies.get('auth-token'),
      localStorageToken: localStorage.getItem('finance_token'),
      finalToken: token ? `${token.substring(0, 20)}...` : 'No token',
      isAuthenticated: !!token
    })
  }
  
  if (!token) {
    console.error('No authentication token found. User may need to log in again.')
  }
  
  return axios.create({
    baseURL: `${API_BASE_URL}/wp-json/wp/v2`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  })
}

export const debtLoanAPI = {
  // Get all debt/loan items
  getDebtLoanItems: async (): Promise<{ data: DebtLoanItem[] }> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.get('/debt-loans')
      
      // Transform WordPress response to our format
      const transformedData = response.data.map((item: any) => ({
        id: item.id,
        title: item.title?.rendered || item.title,
        person: item.acf?.person || 'Unknown',
        amount: parseFloat(item.acf?.amount || 0),
        type: item.acf?.type || 'lent',
        status: item.acf?.status || 'outstanding',
        date: item.acf?.date || item.date,
        description: item.acf?.description || item.content?.rendered || '',
        created_at: item.date,
        updated_at: item.modified
      }))
      
      return { data: transformedData }
    } catch (error: any) {
      console.log('Debt-loan API error:', error.response?.status, error.message)
      
      // If the endpoint doesn't exist yet, return sample data for demonstration
      if (error.response?.status === 404 || error.message?.includes('Network Error')) {
        console.log('Using sample debt-loan data since WordPress endpoint is not available')
        return { 
          data: [
            {
              id: 1,
              title: 'Lent to John Doe',
              person: 'John Doe',
              amount: 5000,
              type: 'lent',
              status: 'outstanding',
              date: '2024-01-15',
              description: 'Emergency loan for medical expenses',
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z'
            },
            {
              id: 2,
              title: 'Borrowed from Jane Smith',
              person: 'Jane Smith',
              amount: 3000,
              type: 'borrowed',
              status: 'outstanding',
              date: '2024-01-20',
              description: 'Car repair loan',
              created_at: '2024-01-20T14:30:00Z',
              updated_at: '2024-01-20T14:30:00Z'
            },
            {
              id: 3,
              title: 'Lent to Mike Johnson',
              person: 'Mike Johnson',
              amount: 2000,
              type: 'lent',
              status: 'paid',
              date: '2024-01-10',
              description: 'Business startup loan',
              created_at: '2024-01-10T09:15:00Z',
              updated_at: '2024-01-25T16:45:00Z'
            },
            {
              id: 4,
              title: 'Lent to John Doe',
              person: 'John Doe',
              amount: 1500,
              type: 'lent',
              status: 'outstanding',
              date: '2024-01-25',
              description: 'Additional loan for rent',
              created_at: '2024-01-25T11:20:00Z',
              updated_at: '2024-01-25T11:20:00Z'
            }
          ] as DebtLoanItem[]
        }
      }
      throw error
    }
  },

  // Create new debt/loan item
  createDebtLoanItem: async (data: Partial<DebtLoanItem>): Promise<DebtLoanItem> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.post('/debt-loans', {
        title: `${data.type === 'lent' ? 'Lent to' : 'Borrowed from'} ${data.person}`,
        status: 'publish',
        acf: {
          person: data.person,
          amount: data.amount,
          type: data.type,
          status: data.status || 'outstanding',
          date: data.date,
          description: data.description || ''
        }
      })
      
      // Transform WordPress response to our format
      const item = response.data
      return {
        id: item.id,
        title: item.title?.rendered || item.title,
        person: item.acf?.person || data.person || '',
        amount: parseFloat(item.acf?.amount || data.amount || 0),
        type: item.acf?.type || data.type || 'lent',
        status: item.acf?.status || data.status || 'outstanding',
        date: item.acf?.date || data.date || new Date().toISOString().split('T')[0],
        description: item.acf?.description || data.description || '',
        created_at: item.date,
        updated_at: item.modified
      }
    } catch (error: any) {
      console.error('Create debt-loan error:', error.response?.status, error.response?.data)
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create transactions.')
      } else if (error.response?.status === 404 || error.message?.includes('Network Error')) {
        // Return mock created item for demo
        return {
          id: Math.floor(Math.random() * 1000) + 100,
          title: `${data.type === 'lent' ? 'Lent to' : 'Borrowed from'} ${data.person}`,
          person: data.person || '',
          amount: data.amount || 0,
          type: data.type || 'lent',
          status: data.status || 'outstanding',
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as DebtLoanItem
      }
      throw error
    }
  },

  // Update debt/loan item
  updateDebtLoanItem: async (id: number, data: Partial<DebtLoanItem>): Promise<DebtLoanItem> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.put(`/debt-loans/${id}`, {
        acf: {
          person: data.person,
          amount: data.amount,
          type: data.type,
          status: data.status,
          date: data.date,
          description: data.description
        }
      })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404 || error.message?.includes('Network Error')) {
        // Return mock updated item for demo
        return {
          id,
          title: `${data.type === 'lent' ? 'Lent to' : 'Borrowed from'} ${data.person}`,
          person: data.person || '',
          amount: data.amount || 0,
          type: data.type || 'lent',
          status: data.status || 'outstanding',
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as DebtLoanItem
      }
      throw error
    }
  },

  // Update status only
  updateDebtLoanStatus: async (id: number, status: 'outstanding' | 'paid'): Promise<DebtLoanItem> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.put(`/debt-loans/${id}`, {
        acf: { status }
      })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404 || error.message?.includes('Network Error')) {
        // Return mock updated item for demo
        return {
          id,
          title: 'Demo Transaction',
          person: 'Demo Person',
          amount: 1000,
          type: 'lent',
          status,
          date: new Date().toISOString().split('T')[0],
          description: 'Demo transaction',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as DebtLoanItem
      }
      throw error
    }
  },

  // Delete debt/loan item
  deleteDebtLoanItem: async (id: number): Promise<void> => {
    try {
      const api = createAuthenticatedRequest()
      await api.delete(`/debt-loans/${id}`)
    } catch (error: any) {
      if (error.response?.status === 404 || error.message?.includes('Network Error')) {
        // Silently succeed for demo mode
        console.log(`Demo: Would delete debt-loan item ${id}`)
        return
      }
      throw error
    }
  },

  // Generate share link
  generateShareLink: async (person: string, paymentQRCodeUrl?: string): Promise<{ token: string; shareUrl: string; expiresAt: string }> => {
    try {
      // Get token for authentication
      const token = Cookies.get('auth-token') || 
                    (typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null)
      
      console.log('Share link generation - Auth token check:', {
        hasToken: !!token,
        tokenSource: Cookies.get('auth-token') ? 'cookie' : localStorage.getItem('finance_token') ? 'localStorage' : 'none'
      })
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }
      
      // Create axios instance with correct base URL for share endpoint
      const response = await axios.post(`${API_BASE_URL}/wp-json/finance-tracker/v1/debt-loan-share`, {
        person_name: person,
        payment_qr_code_url: paymentQRCodeUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Share link generated successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Share link generation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log out and log back in.')
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create share links.')
      } else if (error.response?.status === 404) {
        if (error.response?.data?.code === 'no_transactions') {
          throw new Error('No transactions found for this person.')
        } else {
          throw new Error('Share endpoint not found. Please contact support.')
        }
      } else if (error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to server. Please check your connection.')
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to generate share link')
      }
    }
  },

  // Get share data (public endpoint)
  getShareData: async (token: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wp-json/finance-tracker/v1/debt-loan-share/${token}`)
      return response.data
    } catch (error: any) {
      console.error('Share data fetch error:', error)
      
      // Don't fall back to demo data - let the error propagate
      if (error.response?.status === 404) {
        throw new Error('Share link is invalid or expired')
      } else if (error.message?.includes('Network Error')) {
        throw new Error('Unable to connect to server')
      }
      
      throw new Error('Failed to fetch share data')
    }
  }
}