'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { transactionAPI, authAPI } from '@/lib/api'

export default function TransactionDebugger() {
  const [debugResults, setDebugResults] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const addResult = (step: string, success: boolean, data: any) => {
    setDebugResults(prev => [...prev, { step, success, data, timestamp: new Date().toISOString() }])
  }

  const runFullDebug = async () => {
    setDebugResults([])
    setIsVisible(true)

    // Step 1: Check cookies
    const cookieToken = Cookies.get('auth-token')
    const userData = Cookies.get('user-data')
    
    addResult('Check Cookies', !!cookieToken, {
      hasToken: !!cookieToken,
      tokenPreview: cookieToken ? `${cookieToken.substring(0, 30)}...` : 'None',
      hasUserData: !!userData,
      userDataPreview: userData ? JSON.parse(userData) : 'None'
    })

    if (!cookieToken) {
      addResult('Authentication', false, { error: 'No auth token found in cookies' })
      return
    }

    // Step 2: Test user endpoint
    try {
      const userResponse = await authAPI.getCurrentUser()
      addResult('User API Test', true, userResponse)
    } catch (error: any) {
      addResult('User API Test', false, { 
        error: error.message, 
        status: error.response?.status,
        data: error.response?.data 
      })
    }

    // Step 3: Test transaction creation with new API
    try {
      const testTransaction = {
        title: 'Debug Test Transaction',
        content: 'Testing transaction creation from debugger',
        acf: {
          amount: 15.75,
          type: 'expense' as const,
          category: 'Debug',
          date: new Date().toISOString().split('T')[0],
          note: 'Debug test transaction'
        }
      }

      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testTransaction),
      })

      if (response.ok) {
        const transactionResponse = await response.json()
        addResult('Transaction Creation', true, transactionResponse)
      } else {
        const errorData = await response.json()
        addResult('Transaction Creation', false, { 
          error: errorData.error,
          status: response.status,
          statusText: response.statusText
        })
      }
    } catch (error: any) {
      addResult('Transaction Creation', false, { 
        error: error.message
      })
    }

    // Step 4: Test direct WordPress API call
    try {
      const directResponse = await fetch('http://localhost/finance/wp-json/wp/v2/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookieToken}`
        },
        body: JSON.stringify({
          title: 'Direct API Test',
          content: 'Testing direct API call',
          status: 'publish',
          acf: {
            amount: 20.50,
            type: 'income',
            category: 'Direct Test',
            date: new Date().toISOString().split('T')[0],
            note: 'Direct API test'
          }
        })
      })

      if (directResponse.ok) {
        const directData = await directResponse.json()
        addResult('Direct WordPress API', true, directData)
      } else {
        const errorData = await directResponse.text()
        addResult('Direct WordPress API', false, {
          status: directResponse.status,
          statusText: directResponse.statusText,
          error: errorData
        })
      }
    } catch (error: any) {
      addResult('Direct WordPress API', false, { error: error.message })
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button onClick={runFullDebug} variant="destructive" size="sm">
          🐛 Debug 403 Error
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transaction 403 Error Debugger
            <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debugResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? '✅' : '❌'} {result.step}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
            
            {debugResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Click "🐛 Debug 403 Error" to start debugging...</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex space-x-2">
            <Button onClick={runFullDebug} size="sm">
              Run Debug Again
            </Button>
            <Button onClick={() => setDebugResults([])} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}