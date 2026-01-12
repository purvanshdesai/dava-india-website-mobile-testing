'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import UserAddress from '@/components/Checkout/UserAddress'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useEffect, useState } from 'react'

export default function SelectAddressPage() {
  const cart = useTranslations('Cart')
  const router = useRouter()

  const { currentLocation } = useCheckoutStore()
  const [serviceNotAvailable, setServiceNotAvailable] = useState(false)

  useEffect(() => {
    if (currentLocation && !currentLocation.isDeliverable) {
      setServiceNotAvailable(true)
    } else {
      setServiceNotAvailable(false)
    }
  }, [currentLocation])

  const handleContinue = () => {
    if (serviceNotAvailable) return // 🔥 prevent navigation
    router.push('/prescription/select-patient')
  }

  return (
    <div className='flex min-h-screen w-full flex-col bg-white'>
      {/* ✅ Top Navbar */}
      <div className='sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-4 py-3'>
        <button
          onClick={() => router.back()}
          className='rounded-full bg-gray-100 p-2'
        >
          <ArrowLeft className='h-5 w-5 text-gray-700' />
        </button>
        <h2 className='text-md font-semibold'>Select Address</h2>
      </div>

      {/* ✅ Address Section */}
      <div className='flex w-full justify-center px-4 pb-24 pt-4'>
        <div className='w-full space-y-4 lg:w-1/2'>
          <h1 className='text-lg font-semibold'>
            {cart('select_delivery_address')}
          </h1>
          <UserAddress />
        </div>
      </div>

      {/* ✅ Sticky Continue Button */}
      <div className='fixed bottom-0 left-0 right-0 z-10 border-t bg-white p-4'>
        <Button
          className='w-full bg-[#f26321] font-semibold text-white hover:bg-[#e45717]'
          onClick={handleContinue}
          disabled={serviceNotAvailable} // 🔥 Disable button if not deliverable
        >
          Continue
        </Button>

        {serviceNotAvailable && (
          <p className='mt-2 text-center text-sm text-red-500'>
             This pincode is not serviceable. Please select another one.
          </p>
        )}
      </div>
    </div>
  )
}
