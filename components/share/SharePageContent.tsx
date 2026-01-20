'use client'

import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, FileText, Share2, ExternalLink, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { debtLoanUtils } from '@/lib/debt-loan'
import { formatDate } from '@/lib/utils'

interface Transaction {
  id: number
  title: string
  person: string
  amount: number
  type: 'lent' | 'borrowed'
  status: 'outstanding' | 'paid'
  date: string
  description: string
  created_at: string
  updated_at: string
}

interface ShareData {
  person_name: string
  owner_name: string
  transactions: Transaction[]
  currency: string
  payment_qr_code_url?: string
  created_at: string
  expires_at: string
}

interface SharePageContentProps {
  shareData: ShareData
}

export default function SharePageContent({ shareData }: SharePageContentProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  // Calculate totals from viewer's perspective
  const summary = useMemo(() => {
    let totalBorrowed = 0 // What viewer borrowed from owner
    let totalLent = 0     // What viewer lent to owner
    
    shareData.transactions.forEach(transaction => {
      if (transaction.status === 'outstanding') {
        if (transaction.type === 'lent') {
          // Owner lent to viewer = viewer borrowed from owner
          totalBorrowed += transaction.amount
        } else {
          // Owner borrowed from viewer = viewer lent to owner
          totalLent += transaction.amount
        }
      }
    })
    
    const netBalance = totalLent - totalBorrowed // Positive = owner owes viewer, Negative = viewer owes owner
    
    return { totalBorrowed, totalLent, netBalance }
  }, [shareData.transactions])
  
  const sortedTransactions = useMemo(() => {
    return [...shareData.transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [shareData.transactions])
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Transaction History with ${shareData.owner_name}`,
          text: `View my transaction history and balance with ${shareData.owner_name}`,
          url: currentUrl
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Transaction History with {shareData.owner_name}
              </h1>
              <p className="text-gray-600 mt-1">
                Your financial summary as of {formatDate(shareData.created_at)}
              </p>
            </div>
            <Button onClick={handleShare} variant="outline" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* QR Code for Current URL */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Share This Page</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              <QRCodeSVG 
                value={currentUrl} 
                size={150}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Scan this QR code to share this transaction history
            </p>
          </CardContent>
        </Card>
        
        {/* Summary Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Balance Summary</h2>
              
              <div className="mb-6">
                <div className={`text-4xl font-bold mb-2 ${
                  summary.netBalance > 0 ? 'text-green-600' : 
                  summary.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {debtLoanUtils.formatCurrency(Math.abs(summary.netBalance))}
                </div>
                
                <Badge 
                  variant={summary.netBalance > 0 ? 'success' : summary.netBalance < 0 ? 'destructive' : 'secondary'}
                  className="text-base px-4 py-2"
                >
                  {summary.netBalance > 0 ? `${shareData.owner_name} owes you` : 
                   summary.netBalance < 0 ? `You owe ${shareData.owner_name}` : 'All settled'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-600">You Borrowed</p>
                  <p className="text-xl font-semibold text-red-600">
                    {debtLoanUtils.formatCurrency(summary.totalBorrowed)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">You Lent</p>
                  <p className="text-xl font-semibold text-green-600">
                    {debtLoanUtils.formatCurrency(summary.totalLent)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment QR Code - Only show if viewer owes money and QR code exists */}
        {summary.netBalance < 0 && shareData.payment_qr_code_url && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="payment" className="border-0 shadow-lg rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold">Payment Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Scan the QR code below to make a payment to {shareData.owner_name}
                  </p>
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={shareData.payment_qr_code_url} 
                      alt="Payment QR Code"
                      className="max-w-48 max-h-48"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Amount to pay: <span className="font-semibold text-red-600">
                      {debtLoanUtils.formatCurrency(Math.abs(summary.netBalance))}
                    </span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {/* Transaction History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">There are no transactions between you and {shareData.owner_name}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTransactions.map((transaction) => {
                  const isPaid = transaction.status === 'paid'
                  const isViewerBorrowed = transaction.type === 'lent' // Owner lent = viewer borrowed
                  
                  return (
                    <div 
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                        isPaid 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isViewerBorrowed 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {isViewerBorrowed ? '-' : '+'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-gray-900">
                              {isViewerBorrowed 
                                ? `You borrowed from ${shareData.owner_name}` 
                                : `You lent to ${shareData.owner_name}`}
                            </p>
                            <Badge
                              variant={isPaid ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {isPaid ? 'Paid' : 'Outstanding'}
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
                          isViewerBorrowed ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {debtLoanUtils.formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>This link expires on {formatDate(shareData.expires_at)}</p>
          <p className="mt-2">Powered by FinTrack - Personal Finance Tracker</p>
        </div>
      </div>
    </div>
  )
}