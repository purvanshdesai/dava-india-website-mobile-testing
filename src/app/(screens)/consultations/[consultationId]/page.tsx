'use client'
import { Button } from '@/components/ui/button'
import { consultationStatusMeaning } from '@/constants'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useGetConsultation } from '@/utils/hooks/consultationsHooks'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function ConsultationDetails({ params }: any) {
  const consultationId = params?.consultationId || ''
  const router = useRouter()
  const { data: consultation, isLoading } = useGetConsultation(consultationId)
  const { createConsultationOrder } = useCheckoutStore()

  const handleNavigateConsultationOrder = async () => {
    try {
      const cartItems = []
      for (const item of consultation?.medicines) {
        cartItems.push({
          ...item?.productId,
          isSelected: true,
          isConsultationItem: true,
          quantity: item?.quantity,
          consultationId: consultation?._id
        })
      }
      await createConsultationOrder(
        consultation?._id,
        cartItems,
        consultation?.prescriptionUrl
      )
      router.push('/checkout/address')
      // router.push(`/checkout/consultation/${notification?.data?.consultationId}`)
    } catch (error) {
      throw error
    }
  }

  if (isLoading) {
    return null
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
        <div className='font-bold'>Consult Details</div>
      </div>
      <div className='mt-2 flex-1 bg-[#FFFFFF]'>
        <div className='bg-[#F6F6F6] p-4'>
          Appointment No : {consultation?.appointmentId}
        </div>
        <div className='flex items-center gap-4 p-4'>
          <Image
            alt=''
            src={
              consultation?.ticketType == 'doctorConsultation'
                ? '/images/DoctorConsultation.svg'
                : '/images/prescription.png'
            }
            width={50}
            height={50}
          />
          <p>{consultationStatusMeaning[consultation?.status]}</p>
        </div>
        <div className='bg-[#F6F6F6] p-4'>
          <p className='font-bold'>Status</p>
          <div className='flex items-center gap-2'>
            <div className='h-[8px] w-[8px] rounded-full bg-[#51B22A]'></div>
            <p className='font-semibold text-[#637381]'>
              {consultationStatusMeaning[consultation?.status]}
            </p>
          </div>
        </div>
        {consultation?.medicines?.length ? (
          <div className='m-4 mb-24'>
            <div className='rounded-2xl border border-[#CCCCCC]'>
              <div className='rounded-t-2xl bg-[#F9F9F9] px-4 py-7'>
                <p className='font-semibold'>Added Items</p>
              </div>
              {consultation?.medicines?.map((item: any, index: number) => (
                <div
                  key={index}
                  className='flex gap-3.5 border-t border-[#DFE4EA] px-3 py-4'
                >
                  <Image
                    alt=''
                    src={item?.productId?.thumbnail}
                    width={88}
                    height={88}
                  />
                  <div>
                    <p className='font-semibold'>{item?.productId?.title}</p>
                    <p>{item?.quantity} Quantity</p>
                    <p className='font-semibold'>
                      Rs {item?.productId?.finalPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {consultation?.medicines?.length ? (
        <div className='fixed bottom-0 w-full border-t border-t-[#E1E1E1] bg-white p-4'>
          <Button className='w-full' onClick={handleNavigateConsultationOrder}>
            Confirm & Order
          </Button>
        </div>
      ) : null}
    </div>
  )
}
