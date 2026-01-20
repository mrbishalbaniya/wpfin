import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')?.value
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log('Fetching categories with token:', authToken.substring(0, 30) + '...')
    
    // Fetch categories from WordPress
    const wpUrl = 'http://localhost/finance/wp-json/wp/v2/finance_categories'
    console.log('Fetching from WordPress:', wpUrl)
    
    const response = await fetch(wpUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    })
    
    console.log('WordPress response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: errorText },
        { status: response.status }
      )
    }
    
    const categories = await response.json()
    console.log('Categories fetched:', categories.length)
    
    return NextResponse.json(categories)
    
  } catch (error: any) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}