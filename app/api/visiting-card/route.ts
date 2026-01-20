import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')?.value
    const userData = cookieStore.get('user-data')?.value
    
    if (!authToken || !userData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = JSON.parse(userData)
    console.log('Fetching visiting card for user:', user.username)
    
    // Fetch visiting card from WordPress
    const wpUrl = `http://localhost/finance/wp-json/finance-tracker/v1/visiting-card/${user.username}`
    console.log('Fetching from WordPress:', wpUrl)
    
    const response = await fetch(wpUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    })
    
    console.log('WordPress response status:', response.status)
    
    if (response.status === 404) {
      // No card found, return null
      return NextResponse.json(null)
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch visiting card', details: errorText },
        { status: response.status }
      )
    }
    
    const cardData = await response.json()
    console.log('Visiting card fetched successfully')
    console.log('🖼️ WordPress returned image URLs:', {
      profileImage: cardData.profileImage,
      companyLogo: cardData.companyLogo,
      paymentQR: cardData.paymentQR
    })
    
    return NextResponse.json(cardData)
    
  } catch (error: any) {
    console.error('Visiting card GET API error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')?.value
    const userData = cookieStore.get('user-data')?.value
    
    if (!authToken || !userData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = JSON.parse(userData)
    const cardData = await request.json()
    
    console.log('Saving visiting card for user:', user.username)
    console.log('Card data:', cardData)
    
    // Ensure username is set
    cardData.username = user.username
    
    // Save visiting card to WordPress
    const wpUrl = 'http://localhost/finance/wp-json/finance-tracker/v1/visiting-card'
    console.log('Saving to WordPress:', wpUrl)
    
    const response = await fetch(wpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData)
    })
    
    console.log('WordPress save response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('WordPress save error:', errorText)
      return NextResponse.json(
        { error: 'Failed to save visiting card', details: errorText },
        { status: response.status }
      )
    }
    
    const savedCard = await response.json()
    console.log('Visiting card saved successfully:', savedCard.id)
    
    return NextResponse.json(savedCard)
    
  } catch (error: any) {
    console.error('Visiting card POST API error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Same as POST for now
  return POST(request)
}