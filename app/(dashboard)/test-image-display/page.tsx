'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestImageDisplayPage() {
  const [testImages, setTestImages] = useState<string[]>([])
  const [imageStatus, setImageStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({})

  // Test images from the uploads directory
  const testImageUrls = [
    '/uploads/visiting-cards/profile_1768921054385.jpg',
    '/uploads/visiting-cards/logo_1768921057935.png',
    '/uploads/visiting-cards/profile_1768921061290.png'
  ]

  useEffect(() => {
    setTestImages(testImageUrls)
    
    // Initialize status
    const initialStatus: Record<string, 'loading' | 'success' | 'error'> = {}
    testImageUrls.forEach(url => {
      initialStatus[url] = 'loading'
    })
    setImageStatus(initialStatus)
  }, [])

  const handleImageLoad = (url: string) => {
    console.log('✅ Image loaded successfully:', url)
    setImageStatus(prev => ({ ...prev, [url]: 'success' }))
  }

  const handleImageError = (url: string, error: any) => {
    console.error('❌ Image failed to load:', url, error)
    setImageStatus(prev => ({ ...prev, [url]: 'error' }))
  }

  const testDirectAccess = (url: string) => {
    const fullUrl = `http://localhost:3002${url}`
    window.open(fullUrl, '_blank')
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Image Display Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((imageUrl, index) => (
          <Card key={imageUrl} className="border-2">
            <CardHeader>
              <CardTitle className="text-sm">Test Image {index + 1}</CardTitle>
              <p className="text-xs text-gray-600 break-all">{imageUrl}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Display Test */}
              <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                <img 
                  src={imageUrl}
                  alt={`Test image ${index + 1}`}
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: '200px' }}
                  onLoad={() => handleImageLoad(imageUrl)}
                  onError={(e) => handleImageError(imageUrl, e)}
                />
                
                {/* Status Indicator */}
                <div className="mt-2">
                  {imageStatus[imageUrl] === 'loading' && (
                    <span className="text-blue-600">🔄 Loading...</span>
                  )}
                  {imageStatus[imageUrl] === 'success' && (
                    <span className="text-green-600">✅ Loaded Successfully</span>
                  )}
                  {imageStatus[imageUrl] === 'error' && (
                    <span className="text-red-600">❌ Failed to Load</span>
                  )}
                </div>
              </div>
              
              {/* Test Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={() => testDirectAccess(imageUrl)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Open in New Tab
                </Button>
                
                <div className="text-xs space-y-1">
                  <div><strong>Status:</strong> {imageStatus[imageUrl] || 'unknown'}</div>
                  <div><strong>URL:</strong> <code className="bg-gray-100 px-1 rounded">{imageUrl}</code></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Manual URL Test */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Manual URL Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Test any image URL manually:
            </p>
            
            <div className="flex space-x-2">
              <input 
                type="text"
                placeholder="/uploads/visiting-cards/your-image.jpg"
                className="flex-1 px-3 py-2 border rounded"
                id="manual-url"
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('manual-url') as HTMLInputElement
                  if (input.value) {
                    setTestImages(prev => [...prev, input.value])
                    setImageStatus(prev => ({ ...prev, [input.value]: 'loading' }))
                  }
                }}
                size="sm"
              >
                Test URL
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Debug Info */}
      <Card className="mt-8 bg-gray-50">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
            <div><strong>Expected Base:</strong> http://localhost:3002</div>
            <div><strong>Upload Directory:</strong> public/uploads/visiting-cards/</div>
            <div><strong>Public Path:</strong> /uploads/visiting-cards/</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}