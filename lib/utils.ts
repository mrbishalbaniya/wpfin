import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Invalid Date'
  }
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Invalid Date'
  }
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

// Additional date utilities
export function isValidDate(date: any): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d instanceof Date && !isNaN(d.getTime())
}

export function formatCurrency(amount: number | string | null | undefined, currency: string = 'NPR'): string {
  if (amount === null || amount === undefined || amount === '') {
    return `${currency} 0.00`
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return `${currency} 0.00`
  }
  
  return `${currency} ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function safeParseFloat(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

export function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue
  }
  
  return String(value)
}