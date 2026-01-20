'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { localImageStorage } from '@/lib/local-image-storage'
import { auth } from '@/lib/auth'

export default function DebugImagesPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    // Load local storage data
    setLocalStorageData(localImageStorage.getAllImages())
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testImageAccess = async () => {
    addResult('🧪 Starting image access tests...')
    
    // Test 1: Static file access
    try {
      const response = await fetch('/test-profile.jpg')
      addResult(`📁 Static file test: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'} (${response.status})`)
    } catch (error) {
      addResult(`📁 Static file test: ❌ ERROR - ${error}`)
    }

    // Test 2: Uploads directory access
    try {
      const response = await fetch('/uploads/visiting-cards/profile_1768921054385.jpg')
      addResult(`📂 Uploads test: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'} (${response.status})`)
    } catch (error) {
      addResult(`📂 Uploads test: ❌ ERROR - ${error}`)
    }

    // Test 3: API endpoint test
    try {
      const response = await fetch('/api/test-image')
      const data = await response.json()
      addResult(`🔌 API test: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'} - Found ${data.imageFiles || 0} images`)
    } catch (error) {
      addResult(`🔌 API test: ❌ ERROR - ${error}`)
    }

    // Test 4: Current user images
    const user = auth.getCurrentUser()
    if (user) {
      const localImages = localImageStorage.getImages(user.username)
      addResult(`👤 User images: ${localImages ? '✅ FOUND' : '❌ NOT FOUND'} - ${JSON.stringify(localImages)}`)
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('visiting-card-images')
    setLocalStorageData({})
    addResult('🗑️ Local storage cleared')
  }

  const testImageLoad = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }

  const testAllImages = async () => {
    addResult('🖼️ Testing image loading...')
    
    const testUrls = [
      '/test-profile.jpg',
      '/uploads/visiting-cards/profile_1768921054385.jpg',
      '/uploads/visiting-cards/logo_1768921057935.png'
    ]

    for (const url of testUrls) {
      const loaded = await testImageLoad(url)
      addResult(`🖼️ ${url}: ${loaded ? '✅ LOADED' : '❌ FAILED'}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Image Debug Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testImageAccess} className="w-full">
              🧪 Test Image Access
            </Button>
            
            <Button onClick={testAllImages} className="w-full">
              🖼️ Test Image Loading
            </Button>
            
            <Button onClick={clearLocalStorage} variant="outline" className="w-full">
              🗑️ Clear Local Storage
            </Button>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Manual Image Tests:</h3>
              <div className="grid grid-cols-2 gap-2">
                <img 
                  src="/test-profile.jpg" 
                  alt="Static test"
                  className="w-full h-20 object-cover border rounded"
                  onLoad={() => addResult('✅ Static image loaded')}
                  onError={() => addResult('❌ Static image failed')}
                />
                <img 
                  src="/uploads/visiting-cards/profile_1768921054385.jpg" 
                  alt="Upload test"
                  className="w-full h-20 object-cover border rounded"
                  onLoad={() => addResult('✅ Upload image loaded')}
                  onError={() => addResult('❌ Upload image failed')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Storage Data */}
        <Card>
          <CardHeader>
            <CardTitle>Local Storage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
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
    </div>
  )
}