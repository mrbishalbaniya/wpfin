'use client'

import { useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { gsap } from 'gsap'
import { financeUtils, type FinanceSummary } from '@/lib/finance'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SummaryCardsProps {
  summary: FinanceSummary
  trends?: {
    income: number
    expense: number
    balance: number
  }
  isLoading?: boolean
}

interface SummaryCardProps {
  title: string
  amount: number
  trend?: number
  icon: React.ReactNode
  color: 'green' | 'red' | 'blue' | 'gray'
  isLoading?: boolean
  index?: number
}

function SummaryCard({ title, amount, trend, icon, color, isLoading, index = 0 }: SummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current && !isLoading) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          ease: "back.out(1.7)",
          delay: index * 0.1
        }
      )
    }
  }, [isLoading, index])

  const colorClasses = {
    green: {
      bg: 'from-green-50 to-emerald-50',
      icon: 'from-green-500 to-emerald-600',
      text: 'text-green-600'
    },
    red: {
      bg: 'from-red-50 to-rose-50',
      icon: 'from-red-500 to-rose-600',
      text: 'text-red-600'
    },
    blue: {
      bg: 'from-blue-50 to-indigo-50',
      icon: 'from-blue-500 to-indigo-600',
      text: 'text-blue-600'
    },
    gray: {
      bg: 'from-gray-50 to-slate-50',
      icon: 'from-gray-500 to-slate-600',
      text: 'text-gray-600'
    },
  }

  const getTrendColor = (trendValue?: number) => {
    if (!trendValue || trendValue === 0) return 'text-gray-500'
    return trendValue > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = (trendValue?: number) => {
    if (!trendValue || trendValue === 0) return null
    return trendValue > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br",
        colorClasses[color].bg
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {financeUtils.formatCurrency(amount)}
            </p>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center space-x-1 text-sm font-medium",
                getTrendColor(trend)
              )}>
                {getTrendIcon(trend)}
                <span>
                  {Math.abs(trend).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br",
            colorClasses[color].icon
          )}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SummaryCards({ summary, trends, isLoading }: SummaryCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
    }
  }, [isLoading])

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard
        title="Total Income"
        amount={summary.totalIncome}
        trend={trends?.income}
        icon={<TrendingUp className="h-7 w-7" />}
        color="green"
        isLoading={isLoading}
        index={0}
      />
      
      <SummaryCard
        title="Total Expense"
        amount={summary.totalExpense}
        trend={trends?.expense}
        icon={<TrendingDown className="h-7 w-7" />}
        color="red"
        isLoading={isLoading}
        index={1}
      />
      
      <SummaryCard
        title="Balance"
        amount={summary.balance}
        trend={trends?.balance}
        icon={<Wallet className="h-7 w-7" />}
        color={summary.balance >= 0 ? 'green' : 'red'}
        isLoading={isLoading}
        index={2}
      />
      
      <SummaryCard
        title="Transactions"
        amount={summary.transactionCount}
        icon={<CreditCard className="h-7 w-7" />}
        color="blue"
        isLoading={isLoading}
        index={3}
      />
    </div>
  )
}