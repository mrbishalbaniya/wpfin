'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Default to open on desktop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="layout-container bg-gray-50">
      {/* Sidebar */}
      <div className={`layout-sidebar transition-all duration-300 ${
        isSidebarOpen ? 'w-72' : 'w-0 lg:w-16'
      }`}>
        <Sidebar 
          isOpen={isSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          isCollapsed={!isSidebarOpen}
        />
      </div>
      
      {/* Main Content */}
      <div className="layout-main">
        {/* Navbar */}
        <Navbar 
          onMenuToggle={toggleMobileMenu}
          onSidebarToggle={toggleSidebar}
          isMobileMenuOpen={isMobileMenuOpen}
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Page Content */}
        <main className="layout-content p-6">
          {children}
        </main>
      </div>
    </div>
  )
}