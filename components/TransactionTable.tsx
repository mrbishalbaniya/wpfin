'use client'

import { useState } from 'react'
import { Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Transaction, financeUtils } from '@/lib/finance'
import { formatDate } from '@/lib/utils'
import { transactionAPI } from '@/lib/api'

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: number) => void
  isLoading?: boolean
}

interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  dateFrom: string
  dateTo: string
}

export default function TransactionTable({ 
  transactions, 
  onEdit, 
  onDelete, 
  isLoading 
}: TransactionTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: '',
    dateFrom: '',
    dateTo: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const itemsPerPage = 10

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Safe access to ACF fields with fallbacks
    const acf = transaction.acf || {}
    const category = acf.category || ''
    const note = acf.note || ''
    const type = acf.type || 'expense'
    const date = acf.date || transaction.date || ''
    
    const matchesSearch = !filters.search || 
      transaction.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      category.toLowerCase().includes(filters.search.toLowerCase()) ||
      note.toLowerCase().includes(filters.search.toLowerCase())

    const matchesType = filters.type === 'all' || type === filters.type

    const matchesCategory = !filters.category || category === filters.category

    const matchesDateFrom = !filters.dateFrom || date >= filters.dateFrom

    const matchesDateTo = !filters.dateTo || date <= filters.dateTo

    return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  // Get unique categories for filter
  const categories = Array.from(new Set(
    transactions
      .map(t => t.acf?.category)
      .filter(Boolean)
  )).sort()

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    setIsDeleting(id)
    try {
      await transactionAPI.deleteTransaction(id)
      onDelete?.(id)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      alert('Failed to delete transaction')
    } finally {
      setIsDeleting(null)
    }
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: '',
      dateFrom: '',
      dateTo: '',
    })
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        <div className="text-sm text-gray-500">
          {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input-field pl-10"
            />
          </div>

          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="input-field"
            placeholder="From date"
          />

          {/* Date to */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="input-field"
            placeholder="To date"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="btn-secondary text-sm"
          >
            <Filter className="h-4 w-4 mr-1" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Type</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => {
                const acf = transaction.acf || {}
                
                return (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {formatDate(acf.date || transaction.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {acf.category || 'Uncategorized'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{transaction.title}</div>
                      {acf.note && (
                        <div className="text-gray-500 text-xs mt-1">
                          {acf.note}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    <span className={
                      acf.type === 'income' 
                        ? 'text-success-600' 
                        : 'text-danger-600'
                    }>
                      {acf.type === 'income' ? '+' : '-'}
                      {financeUtils.formatCurrency(acf.amount || 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      acf.type === 'income'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {acf.type || 'expense'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onEdit?.(transaction)}
                        className="p-1 text-gray-400 hover:text-primary-600"
                        title="Edit transaction"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        disabled={isDeleting === transaction.id}
                        className="p-1 text-gray-400 hover:text-danger-600 disabled:opacity-50"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}