// import type { Metadata } from 'next'
'use client'
import PaymentSummary from '@/components/Checkout/PaymentSummary'
import UserAddress from '@/components/Checkout/UserAddress'
import DeliveryEstimates from '@/components/Checkout/DeliveryEstimates'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, Search, SquarePen } from 'lucide-react'
import usePatientsStore from '@/store/userPatientStore'
import useCheckoutStore, {
  isPrescriptionStepRequired
} from '@/store/useCheckoutStore'
// import DeliveryMode from '@/components/Checkout/DeliveryMode'

// export const metadata: Metadata = {
//   title: 'Dava India | My Address',
//   description: 'Dava India Ecommerce app'
// }

export default function MyAddress() {
  const cart = useTranslations('Cart')
  const { patients } = usePatientsStore(state => state)
  const { patientId } = useCheckoutStore(state => state)
  const selectedPatient: any = patients.find((p: any) => p._id === patientId)
  const PrescriptionRequired = isPrescriptionStepRequired()

  //  const router = useRouter()
  return (
    <div className='relative'>
      <div className='fixed top-0 mb-2 flex w-full flex-row items-center justify-between bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <Link href={'/'}>
            <div
              className='rounded-full bg-[#F4F4F4] p-2'
              // onClick={() => router.back()}
            >
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
          </Link>
          <p className='ml-2 font-semibold'>Cart</p>
        </div>

        <div className='flex flex-row items-center justify-center'>
          <Link href={'/search'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <Search color='#3C3C3C' size={20} />
            </div>
          </Link>
        </div>
      </div>
      <div className='mt-12 flex w-full justify-center p-4 pb-6 md:px-6'>
        <div className='w-full lg:w-3/4'>
          <h1 className='pb-4 text-sm font-semibold'>
            {cart('select_delivery_address')}
          </h1>

          <div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]'>
              <div>
                <UserAddress />
                {PrescriptionRequired && patientId && patients.length && (
                  <div className='mx-auto mt-4 w-full overflow-hidden rounded-xl border bg-white shadow-sm'>
                    {/* Header */}
                    <div className='flex items-center justify-between bg-gray-50 px-4 py-2'>
                      <span className='text-sm font-semibold text-gray-900'>
                        Patient
                      </span>
                      <Link href={'/checkout/cart'}>
                        <button className='rounded p-1 hover:bg-gray-100'>
                          <SquarePen size={18} />
                        </button>
                      </Link>
                    </div>

                    {/* Content */}
                    <div className='px-4 py-3'>
                      <p className='text-sm text-gray-800'>
                        {selectedPatient?.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <DeliveryEstimates />
                {/* <DeliveryMode></DeliveryMode>  */}
                <PaymentSummary nextPath='/checkout/confirmation' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
