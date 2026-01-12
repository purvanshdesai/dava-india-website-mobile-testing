'use client'

import { useParams, useRouter } from 'next/navigation'
import { useFetchPolicies } from '@/utils/hooks/policiesHooks'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function PoliciesPage() {
  const params = useParams() as any
  const router = useRouter()
  const searchParams = useSearchParams()

  // Map slugs (from URL) to real DB policy names
  const policyMap: Record<string, string> = {
    privacy_policy: 'privacy_policy',
    terms_conditions: 'terms_and_conditions',
    grievance_redressal: 'grevience_readdressal',
    shipping_delivery: 'shipping_and_delivery_policy',
    return_refund: 'return_refund',
    ip_policy: 'ip_policy'
  }

  const policyName = policyMap[params?.policy] ?? ''

  const {
    data: policyData,
    isLoading,
    error
  } = useFetchPolicies({
    policy: policyName
  })

  if (isLoading) {
    return <p className='text-muted-foreground p-6'>Loading policy...</p>
  }

  if (error) {
    return (
      <div className='p-6 text-red-500'>
        Failed to load policy. Please try again later.
      </div>
    )
  }

  if (!policyData) {
    return <div className='text-muted-foreground p-6'>No policy found.</div>
  }

  return (
    <div className='p-2'>
      <header className='fixed left-0 right-0 top-0 z-50 flex items-center bg-white px-4 py-3 shadow'>
        <button
          onClick={() => router.back()}
          aria-label='Go back'
          className='mr-3 rounded-full p-2 transition hover:bg-gray-200'
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className='text-xl font-bold'>
          {searchParams.get('policy') ?? ''}
        </h1>
      </header>
      {/* Render the latest policy HTML content */}
      <div
        className='prose mt-16 max-w-none rounded-md bg-white p-2.5'
        dangerouslySetInnerHTML={{ __html: policyData }}
      />
    </div>
  )
}
