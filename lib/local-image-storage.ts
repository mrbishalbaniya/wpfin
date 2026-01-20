// Local storage solution for image URLs when WordPress backend has issues

interface ImageStorage {
  [username: string]: {
    profileImage?: string
    companyLogo?: string
    paymentQR?: string
    lastUpdated: string
  }
}

const STORAGE_KEY = 'visiting-card-images'

export const localImageStorage = {
  // Save image URLs for a user
  saveImages: (username: string, images: { profileImage?: string, companyLogo?: string, paymentQR?: string }) => {
    try {
      const storage: ImageStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      
      storage[username] = {
        ...storage[username],
        ...images,
        lastUpdated: new Date().toISOString()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
      console.log('💾 Images saved to local storage for:', username, images)
    } catch (error) {
      console.error('Failed to save images to local storage:', error)
    }
  },

  // Get image URLs for a user
  getImages: (username: string) => {
    try {
      const storage: ImageStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const userImages = storage[username]
      
      if (userImages) {
        console.log('📁 Images loaded from local storage for:', username, userImages)
        return {
          profileImage: userImages.profileImage,
          companyLogo: userImages.companyLogo,
          paymentQR: userImages.paymentQR
        }
      }
      
      return null
    } catch (error) {
      console.error('Failed to load images from local storage:', error)
      return null
    }
  },

  // Clear images for a user
  clearImages: (username: string) => {
    try {
      const storage: ImageStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      delete storage[username]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
      console.log('🗑️ Images cleared from local storage for:', username)
    } catch (error) {
      console.error('Failed to clear images from local storage:', error)
    }
  },

  // Get all stored images (for debugging)
  getAllImages: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch (error) {
      console.error('Failed to load all images from local storage:', error)
      return {}
    }
  }
}