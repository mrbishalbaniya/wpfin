'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { auth } from '@/lib/auth'
import { transactionAPI } from '@/lib/api'
import Cookies from 'js-cookie'

export default function AuthTester() {
  const [isVisible, setIsVisible] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [credentials, setCredentials] = useState({ username: 'sonik', password: 'sonik123' })

  const log = (message: string) => {
    console.log(message)
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setResults([])
  }

  const testFullFlow = async () => {
    clearResults()
    
    try {
      // Step 1: Clear existing auth
      log('🧹 Clearing existing authentication...')
      Cookies.remove('auth-token')
      Cookies.remove('user-data')
      localStorage.removeItem('finance_token')
      
      // Step 2: Login
      log('🔐 Attempting login...')
      const authState = await auth.login(credentials.username, credentials.password)
      log(`✅ Login successful! User: ${authState.user?.display_name}`)
      
      // Step 3: Verify token storage
      const storedToken = Cookies.get('auth-token')
      log(`🍪 Token stored in cookie: ${storedToken ? 'Yes' : 'No'}`)
      
      // Step 4: Test transaction creation
      log('💰 Testing transaction creation...')
      const testTransaction = {
        title: 'Auth Test Transaction',
        content: 'Testing authentication flow',
        acf: {
          amount: 42.50,
          type: 'expense' as const,
          category: 'Auth Test',
          date: new Date().toISOString().split('T')[0],
          note: 'Authentication flow test'
        }
      }
      
      const transaction = await transactionAPI.createTransaction(testTransaction)
      log(`✅ Transaction created! ID: ${transaction.id}`)
      
      log('🎉 All tests passed! Authentication is working correctly.')
      
    } catch (error: any) {
      log(`❌ Test failed: ${error.message}`)
      console.error('Full test error:', error)
    }
  }

  const testTokenOnly = async () => {
    clearResults()
    
    try {
      log('🔍 Testing current authentication state...')
      
      const authState = auth.getAuthState()
      log(`Auth state: ${authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`)
      
      if (authState.isAuthenticated) {
        log(`User: ${authState.user?.display_name}`)
        log(`Token: ${authState.token?.substring(0, 30)}...`)
        
        // Test API call
        log('🧪 Testing API call with current token...')
        const testTransaction = {
          title: 'Token Test Transaction',
          content: 'Testing with existing token',
          acf: {
            amount: 25.00,
            type: 'income' as const,
            category: 'Token Test',
            date: new Date().toISOString().split('T')[0],
            note: 'Token test'
          }
        }
        
        const transaction = await transactionAPI.createTransaction(testTransaction)
        log(`✅ Transaction created with existing token! ID: ${transaction.id}`)
      } else {
        log('❌ No valid authentication found')
      }
      
    } catch (error: any) {
      log(`❌ Token test failed: ${error.message}`)
      console.error('Token test error:', error)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={() => setIsVisible(true)} variant="outline" size="sm">
          🧪 Auth Tester
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Authentication Tester
            <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={testFullFlow} size="sm">
              🔄 Full Auth Test
            </Button>
            <Button onClick={testTokenOnly} variant="outline" size="sm">
              🔍 Test Current Token
            </Button>
            <Button onClick={clearResults} variant="outline" size="sm">
              🧹 Clear
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-auto">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">No tests run yet...</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}