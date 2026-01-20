'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  CreditCard, 
  Plus, 
  BarChart3, 
  User,
  X,
  Sparkles,
  Users,
  Contact
} from 'lucide-react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  isOpen?: boolean
  isMobileMenuOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'Add Transaction',
    href: '/add-transaction',
    icon: Plus,
  },
  {
    name: 'Lend & Borrow',
    href: '/borrow-lend',
    icon: Users,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Visiting Card',
    href: '/visiting-card',
    icon: Contact,
    badge: 'New'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export default function Sidebar({ isOpen = true, isMobileMenuOpen = false, onClose, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animation for sidebar items
    if (navItemsRef.current && (isOpen || isMobileMenuOpen)) {
      const navItems = navItemsRef.current.children
      gsap.fromTo(navItems,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.1, 
          ease: "power2.out",
          delay: 0.2
        }
      )
    }
  }, [isOpen, isMobileMenuOpen])

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "bg-white/95 backdrop-blur-md border-r border-gray-200/50 flex-shrink-0 shadow-xl lg:shadow-none transition-all duration-300 ease-out h-full",
          // Desktop: always visible, width changes based on collapsed state
          "hidden lg:flex lg:flex-col",
          isCollapsed ? "lg:w-16" : "lg:w-72",
          // Mobile: fixed positioning with transform
          isMobileMenuOpen && "fixed inset-y-0 left-0 z-50 flex flex-col w-72 lg:hidden"
        )}
      >
        {/* Mobile header - only show on mobile */}
        {isMobileMenuOpen && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Finance Tracker
                </span>
                <p className="text-xs text-gray-500">Personal Finance Manager</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Desktop header - only show when not collapsed */}
        {!isCollapsed && (
          <div className="hidden lg:flex items-center space-x-3 p-6 border-b border-gray-200/50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">FT</span>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Finance Tracker
              </span>
              <p className="text-xs text-gray-500">Personal Finance Manager</p>
            </div>
          </div>
        )}

        {/* Collapsed desktop header - only show icon when collapsed */}
        {isCollapsed && (
          <div className="hidden lg:flex items-center justify-center p-4 border-b border-gray-200/50">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs">FT</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-6 flex-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Main Menu
              </h2>
            </div>
          )}
          
          <div ref={navItemsRef} className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                    isActive 
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25" 
                      : "text-gray-700 hover:bg-gray-100/80 hover:text-primary-600"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-20 animate-pulse" />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-primary-600",
                    isCollapsed ? "" : "mr-3"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="relative z-10">{item.name}</span>
                      {item.name === 'Add Transaction' && (
                        <Badge className="ml-auto bg-green-500 hover:bg-green-600">
                          <Plus className="h-3 w-3" />
                        </Badge>
                      )}
                      {item.badge && (
                        <Badge className="ml-auto bg-blue-500 hover:bg-blue-600 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Quick Stats - only show when not collapsed */}
          {!isCollapsed && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-green-600">+$2,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/50">
          {!isCollapsed ? (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xs">FT</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Finance Tracker</p>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">FT</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}