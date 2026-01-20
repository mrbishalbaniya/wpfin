'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Save, X, DollarSign, Calendar, Tag, FileText } from 'lucide-react'
import { gsap } from 'gsap'
import { transactionAPI } from '@/lib/api'
import { financeUtils } from '@/lib/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface TransactionFormData {
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  note?: string
}

interface TransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<TransactionFormData>
  isEditing?: boolean
  transactionId?: number
}

export default function TransactionForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  isEditing = false,
  transactionId 
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    defaultValues: {
      amount: initialData?.amount || 0,
      type: initialData?.type || 'expense',
      category: initialData?.category || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      note: initialData?.note || '',
    },
  })

  useEffect(() => {
    // GSAP animation on mount
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      )
    }
  }, [])

  const watchType = watch('type')
  const categories = financeUtils.getDefaultCategories()
  const filteredCategories = categories.filter(cat => 
    cat.type === watchType || cat.type === 'both'
  )

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const transactionData = {
        title: `${data.type === 'income' ? 'Income' : 'Expense'}: ${data.category}`,
        content: data.note || '',
        acf: {
          amount: Number(data.amount),
          type: data.type,
          category: data.category,
          date: data.date,
          note: data.note || '',
        },
      }

      if (isEditing && transactionId) {
        // For editing, still use the old API for now
        await transactionAPI.updateTransaction(transactionId, transactionData)
      } else {
        // Use our reliable transaction creation API endpoint
        console.log('Creating transaction with data:', transactionData)
        
        const response = await fetch('/api/transactions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        })

        console.log('Transaction API response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Transaction API error:', errorData)
          throw new Error(errorData.error || 'Failed to create transaction')
        }

        const result = await response.json()
        console.log('Transaction created successfully:', result)
      }

      reset()
      onSuccess?.()
    } catch (err: any) {
      console.error('Transaction creation error:', err)
      setError(err.message || 'Failed to save transaction')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card ref={formRef} className="border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</span>
          </CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Amount (NPR) *</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              className="text-lg font-semibold"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-sm text-red-600 font-medium">{errors.amount.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                watchType === 'income' 
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="income"
                  {...register('type', { required: 'Type is required' })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">+</span>
                  </div>
                  <span className="font-semibold text-green-600">Income</span>
                </div>
              </label>
              <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                watchType === 'expense' 
                  ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="expense"
                  {...register('type', { required: 'Type is required' })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">-</span>
                  </div>
                  <span className="font-semibold text-red-600">Expense</span>
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="text-sm text-red-600 font-medium">{errors.type.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Category *</span>
            </label>
            <Select onValueChange={(value) => setValue('category', value)} defaultValue={initialData?.category}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600 font-medium">{errors.category.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Date *</span>
            </label>
            <Input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="h-12"
            />
            {errors.date && (
              <p className="text-sm text-red-600 font-medium">{errors.date.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Note</span>
            </label>
            <textarea
              {...register('note')}
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Optional note about this transaction..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Save Transaction')}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-12 px-8 font-semibold"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}