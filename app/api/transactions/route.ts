import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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
    
    console.log('Fetching transactions with token:', authToken.substring(0, 30) + '...')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const per_page = searchParams.get('per_page') || '10'
    const page = searchParams.get('page') || '1'
    
    // Fetch transactions from WordPress
    const wpUrl = `http://localhost/finance/wp-json/wp/v2/transactions?per_page=${per_page}&page=${page}`
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
        { error: 'Failed to fetch transactions', details: errorText },
        { status: response.status }
      )
    }
    
    const transactions = await response.json()
    console.log('Transactions fetched:', transactions.length)
    
    // Get total count from headers
    const total = response.headers.get('x-wp-total') || '0'
    const totalPages = response.headers.get('x-wp-totalpages') || '0'
    
    // Normalize transaction data
    const normalizedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      title: transaction.title?.rendered || '',
      content: transaction.content?.rendered || '',
      date: transaction.date,
      acf: transaction.acf || {
        amount: 0,
        type: 'expense',
        category: 'Unknown',
        date: transaction.date.split('T')[0],
        note: ''
      }
    }))
    
    return NextResponse.json({
      data: normalizedTransactions,
      total: parseInt(total),
      totalPages: parseInt(totalPages)
    })
    
  } catch (error: any) {
    console.error('Transaction API error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}