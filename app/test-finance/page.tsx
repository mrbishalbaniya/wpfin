'use client'

import { useState, useEffect } from 'react'
import { financeUtils, Transaction } from '@/lib/finance'

export default function TestFinance() {
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const runTests = () => {
      const results: string[] = []

      // Test data with various edge cases
      const testTransactions: Transaction[] = [
        {
          id: 1,
          title: 'Valid Transaction',
          date: '2024-01-15',
          acf: {
            amount: 100,
            type: 'income',
            category: 'Salary',
            date: '2024-01-15',
            note: 'Test income'
          }
        },
        {
          id: 2,
          title: 'Invalid Date Transaction',
          date: 'invalid-date',
          acf: {
            amount: 50,
            type: 'expense',
            category: 'Food',
            date: 'invalid-date',
            note: 'Test expense'
          }
        },
        {
          id: 3,
          title: 'Missing ACF Transaction',
          date: '2024-01-10',
          acf: null as any // Simulate missing ACF data
        },
        {
          id: 4,
          title: 'Partial ACF Transaction',
          date: '2024-01-20',
          acf: {
            amount: 75,
            type: 'expense',
            category: '',
            date: null as any,
            note: undefined as any
          }
        }
      ]

      try {
        // Test calculateSummary
        const summary = financeUtils.calculateSummary(testTransactions)
        results.push(`✅ calculateSummary: Income=${summary.totalIncome}, Expense=${summary.totalExpense}, Balance=${summary.balance}`)
      } catch (error) {
        results.push(`❌ calculateSummary failed: ${error}`)
      }

      try {
        // Test getMonthlyData
        const monthlyData = financeUtils.getMonthlyData(testTransactions, 3)
        results.push(`✅ getMonthlyData: Generated ${monthlyData.length} months of data`)
      } catch (error) {
        results.push(`❌ getMonthlyData failed: ${error}`)
      }

      try {
        // Test getCategoryData
        const categoryData = financeUtils.getCategoryData(testTransactions)
        results.push(`✅ getCategoryData: Found ${categoryData.length} categories`)
      } catch (error) {
        results.push(`❌ getCategoryData failed: ${error}`)
      }

      try {
        // Test filterByDateRange
        const startDate = new Date('2024-01-01')
        const endDate = new Date('2024-01-31')
        const filtered = financeUtils.filterByDateRange(testTransactions, startDate, endDate)
        results.push(`✅ filterByDateRange: Filtered to ${filtered.length} transactions`)
      } catch (error) {
        results.push(`❌ filterByDateRange failed: ${error}`)
      }

      try {
        // Test getCurrentMonthTransactions
        const currentMonth = financeUtils.getCurrentMonthTransactions(testTransactions)
        results.push(`✅ getCurrentMonthTransactions: Found ${currentMonth.length} transactions`)
      } catch (error) {
        results.push(`❌ getCurrentMonthTransactions failed: ${error}`)
      }

      try {
        // Test formatCurrency
        const formatted = financeUtils.formatCurrency(1234.56)
        results.push(`✅ formatCurrency: ${formatted}`)
      } catch (error) {
        results.push(`❌ formatCurrency failed: ${error}`)
      }

      try {
        // Test getTransactionTrends
        const trends = financeUtils.getTransactionTrends(testTransactions)
        results.push(`✅ getTransactionTrends: Current balance=${trends.current.balance}`)
      } catch (error) {
        results.push(`❌ getTransactionTrends failed: ${error}`)
      }

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Finance Utilities Test
          </h1>
          
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded ${
                result.startsWith('✅') 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {result}
              </div>
            ))}
          </div>

          {testResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Running tests...
            </div>
          )}

          <div className="mt-6">
            <a 
              href="/dashboard" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}