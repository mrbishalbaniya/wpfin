'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, CheckCircle, XCircle } from 'lucide-react'

export default function TestUploadPage() {
  const [uploadResult, setUploadResult] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')

  const handleTestUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadResult('Uploading...')
      
      console.log('Testing upload with file:', file.name, file.size, file.type)
      
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'profile')

      const response = await fetch('/api/visiting-card/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload success:', result)
        setUploadResult(`✅ Upload Successful!\nURL: ${result.url}\nFilename: ${result.filename}\nSize: ${result.size} bytes`)
        setUploadedImageUrl(result.url)
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        setUploadResult(`❌ Upload Failed!\nStatus: ${response.status}\nError: ${errorData.error}`)
      }
    } catch (error: any) {
      console.error('Network error:', error)
      setUploadResult(`❌ Network Error!\nError: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Image Upload Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleTestUpload(file)
                  }
                }}
                className="hidden"
                id="test-upload"
              />
              <Button
                onClick={() => document.getElementById('test-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Select Image to Upload'}
              </Button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded text-sm">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="whitespace-pre-wrap">
                {uploadResult || 'No upload attempted yet...'}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upload Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedImageUrl ? (
              <div className="text-center">
                <img 
                  src={uploadedImageUrl} 
                  alt="Uploaded preview"
                  className="max-w-full h-auto rounded border mx-auto mb-4"
                  style={{ maxHeight: '300px' }}
                />
                <p className="text-sm text-gray-600">
                  Image successfully uploaded and accessible at:
                  <br />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {uploadedImageUrl}
                  </code>
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload an image to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upload API Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Endpoint:</strong> <code>/api/visiting-card/upload</code></p>
            <p><strong>Method:</strong> POST</p>
            <p><strong>Content-Type:</strong> multipart/form-data</p>
            <p><strong>Accepted Types:</strong> JPG, PNG, GIF, WebP</p>
            <p><strong>Max Size:</strong> 5MB</p>
            <p><strong>Upload Directory:</strong> <code>public/uploads/visiting-cards/</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}