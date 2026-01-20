'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, TrendingUp, PieChart } from 'lucide-react'
import Charts from '@/components/Charts'
import SummaryCards from '@/components/SummaryCards'
import { transactionAPI } from '@/lib/api'
import { financeUtils, type Transaction } from '@/lib/finance'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    loadTransactions()
  }, [dateRange])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Loading transactions with date range:', dateRange)
      
      const response = await transactionAPI.getTransactions({
        per_page: 100, // Reduced from 1000 for better performance
        date_from: dateRange.from,
        date_to: dateRange.to,
      })
      
      console.log('Transactions loaded:', response.data.length)
      setTransactions(response.data)
    } catch (err: any) {
      console.error('Error loading transactions:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate report data with safety checks
  const summary = financeUtils.calculateSummary(transactions)
  const monthlyData = financeUtils.getMonthlyData(transactions, 12)
  const incomeCategories = financeUtils.getCategoryData(transactions, 'income')
  const expenseCategories = financeUtils.getCategoryData(transactions, 'expense')
  
  // Additional analytics with safety checks
  const validMonthlyData = monthlyData.filter(month => month.income > 0 || month.expense > 0)
  const avgMonthlyIncome = validMonthlyData.length > 0 
    ? validMonthlyData.reduce((sum, month) => sum + month.income, 0) / validMonthlyData.length 
    : 0
  const avgMonthlyExpense = validMonthlyData.length > 0 
    ? validMonthlyData.reduce((sum, month) => sum + month.expense, 0) / validMonthlyData.length 
    : 0
  const savingsRate = summary.totalIncome > 0 ? (summary.balance / summary.totalIncome) * 100 : 0

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export')
      return
    }
    
    const headers = ['Date', 'Category', 'Type', 'Amount', 'Note']
    const csvData = transactions.map(t => {
      const acf = t.acf || {}
      return [
        acf.date || t.date || '',
        acf.category || 'Uncategorized',
        acf.type || 'expense',
        acf.amount || 0,
        acf.note || ''
      ]
    })
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={loadTransactions}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Analyze your financial data and trends.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="btn-primary flex items-center space-x-2"
          disabled={transactions.length === 0}
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Monthly Income</p>
              <p className="text-lg font-semibold text-gray-900">
                {financeUtils.formatCurrency(avgMonthlyIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Monthly Expense</p>
              <p className="text-lg font-semibold text-gray-900">
                {financeUtils.formatCurrency(avgMonthlyExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">%</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Savings Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Expense Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {expenseCategories[0]?.category || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <Charts
        monthlyData={monthlyData}
        categoryData={incomeCategories}
        expenseCategoryData={expenseCategories}
        isLoading={isLoading}
      />

      {/* Category Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
          {incomeCategories.length > 0 ? (
            <div className="space-y-3">
              {incomeCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {financeUtils.formatCurrency(category.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No income data</p>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {expenseCategories.length > 0 ? (
            <div className="space-y-3">
              {expenseCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {financeUtils.formatCurrency(category.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No expense data</p>
          )}
        </div>
      </div>
    </div>
  )
}