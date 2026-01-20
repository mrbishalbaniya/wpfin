'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import TransactionTable from '@/components/TransactionTable'
import TransactionForm from '@/components/TransactionForm'
import { transactionAPI } from '@/lib/api'
import { type Transaction } from '@/lib/finance'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await transactionAPI.getTransactions({
        per_page: 100,
      })
      setTransactions(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowEditForm(true)
  }

  const handleDelete = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    setEditingTransaction(null)
    loadTransactions() // Reload to get updated data
  }

  const handleEditCancel = () => {
    setShowEditForm(false)
    setEditingTransaction(null)
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage all your income and expense transactions.</p>
        </div>
        <Link href="/add-transaction" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </Link>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <TransactionForm
                initialData={{
                  amount: editingTransaction.acf?.amount || 0,
                  type: editingTransaction.acf?.type || 'expense',
                  category: editingTransaction.acf?.category || '',
                  date: editingTransaction.acf?.date || editingTransaction.date || new Date().toISOString().split('T')[0],
                  note: editingTransaction.acf?.note || '',
                }}
                isEditing={true}
                transactionId={editingTransaction.id}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <TransactionTable
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking your finances by adding your first transaction.
          </p>
          <Link href="/add-transaction" className="btn-primary">
            Add Transaction
          </Link>
        </div>
      )}
    </div>
  )
}