import SharePageContent from '@/components/share/SharePageContent'

// Demo share data for testing
const demoShareData = {
  person_name: 'Demo Viewer',
  owner_name: 'John Doe',
  transactions: [
    {
      id: 1,
      title: 'Lent to Demo Viewer',
      person: 'Demo Viewer',
      amount: 5000,
      type: 'lent' as const,
      status: 'outstanding' as const,
      date: '2024-01-15T00:00:00.000Z',
      description: 'Emergency loan for medical expenses',
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'Borrowed from Demo Viewer',
      person: 'Demo Viewer',
      amount: 2000,
      type: 'borrowed' as const,
      status: 'paid' as const,
      date: '2024-01-10T00:00:00.000Z',
      description: 'Car repair payment',
      created_at: '2024-01-10T09:15:00.000Z',
      updated_at: '2024-01-25T16:45:00.000Z'
    },
    {
      id: 3,
      title: 'Lent to Demo Viewer',
      person: 'Demo Viewer',
      amount: 1500,
      type: 'lent' as const,
      status: 'outstanding' as const,
      date: '2024-01-25T00:00:00.000Z',
      description: 'Additional loan for rent',
      created_at: '2024-01-25T11:20:00.000Z',
      updated_at: '2024-01-25T11:20:00.000Z'
    }
  ],
  currency: 'NPR',
  payment_qr_code_url: undefined,
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
}

export default function DemoSharePage() {
  return <SharePageContent shareData={demoShareData} />
}

export async function generateMetadata() {
  return {
    title: 'Demo Transaction History - FinTrack',
    description: 'Demo share page showing transaction history functionality',
    robots: 'noindex, nofollow'
  }
}