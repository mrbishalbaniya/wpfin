import { notFound } from 'next/navigation'
import { debtLoanAPI } from '@/lib/debt-loan-api'
import SharePageContent from '@/components/share/SharePageContent'

interface SharePageProps {
  params: {
    token: string
  }
}

async function getShareData(token: string) {
  try {
    const data = await debtLoanAPI.getShareData(token)
    
    // Serialize dates to ISO strings
    const serializedData = {
      ...data,
      transactions: data.transactions.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date).toISOString(),
        created_at: new Date(transaction.created_at).toISOString(),
        updated_at: new Date(transaction.updated_at).toISOString()
      })),
      created_at: new Date(data.created_at).toISOString(),
      expires_at: new Date(data.expires_at).toISOString()
    }
    
    return serializedData
  } catch (error) {
    return null
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const shareData = await getShareData(params.token)
  
  if (!shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h1>
            <p className="text-gray-600 mb-6">
              This share link is either invalid or has expired. Please request a new link from the person who shared it with you.
            </p>
            <div className="text-sm text-gray-500">
              Share links expire after 30 days for security reasons.
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return <SharePageContent shareData={shareData} />
}

export async function generateMetadata({ params }: SharePageProps) {
  const shareData = await getShareData(params.token)
  
  if (!shareData) {
    return {
      title: 'Invalid Share Link - FinTrack',
      description: 'This share link is invalid or expired.'
    }
  }
  
  return {
    title: `Transaction History with ${shareData.owner_name} - FinTrack`,
    description: `View your transaction history and balance with ${shareData.owner_name}`,
    robots: 'noindex, nofollow' // Prevent search engine indexing
  }
}