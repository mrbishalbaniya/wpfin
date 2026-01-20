export interface DebtLoanItem {
  id: number
  title: string
  person: string
  amount: number
  type: 'lent' | 'borrowed'
  status: 'outstanding' | 'paid'
  date: string
  description?: string
  created_at: string
  updated_at: string
}

export interface PersonSummary {
  person: string
  totalLent: number
  totalBorrowed: number
  netBalance: number
  transactions: DebtLoanItem[]
}

export const debtLoanUtils = {
  // Group debt/loan items by person
  groupByPerson: (items: DebtLoanItem[]): PersonSummary[] => {
    const grouped = items.reduce((acc, item) => {
      const personKey = item.person.toLowerCase()
      
      if (!acc[personKey]) {
        acc[personKey] = {
          person: item.person,
          totalLent: 0,
          totalBorrowed: 0,
          netBalance: 0,
          transactions: []
        }
      }
      
      acc[personKey].transactions.push(item)
      
      if (item.type === 'lent') {
        acc[personKey].totalLent += item.amount
      } else {
        acc[personKey].totalBorrowed += item.amount
      }
      
      return acc
    }, {} as Record<string, PersonSummary>)
    
    // Calculate net balance for each person
    Object.values(grouped).forEach(person => {
      person.netBalance = person.totalLent - person.totalBorrowed
    })
    
    return Object.values(grouped)
  },

  // Calculate total amounts
  calculateTotals: (items: DebtLoanItem[]) => {
    const outstanding = items.filter(item => item.status === 'outstanding')
    
    const totalOwedToYou = outstanding
      .filter(item => item.type === 'lent')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const totalYouOwe = outstanding
      .filter(item => item.type === 'borrowed')
      .reduce((sum, item) => sum + item.amount, 0)
    
    return { totalOwedToYou, totalYouOwe }
  },

  // Filter items by status
  filterByStatus: (items: PersonSummary[], filter: 'all' | 'to_receive' | 'to_give' | 'settled') => {
    switch (filter) {
      case 'to_receive':
        return items.filter(person => person.netBalance > 0)
      case 'to_give':
        return items.filter(person => person.netBalance < 0)
      case 'settled':
        return items.filter(person => person.netBalance === 0)
      default:
        return items
    }
  },

  // Search by person name
  searchByName: (items: PersonSummary[], query: string) => {
    if (!query.trim()) return items
    return items.filter(person => 
      person.person.toLowerCase().includes(query.toLowerCase())
    )
  },

  // Format currency
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  },

  // Generate avatar initials
  getInitials: (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
}