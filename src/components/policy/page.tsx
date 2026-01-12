'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PoliciesListPage() {
  const router = useRouter()

  const policies = [
    { title: 'Terms and Conditions', href: '/policies/terms_conditions' },
    { title: 'Privacy Policy', href: '/policies/privacy_policy' },
    {
      title: 'Grievance Redressal Policy',
      href: '/policies/grievance_redressal'
    },
    {
      title: 'Shipping and Delivery Policy',
      href: '/policies/shipping_delivery'
    },
    {
      title: 'Return, Refund and Cancellation Policy',
      href: '/policies/return_refund'
    },
    { title: 'IP Policy', href: '/policies/ip_policy' }
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Fixed Header */}
      <header className='fixed left-0 right-0 top-0 z-50 flex items-center bg-white px-4 py-3 shadow'>
        <button
          onClick={() => router.back()}
          aria-label='Go back'
          className='mr-3 rounded-full p-2 transition hover:bg-gray-200'
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className='text-xl font-bold'>Policies</h1>
      </header>

      {/* Content with top padding */}
      <main className='mt-16 px-4 pt-3'>
        <nav aria-label='Policies List' className='rounded bg-white shadow'>
          <ul>
            {policies.map((policy, index) => (
              <li key={index} className='border-b last:border-b-0'>
                <Link
                  href={`${policy.href}?policy=${policy.title}`}
                  className='flex items-center justify-between px-4 py-4 transition hover:bg-gray-100'
                >
                  <span>{policy.title}</span>
                  <ChevronRight size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}
