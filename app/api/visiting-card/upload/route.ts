import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies (make it optional for testing)
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')?.value
    
    // For testing, we'll allow uploads without auth but log it
    if (!authToken) {
      console.log('⚠️ Upload attempted without authentication - allowing for testing')
    }
    
    console.log('Uploading visiting card image...')
    
    // Get form data
    const formData = await request.formData()
    const image = formData.get('image') as File
    const type = formData.get('type') as string
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }
    
    console.log('Image details:', {
      name: image.name,
      size: image.size,
      type: image.type
    })
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, GIF, and WebP files are allowed' },
        { status: 400 }
      )
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'visiting-cards')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = image.name.split('.').pop()
    const fileName = `${type}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Convert file to buffer and save
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const publicUrl = `/uploads/visiting-cards/${fileName}`
    
    console.log('✅ Image uploaded successfully:', publicUrl)
    
    return NextResponse.json({
      url: publicUrl,
      filename: fileName,
      type: type,
      size: image.size,
      message: 'Upload successful'
    })
    
  } catch (error: any) {
    console.error('❌ Image upload API error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}