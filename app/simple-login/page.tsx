'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleLoginPage() {
  const [formData, setFormData] = useState({ username: 'sonik', password: 'sonik123' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleDirectLogin = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('=== DIRECT LOGIN TEST ===')
      console.log('Attempting login with:', formData.username)
      
      const response = await fetch('/api/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Login success:', data)
        setSuccess('Login successful! Redirecting...')
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error('Login failed:', errorData)
        setError(errorData.error || 'Login failed')
      }
    } catch (err: any) {
      console.error('Network error:', err)
      setError(`Network error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectWordPress = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('=== DIRECT WORDPRESS TEST ===')
      
      const response = await fetch('http://localhost/finance/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('WordPress response:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('WordPress success:', data)
        setSuccess('Direct WordPress connection successful!')
      } else {
        const errorText = await response.text()
        console.error('WordPress error:', errorText)
        setError(`WordPress error: ${response.status}`)
      }
    } catch (err: any) {
      console.error('WordPress network error:', err)
      setError(`WordPress network error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Simple Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleDirectLogin}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Direct Login (via API)'}
            </button>
            
            <button
              onClick={handleDirectWordPress}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Direct WordPress'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
            <p>WordPress JWT URL: {process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}