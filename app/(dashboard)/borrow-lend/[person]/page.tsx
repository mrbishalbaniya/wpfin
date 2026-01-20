'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Share2, Pencil, Plus, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { debtLoanAPI } from '@/lib/debt-loan-api'
import { debtLoanUtils, type DebtLoanItem } from '@/lib/debt-loan'
import { formatDate } from '@/lib/utils'
import AddTransactionForPersonForm from '@/components/debt-loan/AddTransactionForPersonForm'
import EditPersonForm from '@/components/debt-loan/EditPersonForm'

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const person = decodeURIComponent(params.person as string)
  
  const [debtLoanItems, setDebtLoanItems] = useState<DebtLoanItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Load debt/loan items
  useEffect(() => {
    loadDebtLoanItems()
  }, [])

  const loadDebtLoanItems = async () => {
    try {
      setIsLoading(true)
      const response = await debtLoanAPI.getDebtLoanItems()
      // Filter items for this specific person
      const personItems = response.data.filter(
        item => item.person.toLowerCase() === person.toLowerCase()
      )
      setDebtLoanItems(personItems)
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized calculations
  const personSummary = useMemo(() => {
    const totalLent = debtLoanItems
      .filter(item => item.type === 'lent' && item.status === 'outstanding')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const totalBorrowed = debtLoanItems
      .filter(item => item.type === 'borrowed' && item.status === 'outstanding')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const netBalance = totalLent - totalBorrowed
    
    return { totalLent, totalBorrowed, netBalance }
  }, [debtLoanItems])

  const sortedTransactions = useMemo(() => {
    return [...debtLoanItems].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [debtLoanItems])

  const handleStatusToggle = async (transaction: DebtLoanItem) => {
    try {
      const newStatus = transaction.status === 'outstanding' ? 'paid' : 'outstanding'
      await debtLoanAPI.updateDebtLoanStatus(transaction.id, newStatus)
      await loadDebtLoanItems()
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
  }

  const handleShare = async () => {
    try {
      console.log('Share button clicked for person:', person)
      
      // Check if user is authenticated
      const token = Cookies.get('auth-token') || localStorage.getItem('finance_token')
      console.log('Authentication check:', {
        hasToken: !!token,
        tokenSource: Cookies.get('auth-token') ? 'cookie' : localStorage.getItem('finance_token') ? 'localStorage' : 'none'
      })
      
      if (!token) {
        alert('You need to log in again. Please refresh the page and log in.')
        return
      }
      
      console.log('Generating share link...')
      const shareLink = await debtLoanAPI.generateShareLink(person)
      console.log('Share link generated:', shareLink)
      
      if (navigator.share) {
        await navigator.share({
          title: `Transaction History with ${person}`,
          text: `Check out our financial transactions summary`,
          url: shareLink.shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareLink.shareUrl)
        alert('Share link copied to clipboard!')
      }
    } catch (err: any) {
      console.error('Share error details:', err)
      alert(`Failed to generate share link: ${err.message}`)
    }
  }

  const handleSendReminder = () => {
    // This could integrate with email/SMS services
    alert(`Reminder feature would send a notification to ${person}`)
  }

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
              <Button onClick={loadDebtLoanItems} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
          <Link href="/borrow-lend">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            {person}
          </h1>
          <p className="text-gray-600 mt-1">Transaction history and summary</p>
        </div>
      </div>

      {/* Person Summary Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {debtLoanUtils.getInitials(person)}
                </span>
              </div>
              
              {/* Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{person}</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Net Balance</p>
                    <p className={`text-2xl font-bold ${
                      personSummary.netBalance > 0 ? 'text-green-600' : 
                      personSummary.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {debtLoanUtils.formatCurrency(Math.abs(personSummary.netBalance))}
                    </p>
                    <Badge variant={
                      personSummary.netBalance > 0 ? 'success' : 
                      personSummary.netBalance < 0 ? 'destructive' : 'secondary'
                    }>
                      {personSummary.netBalance > 0 ? 'Owes You' : 
                       personSummary.netBalance < 0 ? 'You Owe' : 'Settled'}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Lent</p>
                    <p className="text-lg font-semibold text-green-600">
                      {debtLoanUtils.formatCurrency(personSummary.totalLent)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Borrowed</p>
                    <p className="text-lg font-semibold text-red-600">
                      {debtLoanUtils.formatCurrency(personSummary.totalBorrowed)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSendReminder}
                title="Send Reminder"
              >
                <Bell className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Edit Person">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Person Details</DialogTitle>
                  </DialogHeader>
                  <EditPersonForm 
                    person={person}
                    onSuccess={() => {
                      setIsEditDialogOpen(false)
                      loadDebtLoanItems()
                    }}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction for {person}</DialogTitle>
                  </DialogHeader>
                  <AddTransactionForPersonForm 
                    person={person}
                    onSuccess={() => {
                      setIsAddDialogOpen(false)
                      loadDebtLoanItems()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first transaction with {person}</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'lent' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'lent' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">
                          {transaction.type === 'lent' ? 'You lent' : 'You borrowed'}
                        </p>
                        <Badge
                          variant={transaction.status === 'outstanding' ? 'destructive' : 'success'}
                          className="cursor-pointer"
                          onClick={() => handleStatusToggle(transaction)}
                        >
                          {transaction.status === 'outstanding' ? 'Outstanding' : 'Paid'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                        {transaction.description && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{transaction.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'lent' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {debtLoanUtils.formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}