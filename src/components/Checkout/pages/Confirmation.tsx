'use client'

import PaymentSummary from '@/components/Checkout/PaymentSummary'
import ItemsSummary from '@/components/Checkout/ItemsSummary'
import DeliveryAddressSummary from '@/components/Checkout/DeliveryAddressSummary'
import Link from 'next/link'
import { ArrowLeft, Search, SquarePen } from 'lucide-react'
import UploadPrescriptionCheckout from '@/components/UploadPrescriptionCheckout'
import DeliveryMode from '@/components/Checkout/DeliveryMode'
import { useTranslations } from 'next-intl'
import useCheckoutStore, {
  isPrescriptionStepRequired
} from '@/store/useCheckoutStore'
import usePatientsStore from '@/store/userPatientStore'
import { useEffect, useState } from 'react'
import { checkOneDayDelivery } from '@/utils/actions/cartActions'
// import TaxChange from '@/components/Notices/TaxChange'
import useUserDetailsStore from '@/store/useUserDetailsStore'
import { useSearchParams } from 'next/navigation'
import OrderSuccessCard from '../OrderSuccess'

export default function Confirmation() {
  const {
    isProceedWithItemsWithoutPrescription,
    selectedAddress,
    products,
    isOrderConfirmed,
    setDeliveryMode
  } = useCheckoutStore()
  const { patients } = usePatientsStore(state => state)
  const { patientId } = useCheckoutStore(state => state)
  const selectedPatient: any = patients.find((p: any) => p._id === patientId)
  const PrescriptionRequired = isPrescriptionStepRequired()
  const { fetchUserDetails } = useUserDetailsStore(state => state)
  const searchParams = useSearchParams()

  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)

  // Check if one-day delivery is available when component mounts
  useEffect(() => {
    const checkDeliveryAvailability = async () => {
      if (!selectedAddress || !products?.length || isCheckingDelivery) return

      setIsCheckingDelivery(true)
      try {
        const result = await checkOneDayDelivery({
          addressId: selectedAddress._id
        })

        if (!result.error && result.isOneDayDeliverable) {
          // If one-day delivery is available, automatically switch to it
          setDeliveryMode('oneDay')
        } else {
          // If not available, keep standard mode
          setDeliveryMode('standard')
        }
      } catch (error) {
        console.error('Error checking delivery availability:', error)
        // On error, keep standard mode
        setDeliveryMode('standard')
      }
    }

    checkDeliveryAvailability()
  }, [selectedAddress, products, setDeliveryMode, !isCheckingDelivery])

  // Refetch user details when confirmation page loads with success status to update Dava coin balance
  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      fetchUserDetails()
    }
  }, [searchParams, fetchUserDetails])

  const cartTranslations = useTranslations('Cart')
  return (
    <div className='relative'>
      <div className='fixed top-0 z-50 mb-2 flex w-full flex-row items-center justify-between bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <Link href={'/'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
          </Link>
          <p className='ml-2 font-semibold'>{cartTranslations('cart')}</p>
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
          {/* <div className='pb-3'>
            <TaxChange />
          </div> */}

          {/* <h1 className='pb-4 text-sm font-semibold'>
            {cartTranslations('order_confirmation')}
          </h1> */}

          <div>
            {isOrderConfirmed ? (
              <OrderSuccessCard />
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]'>
                <div className='space-y-4'>
                  <DeliveryAddressSummary />
                  <ItemsSummary />
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
                  {isPrescriptionStepRequired() &&
                  !isProceedWithItemsWithoutPrescription ? (
                    <UploadPrescriptionCheckout />
                  ) : null}
                </div>

                <div>
                  <DeliveryMode />
                </div>

                <div className='space-y-4'>
                  <PaymentSummary nextPath='/checkout/payment' />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
