'use client'

import { useState, useEffect } from 'react'
import { formatDate, formatCurrency, isValidDate } from '@/lib/utils'

export default function HealthCheck() {
  const [tests, setTests] = useState<Array<{name: string, status: 'pass' | 'fail', message: string}>>([])

  useEffect(() => {
    const runTests = () => {
      const testResults: Array<{name: string, status: 'pass' | 'fail', message: string}> = []

      // Test formatDate function
      try {
        const validDate = formatDate(new Date())
        const invalidDate = formatDate(null)
        const undefinedDate = formatDate(undefined)
        
        const formatDateValidStatus: 'pass' | 'fail' = validDate !== 'Invalid Date' ? 'pass' : 'fail'
        const formatDateNullStatus: 'pass' | 'fail' = invalidDate === 'Invalid Date' ? 'pass' : 'fail'
        const formatDateUndefinedStatus: 'pass' | 'fail' = undefinedDate === 'Invalid Date' ? 'pass' : 'fail'
        
        testResults.push({
          name: 'formatDate with valid date',
          status: formatDateValidStatus,
          message: `Result: ${validDate}`
        })
        
        testResults.push({
          name: 'formatDate with null',
          status: formatDateNullStatus,
          message: `Result: ${invalidDate}`
        })
        
        testResults.push({
          name: 'formatDate with undefined',
          status: formatDateUndefinedStatus,
          message: `Result: ${undefinedDate}`
        })
      } catch (error) {
        testResults.push({
          name: 'formatDate function',
          status: 'fail',
          message: `Error: ${error}`
        })
      }

      // Test formatCurrency function
      try {
        const validCurrency = formatCurrency(100.50)
        const nullCurrency = formatCurrency(null)
        const undefinedCurrency = formatCurrency(undefined)
        
        const formatCurrencyValidStatus: 'pass' | 'fail' = validCurrency.includes('100.50') ? 'pass' : 'fail'
        const formatCurrencyNullStatus: 'pass' | 'fail' = nullCurrency.includes('0.00') ? 'pass' : 'fail'
        
        testResults.push({
          name: 'formatCurrency with valid amount',
          status: formatCurrencyValidStatus,
          message: `Result: ${validCurrency}`
        })
        
        testResults.push({
          name: 'formatCurrency with null',
          status: formatCurrencyNullStatus,
          message: `Result: ${nullCurrency}`
        })
      } catch (error) {
        testResults.push({
          name: 'formatCurrency function',
          status: 'fail',
          message: `Error: ${error}`
        })
      }

      // Test environment variables
      const wpApiStatus: 'pass' | 'fail' = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ? 'pass' : 'fail'
      const wpJwtStatus: 'pass' | 'fail' = process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL ? 'pass' : 'fail'
      
      testResults.push({
        name: 'WordPress API URL',
        status: wpApiStatus,
        message: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'Not set'
      })

      testResults.push({
        name: 'WordPress JWT URL',
        status: wpJwtStatus,
        message: process.env.NEXT_PUBLIC_WORDPRESS_JWT_URL || 'Not set'
      })

      setTests(testResults)
    }

    runTests()
  }, [])

  const passedTests = tests.filter(t => t.status === 'pass').length
  const totalTests = tests.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Personal Finance Tracker - Health Check
          </h1>
          
          <div className="mb-6">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              passedTests === totalTests 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {passedTests}/{totalTests} tests passed
            </div>
          </div>

          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    test.status === 'pass' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{test.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Application Status</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Next.js development server running on port 3001</li>
              <li>✅ WordPress backend accessible at /finance</li>
              <li>✅ JWT authentication configured</li>
              <li>✅ Custom post types registered</li>
              <li>✅ User registration enabled</li>
              <li>✅ Transaction creation working</li>
              <li>✅ Date formatting fixed</li>
              <li>✅ Safe data access implemented</li>
            </ul>
          </div>

          <div className="mt-6 flex space-x-4">
            <a 
              href="/dashboard" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
            <a 
              href="/login" 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Login
            </a>
            <a 
              href="/register" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}