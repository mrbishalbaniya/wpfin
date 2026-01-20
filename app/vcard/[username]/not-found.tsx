'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Contact, Search } from 'lucide-react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VisitingCardNotFound() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP entrance animation
    const tl = gsap.timeline()
    
    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    )
    .fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.3"
    )
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <Card ref={cardRef} className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Contact className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Visiting Card Not Found
            </CardTitle>
            <p className="text-gray-600 mt-2">
              The digital visiting card you're looking for doesn't exist or has been removed.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                This could happen if:
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>• The username is incorrect</li>
                <li>• The card has been deleted</li>
                <li>• The user hasn't created a card yet</li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/visiting-card">
                  <Contact className="h-4 w-4 mr-2" />
                  Create Your Card
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <Link 
              href="/" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Finance Tracker
            </Link>
            {' '}Digital Visiting Cards
          </p>
        </div>
      </div>
    </div>
  )
}