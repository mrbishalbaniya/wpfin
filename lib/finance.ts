import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, isValid } from 'date-fns'

export interface Transaction {
  id: number
  title: string
  content?: string
  date: string
  acf: {
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    note?: string
  }
}

export interface FinanceSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
  color: string
}

// Predefined category colors
const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280'
]

// Safe date parsing utility
const safeParseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null
  
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : null
  } catch (error) {
    return null
  }
}

// Safe WordPress field access
const safeGetRenderedText = (field: { rendered: string } | string | null | undefined): string => {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field.rendered) return field.rendered
  return ''
}

// Safe transaction data access
const safeGetTransactionData = (transaction: Transaction) => {
  const acf = transaction.acf || {}
  return {
    id: transaction.id,
    title: safeGetRenderedText(transaction.title),
    content: safeGetRenderedText(transaction.content),
    amount: typeof acf.amount === 'number' ? acf.amount : 0,
    type: acf.type || 'expense',
    category: acf.category || 'Uncategorized',
    date: acf.date || transaction.date || new Date().toISOString().split('T')[0],
    note: acf.note || ''
  }
}

export const financeUtils = {
  // Calculate finance summary from transactions
  calculateSummary: (transactions: Transaction[]): FinanceSummary => {
    const summary = transactions.reduce(
      (acc, transaction) => {
        const data = safeGetTransactionData(transaction)
        const amount = data.amount
        
        if (data.type === 'income') {
          acc.totalIncome += amount
        } else {
          acc.totalExpense += amount
        }
        
        acc.transactionCount++
        return acc
      },
      { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    )
    
    summary.balance = summary.totalIncome - summary.totalExpense
    return summary
  },

  // Get monthly data for charts
  getMonthlyData: (transactions: Transaction[], months: number = 6): MonthlyData[] => {
    const monthlyMap = new Map<string, { income: number; expense: number }>()
    
    // Initialize last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = format(date, 'yyyy-MM')
      monthlyMap.set(monthKey, { income: 0, expense: 0 })
    }
    
    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const data = safeGetTransactionData(transaction)
      const transactionDate = safeParseDate(data.date)
      
      // Skip transactions with invalid dates
      if (!transactionDate) return
      
      const monthKey = format(transactionDate, 'yyyy-MM')
      
      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey)!
        
        if (data.type === 'income') {
          monthData.income += data.amount
        } else {
          monthData.expense += data.amount
        }
      }
    })
    
    // Convert to array format for charts
    return Array.from(monthlyMap.entries()).map(([month, data]) => {
      const monthDate = safeParseDate(`${month}-01`)
      const monthLabel = monthDate ? format(monthDate, 'MMM yyyy') : month
      
      return {
        month: monthLabel,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }
    })
  },

  // Get category breakdown for pie charts
  getCategoryData: (transactions: Transaction[], type?: 'income' | 'expense'): CategoryData[] => {
    const categoryMap = new Map<string, number>()
    let totalAmount = 0
    
    // Filter and process transactions
    transactions.forEach(transaction => {
      const data = safeGetTransactionData(transaction)
      
      // Filter by type if specified
      if (type && data.type !== type) return
      
      const category = data.category
      const amount = data.amount
      
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount)
      totalAmount += amount
    })
    
    // Convert to array with percentages and colors
    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending
  },

  // Filter transactions by date range
  filterByDateRange: (
    transactions: Transaction[], 
    startDate: Date, 
    endDate: Date
  ): Transaction[] => {
    return transactions.filter(transaction => {
      const data = safeGetTransactionData(transaction)
      const transactionDate = safeParseDate(data.date)
      
      // Skip transactions with invalid dates
      if (!transactionDate) return false
      
      return isWithinInterval(transactionDate, { start: startDate, end: endDate })
    })
  },

  // Get current month transactions
  getCurrentMonthTransactions: (transactions: Transaction[]): Transaction[] => {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    
    return financeUtils.filterByDateRange(transactions, start, end)
  },

  // Format currency (NPR)
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  },

  // Format number with commas
  formatNumber: (amount: number): string => {
    return new Intl.NumberFormat('en-NP').format(amount)
  },

  // Get transaction trends
  getTransactionTrends: (transactions: Transaction[]) => {
    const currentMonth = financeUtils.getCurrentMonthTransactions(transactions)
    const currentSummary = financeUtils.calculateSummary(currentMonth)
    
    // Previous month
    const prevMonthStart = startOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)))
    const prevMonthEnd = endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)))
    const prevMonth = financeUtils.filterByDateRange(transactions, prevMonthStart, prevMonthEnd)
    const prevSummary = financeUtils.calculateSummary(prevMonth)
    
    return {
      current: currentSummary,
      previous: prevSummary,
      trends: {
        income: prevSummary.totalIncome > 0 
          ? ((currentSummary.totalIncome - prevSummary.totalIncome) / prevSummary.totalIncome) * 100
          : 0,
        expense: prevSummary.totalExpense > 0
          ? ((currentSummary.totalExpense - prevSummary.totalExpense) / prevSummary.totalExpense) * 100
          : 0,
        balance: prevSummary.balance !== 0
          ? ((currentSummary.balance - prevSummary.balance) / Math.abs(prevSummary.balance)) * 100
          : 0,
      }
    }
  },

  // Default categories
  getDefaultCategories: () => [
    { name: 'Salary', type: 'income', color: '#22c55e' },
    { name: 'Freelance', type: 'income', color: '#3b82f6' },
    { name: 'Investment', type: 'income', color: '#8b5cf6' },
    { name: 'Food & Dining', type: 'expense', color: '#ef4444' },
    { name: 'Transportation', type: 'expense', color: '#f59e0b' },
    { name: 'Shopping', type: 'expense', color: '#ec4899' },
    { name: 'Bills & Utilities', type: 'expense', color: '#6b7280' },
    { name: 'Healthcare', type: 'expense', color: '#06b6d4' },
    { name: 'Entertainment', type: 'expense', color: '#f97316' },
    { name: 'Education', type: 'expense', color: '#84cc16' },
  ],
}