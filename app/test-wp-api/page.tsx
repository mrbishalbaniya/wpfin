'use client'

import { useState, useEffect } from 'react'
import { getRenderedText, normalizeTransaction } from '@/lib/wordpress'

export default function TestWPAPI() {
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const runTests = () => {
      const results: string[] = []

      // Test getRenderedText function
      try {
        // Test with WordPress rendered object
        const wpField = { rendered: 'Test Title', raw: 'Test Title' }
        const renderedText = getRenderedText(wpField)
        results.push(`✅ getRenderedText with WP object: "${renderedText}"`)

        // Test with plain string
        const plainString = 'Plain Title'
        const plainText = getRenderedText(plainString)
        results.push(`✅ getRenderedText with string: "${plainText}"`)

        // Test with null/undefined
        const nullText = getRenderedText(null)
        const undefinedText = getRenderedText(undefined)
        results.push(`✅ getRenderedText with null: "${nullText}"`)
        results.push(`✅ getRenderedText with undefined: "${undefinedText}"`)
      } catch (error) {
        results.push(`❌ getRenderedText failed: ${error}`)
      }

      // Test normalizeTransaction function
      try {
        const wpTransaction = {
          id: 1,
          title: { rendered: 'Test Transaction', raw: 'Test Transaction' },
          content: { rendered: '<p>Test content</p>', raw: 'Test content' },
          date: '2024-01-15T10:00:00',
          acf: {
            amount: 100,
            type: 'income' as const,
            category: 'Salary',
            date: '2024-01-15',
            note: 'Test note'
          }
        }

        const normalized = normalizeTransaction(wpTransaction)
        results.push(`✅ normalizeTransaction: Title="${normalized.title}", Amount=${normalized.acf.amount}`)
      } catch (error) {
        results.push(`❌ normalizeTransaction failed: ${error}`)
      }

      // Test with missing ACF data
      try {
        const wpTransactionNoACF = {
          id: 2,
          title: { rendered: 'No ACF Transaction' },
          date: '2024-01-16T10:00:00',
          acf: null as any
        }

        const normalizedNoACF = normalizeTransaction(wpTransactionNoACF)
        results.push(`✅ normalizeTransaction (no ACF): Title="${normalizedNoACF.title}", Category="${normalizedNoACF.acf.category}"`)
      } catch (error) {
        results.push(`❌ normalizeTransaction (no ACF) failed: ${error}`)
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
            WordPress API Normalization Test
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What This Fixes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ WordPress API returns objects like {`{rendered: "Title"}`}</li>
              <li>✅ React expects strings, not objects</li>
              <li>✅ Normalization converts WP objects to strings</li>
              <li>✅ Safe fallbacks for missing data</li>
              <li>✅ Consistent data structure across the app</li>
            </ul>
          </div>

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