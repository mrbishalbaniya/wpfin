import { NextRequest, NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'
import { readdir } from 'fs/promises'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    
    if (imagePath) {
      // Test specific image
      const fullPath = join(process.cwd(), 'public', imagePath)
      const exists = existsSync(fullPath)
      
      return NextResponse.json({
        path: imagePath,
        fullPath,
        exists,
        publicUrl: imagePath,
        message: exists ? 'Image exists' : 'Image not found'
      })
    } else {
      // List all uploaded images
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'visiting-cards')
      
      if (!existsSync(uploadsDir)) {
        return NextResponse.json({
          error: 'Uploads directory does not exist',
          path: uploadsDir
        })
      }
      
      const files = await readdir(uploadsDir)
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      )
      
      const fileInfo = imageFiles.map(file => ({
        filename: file,
        publicUrl: `/uploads/visiting-cards/${file}`,
        fullPath: join(uploadsDir, file),
        exists: existsSync(join(uploadsDir, file))
      }))
      
      return NextResponse.json({
        uploadsDirectory: uploadsDir,
        totalFiles: files.length,
        imageFiles: imageFiles.length,
        files: fileInfo
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      error: 'Server error',
      message: error.message
    }, { status: 500 })
  }
}