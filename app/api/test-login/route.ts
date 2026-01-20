import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('Test login attempt:', { username })
    console.log('Environment variables:', {
      WORDPRESS_API_URL: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
      WORDPRESS_JWT_URL: process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL
    })
    
    // Test direct fetch to WordPress
    const response = await fetch('http://localhost/finance/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    
    console.log('WordPress response status:', response.status)
    console.log('WordPress response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress error:', errorText)
      return NextResponse.json(
        { error: 'WordPress authentication failed', details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('WordPress success:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Login test successful',
      token: data.token ? 'Token received' : 'No token',
      data: data
    })
    
  } catch (error: any) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: 'Network error', message: error.message },
      { status: 500 }
    )
  }
}