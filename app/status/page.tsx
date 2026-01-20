'use client'

import { useState, useEffect } from 'react'

interface SystemStatus {
  name: string
  status: 'checking' | 'success' | 'error'
  message: string
  details?: any
}

export default function StatusPage() {
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Authentication', status: 'checking', message: 'Checking...' },
    { name: 'WordPress API', status: 'checking', message: 'Checking...' },
    { name: 'Transactions API', status: 'checking', message: 'Checking...' },
    { name: 'Dashboard Data', status: 'checking', message: 'Checking...' }
  ])

  useEffect(() => {
    checkSystems()
  }, [])

  const updateSystem = (name: string, status: 'success' | 'error', message: string, details?: any) => {
    setSystems(prev => prev.map(system => 
      system.name === name ? { ...system, status, message, details } : system
    ))
  }

  const checkSystems = async () => {
    // Check Authentication
    try {
      const authResponse = await fetch('/api/direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'sonik', password: 'sonik123' })
      })
      
      if (authResponse.ok) {
        const authData = await authResponse.json()
        updateSystem('Authentication', 'success', 'Login working', authData)
      } else {
        updateSystem('Authentication', 'error', `Login failed: ${authResponse.status}`)
      }
    } catch (error: any) {
      updateSystem('Authentication', 'error', `Auth error: ${error.message}`)
    }

    // Check WordPress API
    try {
      const wpResponse = await fetch('http://localhost/finance/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'sonik', password: 'sonik123' })
      })
      
      if (wpResponse.ok) {
        const wpData = await wpResponse.json()
        updateSystem('WordPress API', 'success', 'WordPress JWT working', { hasToken: !!wpData.token })
      } else {
        updateSystem('WordPress API', 'error', `WordPress failed: ${wpResponse.status}`)
      }
    } catch (error: any) {
      updateSystem('WordPress API', 'error', `WordPress error: ${error.message}`)
    }

    // Check Transactions API
    try {
      const transResponse = await fetch('/api/transactions?per_page=5')
      
      if (transResponse.ok) {
        const transData = await transResponse.json()
        updateSystem('Transactions API', 'success', `Transactions API working`, { count: transData.data?.length || 0 })
      } else if (transResponse.status === 401) {
        updateSystem('Transactions API', 'error', 'Authentication required (expected)')
      } else {
        updateSystem('Transactions API', 'error', `Transactions failed: ${transResponse.status}`)
      }
    } catch (error: any) {
      updateSystem('Transactions API', 'error', `Transactions error: ${error.message}`)
    }

    // Check Dashboard Data
    try {
      const dashResponse = await fetch('/api/dashboard-data')
      
      if (dashResponse.ok) {
        const dashData = await dashResponse.json()
        updateSystem('Dashboard Data', 'success', `Dashboard working (${dashData.source})`, { 
          count: dashData.data?.length || 0,
          source: dashData.source 
        })
      } else if (dashResponse.status === 401) {
        updateSystem('Dashboard Data', 'error', 'Authentication required (expected)')
      } else {
        updateSystem('Dashboard Data', 'error', `Dashboard failed: ${dashResponse.status}`)
      }
    } catch (error: any) {
      updateSystem('Dashboard Data', 'error', `Dashboard error: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>
        
        <div className="space-y-4">
          {systems.map((system) => (
            <div key={system.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{system.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(system.status)}`}>
                  {getStatusIcon(system.status)} {system.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2">{system.message}</p>
              
              {system.details && (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(system.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Links:</h3>
          <div className="space-y-1 text-sm">
            <a href="/login" className="text-blue-600 hover:underline block">→ Login Page</a>
            <a href="/simple-login" className="text-blue-600 hover:underline block">→ Simple Login Test</a>
            <a href="/dashboard" className="text-blue-600 hover:underline block">→ Dashboard</a>
            <a href="/test-login" className="text-blue-600 hover:underline block">→ Debug Test Page</a>
          </div>
        </div>
        
        <button 
          onClick={checkSystems}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Status
        </button>
      </div>
    </div>
  )
}