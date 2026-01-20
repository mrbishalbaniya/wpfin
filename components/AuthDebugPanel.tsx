'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'

export default function AuthDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  const collectDebugInfo = () => {
    const cookieToken = Cookies.get('auth-token')
    const userDataCookie = Cookies.get('user-data')
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null
    
    let userData = null
    try {
      userData = userDataCookie ? JSON.parse(userDataCookie) : null
    } catch (e) {
      userData = 'Invalid JSON'
    }

    setDebugInfo({
      cookieToken: cookieToken ? `${cookieToken.substring(0, 30)}...` : 'Not found',
      cookieTokenFull: cookieToken || 'Not found',
      userDataCookie: userData,
      localStorageToken: localStorageToken ? `${localStorageToken.substring(0, 30)}...` : 'Not found',
      allCookies: document.cookie,
      timestamp: new Date().toISOString()
    })
    setIsVisible(true)
  }

  const testAPICall = async () => {
    try {
      console.log('Testing API call...')
      const response = await authAPI.getCurrentUser()
      console.log('API call successful:', response)
      alert('API call successful! Check console for details.')
    } catch (error: any) {
      console.error('API call failed:', error)
      alert(`API call failed: ${error.message}`)
    }
  }

  const testDirectAPI = async () => {
    try {
      const token = Cookies.get('auth-token')
      if (!token) {
        alert('No token found!')
        return
      }

      console.log('Testing direct API endpoint...')
      
      const response = await fetch('http://localhost/finance/test-api-direct.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      console.log('Direct API response:', result)
      
      if (response.ok) {
        alert('Direct API call successful! Check console for details.')
      } else {
        alert(`Direct API call failed: ${result.error || result.message}`)
      }
    } catch (error: any) {
      console.error('Direct API call error:', error)
      alert(`Direct API call error: ${error.message}`)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={collectDebugInfo} variant="outline" size="sm">
          Debug Auth
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Authentication Debug Panel
            <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Token Information:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Cookie Token:</strong> {debugInfo?.cookieToken}</p>
              <p><strong>LocalStorage Token:</strong> {debugInfo?.localStorageToken}</p>
              <p><strong>Timestamp:</strong> {debugInfo?.timestamp}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">User Data:</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(debugInfo?.userDataCookie, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">All Cookies:</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
              {debugInfo?.allCookies}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Full Token (for testing):</h3>
            <textarea 
              className="w-full text-xs bg-gray-100 p-2 rounded h-20 resize-none"
              value={debugInfo?.cookieTokenFull}
              readOnly
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={testAPICall} size="sm">
              Test User API
            </Button>
            <Button onClick={testDirectAPI} size="sm">
              Test Direct API
            </Button>
            <Button onClick={collectDebugInfo} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}