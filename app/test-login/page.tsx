'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testDirectWordPress = async () => {
    setIsLoading(true)
    setResult('Testing direct WordPress connection...')
    
    try {
      const response = await fetch('http://localhost/finance/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'sonik',
          password: 'sonik123'
        })
      })
      
      console.log('Direct WordPress response:', response)
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Direct WordPress Success!\nStatus: ${response.status}\nToken: ${data.token ? 'Received' : 'Missing'}\nData: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        setResult(`❌ Direct WordPress Error!\nStatus: ${response.status}\nError: ${errorText}`)
      }
    } catch (error: any) {
      console.error('Direct WordPress error:', error)
      setResult(`❌ Network Error!\nError: ${error.message}\nThis might be a CORS issue.`)
    } finally {
      setIsLoading(false)
    }
  }

  const testNextJSAPI = async () => {
    setIsLoading(true)
    setResult('Testing Next.js API route...')
    
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'sonik',
          password: 'sonik123'
        })
      })
      
      console.log('Next.js API response:', response)
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Next.js API Success!\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorData = await response.json()
        setResult(`❌ Next.js API Error!\nStatus: ${response.status}\nError: ${JSON.stringify(errorData, null, 2)}`)
      }
    } catch (error: any) {
      console.error('Next.js API error:', error)
      setResult(`❌ Next.js API Network Error!\nError: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAuthLib = async () => {
    setIsLoading(true)
    setResult('Testing auth library...')
    
    try {
      // Import auth dynamically to avoid SSR issues
      const { auth } = await import('@/lib/auth')
      
      console.log('Testing auth.login...')
      const authResult = await auth.login('sonik', 'sonik123')
      
      setResult(`✅ Auth Library Success!\nAuthenticated: ${authResult.isAuthenticated}\nUser: ${authResult.user?.display_name}\nToken: ${authResult.token ? 'Received' : 'Missing'}`)
    } catch (error: any) {
      console.error('Auth library error:', error)
      setResult(`❌ Auth Library Error!\nError: ${error.message}\nStack: ${error.stack}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Login Debug Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testDirectWordPress}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Direct WordPress
          </button>
          
          <button
            onClick={testNextJSAPI}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Next.js API
          </button>
          
          <button
            onClick={testAuthLib}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Auth Library
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {result || 'Click a test button to see results...'}
          </pre>
        </div>
        
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Environment Info:</h3>
          <p className="text-sm text-yellow-700">
            WORDPRESS_API_URL: {process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'Not set'}<br/>
            WORDPRESS_JWT_URL: {process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL || 'Not set'}<br/>
            Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
          </p>
        </div>
      </div>
    </div>
  )
}