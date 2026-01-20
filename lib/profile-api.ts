import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || 'http://localhost/finance'

// Create axios instance with auth
const createAuthenticatedRequest = () => {
  const token = Cookies.get('auth-token') || 
                (typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null)
  
  return axios.create({
    baseURL: `${API_BASE_URL}/wp-json/finance-tracker/v1`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  })
}

export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  description: string
  avatar_url?: string
}

export interface UserStats {
  total_transactions: number
  total_income: number
  total_expenses: number
  net_worth: number
  total_debt_loans: number
  total_lent: number
  total_borrowed: number
  debt_loan_balance: number
  member_since: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  display_name?: string
  email?: string
  description?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export const profileAPI = {
  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.put('/user/profile', data)
      return response.data
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid data provided.')
      } else {
        throw new Error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.put('/user/password', data)
      return response.data
    } catch (error: any) {
      console.error('Change password error:', error.response?.data)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid password data.')
      } else {
        throw new Error(error.response?.data?.message || 'Failed to change password')
      }
    }
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.get('/user/stats')
      return response.data
    } catch (error: any) {
      console.error('Get user stats error:', error.response?.data)
      
      if (error.response?.status === 401) {
        console.warn('Auth failed for user stats - returning mock data instead of logging out')
      }
      
      // Always return mock data if API fails (don't throw auth errors)
      return {
        total_transactions: 0,
        total_income: 0,
        total_expenses: 0,
        net_worth: 0,
        total_debt_loans: 0,
        total_lent: 0,
        total_borrowed: 0,
        debt_loan_balance: 0,
        member_since: new Date().toISOString()
      }
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string; message: string }> => {
    try {
      const token = Cookies.get('auth-token') || 
                    (typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null)
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }
      
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await axios.post(`${API_BASE_URL}/wp-json/finance-tracker/v1/user/avatar`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error: any) {
      console.error('Upload avatar error:', error.response?.data)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid file. Please use JPG, PNG, or GIF under 2MB.')
      } else {
        throw new Error(error.response?.data?.message || 'Failed to upload avatar')
      }
    }
  },

  // Delete avatar
  deleteAvatar: async (): Promise<{ message: string }> => {
    try {
      const api = createAuthenticatedRequest()
      const response = await api.delete('/user/avatar')
      return response.data
    } catch (error: any) {
      console.error('Delete avatar error:', error.response?.data)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else {
        throw new Error(error.response?.data?.message || 'Failed to delete avatar')
      }
    }
  }
}