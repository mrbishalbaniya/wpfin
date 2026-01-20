'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authErrorHandler } from '@/lib/auth-error-handler'
import { useAuthContext } from '@/contexts/AuthContext'
import { profileAPI } from '@/lib/profile-api'

export default function TestAuthPage() {
  const { user, isAuthenticated, logout } = useAuthContext()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSessionInfo = () => {
    const sessionInfo = authErrorHandler.getSessionInfo()
    addResult(`📊 Session Info: ${JSON.stringify(sessionInfo)}`)
  }

  const testUserStats = async () => {
    addResult('🧪 Testing user stats API...')
    try {
      const stats = await profileAPI.getUserStats()
      addResult(`✅ User stats loaded: ${stats.total_transactions} transactions`)
    } catch (error: any) {
      addResult(`❌ User stats failed: ${error.message}`)
    }
  }

  const testAuthAPI = async () => {
    addResult('🧪 Testing auth API...')
    try {
      const response = await fetch('/api/visiting-card', {
        method: 'GET'
      })
      addResult(`📡 API Response: ${response.status} ${response.statusText}`)
    } catch (error: any) {
      addResult(`❌ API Error: ${error.message}`)
    }
  }

  const simulateAuthError = () => {
    addResult('🧪 Simulating auth error...')
    authErrorHandler.handle401Error({
      url: '/test-endpoint',
      method: 'GET'
    })
  }

  const simulateCriticalAuthError = () => {
    addResult('🧪 Simulating critical auth error...')
    authErrorHandler.handle401Error({
      url: '/users/me',
      method: 'GET'
    })
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
              <div><strong>User:</strong> {user?.username || 'None'}</div>
              <div><strong>Email:</strong> {user?.email || 'None'}</div>
              <div><strong>Display Name:</strong> {user?.display_name || 'None'}</div>
            </div>
            
            <Button onClick={testSessionInfo} className="w-full">
              📊 Check Session Info
            </Button>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Auth Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testUserStats} className="w-full">
              📈 Test User Stats API
            </Button>
            
            <Button onClick={testAuthAPI} className="w-full">
              📡 Test Visiting Card API
            </Button>
            
            <Button onClick={simulateAuthError} variant="outline" className="w-full">
              ⚠️ Simulate Non-Critical Auth Error
            </Button>
            
            <Button onClick={simulateCriticalAuthError} variant="destructive" className="w-full">
              🚨 Simulate Critical Auth Error
            </Button>
            
            <Button onClick={logout} variant="outline" className="w-full">
              🚪 Manual Logout
            </Button>
            
            <Button onClick={clearResults} variant="ghost" className="w-full">
              🗑️ Clear Results
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No tests run yet...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>1. Check Session Info:</strong> Verify your current authentication state</p>
            <p><strong>2. Test APIs:</strong> Try calling various APIs to see if they work</p>
            <p><strong>3. Simulate Errors:</strong> Test how the system handles auth failures</p>
            <p><strong>4. Non-Critical Error:</strong> Should NOT log you out automatically</p>
            <p><strong>5. Critical Error:</strong> WILL log you out (simulates /users/me failure)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}