'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Mail, Phone, Linkedin, Github, Twitter, ExternalLink, Download, Palette, Settings, FileImage, FileText, MapPin, CreditCard, Smartphone } from 'lucide-react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { downloadVCard } from '@/lib/vcard-generator'
import { NepalPatterns } from './cultural-patterns/NepalPatterns'
import { AnimatedNepalPatterns } from './cultural-patterns/AnimatedNepalPatterns'

// Import Nepali fonts
import '@fontsource/hind/400.css'
import '@fontsource/hind/500.css'
import '@fontsource/hind/600.css'
import '@fontsource/mukta/400.css'
import '@fontsource/mukta/500.css'
import '@fontsource/mukta/600.css'

export interface BusinessCardData {
  id?: string
  name: string
  title: string
  company?: string
  bio?: string
  email: string
  phone?: string
  website?: string
  profileImage?: string
  companyLogo?: string
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  theme: 'modern' | 'minimal' | 'dark' | 'glassmorphism' | 'metallic-gold' | 'metallic-silver' | 'midnight-stealth' | 'holographic' | 'nepal-heritage' | 'dhaka-pattern' | 'himalayan' | 'newari-copper'
  username: string
  customization?: {
    borderRadius: number
    blurIntensity: number
    accentColor: string
    fontFamily: string
  }
  // New features
  nationalPride?: boolean
  landmark?: string
  paymentQR?: string
  phoneNumbers?: {
    ncell?: string
    ntc?: string
    landline?: string
  }
}

interface BusinessCardProps {
  data: BusinessCardData
  isInteractive?: boolean
  showActions?: boolean
  publicUrl?: string
  showCustomization?: boolean
  onDataChange?: (data: BusinessCardData) => void
}

const premiumThemes = {
  modern: {
    front: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800',
    back: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600',
    text: 'text-white',
    accent: 'text-blue-200',
    name: 'Modern Gradient',
    premium: false
  },
  minimal: {
    front: 'bg-white border-2 border-gray-200',
    back: 'bg-gray-50 border-2 border-gray-200',
    text: 'text-gray-900',
    accent: 'text-gray-600',
    name: 'Clean Minimal',
    premium: false
  },
  dark: {
    front: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    back: 'bg-gradient-to-br from-black via-gray-900 to-gray-800',
    text: 'text-white',
    accent: 'text-gray-300',
    name: 'Dark Professional',
    premium: false
  },
  glassmorphism: {
    front: 'bg-white/10 backdrop-blur-xl border border-white/20',
    back: 'bg-black/10 backdrop-blur-xl border border-white/20',
    text: 'text-white',
    accent: 'text-white/80',
    name: 'Glassmorphism',
    premium: true
  },
  'metallic-gold': {
    front: 'bg-gradient-to-br from-yellow-600 via-yellow-200 to-yellow-600 metallic-shimmer',
    back: 'bg-gradient-to-br from-yellow-700 via-yellow-300 to-yellow-700 metallic-shimmer',
    text: 'text-yellow-900',
    accent: 'text-yellow-700',
    name: 'Metallic Gold',
    premium: true
  },
  'metallic-silver': {
    front: 'bg-gradient-to-br from-gray-400 via-gray-100 to-gray-400 metallic-shimmer',
    back: 'bg-gradient-to-br from-gray-500 via-gray-200 to-gray-500 metallic-shimmer',
    text: 'text-gray-900',
    accent: 'text-gray-700',
    name: 'Metallic Silver',
    premium: true
  },
  'midnight-stealth': {
    front: 'bg-gradient-to-br from-black via-gray-900 to-black border border-cyan-500/30',
    back: 'bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-cyan-500/30',
    text: 'text-white',
    accent: 'text-cyan-400',
    name: 'Midnight Stealth',
    premium: true
  },
  holographic: {
    front: 'bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 holographic-overlay',
    back: 'bg-gradient-to-br from-blue-600 via-purple-500 to-pink-600 holographic-overlay',
    text: 'text-white',
    accent: 'text-purple-200',
    name: 'Holographic',
    premium: true
  },
  'nepal-heritage': {
    front: 'bg-gradient-to-br from-red-700 via-red-600 to-red-800 nepal-flag-pattern',
    back: 'bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 nepal-flag-pattern',
    text: 'text-white',
    accent: 'text-yellow-300',
    name: 'Nepal Heritage',
    premium: true,
    cultural: true
  },
  'dhaka-pattern': {
    front: 'bg-gradient-to-br from-red-600 via-red-500 to-red-700 dhaka-overlay',
    back: 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 dhaka-overlay',
    text: 'text-white',
    accent: 'text-yellow-200',
    name: 'Dhaka Topi Pattern',
    premium: true,
    cultural: true
  },
  'himalayan': {
    front: 'bg-gradient-to-t from-blue-900 via-blue-700 to-blue-300 himalayan-silhouette',
    back: 'bg-gradient-to-t from-gray-800 via-gray-600 to-gray-300 himalayan-silhouette',
    text: 'text-white',
    accent: 'text-blue-200',
    name: 'Himalayan Majesty',
    premium: true,
    cultural: true
  },
  'newari-copper': {
    front: 'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 copper-texture',
    back: 'bg-gradient-to-br from-orange-600 via-amber-700 to-orange-900 copper-texture',
    text: 'text-amber-100',
    accent: 'text-amber-200',
    name: 'Newari Copper',
    premium: true,
    cultural: true
  }
}

const fontOptions = [
  { name: 'Inter', value: 'font-sans' },
  { name: 'Playfair Display', value: 'font-serif' },
  { name: 'JetBrains Mono', value: 'font-mono' },
  { name: 'Poppins', value: 'font-poppins' },
  { name: 'Roboto', value: 'font-roboto' },
  { name: 'Hind (Nepali)', value: 'font-hind' },
  { name: 'Mukta (Nepali)', value: 'font-mukta' }
]

export default function BusinessCard({ 
  data, 
  isInteractive = true, 
  showActions = false, 
  publicUrl,
  showCustomization = false,
  onDataChange
}: BusinessCardProps) {
  // Debug logging for image URLs
  useEffect(() => {
    console.log('🎴 BusinessCard component rendered with data:', {
      name: data.name,
      profileImage: data.profileImage,
      companyLogo: data.companyLogo,
      paymentQR: data.paymentQR
    })
  }, [data.profileImage, data.companyLogo, data.paymentQR])

  const [isFlipped, setIsFlipped] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showCustomPanel, setShowCustomPanel] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  
  // Enhanced mouse tracking for parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])
  const rotateZ = useTransform(mouseX, [-300, 300], [-1, 1])
  
  // Parallax transforms for cultural patterns
  const patternX = useSpring(useTransform(mouseX, [-300, 300], [-20, 20]), { stiffness: 100, damping: 30 })
  const patternY = useSpring(useTransform(mouseY, [-300, 300], [-10, 10]), { stiffness: 100, damping: 30 })
  const patternScale = useSpring(useTransform(mouseX, [-150, 150], [0.95, 1.05]), { stiffness: 100, damping: 30 })

  const theme = premiumThemes[data.theme]
  const customization = data.customization || {
    borderRadius: 12,
    blurIntensity: 20,
    accentColor: '#3b82f6',
    fontFamily: 'font-sans'
  }

  useEffect(() => {
    if (publicUrl) {
      QRCode.toDataURL(publicUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: data.theme === 'minimal' ? '#000000' : '#FFFFFF',
          light: '#00000000'
        }
      }).then(setQrCodeUrl)
    }
  }, [publicUrl, data.theme])

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isInteractive || isFlipped) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set(event.clientX - centerX)
    mouseY.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleFlip = () => {
    if (isInteractive) {
      setIsFlipped(!isFlipped)
    }
  }

  const updateCustomization = (key: string, value: any) => {
    const newData = {
      ...data,
      customization: {
        ...customization,
        [key]: value
      }
    }
    onDataChange?.(newData)
  }

  const exportAsImage = async (format: 'png' | 'pdf' = 'png') => {
    if (!exportRef.current) return
    
    setIsExporting(true)
    
    try {
      // Create a temporary container for export
      const exportContainer = document.createElement('div')
      exportContainer.style.position = 'fixed'
      exportContainer.style.top = '-9999px'
      exportContainer.style.left = '-9999px'
      exportContainer.style.width = '800px'
      exportContainer.style.height = '500px'
      exportContainer.style.background = 'white'
      exportContainer.style.padding = '40px'
      document.body.appendChild(exportContainer)

      // Create side-by-side layout
      exportContainer.innerHTML = `
        <div style="display: flex; gap: 40px; justify-content: center; align-items: center; height: 100%;">
          <div id="front-export" style="width: 320px; height: 200px;"></div>
          <div id="back-export" style="width: 320px; height: 200px;"></div>
        </div>
      `

      // Clone and render both sides
      const frontClone = exportRef.current.children[0].cloneNode(true) as HTMLElement
      const backClone = exportRef.current.children[1].cloneNode(true) as HTMLElement
      
      // Remove transform and animation styles for export
      frontClone.style.transform = 'none'
      backClone.style.transform = 'none'
      frontClone.style.animation = 'none'
      backClone.style.animation = 'none'
      
      document.getElementById('front-export')?.appendChild(frontClone)
      document.getElementById('back-export')?.appendChild(backClone)

      // Generate image
      const canvas = await html2canvas(exportContainer, {
        width: 800,
        height: 500,
        scale: 2,
        backgroundColor: 'white',
        useCORS: true
      })

      if (format === 'png') {
        // Download as PNG
        const link = document.createElement('a')
        link.download = `${data.name.replace(/\s+/g, '_')}_BusinessCard.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        // Download as PDF
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [85.6, 54] // Standard business card size with bleed
        })
        
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54)
        pdf.save(`${data.name.replace(/\s+/g, '_')}_BusinessCard.pdf`)
      }

      // Cleanup
      document.body.removeChild(exportContainer)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const generateVCard = () => {
    downloadVCard(data, {
      includeQR: true,
      includeSocialLinks: true,
      includeLocation: true
    })
  }

  const openGoogleMaps = () => {
    if (data.landmark) {
      const query = encodeURIComponent(`${data.landmark}, Nepal`)
      const mapsUrl = `https://maps.google.com/maps?q=${query}`
      window.open(mapsUrl, '_blank')
    }
  }

  const copyLink = async () => {
    if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl)
      alert('Link copied to clipboard!')
    }
  }

  const cardStyle = {
    borderRadius: `${customization.borderRadius}px`,
    backdropFilter: data.theme.includes('glass') ? `blur(${customization.blurIntensity}px)` : undefined,
  }

  return (
    <div className="relative">
      <div className="perspective-1000 w-80 h-48 mx-auto relative" ref={cardRef}>
        <motion.div
          ref={exportRef}
          className={`absolute inset-0 preserve-3d cursor-pointer ${customization.fontFamily}`}
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={handleFlip}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={isInteractive ? { scale: 1.02 } : {}}
          whileTap={isInteractive ? { scale: 0.98 } : {}}
          style={{
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Front Side */}
          <div 
            className={`absolute inset-0 backface-hidden shadow-2xl p-6 ${theme.front} ${theme.text} ${
              data.nationalPride ? 'national-pride-border' : ''
            }`}
            style={cardStyle}
          >
            <div className="flex flex-col h-full justify-between relative z-10">
              {/* Animated mesh gradient background for certain themes */}
              {data.theme === 'holographic' && (
                <div className="absolute inset-0 opacity-30 animated-mesh-gradient rounded-xl" />
              )}
              
              {/* Nepal Heritage Cultural Patterns with Parallax */}
              {data.theme === 'nepal-heritage' && (
                <>
                  <AnimatedNepalPatterns.AnimatedDhakaPattern 
                    mouseX={patternX} 
                    mouseY={patternY} 
                  />
                  <AnimatedNepalPatterns.AnimatedBuddhEyes 
                    mouseX={useTransform(patternX, [0, 20], [0, -10])} 
                  />
                </>
              )}
              
              {data.theme === 'dhaka-pattern' && (
                <AnimatedNepalPatterns.AnimatedDhakaPattern 
                  mouseX={patternX} 
                  mouseY={patternY} 
                />
              )}
              
              {data.theme === 'himalayan' && (
                <>
                  <AnimatedNepalPatterns.AnimatedHimalayanSilhouette 
                    mouseX={useTransform(patternX, [0, 20], [0, 5])} 
                    mouseY={useTransform(patternY, [0, 10], [0, 3])} 
                  />
                  <motion.div 
                    className="absolute top-4 right-4 opacity-30 text-blue-200"
                    style={{ x: useTransform(patternX, [0, 20], [0, -8]) }}
                  >
                    <NepalPatterns.PagodaSilhouette />
                  </motion.div>
                </>
              )}
              
              {data.theme === 'newari-copper' && (
                <>
                  <AnimatedNepalPatterns.AnimatedCopperTexture 
                    mouseScale={patternScale} 
                  />
                  <motion.div 
                    className="absolute bottom-4 left-4 opacity-40 text-amber-200"
                    style={{ x: useTransform(patternX, [0, 20], [0, 5]) }}
                  >
                    <NepalPatterns.NewariWindow />
                  </motion.div>
                  <motion.div 
                    className="absolute top-4 right-4 opacity-50 text-amber-300"
                    style={{ x: useTransform(patternX, [0, 20], [0, -5]) }}
                  >
                    <NepalPatterns.KhukuriIcon />
                  </motion.div>
                </>
              )}
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{data.name}</h2>
                  <p className={`text-sm ${theme.accent} mb-2`}>{data.title}</p>
                  {data.company && (
                    <p className={`text-xs ${theme.accent}`}>{data.company}</p>
                  )}
                </div>
                {(data.profileImage || data.companyLogo) && (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                    {data.profileImage ? (
                      <>
                        <img 
                          src={data.profileImage} 
                          alt={data.name}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Profile image loaded:', data.profileImage)}
                          onError={(e) => {
                            console.error('❌ Profile image failed to load:', data.profileImage, e)
                            console.log('🔍 Trying to access:', `${window.location.origin}${data.profileImage}`)
                          }}
                        />
                        {/* Debug overlay */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded opacity-75">
                            IMG
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {data.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bio */}
              {data.bio && (
                <div className="flex-1 flex items-center">
                  <p className={`text-xs ${theme.accent} line-clamp-3`}>{data.bio}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className={`text-xs ${theme.accent}`}>
                  {data.email}
                </div>
                <div className={`text-xs ${theme.accent}`}>
                  Tap to flip
                </div>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div 
            className={`absolute inset-0 backface-hidden shadow-2xl p-6 ${theme.back} ${theme.text} rotate-y-180`}
            style={cardStyle}
          >
            <div className="flex flex-col h-full relative z-10">
              {/* Animated mesh gradient background for certain themes */}
              {data.theme === 'holographic' && (
                <div className="absolute inset-0 opacity-30 animated-mesh-gradient rounded-xl" />
              )}
              
              {/* Nepal Heritage Cultural Patterns - Back Side */}
              {data.theme === 'nepal-heritage' && (
                <div className="absolute inset-0 opacity-8 text-yellow-400">
                  <NepalPatterns.DhakaPattern />
                </div>
              )}
              
              {data.theme === 'dhaka-pattern' && (
                <div className="absolute inset-0 opacity-12 text-yellow-300">
                  <NepalPatterns.DhakaPattern />
                </div>
              )}
              
              {data.theme === 'himalayan' && (
                <div className="absolute bottom-0 left-0 right-0 opacity-15 text-white">
                  <NepalPatterns.HimalayanSilhouette />
                </div>
              )}
              
              {data.theme === 'newari-copper' && (
                <div className="absolute inset-0 opacity-15">
                  <NepalPatterns.CopperTexture />
                </div>
              )}
              
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold mb-1">Contact Me</h3>
                <p className={`text-xs ${theme.accent}`}>Connect & Save Contact</p>
              </div>

              {/* Contact Info & QR Code */}
              <div className="flex-1 flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  {/* Email */}
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">{data.email}</span>
                  </div>

                  {/* Multiple Phone Numbers */}
                  {data.phoneNumbers?.ncell && (
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">{data.phoneNumbers.ncell} (Ncell)</span>
                    </div>
                  )}
                  {data.phoneNumbers?.ntc && (
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs">{data.phoneNumbers.ntc} (NTC)</span>
                    </div>
                  )}
                  {data.phone && !data.phoneNumbers?.ncell && !data.phoneNumbers?.ntc && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">{data.phone}</span>
                    </div>
                  )}

                  {/* Location with Landmark */}
                  {data.landmark && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openGoogleMaps()
                        }}
                        className="text-xs hover:underline cursor-pointer"
                      >
                        {data.landmark}
                      </button>
                    </div>
                  )}

                  {/* Payment Section */}
                  {data.paymentQR && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowPaymentDialog(true)
                        }}
                        className="text-xs hover:underline cursor-pointer"
                      >
                        Scan to Pay
                      </button>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex space-x-2">
                    {data.socialLinks.linkedin && (
                      <a 
                        href={data.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-white/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {data.socialLinks.github && (
                      <a 
                        href={data.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-white/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {data.socialLinks.twitter && (
                      <a 
                        href={data.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-white/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="ml-4">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code"
                      className="w-16 h-16 rounded"
                    />
                    <p className={`text-xs text-center mt-1 ${theme.accent}`}>Scan me</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      generateVCard()
                    }}
                    className="flex-1 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Save Contact
                  </Button>
                  {publicUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyLink()
                      }}
                      className="flex-1 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Premium Actions */}
      {showCustomization && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomPanel(!showCustomPanel)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Customize</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsImage('png')}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <FileImage className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsImage('pdf')}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      )}

      {/* Customization Panel */}
      {showCustomPanel && showCustomization && (
        <Card className="mt-4 w-full max-w-md mx-auto">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Customize Card</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomPanel(false)}
              >
                ×
              </Button>
            </div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select
                value={data.theme}
                onValueChange={(value) => onDataChange?.({ ...data, theme: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(premiumThemes).map(([key, theme]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{theme.name}</span>
                        {theme.premium && <Badge variant="secondary" className="text-xs">Premium</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Border Radius: {customization.borderRadius}px</label>
              <Slider
                value={[customization.borderRadius]}
                onValueChange={([value]) => updateCustomization('borderRadius', value)}
                max={24}
                min={0}
                step={1}
              />
            </div>

            {/* Blur Intensity (for glassmorphism) */}
            {data.theme.includes('glass') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Blur Intensity: {customization.blurIntensity}px</label>
                <Slider
                  value={[customization.blurIntensity]}
                  onValueChange={([value]) => updateCustomization('blurIntensity', value)}
                  max={40}
                  min={0}
                  step={1}
                />
              </div>
            )}

            {/* Font Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Family</label>
              <Select
                value={customization.fontFamily}
                onValueChange={(value) => updateCustomization('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Accent Color</label>
              <input
                type="color"
                value={customization.accentColor}
                onChange={(e) => updateCustomization('accentColor', e.target.value)}
                className="w-full h-10 rounded border"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
          position: relative;
          overflow: visible;
        }
        .preserve-3d {
          transform-style: preserve-3d;
          transform-origin: center center;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-origin: center center;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        /* Ensure proper 3D layering */
        .preserve-3d {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        
        /* Prevent container expansion */
        .perspective-1000 {
          height: 12rem; /* 48 in Tailwind = 12rem */
          width: 20rem;   /* 80 in Tailwind = 20rem */
        }
        .metallic-shimmer {
          position: relative;
          overflow: hidden;
        }
        .metallic-shimmer::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s infinite;
          pointer-events: none;
        }
        .holographic-overlay {
          position: relative;
          overflow: hidden;
        }
        .holographic-overlay::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: holographic 4s infinite;
          pointer-events: none;
        }
        .animated-mesh-gradient {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        @keyframes holographic {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Nepal Heritage Styles */
        .nepal-flag-pattern {
          position: relative;
          overflow: hidden;
        }
        .nepal-flag-pattern::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-left: 40px solid transparent;
          border-right: 40px solid #003893;
          border-bottom: 40px solid #DC143C;
          opacity: 0.3;
          pointer-events: none;
        }
        
        .dhaka-overlay {
          position: relative;
          overflow: hidden;
        }
        .dhaka-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 215, 0, 0.1) 10px,
            rgba(255, 215, 0, 0.1) 20px
          );
          animation: dhaka-shift 8s linear infinite;
          pointer-events: none;
        }
        
        .himalayan-silhouette {
          position: relative;
          overflow: hidden;
        }
        .himalayan-silhouette::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, rgba(255,255,255,0.1), transparent);
          clip-path: polygon(0% 100%, 15% 60%, 25% 40%, 35% 65%, 50% 20%, 65% 45%, 75% 30%, 85% 55%, 100% 35%, 100% 100%);
          pointer-events: none;
        }
        
        .copper-texture {
          position: relative;
          overflow: hidden;
        }
        .copper-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 25% 25%, rgba(205, 127, 50, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(184, 115, 51, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(160, 82, 45, 0.1) 0%, transparent 50%);
          animation: copper-glow 6s ease-in-out infinite alternate;
          pointer-events: none;
        }
        
        @keyframes dhaka-shift {
          0% { transform: translateX(-20px); }
          100% { transform: translateX(20px); }
        }
        
        @keyframes copper-glow {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        
        /* National Pride Border Animation */
        .national-pride-border {
          position: relative;
          overflow: hidden;
        }
        .national-pride-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #DC143C, #003893, #DC143C, #003893);
          background-size: 400% 400%;
          border-radius: inherit;
          z-index: -1;
          animation: national-pride-glow 3s ease-in-out infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .national-pride-border:hover::before {
          opacity: 0.8;
        }
        
        @keyframes national-pride-glow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Nepali Font Classes */
        .font-hind {
          font-family: 'Hind', sans-serif;
        }
        .font-mukta {
          font-family: 'Mukta', sans-serif;
        }
      `}</style>

      {/* Payment QR Dialog */}
      {showPaymentDialog && data.paymentQR && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentDialog(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Scan to Pay</h3>
            <div className="flex justify-center mb-4">
              <img 
                src={data.paymentQR} 
                alt="Payment QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Scan with Fonepay, eSewa, or your banking app
            </p>
            <button
              onClick={() => setShowPaymentDialog(false)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}