'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Share2, Download, Upload, Palette, User, Mail, Phone, Globe, Linkedin, Github, Twitter, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BusinessCard, { BusinessCardData } from '@/components/BusinessCard'
import { auth } from '@/lib/auth'
import { localImageStorage } from '@/lib/local-image-storage'
import { visitingCardAPI } from '@/lib/visiting-card-api'

const themes = [
  { value: 'modern', label: 'Modern', preview: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800' },
  { value: 'minimal', label: 'Minimal', preview: 'bg-white border-2 border-gray-200' },
  { value: 'dark', label: 'Dark', preview: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' },
  { value: 'glassmorphism', label: 'Glassmorphism', preview: 'bg-white/20 backdrop-blur-lg border border-white/30', premium: true },
  { value: 'metallic-gold', label: 'Metallic Gold', preview: 'bg-gradient-to-br from-yellow-600 via-yellow-200 to-yellow-600', premium: true },
  { value: 'metallic-silver', label: 'Metallic Silver', preview: 'bg-gradient-to-br from-gray-400 via-gray-100 to-gray-400', premium: true },
  { value: 'midnight-stealth', label: 'Midnight Stealth', preview: 'bg-gradient-to-br from-black via-gray-900 to-black border border-cyan-500/30', premium: true },
  { value: 'holographic', label: 'Holographic', preview: 'bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600', premium: true },
  { value: 'nepal-heritage', label: 'Nepal Heritage 🇳🇵', preview: 'bg-gradient-to-br from-red-700 via-red-600 to-red-800', premium: true, cultural: true },
  { value: 'dhaka-pattern', label: 'Dhaka Topi Pattern', preview: 'bg-gradient-to-br from-red-600 via-red-500 to-red-700', premium: true, cultural: true },
  { value: 'himalayan', label: 'Himalayan Majesty', preview: 'bg-gradient-to-t from-blue-900 via-blue-700 to-blue-300', premium: true, cultural: true },
  { value: 'newari-copper', label: 'Newari Copper', preview: 'bg-gradient-radial from-amber-600 via-orange-700 to-amber-900', premium: true, cultural: true }
]

export default function VisitingCardPage() {
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingQR, setIsUploadingQR] = useState(false)
  const [cardData, setCardData] = useState<BusinessCardData>({
    name: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    profileImage: '',
    companyLogo: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: ''
    },
    theme: 'modern' as BusinessCardData['theme'],
    username: '',
    customization: {
      borderRadius: 12,
      blurIntensity: 20,
      accentColor: '#3b82f6',
      fontFamily: 'font-sans'
    },
    // New features
    nationalPride: false,
    landmark: '',
    paymentQR: '',
    phoneNumbers: {
      ncell: '',
      ntc: '',
      landline: ''
    }
  })

  useEffect(() => {
    // GSAP animations
    const tl = gsap.timeline()
    
    tl.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
    .fromTo([formRef.current, previewRef.current],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 },
      "-=0.3"
    )

    // Load existing card data
    loadCardData()
  }, [])

  const loadCardData = async () => {
    try {
      setIsLoading(true)
      const user = auth.getCurrentUser()
      if (user) {
        console.log('Loading card data for user:', user.username)
        
        try {
          const existingCard = await visitingCardAPI.getCard(user.username)
          if (existingCard) {
            console.log('Existing card loaded:', existingCard)
            console.log('🖼️ Profile image URL:', existingCard.profileImage)
            console.log('🏢 Company logo URL:', existingCard.companyLogo)
            console.log('💳 Payment QR URL:', existingCard.paymentQR)
            
            // Check if images are missing and try to load from local storage
            const localImages = localImageStorage.getImages(user.username)
            if (localImages) {
              const mergedCard = {
                ...existingCard,
                profileImage: existingCard.profileImage || localImages.profileImage,
                companyLogo: existingCard.companyLogo || localImages.companyLogo,
                paymentQR: existingCard.paymentQR || localImages.paymentQR
              }
              console.log('🔄 Merged with local storage:', mergedCard)
              setCardData(mergedCard)
            } else {
              setCardData(existingCard)
            }
          } else {
            console.log('No existing card found, using default values')
            // Set default values from user data
            setCardData(prev => ({
              ...prev,
              name: user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.username,
              email: user.email,
              username: user.username
            }))
          }
        } catch (error: any) {
          console.log('No existing card found, using default values')
          // Set default values from user data
          setCardData(prev => ({
            ...prev,
            name: user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.username,
            email: user.email,
            username: user.username
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load card data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    console.log('Refreshing card data...')
    await loadCardData()
  }

  const handleInputChange = (field: keyof BusinessCardData, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform: keyof BusinessCardData['socialLinks'], value: string) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const handleImageUpload = async (type: 'profile' | 'logo', file: File) => {
    try {
      console.log(`Uploading ${type} image:`, file.name)
      
      // Set loading state
      if (type === 'profile') {
        setIsUploadingProfile(true)
      } else {
        setIsUploadingLogo(true)
      }
      
      const imageUrl = await visitingCardAPI.uploadImage(file, type)
      console.log(`${type} image uploaded successfully:`, imageUrl)
      
      // Update card data
      if (type === 'profile') {
        setCardData(prev => ({ ...prev, profileImage: imageUrl }))
      } else {
        setCardData(prev => ({ ...prev, companyLogo: imageUrl }))
      }
      
      // Save to local storage as backup
      const user = auth.getCurrentUser()
      if (user) {
        const imageUpdate = type === 'profile' 
          ? { profileImage: imageUrl }
          : { companyLogo: imageUrl }
        localImageStorage.saveImages(user.username, imageUpdate)
      }
      
      // Success feedback
      alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded successfully!`)
      
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      alert(`❌ Failed to upload ${type} image: ${error.message}`)
    } finally {
      // Clear loading state
      if (type === 'profile') {
        setIsUploadingProfile(false)
      } else {
        setIsUploadingLogo(false)
      }
    }
  }

  const handlePaymentQRUpload = async (file: File) => {
    try {
      console.log('Uploading payment QR:', file.name)
      setIsUploadingQR(true)
      
      // Use the same upload API for consistency
      const imageUrl = await visitingCardAPI.uploadImage(file, 'profile') // Use profile type for QR
      console.log('Payment QR uploaded successfully:', imageUrl)
      
      setCardData(prev => ({ ...prev, paymentQR: imageUrl }))
      
      // Save to local storage as backup
      const user = auth.getCurrentUser()
      if (user) {
        localImageStorage.saveImages(user.username, { paymentQR: imageUrl })
      }
      
      alert('✅ Payment QR code uploaded successfully!')
      
    } catch (error: any) {
      console.error('Failed to upload payment QR:', error)
      
      // Fallback to FileReader for base64
      console.log('Falling back to base64 encoding...')
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Url = e.target?.result as string
        setCardData(prev => ({ ...prev, paymentQR: base64Url }))
        
        // Save to local storage as backup
        const user = auth.getCurrentUser()
        if (user) {
          localImageStorage.saveImages(user.username, { paymentQR: base64Url })
        }
        
        alert('✅ Payment QR code uploaded (base64)!')
      }
      reader.onerror = () => {
        alert('❌ Failed to upload payment QR code')
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingQR(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      console.log('=== SAVING VISITING CARD ===')
      console.log('Card data:', cardData)
      
      // Validate required fields
      if (!cardData.name || !cardData.title || !cardData.email) {
        throw new Error('Please fill in all required fields (Name, Title, Email)')
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(cardData.email)) {
        throw new Error('Please enter a valid email address')
      }
      
      const savedCard = await visitingCardAPI.saveCard(cardData)
      console.log('Card saved successfully:', savedCard)
      
      // Update the local state with the saved data
      setCardData(savedCard)
      
      // Success animation
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      })
      
      // Show success message with better UX
      const successMessage = `✅ Visiting card saved successfully!\n\nCard ID: ${savedCard.id}\nName: ${savedCard.name}\nTitle: ${savedCard.title}\nPublic URL: ${window.location.origin}/vcard/${savedCard.username}`
      alert(successMessage)
      
    } catch (error: any) {
      console.error('=== SAVE ERROR ===')
      console.error('Error details:', error)
      console.error('Error message:', error.message)
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to save card. Please try again.'
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setIsSaving(false)
      console.log('=== SAVE ATTEMPT END ===')
    }
  }

  const handlePreview = () => {
    const user = auth.getCurrentUser()
    if (user) {
      window.open(`/vcard/${user.username}`, '_blank')
    }
  }

  const handleShare = async () => {
    const user = auth.getCurrentUser()
    if (user) {
      const shareUrl = `${window.location.origin}/vcard/${user.username}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Share link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
        alert(`Share your card: ${shareUrl}`)
      }
    }
  }

  const testAPI = async () => {
    try {
      console.log('=== TESTING VISITING CARD API ===')
      
      // Test 1: Check authentication
      const authResponse = await fetch('/api/visiting-card', {
        method: 'GET'
      })
      console.log('Auth test response:', authResponse.status)
      
      // Test 2: Try to save a simple card
      const testCard = {
        name: 'API Test User',
        title: 'Test Developer',
        email: 'test@example.com',
        theme: 'modern' as const,
        company: '',
        bio: '',
        phone: '',
        website: '',
        profileImage: '',
        companyLogo: '',
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: ''
        },
        username: ''
      }
      
      console.log('Testing save with:', testCard)
      const saveResponse = await fetch('/api/visiting-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCard)
      })
      
      console.log('Save test response:', saveResponse.status)
      
      if (saveResponse.ok) {
        const result = await saveResponse.json()
        console.log('Save test success:', result)
        alert('✅ API Test Successful! Check console for details.')
      } else {
        const error = await saveResponse.json()
        console.error('Save test error:', error)
        alert(`❌ API Test Failed: ${error.error}`)
      }
    } catch (error: any) {
      console.error('API test error:', error)
      alert(`❌ API Test Error: ${error.message}`)
    }
  }

  const publicUrl = cardData.username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/vcard/${cardData.username}` : undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Digital Visiting Card
            </h1>
            <p className="text-gray-600 mt-1">Create your professional 3D business card with interactive features.</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-gradient-to-r from-red-50 to-blue-50 border-red-200 hover:from-red-100 hover:to-blue-100">
            <Link href="/visiting-card-demo">
              ✨ Live Demo
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-gradient-to-r from-red-50 to-blue-50 border-red-200 hover:from-red-100 hover:to-blue-100">
            <Link href="/nepal-heritage-showcase">
              🏔️ Heritage Themes
            </Link>
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            🔄 Refresh
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Card'}
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button onClick={testAPI} variant="outline" size="sm">
              🧪 Test API
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div ref={formRef} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={cardData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={cardData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={cardData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Tech Corp Inc."
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={cardData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Brief description about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={cardData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              
              {/* Nepali Phone Numbers */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Phone Numbers (Nepal)</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="ncell" className="text-xs text-gray-600">Ncell Number</Label>
                    <Input
                      id="ncell"
                      value={cardData.phoneNumbers?.ncell || ''}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        phoneNumbers: { ...prev.phoneNumbers, ncell: e.target.value }
                      }))}
                      placeholder="+977 98X-XXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ntc" className="text-xs text-gray-600">NTC Number</Label>
                    <Input
                      id="ntc"
                      value={cardData.phoneNumbers?.ntc || ''}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        phoneNumbers: { ...prev.phoneNumbers, ntc: e.target.value }
                      }))}
                      placeholder="+977 98X-XXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="landline" className="text-xs text-gray-600">Landline (Optional)</Label>
                    <Input
                      id="landline"
                      value={cardData.phoneNumbers?.landline || ''}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        phoneNumbers: { ...prev.phoneNumbers, landline: e.target.value }
                      }))}
                      placeholder="+977 1-XXXXXXX"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={cardData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://johndoe.com"
                />
              </div>

              {/* Landmark */}
              <div>
                <Label htmlFor="landmark">Landmark / Address</Label>
                <Input
                  id="landmark"
                  value={cardData.landmark || ''}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  placeholder="Thamel, Kathmandu"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will create a "Get Directions" link to Google Maps
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Social Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="linkedin" className="flex items-center space-x-2">
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </Label>
                <Input
                  id="linkedin"
                  value={cardData.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              
              <div>
                <Label htmlFor="github" className="flex items-center space-x-2">
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </Label>
                <Input
                  id="github"
                  value={cardData.socialLinks.github}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="https://github.com/johndoe"
                />
              </div>
              
              <div>
                <Label htmlFor="twitter" className="flex items-center space-x-2">
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </Label>
                <Input
                  id="twitter"
                  value={cardData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/johndoe"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Customization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={cardData.theme} onValueChange={(value: any) => handleInputChange('theme', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded ${theme.preview}`}></div>
                          <span>{theme.label}</span>
                          {theme.premium && !theme.cultural && <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full">Premium</span>}
                          {theme.cultural && <span className="text-xs bg-gradient-to-r from-red-600 to-blue-600 text-white px-2 py-0.5 rounded-full">Heritage</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* National Pride Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="national-pride">National Pride Border 🇳🇵</Label>
                  <p className="text-xs text-gray-500">Adds a crimson-to-blue glowing border on hover</p>
                </div>
                <input
                  type="checkbox"
                  id="national-pride"
                  checked={cardData.nationalPride || false}
                  onChange={(e) => setCardData(prev => ({ ...prev, nationalPride: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-image">Profile Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload('profile', file)
                      }}
                      className="hidden"
                      id="profile-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('profile-upload')?.click()}
                      className="w-full"
                      disabled={isUploadingProfile}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingProfile ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    {cardData.profileImage && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <img 
                          src={cardData.profileImage} 
                          alt="Profile preview"
                          className="w-16 h-16 object-cover rounded-full mx-auto"
                        />
                        <p className="text-xs text-center text-gray-600 mt-1">Profile image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company-logo">Company Logo</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload('logo', file)
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="w-full"
                      disabled={isUploadingLogo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    {cardData.companyLogo && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <img 
                          src={cardData.companyLogo} 
                          alt="Logo preview"
                          className="w-16 h-16 object-contain mx-auto"
                        />
                        <p className="text-xs text-center text-gray-600 mt-1">Company logo uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CreditCard className="h-5 w-5" />
                <span>Payment Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment-qr">Fonepay/eSewa QR Code</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handlePaymentQRUpload(file)
                      }
                    }}
                    className="hidden"
                    id="payment-qr-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('payment-qr-upload')?.click()}
                    className="w-full"
                    disabled={isUploadingQR}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingQR ? 'Uploading...' : 'Upload QR Code'}
                  </Button>
                </div>
                {cardData.paymentQR && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <img 
                      src={cardData.paymentQR} 
                      alt="Payment QR Code"
                      className="w-16 h-16 object-contain mx-auto"
                    />
                    <p className="text-xs text-center text-gray-600 mt-1">QR Code uploaded</p>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  Upload your Fonepay or eSewa QR code. Visitors can tap "Scan to Pay" to see it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div ref={previewRef} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <p className="text-sm text-gray-600">Click the card to see the flip animation</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <BusinessCard 
                data={cardData} 
                isInteractive={true}
                showActions={false}
                publicUrl={publicUrl}
                showCustomization={true}
                onDataChange={setCardData}
              />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Share Your Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Your public card URL:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                  {publicUrl || 'Save your card to get a shareable URL'}
                </code>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleShare} variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={handlePreview} variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-2">
                  <div><strong>Name:</strong> {cardData.name || 'Not set'}</div>
                  <div><strong>Title:</strong> {cardData.title || 'Not set'}</div>
                  <div><strong>Email:</strong> {cardData.email || 'Not set'}</div>
                  <div><strong>Username:</strong> {cardData.username || 'Not set'}</div>
                  <div><strong>Theme:</strong> {cardData.theme}</div>
                  <div><strong>Card ID:</strong> {cardData.id || 'Not saved yet'}</div>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2 w-full">
                  🔄 Reload Data
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}