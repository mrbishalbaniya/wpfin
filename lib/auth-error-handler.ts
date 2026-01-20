import Cookies from 'js-cookie'

interface AuthErrorContext {
  url?: string
  method?: string
  endpoint?: string
}

export const authErrorHandler = {
  // Handle 401 errors intelligently
  handle401Error: (context: AuthErrorContext = {}) => {
    console.warn('401 Authentication error:', context)
    
    // Critical endpoints that should trigger immediate logout
    const criticalEndpoints = [
      '/users/me',
      '/token/validate',
      '/wp-json/jwt-auth/v1/token/validate'
    ]
    
    // Check if this is a critical authentication failure
    const isCritical = criticalEndpoints.some(endpoint => 
      context.url?.includes(endpoint) || context.endpoint?.includes(endpoint)
    )
    
    if (isCritical) {
      console.warn('Critical auth failure - logging out user')
      authErrorHandler.forceLogout()
    } else {
      console.warn('Non-critical auth failure - allowing user to continue')
      // For non-critical endpoints, just log the error but don't logout
      // This prevents auto-logout when optional features fail
    }
  },

  // Force logout (for critical auth failures)
  forceLogout: () => {
    console.log('Forcing user logout due to auth failure')
    
    // Clear auth data
    Cookies.remove('auth-token')
    Cookies.remove('user-data')
    
    // Only redirect if we're not already on login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      // Add a flag to indicate this was an auto-logout
      const currentPath = window.location.pathname
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=session_expired`
    }
  },

  // Check if current session is valid
  isSessionValid: (): boolean => {
    const token = Cookies.get('auth-token')
    const userData = Cookies.get('user-data')
    
    return !!(token && userData)
  },

  // Get session info for debugging
  getSessionInfo: () => {
    const token = Cookies.get('auth-token')
    const userData = Cookies.get('user-data')
    
    return {
      hasToken: !!token,
      hasUserData: !!userData,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      isValid: !!(token && userData)
    }
  }
}