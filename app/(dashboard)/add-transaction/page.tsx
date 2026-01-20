'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { ArrowLeft, Lightbulb, TrendingUp, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import TransactionForm from '@/components/TransactionForm'
import AuthDebugPanel from '@/components/AuthDebugPanel'
import TransactionDebugger from '@/components/TransactionDebugger'
import AuthTester from '@/components/AuthTester'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddTransactionPage() {
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const tipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animations
    const tl = gsap.timeline()
    
    tl.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
    .fromTo(tipsRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    )
  }, [])

  const handleSuccess = () => {
    router.push('/transactions')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div ref={headerRef} className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
          <Link href="/transactions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Add Transaction
          </h1>
          <p className="text-gray-600 mt-1">Record a new income or expense transaction to track your finances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <TransactionForm onSuccess={handleSuccess} />
        </div>

        {/* Tips and Quick Actions */}
        <div className="space-y-6">
          {/* Tips */}
          <Card ref={tipsRef} className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-blue-900 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <span>Pro Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Tag className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Consistent Categories</p>
                    <p className="text-xs text-blue-700">Use the same category names for better reporting and analysis.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Accurate Dates</p>
                    <p className="text-xs text-blue-700">Record transactions with the correct date for precise tracking.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Regular Updates</p>
                    <p className="text-xs text-blue-700">Record transactions as soon as possible for accuracy.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-green-600">+$2,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Transaction</span>
                  <span className="font-semibold text-gray-900">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories Used</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AuthDebugPanel />
      <TransactionDebugger />
      <AuthTester />
    </div>
  )
}