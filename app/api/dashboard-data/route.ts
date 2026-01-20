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
    
    console.log('Fetching dashboard data with token:', authToken.substring(0, 30) + '...')
    
    try {
      // Try to fetch real transactions
      const wpUrl = 'http://localhost/finance/wp-json/wp/v2/transactions?per_page=100'
      console.log('Fetching from WordPress:', wpUrl)
      
      const response = await fetch(wpUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      })
      
      console.log('WordPress response status:', response.status)
      
      if (response.ok) {
        const transactions = await response.json()
        console.log('Real transactions fetched:', transactions.length)
        
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
          success: true,
          data: normalizedTransactions,
          total: transactions.length,
          source: 'wordpress'
        })
      } else {
        throw new Error(`WordPress API returned ${response.status}`)
      }
    } catch (wpError) {
      console.warn('WordPress API failed, returning sample data:', wpError)
      
      // Return sample data for demo purposes
      const sampleTransactions = [
        {
          id: 1,
          title: 'Salary Payment',
          content: 'Monthly salary',
          date: new Date().toISOString(),
          acf: {
            amount: 5000,
            type: 'income',
            category: 'Salary',
            date: new Date().toISOString().split('T')[0],
            note: 'Monthly salary payment'
          }
        },
        {
          id: 2,
          title: 'Grocery Shopping',
          content: 'Weekly groceries',
          date: new Date(Date.now() - 86400000).toISOString(),
          acf: {
            amount: 150,
            type: 'expense',
            category: 'Food & Dining',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            note: 'Weekly grocery shopping'
          }
        },
        {
          id: 3,
          title: 'Freelance Project',
          content: 'Web development project',
          date: new Date(Date.now() - 172800000).toISOString(),
          acf: {
            amount: 1200,
            type: 'income',
            category: 'Freelance',
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            note: 'Completed web development project'
          }
        },
        {
          id: 4,
          title: 'Electricity Bill',
          content: 'Monthly electricity bill',
          date: new Date(Date.now() - 259200000).toISOString(),
          acf: {
            amount: 85,
            type: 'expense',
            category: 'Bills & Utilities',
            date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
            note: 'Monthly electricity bill'
          }
        },
        {
          id: 5,
          title: 'Coffee Shop',
          content: 'Morning coffee',
          date: new Date(Date.now() - 345600000).toISOString(),
          acf: {
            amount: 4.50,
            type: 'expense',
            category: 'Food & Dining',
            date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
            note: 'Morning coffee and pastry'
          }
        }
      ]
      
      return NextResponse.json({
        success: true,
        data: sampleTransactions,
        total: sampleTransactions.length,
        source: 'sample',
        message: 'Using sample data - WordPress API unavailable'
      })
    }
    
  } catch (error: any) {
    console.error('Dashboard data API error:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    )
  }
}