'use client'
import { Button } from '@/components/ui/button'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useConsultationOrder } from '@/utils/hooks/orderHooks'
import { ArrowLeft, CircleCheckIcon, CircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { prescriptionConfirmationOptions } from '@/constants'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { trackPrescriptionEnquiry } from '@/analytics/trackers/appEventTracker'
import { useSession } from 'next-auth/react'

export default function PrescriptionOrder() {
  const router = useRouter()
  const { data: session } = useSession()
  const commonTranslations = useTranslations('Common')
  const [method, setMethod] = useState<string>('search')
  const orderConsultationOrder = useConsultationOrder()
  const { selectedAddress, prescriptionFiles } = useCheckoutStore()

  const handleSubmit = async () => {
    try {
      if (method == 'search') {
        router.push('/prescription/product-search')
      } else if (method == 'call') {
        await orderConsultationOrder.mutateAsync({
          issue: 'prescription-upload',
          prescription_url: prescriptionFiles,
          address: selectedAddress,
          items: []
        })

        trackPrescriptionEnquiry({
          userId: session?.user?.id ?? '',
          address: selectedAddress?.fullAddress ?? '',
          pincode: selectedAddress?.postalCode ?? '',
          prescriptionUploaded: prescriptionFiles?.join(', ')
        })

        router.push('/consultations')
      }
    } catch (error) {
      throw error
    }
  }
  return (
    <div>
      <div className='flex items-center gap-4 bg-white px-4 py-3'>
        <div
          className='flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F4F4F4]'
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
        </div>
        <div className='font-bold'>
          {commonTranslations('upload_prescription')}
        </div>
      </div>
      <div className='mt-2 flex-1 bg-[#FFFFFF]'>
        <div className='p-4'>
          <p>Select how do you want to proceed with the order.</p>
          <div className='mt-2'>
            <div className='space-y-4'>
              {prescriptionConfirmationOptions.map((o: any, idx: any) => {
                return (
                  <div
                    className='flex cursor-pointer items-center gap-5 rounded-md border p-3'
                    key={idx}
                    onClick={() => setMethod(o.type)}
                  >
                    <div>
                      {method !== o.type ? (
                        <CircleIcon size={20} className={'text-label'} />
                      ) : (
                        <CircleCheckIcon size={20} className='text-primary' />
                      )}
                    </div>

                    <div className='space-y-1'>
                      <p className='text-sm font-semibold'>
                        {commonTranslations(o.titleKey)}
                      </p>
                      <p className='text-xs text-label'>
                        {commonTranslations(o.description)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 w-full border-t border-t-[#E1E1E1] bg-white p-4'>
        <Button className='w-full' onClick={handleSubmit}>
          {method == 'search' ? 'Continue' : 'Request Callback'}
        </Button>
      </div>
    </div>
  )
}
