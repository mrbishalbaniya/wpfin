'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Share2, ExternalLink, Mail, Phone, Globe } from 'lucide-react'
import { gsap } from 'gsap'
import BusinessCard, { BusinessCardData } from './BusinessCard'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface PublicVisitingCardProps {
  cardData: BusinessCardData
}

export default function PublicVisitingCard({ cardData }: PublicVisitingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // GSAP entrance animation
    const tl = gsap.timeline()
    
    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    )
    .fromTo(cardRef.current,
      { opacity: 0, y: 50, rotationY: -15 },
      { opacity: 1, y: 0, rotationY: 0, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.3"
    )
    .fromTo(actionsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      "-=0.4"
    )
    .call(() => setIsLoaded(true))
  }, [])

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
ORG:${cardData.company || ''}
TITLE:${cardData.title}
EMAIL:${cardData.email}
TEL:${cardData.phone || ''}
URL:${cardData.website || ''}
NOTE:${cardData.bio || ''}
END:VCARD`

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cardData.name.replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareCard = async () => {
    const shareData = {
      title: `${cardData.name} - Digital Visiting Card`,
      text: `Connect with ${cardData.name}${cardData.title ? `, ${cardData.title}` : ''}${cardData.company ? ` at ${cardData.company}` : ''}`,
      url: window.location.href
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled or failed:', error)
        fallbackShare()
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert(`Share this card: ${window.location.href}`)
    }
  }

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const publicUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            {cardData.name}
          </h1>
          <p className="text-xl text-gray-600">{cardData.title}</p>
          {cardData.company && (
            <p className="text-lg text-gray-500 mt-1">{cardData.company}</p>
          )}
        </div>

        {/* Main Card */}
        <div ref={cardRef} className="flex justify-center mb-8">
          <BusinessCard 
            data={cardData}
            isInteractive={true}
            showActions={false}
            publicUrl={publicUrl}
          />
        </div>

        {/* Actions */}
        <div ref={actionsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={generateVCard} className="w-full" size="lg">
                <Download className="h-5 w-5 mr-2" />
                Add to Contacts
              </Button>
              
              <Button onClick={shareCard} variant="outline" className="w-full" size="lg">
                <Share2 className="h-5 w-5 mr-2" />
                Share Card
              </Button>
              
              {cardData.website && (
                <Button 
                  onClick={() => openLink(cardData.website!)} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  <Globe className="h-5 w-5 mr-2" />
                  Visit Website
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${cardData.email}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {cardData.email}
                  </a>
                </div>
              </div>
              
              {cardData.phone && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a 
                      href={`tel:${cardData.phone}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {cardData.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {cardData.website && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a 
                      href={cardData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {cardData.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        {cardData.bio && (
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{cardData.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <a 
              href="/" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Finance Tracker
            </a>
            {' '}Digital Visiting Cards
          </p>
        </div>
      </div>
    </div>
  )
}