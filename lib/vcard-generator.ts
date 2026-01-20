import { BusinessCardData } from '@/components/BusinessCard'

export interface VCardOptions {
  includeQR?: boolean
  includeSocialLinks?: boolean
  includeLocation?: boolean
}

export function generateVCard(data: BusinessCardData, options: VCardOptions = {}): string {
  const {
    includeQR = true,
    includeSocialLinks = true,
    includeLocation = true
  } = options

  const phoneNumbers: string[] = []
  
  // Add multiple Nepali phone numbers with carrier info
  if (data.phoneNumbers?.ncell) {
    phoneNumbers.push(`TEL;TYPE=CELL;X-CARRIER=Ncell:${data.phoneNumbers.ncell}`)
  }
  if (data.phoneNumbers?.ntc) {
    phoneNumbers.push(`TEL;TYPE=CELL;X-CARRIER=NTC:${data.phoneNumbers.ntc}`)
  }
  if (data.phoneNumbers?.landline) {
    phoneNumbers.push(`TEL;TYPE=HOME:${data.phoneNumbers.landline}`)
  }
  // Fallback to general phone if no specific numbers
  if (data.phone && phoneNumbers.length === 0) {
    phoneNumbers.push(`TEL:${data.phone}`)
  }

  // Build address with landmark
  let address = ''
  if (includeLocation && data.landmark) {
    address = `ADR:;;${data.landmark};;;;Nepal`
  }

  // Social media profiles
  const socialProfiles: string[] = []
  if (includeSocialLinks) {
    if (data.socialLinks.linkedin) {
      socialProfiles.push(`X-SOCIALPROFILE;TYPE=LinkedIn:${data.socialLinks.linkedin}`)
    }
    if (data.socialLinks.github) {
      socialProfiles.push(`X-SOCIALPROFILE;TYPE=GitHub:${data.socialLinks.github}`)
    }
    if (data.socialLinks.twitter) {
      socialProfiles.push(`X-SOCIALPROFILE;TYPE=Twitter:${data.socialLinks.twitter}`)
    }
  }

  // Build the vCard
  const vCardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    data.company ? `ORG:${data.company}` : '',
    `TITLE:${data.title}`,
    `EMAIL:${data.email}`,
    ...phoneNumbers,
    data.website ? `URL:${data.website}` : '',
    address,
    data.bio ? `NOTE:${data.bio}` : '',
    ...socialProfiles,
    data.paymentQR ? `X-PAYMENT-QR:${data.paymentQR}` : '',
    'END:VCARD'
  ]

  // Filter out empty lines
  return vCardLines.filter(line => line.trim() !== '').join('\n')
}

export function downloadVCard(data: BusinessCardData, options?: VCardOptions): void {
  const vCardContent = generateVCard(data, options)
  
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${data.name.replace(/\s+/g, '_')}.vcf`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function shareVCard(data: BusinessCardData, options?: VCardOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (navigator.share) {
      const vCardContent = generateVCard(data, options)
      const blob = new Blob([vCardContent], { type: 'text/vcard' })
      const file = new File([blob], `${data.name.replace(/\s+/g, '_')}.vcf`, { type: 'text/vcard' })
      
      navigator.share({
        title: `${data.name} - Contact Card`,
        text: `Contact information for ${data.name}`,
        files: [file]
      }).then(resolve).catch(reject)
    } else {
      // Fallback to download
      downloadVCard(data, options)
      resolve()
    }
  })
}