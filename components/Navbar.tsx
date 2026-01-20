'use client'

import { useState, useEffect, useRef } from 'react'
import { User, LogOut, Settings, Menu, X, Bell } from 'lucide-react'
import { gsap } from 'gsap'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NavbarProps {
  onMenuToggle?: () => void
  onSidebarToggle?: () => void
  isMobileMenuOpen?: boolean
  isSidebarOpen?: boolean
}

export default function Navbar({ onMenuToggle, onSidebarToggle, isMobileMenuOpen, isSidebarOpen }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isLoading, logout } = useAuthContext()
  const navRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animation on mount
    if (navRef.current) {
      gsap.fromTo(navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
    }
  }, [])

  useEffect(() => {
    // Animate dropdown
    if (dropdownRef.current) {
      if (isProfileOpen) {
        gsap.fromTo(dropdownRef.current,
          { opacity: 0, scale: 0.95, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "back.out(1.7)" }
        )
      }
    }
  }, [isProfileOpen])

  const handleLogout = () => {
    logout()
  }

  // Display fallback during loading to prevent hydration mismatch
  const displayName = isLoading ? 'User' : (user?.display_name || user?.username || 'User')
  const userEmail = isLoading ? '' : user?.email

  return (
    <nav ref={navRef} className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Menu buttons and logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden hover:bg-gray-100/80"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="hidden lg:flex hover:bg-gray-100/80"
            title={`${isSidebarOpen ? "Collapse" : "Expand"} sidebar (Ctrl+B)`}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo - only show on mobile when sidebar is closed */}
          <div className="flex items-center space-x-3 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">FT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Finance Tracker
              </h1>
              <p className="text-xs text-gray-500">Personal Finance Manager</p>
            </div>
          </div>
        </div>

        {/* Right side - Notifications and User menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100/80">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
              3
            </Badge>
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100/80 rounded-xl"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {displayName}
              </span>
            </Button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  )}
                  <Badge variant="secondary" className="mt-1">
                    Premium User
                  </Badge>
                </div>
                
                <a
                  href="/profile"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Profile Settings
                </a>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}