'use client'

import { useState } from 'react'
import { ArrowLeft, Mountain, Crown, Palette } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BusinessCard, { BusinessCardData } from '@/components/BusinessCard'

const nepalThemes = [
  'nepal-heritage',
  'dhaka-pattern', 
  'himalayan',
  'newari-copper'
]

const sampleCardData: BusinessCardData = {
  name: 'राम बहादुर शाह',
  title: 'Software Engineer',
  company: 'Tech Nepal Pvt. Ltd.',
  bio: 'Passionate developer from the land of Everest, building digital solutions with Nepali heritage.',
  email: 'ram.shah@technepal.com',
  phone: '+977-9841234567',
  website: 'https://ramshah.com.np',
  profileImage: '',
  companyLogo: '',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/ramshah',
    github: 'https://github.com/ramshah',
    twitter: 'https://twitter.com/ramshah'
  },
  theme: 'nepal-heritage' as BusinessCardData['theme'],
  username: 'ramshah',
  customization: {
    borderRadius: 12,
    blurIntensity: 20,
    accentColor: '#DC143C',
    fontFamily: 'font-hind'
  }
}

export default function NepalHeritageShowcase() {
  const [selectedTheme, setSelectedTheme] = useState<BusinessCardData['theme']>('nepal-heritage')
  
  const cardData = {
    ...sampleCardData,
    theme: selectedTheme
  }

  const themeDescriptions = {
    'nepal-heritage': {
      title: 'Nepal Heritage 🇳🇵',
      description: 'Traditional red and blue colors inspired by the Nepali flag, featuring Buddha Eyes and Dhaka patterns.',
      features: ['National Colors (Crimson & Royal Blue)', 'Buddha Eyes Icon', 'Dhaka Pattern Overlay', 'Gold Accents']
    },
    'dhaka-pattern': {
      title: 'Dhaka Topi Pattern',
      description: 'Inspired by the traditional Palpali Dhaka and Tehrathume Dhaka geometric designs.',
      features: ['Authentic Dhaka Patterns', 'Geometric Overlays', 'Traditional Weaving Motifs', 'Cultural Authenticity']
    },
    'himalayan': {
      title: 'Himalayan Majesty',
      description: 'Featuring the majestic Himalayan mountain range silhouette with pagoda temple elements.',
      features: ['Mountain Silhouettes', 'Pagoda Temple Icons', 'Sky Gradients', 'Architectural Elements']
    },
    'newari-copper': {
      title: 'Newari Copper',
      description: 'Hand-carved copper texture mimicking traditional Newari metalwork with cultural icons.',
      features: ['Hammered Metal Texture', 'Copper Gradients', 'Khukuri Icon', 'Newari Window Patterns']
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
              Heritage Nepal Themes
            </h1>
            <p className="text-gray-600 mt-1">Experience the beauty of Nepali culture in digital business cards.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-red-600">
          <Mountain className="h-6 w-6" />
          <Crown className="h-6 w-6" />
          <Palette className="h-6 w-6" />
        </div>
      </div>

      {/* Theme Selector */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-center text-red-800">Select a Heritage Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nepalThemes.map((theme) => {
              const info = themeDescriptions[theme as keyof typeof themeDescriptions]
              return (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme as BusinessCardData['theme'])}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedTheme === theme
                      ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-sm mb-2">{info.title}</h3>
                    <div className="w-full h-16 rounded mb-2 bg-gradient-to-br from-red-600 to-blue-600 opacity-80"></div>
                    <p className="text-xs text-gray-600">{info.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Preview */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mountain className="h-5 w-5 text-red-600" />
              <span>Live Preview</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Interactive 3D business card with cultural elements</p>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <BusinessCard 
              data={cardData}
              isInteractive={true}
              showActions={false}
              showCustomization={true}
              onDataChange={() => {}}
            />
          </CardContent>
        </Card>

        {/* Theme Details */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <span>{themeDescriptions[selectedTheme as keyof typeof themeDescriptions]?.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              {themeDescriptions[selectedTheme as keyof typeof themeDescriptions]?.description}
            </p>
            
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Cultural Features:</h4>
              <ul className="space-y-2">
                {themeDescriptions[selectedTheme as keyof typeof themeDescriptions]?.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-red-100 to-blue-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-800">Cultural Significance</h4>
              <p className="text-sm text-gray-700">
                {selectedTheme === 'nepal-heritage' && "Represents the national identity with colors from the Nepali flag and traditional Buddhist symbols."}
                {selectedTheme === 'dhaka-pattern' && "Celebrates the traditional Dhaka Topi, a symbol of Nepali cultural identity and craftsmanship."}
                {selectedTheme === 'himalayan' && "Honors the majestic Himalayas and traditional pagoda architecture that defines Nepal's landscape."}
                {selectedTheme === 'newari-copper' && "Pays tribute to the skilled Newari metalworkers and their intricate copper craftsmanship."}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => window.open('/visiting-card', '_blank')}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
              >
                Create Your Card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Information */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-center text-orange-800">About Nepal Heritage Themes</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">Traditional Elements</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Dhaka Patterns:</strong> Geometric designs from traditional Nepali caps</li>
                <li>• <strong>Buddha Eyes:</strong> Wisdom eyes from Swayambhunath Stupa</li>
                <li>• <strong>Khukuri:</strong> Traditional Nepali curved knife symbol</li>
                <li>• <strong>Pagoda Architecture:</strong> Traditional temple designs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">Color Significance</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Crimson Red (#DC143C):</strong> Bravery and national pride</li>
                <li>• <strong>Royal Blue (#003893):</strong> Peace and harmony</li>
                <li>• <strong>Gold/Brass:</strong> Prosperity and spiritual enlightenment</li>
                <li>• <strong>Copper Tones:</strong> Traditional metalwork heritage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}