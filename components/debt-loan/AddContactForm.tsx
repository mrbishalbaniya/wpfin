'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User, DollarSign, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { debtLoanAPI } from '@/lib/debt-loan-api'

const addContactSchema = z.object({
  person: z.string().min(1, 'Person name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['lent', 'borrowed']),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional()
})

type AddContactFormData = z.infer<typeof addContactSchema>

interface AddContactFormProps {
  onSuccess?: () => void
}

export default function AddContactForm({ onSuccess }: AddContactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddContactFormData>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'lent'
    }
  })

  const watchType = watch('type')

  const onSubmit = async (data: AddContactFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await debtLoanAPI.createDebtLoanItem({
        person: data.person,
        amount: data.amount,
        type: data.type,
        status: 'outstanding',
        date: data.date,
        description: data.description
      })

      reset()
      onSuccess?.()
    } catch (err: any) {
      console.error('Error creating debt/loan item:', err)
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.')
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create transactions.')
      } else if (err.response?.status === 404) {
        setError('The debt/loan feature is not configured. Please contact your administrator.')
      } else {
        setError(err.message || 'Failed to create transaction')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Person Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Person Name *</span>
          </label>
          <Input
            {...register('person')}
            placeholder="Enter person's name"
            className="text-base"
          />
          {errors.person && (
            <p className="text-sm text-red-600 font-medium">{errors.person.message}</p>
          )}
        </div>

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
            {...register('amount', { valueAsNumber: true })}
            placeholder="0.00"
            className="text-base font-semibold"
          />
          {errors.amount && (
            <p className="text-sm text-red-600 font-medium">{errors.amount.message}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Transaction Type *
          </label>
          <Select onValueChange={(value: 'lent' | 'borrowed') => setValue('type', value)} defaultValue="lent">
            <SelectTrigger>
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lent">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>I Lent Money (They owe me)</span>
                </div>
              </SelectItem>
              <SelectItem value="borrowed">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>I Borrowed Money (I owe them)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600 font-medium">{errors.type.message}</p>
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
            {...register('date')}
            className="text-base"
          />
          {errors.date && (
            <p className="text-sm text-red-600 font-medium">{errors.date.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Description</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Optional description or reason for this transaction..."
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold"
        >
          <Save className="h-5 w-5 mr-2" />
          {isLoading ? 'Creating...' : 'Create Transaction'}
        </Button>
      </form>
    </div>
  )
}