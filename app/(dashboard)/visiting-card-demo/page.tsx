'use client'

import { useState } from 'react'
import { ArrowLeft, Sparkles, Heart, MapPin, CreditCard, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import BusinessCard, { BusinessCardData } from '@/components/BusinessCard'

const demoCards: BusinessCardData[] = [
  {
    id: 'demo-1',
    name: 'Rajesh Shrestha',
    title: 'Software Engineer',
    company: 'Tech Nepal Pvt. Ltd.',
    bio: 'Passionate about building digital solutions for Nepal. Love hiking in the Himalayas and exploring our rich cultural heritage.',
    email: 'rajesh@technepal.com',
    website: 'https://rajesh.dev',
    theme: 'nepal-heritage',
    username: 'rajesh_dev',
    nationalPride: true,
    landmark: 'Thamel, Kathmandu',
    paymentQR: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iYmxhY2siLz4KPHN2Zz4K',
    phoneNumbers: {
      ncell: '+977 984-1234567',
      ntc: '+977 985-7654321'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rajesh-shrestha',
      github: 'https://github.com/rajesh-dev',
      twitter: 'https://twitter.com/rajesh_dev'
    }
  },
  {
    id: 'demo-2',
    name: 'Sita Gurung',
    title: 'Digital Marketing Specialist',
    company: 'Himalayan Digital',
    bio: 'Helping Nepali businesses grow online. Advocate for women in tech and sustainable tourism.',
    email: 'sita@himalayandigital.com',
    website: 'https://sitag.marketing',
    theme: 'dhaka-pattern',
    username: 'sita_marketing',
    nationalPride: true,
    landmark: 'Pokhara Lakeside',
    paymentQR: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIgZmlsbD0iYmxhY2siLz4KPHN2Zz4K',
    phoneNumbers: {
      ncell: '+977 981-9876543',
      landline: '+977 61-123456'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sita-gurung',
      twitter: 'https://twitter.com/sita_marketing'
    }
  },
  {
    id: 'demo-3',
    name: 'Arjun Tamang',
    title: 'Traditional Craftsman',
    company: 'Heritage Arts Nepal',
    bio: 'Preserving Newari craftsmanship through modern design. Creating authentic handmade products for global markets.',
    email: 'arjun@heritagearts.np',
    website: 'https://heritagearts.nepal',
    theme: 'newari-copper',
    username: 'arjun_craftsman',
    nationalPride: true,
    landmark: 'Bhaktapur Durbar Square',
    paymentQR: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzNSIgZmlsbD0iYmxhY2siLz4KPHN2Zz4K',
    phoneNumbers: {
      ntc: '+977 986-5432109',
      landline: '+977 1-6612345'
    },
    socialLinks: {
      linkedin: 'https://linkedin.com/in/arjun-tamang',
      github: 'https://github.com/arjun-heritage'
    }
  }
]

export default function VisitingCardDemoPage() {
  const [selectedCard, setSelectedCard] = useState(0)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
            <Link href="/visiting-card">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-clip-text text-transparent">
              Cultural Animations & Smart Features Demo
            </h1>
            <p className="text-gray-600 mt-1">Experience the enhanced 3D visiting cards with Nepali cultural elements.</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-blue-100 text-red-800">
            <Heart className="h-3 w-3 mr-1" />
            Made in Nepal
          </Badge>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <h3 className="font-semibold text-red-800">Woven Texture Motion</h3>
            <p className="text-xs text-red-600 mt-1">Parallax cultural patterns</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-blue-800">National Pride</h3>
            <p className="text-xs text-blue-600 mt-1">Crimson-blue glow border</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-green-800">Dual-SIM vCard</h3>
            <p className="text-xs text-green-600 mt-1">Ncell & NTC numbers</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Local Payments</h3>
            <p className="text-xs text-purple-600 mt-1">Fonepay & eSewa QR</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Demo Cards</h2>
          {demoCards.map((card, index) => (
            <Card 
              key={card.id}
              className={`cursor-pointer transition-all ${
                selectedCard === index 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCard(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 rounded overflow-hidden">
                    <div className={`w-full h-full ${
                      card.theme === 'nepal-heritage' ? 'bg-gradient-to-br from-red-700 to-red-800' :
                      card.theme === 'dhaka-pattern' ? 'bg-gradient-to-br from-red-600 to-red-700' :
                      'bg-gradient-to-br from-amber-600 to-amber-900'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{card.name}</h3>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {card.nationalPride && (
                        <Badge variant="secondary" className="text-xs">
                          🇳🇵 Pride
                        </Badge>
                      )}
                      {card.landmark && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          Location
                        </Badge>
                      )}
                      {card.paymentQR && (
                        <Badge variant="outline" className="text-xs">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Demo */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Interactive Demo</span>
                <Badge className="bg-gradient-to-r from-red-600 to-blue-600">
                  {demoCards[selectedCard].theme.replace('-', ' ').toUpperCase()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Move your mouse over the card to see the parallax effects. Click to flip and explore features.
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <BusinessCard 
                data={demoCards[selectedCard]} 
                isInteractive={true}
                showActions={true}
                publicUrl={`https://demo.visitingcard.np/vcard/${demoCards[selectedCard].username}`}
                showCustomization={false}
              />
            </CardContent>
          </Card>
          
          {/* Feature Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Enhanced Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">🎨 Cultural Animations</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Parallax Dhaka patterns</li>
                    <li>• Animated Buddha eyes</li>
                    <li>• Himalayan silhouettes</li>
                    <li>• Copper texture effects</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">📱 Smart Contact</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Dual-SIM vCard generation</li>
                    <li>• Ncell & NTC carrier info</li>
                    <li>• Social media profiles</li>
                    <li>• Location landmarks</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">🇳🇵 National Pride</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Crimson-to-blue border</li>
                    <li>• Hover glow effects</li>
                    <li>• Cultural theme integration</li>
                    <li>• Heritage color schemes</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">💳 Local Payments</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Fonepay QR integration</li>
                    <li>• eSewa payment codes</li>
                    <li>• Modal dialog display</li>
                    <li>• Easy QR scanning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Instructions */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">How to Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm text-orange-700 space-y-2">
                <li><strong>1. Hover Effects:</strong> Move your mouse over the card to see parallax cultural patterns</li>
                <li><strong>2. National Pride:</strong> Notice the subtle crimson-blue glow on hover (Nepal flag colors)</li>
                <li><strong>3. Flip Animation:</strong> Click the card to see the back with contact details</li>
                <li><strong>4. Smart Features:</strong> Try "Save Contact" for dual-SIM vCard or "Scan to Pay" for QR</li>
                <li><strong>5. Location:</strong> Click landmark addresses to open Google Maps</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}