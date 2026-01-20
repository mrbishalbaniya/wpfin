import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Registration API called with:', { ...body, password: '[HIDDEN]' })

    const { username, email, password, first_name, last_name } = body

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Call WordPress registration endpoint directly
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || 'http://localhost/finance'
    const registrationUrl = `${wordpressUrl}/wp-json/wp/v2/register`
    
    console.log('Calling WordPress registration at:', registrationUrl)

    const response = await fetch(registrationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name,
        last_name,
      }),
    })

    console.log('WordPress response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('WordPress registration error:', errorData)
      
      try {
        const errorJson = JSON.parse(errorData)
        return NextResponse.json(
          { error: errorJson.message || 'Registration failed' },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { error: 'Registration failed' },
          { status: response.status }
        )
      }
    }

    const userData = await response.json()
    console.log('Registration successful:', { ...userData, password: '[HIDDEN]' })

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Registration successful'
    })

  } catch (error: any) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}