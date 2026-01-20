'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, MoreHorizontal, Share2, Trash2, Users, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { debtLoanAPI } from '@/lib/debt-loan-api'
import { debtLoanUtils, type DebtLoanItem, type PersonSummary } from '@/lib/debt-loan'
import AddContactForm from '@/components/debt-loan/AddContactForm'
import AuthCheck from '@/components/AuthCheck'

export default function BorrowLendPage() {
  const [debtLoanItems, setDebtLoanItems] = useState<DebtLoanItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'to_receive' | 'to_give' | 'settled'>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Load debt/loan items
  useEffect(() => {
    loadDebtLoanItems()
  }, [])

  const loadDebtLoanItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setIsDemoMode(false)
      const response = await debtLoanAPI.getDebtLoanItems()
      setDebtLoanItems(response.data)
      
      // Check if we're using demo data (sample data has specific IDs)
      const hasDemoData = response.data.some(item => 
        item.person === 'John Doe' && item.amount === 5000 && item.description === 'Emergency loan for medical expenses'
      )
      setIsDemoMode(hasDemoData)
      
    } catch (err: any) {
      console.error('Error loading debt/loan items:', err)
      if (err.response?.status === 404) {
        setError('Debt/Loan feature is not yet configured in WordPress. Please contact your administrator.')
      } else if (err.message?.includes('Network Error')) {
        setError('Unable to connect to the server. Please check your connection and try again.')
      } else {
        setError(err.message || 'Failed to load debt/loan items')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized calculations
  const personSummaries = useMemo(() => {
    return debtLoanUtils.groupByPerson(debtLoanItems)
  }, [debtLoanItems])

  const totals = useMemo(() => {
    return debtLoanUtils.calculateTotals(debtLoanItems)
  }, [debtLoanItems])

  const filteredPersons = useMemo(() => {
    let filtered = debtLoanUtils.filterByStatus(personSummaries, filterStatus)
    filtered = debtLoanUtils.searchByName(filtered, searchQuery)
    return filtered
  }, [personSummaries, filterStatus, searchQuery])

  const handleDeleteContact = async (person: string) => {
    if (!confirm(`Are you sure you want to delete all transactions with ${person}?`)) return
    
    try {
      const personTransactions = personSummaries.find(p => p.person === person)?.transactions || []
      await Promise.all(
        personTransactions.map(transaction => 
          debtLoanAPI.deleteDebtLoanItem(transaction.id)
        )
      )
      await loadDebtLoanItems()
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact')
    }
  }

  const handleShareContact = async (person: string) => {
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
    <AuthCheck>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Lend & Borrow
          </h1>
          <p className="text-gray-600 mt-1">Track money you've lent and borrowed</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <AddContactForm 
              onSuccess={() => {
                setIsAddDialogOpen(false)
                loadDebtLoanItems()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Demo Notice - only show if using demo data */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Demo Mode</p>
              <p className="text-xs text-blue-600">
                You're viewing sample data. To use real data, ensure the WordPress debt-loan post type is properly configured.
                <br />
                <a href="/test-debt-loan-api.php" target="_blank" className="underline">Test WordPress Configuration</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Owed to You</p>
                <p className="text-3xl font-bold text-green-600">
                  {debtLoanUtils.formatCurrency(totals.totalOwedToYou)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total You Owe</p>
                <p className="text-3xl font-bold text-red-600">
                  {debtLoanUtils.formatCurrency(totals.totalYouOwe)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-red-500 to-rose-600">
                <TrendingDown className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Contacts</p>
                <p className="text-3xl font-bold text-blue-600">
                  {personSummaries.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by person name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contacts</SelectItem>
            <SelectItem value="to_receive">To Receive</SelectItem>
            <SelectItem value="to_give">To Give</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contact Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPersons.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first debt or loan transaction'}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersons.map((person) => (
            <Card key={person.person} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Link href={`/borrow-lend/${encodeURIComponent(person.person)}`} className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {debtLoanUtils.getInitials(person.person)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{person.person}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          person.netBalance > 0 ? 'text-green-600' : 
                          person.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {debtLoanUtils.formatCurrency(Math.abs(person.netBalance))}
                        </span>
                        <Badge variant={
                          person.netBalance > 0 ? 'success' : 
                          person.netBalance < 0 ? 'destructive' : 'secondary'
                        }>
                          {person.netBalance > 0 ? 'Owes You' : 
                           person.netBalance < 0 ? 'You Owe' : 'Settled'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShareContact(person.person)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteContact(person.person)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </AuthCheck>
  )
}