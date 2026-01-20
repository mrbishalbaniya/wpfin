import axios from 'axios'
import Cookies from 'js-cookie'
import { BusinessCardData } from '@/components/BusinessCard'

// WordPress API configuration
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost/finance/wp-json/wp/v2'
const CUSTOM_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL?.replace('/jwt-auth/v1', '/finance-tracker/v1') || 'http://localhost/finance/wp-json/finance-tracker/v1'

// Create axios instance
const api = axios.create({
  baseURL: CUSTOM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Visiting card API auth error - not auto-logging out')
      // Don't auto-logout for visiting card API errors
      // Let the calling code handle the error appropriately
    }
    return Promise.reject(error)
  }
)

export const visitingCardAPI = {
  // Get visiting card by username (authenticated)
  getCard: async (username: string): Promise<BusinessCardData | null> => {
    try {
      console.log('VisitingCardAPI.getCard called for:', username)
      
      // Use our reliable API endpoint
      const response = await fetch('/api/visiting-card', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('API response status:', response.status)
      
      if (response.status === 404 || response.status === 204) {
        console.log('No visiting card found')
        return null
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch visiting card')
      }
      
      const data = await response.json()
      console.log('Visiting card loaded successfully')
      console.log('🖼️ Image URLs in response:', {
        profileImage: data.profileImage,
        companyLogo: data.companyLogo,
        paymentQR: data.paymentQR
      })
      return data
    } catch (error: any) {
      console.log('Card not found or error:', error.message)
      return null
    }
  },

  // Save visiting card
  saveCard: async (cardData: BusinessCardData): Promise<BusinessCardData> => {
    try {
      console.log('VisitingCardAPI.saveCard called with:', cardData)
      
      const response = await fetch('/api/visiting-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData)
      })
      
      console.log('Save response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Save error:', errorData)
        throw new Error(errorData.error || 'Failed to save visiting card')
      }
      
      const savedCard = await response.json()
      console.log('Visiting card saved successfully:', savedCard.id)
      return savedCard
    } catch (error: any) {
      console.error('VisitingCardAPI.saveCard error:', error)
      throw error
    }
  },

  // Update visiting card
  updateCard: async (cardData: BusinessCardData): Promise<BusinessCardData> => {
    return visitingCardAPI.saveCard(cardData) // Same as save for now
  },

  // Upload image (profile or logo)
  uploadImage: async (file: File, type: 'profile' | 'logo'): Promise<string> => {
    try {
      console.log('VisitingCardAPI.uploadImage called:', { type, fileName: file.name })
      
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', type)

      const response = await fetch('/api/visiting-card/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload error:', errorData)
        throw new Error(errorData.error || 'Failed to upload image')
      }
      
      const uploadResult = await response.json()
      console.log('Image uploaded successfully:', uploadResult.url)
      return uploadResult.url
    } catch (error: any) {
      console.error('VisitingCardAPI.uploadImage error:', error)
      throw error
    }
  },

  // Delete visiting card
  deleteCard: async (username: string): Promise<void> => {
    try {
      const response = await fetch(`/api/visiting-card?username=${username}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete visiting card')
      }
    } catch (error: any) {
      console.error('VisitingCardAPI.deleteCard error:', error)
      throw error
    }
  },

  // Get public card data (no auth required) - for server-side rendering
  getPublicCard: async (username: string): Promise<BusinessCardData | null> => {
    try {
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.WORDPRESS_API_URL || 'http://localhost/finance/wp-json/finance-tracker/v1')
        : 'http://localhost/finance/wp-json/finance-tracker/v1'
      
      const response = await fetch(`${baseUrl}/visiting-card/public/${username}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error fetching public card:', error)
      return null
    }
  },

  // Search visiting cards (for future use)
  searchCards: async (query: string): Promise<BusinessCardData[]> => {
    const response = await fetch(`/api/visiting-card/search?q=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      throw new Error('Failed to search visiting cards')
    }
    
    return await response.json()
  },
}

export default visitingCardAPI