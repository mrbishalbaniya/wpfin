import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicVisitingCard from '@/components/PublicVisitingCard'
import { visitingCardAPI } from '@/lib/visiting-card-api'

interface Props {
  params: { username: string }
}

// Generate metadata for social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const cardData = await visitingCardAPI.getPublicCard(params.username)
    
    if (!cardData) {
      return {
        title: 'Visiting Card Not Found',
        description: 'The requested visiting card could not be found.'
      }
    }

    const title = `${cardData.name} - Digital Visiting Card`
    const description = cardData.bio || `Connect with ${cardData.name}${cardData.title ? `, ${cardData.title}` : ''}${cardData.company ? ` at ${cardData.company}` : ''}`
    const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/vcard/${params.username}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: cardUrl,
        siteName: 'Finance Tracker - Digital Visiting Cards',
        images: cardData.profileImage ? [
          {
            url: cardData.profileImage,
            width: 400,
            height: 400,
            alt: `${cardData.name}'s profile picture`
          }
        ] : [],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: cardData.profileImage ? [cardData.profileImage] : [],
      },
      alternates: {
        canonical: cardUrl,
      },
      other: {
        'profile:first_name': cardData.name.split(' ')[0] || '',
        'profile:last_name': cardData.name.split(' ').slice(1).join(' ') || '',
        'profile:username': params.username,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Digital Visiting Card',
      description: 'Professional digital business card'
    }
  }
}

export default async function PublicVisitingCardPage({ params }: Props) {
  try {
    console.log('Loading public visiting card for:', params.username)
    const cardData = await visitingCardAPI.getPublicCard(params.username)
    
    if (!cardData) {
      console.log('No card data found for:', params.username)
      notFound()
    }

    console.log('Card data loaded:', cardData)
    return <PublicVisitingCard cardData={cardData} />
  } catch (error) {
    console.error('Error loading visiting card:', error)
    notFound()
  }
}