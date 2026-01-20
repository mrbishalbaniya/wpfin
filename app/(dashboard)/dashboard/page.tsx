'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import SummaryCards from '@/components/SummaryCards'
import Charts from '@/components/Charts'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { transactionAPI } from '@/lib/api'
import { financeUtils, type Transaction } from '@/lib/finance'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)
  const recentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    // GSAP animations on mount
    const tl = gsap.timeline()
    
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
    .fromTo(summaryRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(statsRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.3"
    )
    .fromTo(chartsRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(recentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
  }, [isLoading])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Loading dashboard data...')
      
      // Use our reliable dashboard data endpoint
      const response = await fetch('/api/dashboard-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('Dashboard API response:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load data')
      }
      
      const data = await response.json()
      console.log('Dashboard data loaded:', {
        count: data.data?.length || 0,
        source: data.source,
        message: data.message
      })
      
      setTransactions(data.data || [])
      
      // Show a notice if using sample data
      if (data.source === 'sample') {
        console.warn('Using sample data:', data.message)
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate finance data
  const summary = financeUtils.calculateSummary(transactions)
  const trends = financeUtils.getTransactionTrends(transactions)
  const monthlyData = financeUtils.getMonthlyData(transactions, 6)
  const incomeCategories = financeUtils.getCategoryData(transactions, 'income')
  const expenseCategories = financeUtils.getCategoryData(transactions, 'expense')
  
  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.acf.date).getTime() - new Date(a.acf.date).getTime())
    .slice(0, 5)

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadTransactions} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <Button asChild className="shadow-lg hover:shadow-xl transition-all duration-300">
          <Link href="/add-transaction" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div ref={summaryRef}>
        <SummaryCards 
          summary={summary} 
          trends={trends.trends}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Stats */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financeUtils.formatCurrency(trends.current.balance)}
                </p>
                <Badge variant={trends.current.balance >= 0 ? "success" : "destructive"} className="mt-1">
                  {trends.current.balance >= 0 ? "Positive" : "Negative"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Daily Expense</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financeUtils.formatCurrency(
                    trends.current.totalExpense / new Date().getDate()
                  )}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  <span>Daily average</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">%</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trends.current.totalIncome > 0 
                    ? ((trends.current.balance / trends.current.totalIncome) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>Of total income</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div ref={chartsRef}>
        <Charts
          monthlyData={monthlyData}
          categoryData={incomeCategories}
          expenseCategoryData={expenseCategories}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Transactions */}
      <Card ref={recentRef} className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Transactions</CardTitle>
            <Button variant="ghost" asChild className="text-primary-600 hover:text-primary-700">
              <Link href="/transactions" className="flex items-center space-x-1">
                <span>View all</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => {
                const acf = transaction.acf || {}
                return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                      acf.type === 'income' 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                        : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                    }`}>
                      {acf.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{acf.category || 'Uncategorized'}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(acf.date || transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      acf.type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {acf.type === 'income' ? '+' : '-'}
                      {financeUtils.formatCurrency(acf.amount || 0)}
                    </p>
                    <Badge variant={acf.type === 'income' ? 'success' : 'destructive'} className="mt-1">
                      {acf.type === 'income' ? 'Income' : 'Expense'}
                    </Badge>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No transactions yet.</p>
              <Button asChild variant="outline">
                <Link href="/add-transaction">
                  Add your first transaction
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}