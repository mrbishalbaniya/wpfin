import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('Direct login attempt:', { username })
    
    // Step 1: Get JWT token
    console.log('Step 1: Getting JWT token...')
    const tokenResponse = await fetch('http://localhost/finance/wp-json/jwt-auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    
    console.log('Token response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token request failed:', errorText)
      return NextResponse.json(
        { error: 'Authentication failed', details: errorText },
        { status: tokenResponse.status }
      )
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Token received:', tokenData.token ? 'Yes' : 'No')
    
    // Step 2: Get user data
    console.log('Step 2: Getting user data...')
    const userResponse = await fetch('http://localhost/finance/wp-json/wp/v2/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json',
      }
    })
    
    console.log('User response status:', userResponse.status)
    
    let userData = null
    if (userResponse.ok) {
      userData = await userResponse.json()
      console.log('User data received:', userData.name)
    } else {
      console.warn('User data request failed, using minimal data')
      userData = {
        id: 0,
        name: username,
        email: '',
        slug: username
      }
    }
    
    // Step 3: Set cookies (server-side)
    const cookieStore = cookies()
    cookieStore.set('auth-token', tokenData.token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    cookieStore.set('user-data', JSON.stringify({
      id: userData.id,
      username: userData.slug || username,
      email: userData.email || '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      display_name: userData.name || username
    }), {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userData.id,
        username: userData.slug || username,
        email: userData.email || '',
        display_name: userData.name || username
      },
      token: tokenData.token
    })
    
  } catch (error: any) {
    console.error('Direct login error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}