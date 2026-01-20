'use client'

import { useState, useEffect } from 'react'
import { transactionAPI } from '@/lib/api'

export default function TestReports() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      const results: string[] = []
      
      try {
        // Test 1: Basic transaction loading
        results.push('🔄 Testing basic transaction loading...')
        const basicResponse = await transactionAPI.getTransactions()
        results.push(`✅ Basic loading: Found ${basicResponse.data.length} transactions`)
        
        // Test 2: Date filtering
        results.push('🔄 Testing date filtering...')
        const currentYear = new Date().getFullYear()
        const dateFilterResponse = await transactionAPI.getTransactions({
          date_from: `${currentYear}-01-01`,
          date_to: `${currentYear}-12-31`
        })
        results.push(`✅ Date filtering: Found ${dateFilterResponse.data.length} transactions for ${currentYear}`)
        
        // Test 3: Pagination
        results.push('🔄 Testing pagination...')
        const paginatedResponse = await transactionAPI.getTransactions({
          per_page: 5,
          page: 1
        })
        results.push(`✅ Pagination: Found ${paginatedResponse.data.length} transactions (max 5)`)
        
        // Test 4: Type filtering
        results.push('🔄 Testing type filtering...')
        const incomeResponse = await transactionAPI.getTransactions({
          type: 'income'
        })
        results.push(`✅ Income filtering: Found ${incomeResponse.data.length} income transactions`)
        
        const expenseResponse = await transactionAPI.getTransactions({
          type: 'expense'
        })
        results.push(`✅ Expense filtering: Found ${expenseResponse.data.length} expense transactions`)
        
      } catch (error: any) {
        results.push(`❌ API Error: ${error.message}`)
        if (error.response) {
          results.push(`   Status: ${error.response.status}`)
          results.push(`   Data: ${JSON.stringify(error.response.data)}`)
        }
      }
      
      setTestResults(results)
      setIsLoading(false)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Reports API Test
          </h1>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Running API tests...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded ${
                  result.startsWith('✅') 
                    ? 'bg-green-50 text-green-800' 
                    : result.startsWith('❌')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}>
                  {result}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <a 
              href="/reports" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Reports
            </a>
            <a 
              href="/dashboard" 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}