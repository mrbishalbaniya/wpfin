'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const editPersonSchema = z.object({
  newName: z.string().min(1, 'Person name is required')
})

type EditPersonFormData = z.infer<typeof editPersonSchema>

interface EditPersonFormProps {
  person: string
  onSuccess?: () => void
}

export default function EditPersonForm({ person, onSuccess }: EditPersonFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPersonFormData>({
    resolver: zodResolver(editPersonSchema),
    defaultValues: {
      newName: person
    }
  })

  const onSubmit = async (data: EditPersonFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // For now, we'll just show a success message
      // In a real implementation, you'd update all transactions for this person
      alert(`Person name would be updated from "${person}" to "${data.newName}"`)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to update person')
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
            {...register('newName')}
            placeholder="Enter person's name"
            className="text-base"
          />
          {errors.newName && (
            <p className="text-sm text-red-600 font-medium">{errors.newName.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold"
        >
          <Save className="h-5 w-5 mr-2" />
          {isLoading ? 'Updating...' : 'Update Person'}
        </Button>
      </form>
    </div>
  )
}