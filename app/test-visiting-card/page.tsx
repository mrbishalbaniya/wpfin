'use client'

import { useState } from 'react'

export default function TestVisitingCardPage() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testSaveCard = async () => {
    setIsLoading(true)
    setResult('Testing visiting card save...')
    
    try {
      const testCard = {
        name: 'Test User',
        title: 'Software Developer',
        company: 'Test Company',
        bio: 'This is a test bio for the visiting card',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567',
        website: 'https://test.com',
        profileImage: '',
        companyLogo: '',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
          twitter: 'https://twitter.com/test'
        },
        theme: 'modern' as const,
        username: ''
      }
      
      console.log('Testing save with:', testCard)
      
      const response = await fetch('/api/visiting-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCard)
      })
      
      console.log('Save response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (response.ok) {
        const savedCard = await response.json()
        console.log('Save success:', savedCard)
        setResult(`✅ Save Successful!\nCard ID: ${savedCard.id}\nName: ${savedCard.name}\nTitle: ${savedCard.title}\nEmail: ${savedCard.email}`)
      } else {
        const errorData = await response.json()
        console.error('Save failed:', errorData)
        setResult(`❌ Save Failed!\nStatus: ${response.status}\nError: ${errorData.error}\nDetails: ${errorData.details || 'None'}`)
      }
    } catch (error: any) {
      console.error('Network error:', error)
      setResult(`❌ Network Error!\nError: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testLoadCard = async () => {
    setIsLoading(true)
    setResult('Testing visiting card load...')
    
    try {
      const response = await fetch('/api/visiting-card', {
        method: 'GET'
      })
      
      console.log('Load response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (response.ok) {
        const cardData = await response.json()
        console.log('Load success:', cardData)
        
        if (cardData) {
          setResult(`✅ Load Successful!\nCard ID: ${cardData.id}\nName: ${cardData.name}\nTitle: ${cardData.title}\nEmail: ${cardData.email}\nTheme: ${cardData.theme}`)
        } else {
          setResult(`ℹ️ No Card Found\nNo visiting card exists for this user yet.`)
        }
      } else {
        const errorData = await response.json()
        console.error('Load failed:', errorData)
        setResult(`❌ Load Failed!\nStatus: ${response.status}\nError: ${errorData.error}`)
      }
    } catch (error: any) {
      console.error('Network error:', error)
      setResult(`❌ Network Error!\nError: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAuth = async () => {
    setIsLoading(true)
    setResult('Testing authentication...')
    
    try {
      // Check cookies
      const cookies = document.cookie
      const hasAuthToken = cookies.includes('auth-token')
      const hasUserData = cookies.includes('user-data')
      
      console.log('Cookies check:', { hasAuthToken, hasUserData })
      
      if (!hasAuthToken) {
        setResult(`❌ Authentication Failed!\nNo auth-token cookie found.\nPlease login first at /login`)
        return
      }
      
      // Test a simple authenticated endpoint
      const response = await fetch('/api/visiting-card', {
        method: 'GET'
      })
      
      if (response.status === 401) {
        setResult(`❌ Authentication Failed!\nToken is invalid or expired.\nPlease login again at /login`)
      } else {
        setResult(`✅ Authentication OK!\nAuth token is valid.\nStatus: ${response.status}`)
      }
    } catch (error: any) {
      console.error('Auth test error:', error)
      setResult(`❌ Auth Test Error!\nError: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Visiting Card API Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testAuth}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Authentication
          </button>
          
          <button
            onClick={testLoadCard}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Load Card
          </button>
          
          <button
            onClick={testSaveCard}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Save Card
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {result || 'Click a test button to see results...'}
          </pre>
        </div>
        
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Instructions:</h3>
          <ol className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>1. First test authentication to make sure you're logged in</li>
            <li>2. Test load card to see if you have an existing card</li>
            <li>3. Test save card to create/update a card</li>
            <li>4. Go to <a href="/visiting-card" className="underline">/visiting-card</a> to use the full interface</li>
          </ol>
        </div>
      </div>
    </div>
  )
}