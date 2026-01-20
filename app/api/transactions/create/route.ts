import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Transaction creation API called with:', body)

    // Get auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      console.error('No auth token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('Using token:', token.substring(0, 30) + '...')

    // Call WordPress transactions endpoint directly
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost/finance/wp-json/wp/v2'
    const transactionsUrl = `${wordpressUrl}/transactions`
    
    console.log('Calling WordPress transactions at:', transactionsUrl)

    const transactionData = {
      ...body,
      status: 'publish',
    }

    console.log('Sending transaction data:', transactionData)

    const response = await fetch(transactionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    })

    console.log('WordPress response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('WordPress transaction error:', errorData)
      
      try {
        const errorJson = JSON.parse(errorData)
        return NextResponse.json(
          { error: errorJson.message || 'Failed to create transaction' },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { error: 'Failed to create transaction' },
          { status: response.status }
        )
      }
    }

    const transactionResult = await response.json()
    console.log('Transaction created successfully:', transactionResult.id)

    return NextResponse.json({
      success: true,
      transaction: transactionResult,
      message: 'Transaction created successfully'
    })

  } catch (error: any) {
    console.error('Transaction creation API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}