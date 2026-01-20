// WordPress API utilities for handling API response objects

export interface WordPressRenderedField {
  rendered: string
  raw?: string
}

export interface WordPressTransaction {
  id: number
  title: WordPressRenderedField
  content?: WordPressRenderedField
  date: string
  acf: {
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    note?: string
  }
}

// Safe access to WordPress rendered fields
export const getRenderedText = (field: WordPressRenderedField | string | null | undefined): string => {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (typeof field === 'object' && field.rendered) return field.rendered
  return ''
}

// Convert WordPress transaction to app transaction format
export const normalizeTransaction = (wpTransaction: WordPressTransaction): {
  id: number
  title: string
  content: string
  date: string
  acf: {
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    note?: string
  }
} => {
  const acf = wpTransaction.acf || {}
  
  return {
    id: wpTransaction.id,
    title: getRenderedText(wpTransaction.title),
    content: getRenderedText(wpTransaction.content),
    date: wpTransaction.date,
    acf: {
      amount: parseFloat(String(acf.amount)) || 0,
      type: acf.type || 'expense',
      category: acf.category || 'Uncategorized',
      date: acf.date || wpTransaction.date || new Date().toISOString().split('T')[0],
      note: acf.note || ''
    }
  }
}

// Normalize array of WordPress transactions
export const normalizeTransactions = (wpTransactions: WordPressTransaction[]): any[] => {
  return wpTransactions.map(normalizeTransaction)
}

// Safe access to WordPress API response data
export const safeGetWPField = (obj: any, field: string, defaultValue: any = '') => {
  if (!obj || !obj[field]) return defaultValue
  
  const value = obj[field]
  
  // Handle WordPress rendered fields
  if (typeof value === 'object' && value.rendered) {
    return value.rendered
  }
  
  return value
}