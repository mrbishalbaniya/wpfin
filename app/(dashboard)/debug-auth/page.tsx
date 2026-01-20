'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [tokenValidation, setTokenValidation] = useState<string>('Not tested')

  useEffect(() => {
    loadAuthInfo()
  }, [])

  const loadAuthInfo = () => {
    const cookieToken = Cookies.get('auth-token')
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null
    const userData = Cookies.get('user-data')
    const authState = auth.getAuthState()

    setAuthInfo({
      cookieToken: cookieToken ? `${cookieToken.substring(0, 50)}...` : 'Not found',
      localStorageToken: localStorageToken ? `${localStorageToken.substring(0, 50)}...` : 'Not found',
      userData: userData ? JSON.parse(userData) : 'Not found',
      authState,
      isAuthenticated: auth.isAuthenticated(),
      currentUser: auth.getCurrentUser()
    })
  }

  const validateToken = async () => {
    setTokenValidation('Testing...')
    try {
      const isValid = await auth.validateToken()
      setTokenValidation(isValid ? 'Valid ✅' : 'Invalid ❌')
    } catch (error: any) {
      setTokenValidation(`Error: ${error.message}`)
    }
  }

  const clearAuth = () => {
    Cookies.remove('auth-token')
    Cookies.remove('user-data')
    localStorage.removeItem('finance_token')
    loadAuthInfo()
    setTokenValidation('Not tested')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Authentication Debug</h1>
        <p className="text-gray-600 mt-1">Debug authentication issues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Cookie Token:</strong>
                <p className="text-sm text-gray-600 break-all">{authInfo?.cookieToken}</p>
              </div>
              
              <div>
                <strong>LocalStorage Token:</strong>
                <p className="text-sm text-gray-600 break-all">{authInfo?.localStorageToken}</p>
              </div>
              
              <div>
                <strong>Is Authenticated:</strong>
                <p className="text-sm text-gray-600">{authInfo?.isAuthenticated ? 'Yes ✅' : 'No ❌'}</p>
              </div>
              
              <div>
                <strong>Token Validation:</strong>
                <p className="text-sm text-gray-600">{tokenValidation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Current User:</strong>
                <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(authInfo?.currentUser, null, 2)}
                </pre>
              </div>
              
              <div>
                <strong>Auth State:</strong>
                <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(authInfo?.authState, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={loadAuthInfo}>
              Refresh Info
            </Button>
            <Button onClick={validateToken} variant="outline">
              Validate Token
            </Button>
            <Button onClick={clearAuth} variant="destructive">
              Clear All Auth Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>If you're getting 401 errors:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Check if you have a valid token (Cookie Token should not be "Not found")</li>
              <li>Click "Validate Token" to test if your token is still valid</li>
              <li>If token is invalid, go to <a href="/login" className="text-blue-600 underline">/login</a> to log in again</li>
              <li>If you're still having issues, click "Clear All Auth Data" and log in again</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}