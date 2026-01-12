'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Phone, Mail, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useSession } from 'next-auth/react'

export default function PaymentSuccessCard() {
  const session = useSession()
  const router = useRouter()
  const { prescriptionFiles, selectedAddress } = useCheckoutStore()

  return (
    <div className='min-h-screen bg-white'>
      {/* ✅ Top Navbar */}
      <div className='sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-4 py-3'>
        <button
          onClick={() => router.push('/')}
          className='rounded-full bg-gray-100 p-2'
        >
          <ArrowLeft className='h-5 w-5 text-gray-700' />
        </button>
        <h2 className='text-md font-semibold'>Confirmation</h2>
      </div>

      <div className='space-y-4 p-4'>
        {/* ✅ Success Message */}
        <Card className='rounded-xl border shadow-sm'>
          <CardContent className='flex flex-col items-center gap-2 p-6 text-center'>
            <div className='h-[100px] w-[100px]'>
              <Image
                src='/images/orderSuccess.svg'
                alt='Order success'
                width={100}
                height={100}
                className='object-contain'
              />
            </div>

            <p className='mt-2 text-base font-semibold text-black'>
              Your request is placed successfully!
            </p>

            <div className='mt-2 flex items-start gap-2 text-sm text-gray-700'>
              <div className='h-[24px] w-[24px]'>
                <Image
                  src='/images/Searchicon.svg'
                  alt='Call icon'
                  width={24}
                  height={24}
                />
              </div>

              <div>
                <p>
                  Your Prescription is{' '}
                  <span className='font-semibold text-red-600'>
                    under review
                  </span>
                  .
                </p>
                <p>You’ll receive a call from</p>
                <p className='font-semibold text-black'>+91-7965189000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Prescription Image */}
        <Card className='rounded-xl border shadow-sm'>
          <CardContent className='space-y-2 p-4'>
            <p className='text-sm font-semibold text-black'>Prescription</p>
            {prescriptionFiles?.length > 0 ? (
              <div className='rounded-md border bg-gray-100 p-2 text-center'>
                <Image
                  src={prescriptionFiles[0]}
                  alt='Prescription'
                  width={400}
                  height={300}
                  className='mx-auto rounded-md'
                />
              </div>
            ) : (
              <div className='rounded-md border bg-gray-100 p-6 text-center text-sm text-gray-500'>
                No prescription uploaded.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ Delivery Address */}
        <Card className='rounded-xl border shadow-sm'>
          <CardContent className='space-y-2 p-4'>
            <p className='text-sm font-semibold text-black'>Delivery Address</p>
            <p className='font-semibold text-black'>
              {selectedAddress?.addressLine1}
            </p>
            <div className='space-y-1 text-sm text-gray-700'>
              <div className='flex items-start gap-2'>
                <MapPin className='h-4 w-4 text-[#E83538]' />
                <span>
                  {selectedAddress?.addressLine2}
                  {selectedAddress?.city}
                  {selectedAddress?.state}
                  {selectedAddress?.postalCode}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4 text-[#E83538]' />
                <span>{selectedAddress?.phoneNumber}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-[#E83538]' />
                <span>{session?.data?.user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
