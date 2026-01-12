import { consultationStatusMeaning, consultationTypeMeaning } from '@/constants'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function ConsultationItem({ consultation }: any) {
  const router = useRouter()

  return (
    <div
      className='border-t border-t-[#DCDCDC] p-4'
      onClick={() => {
        router.push(`/consultations/${consultation?._id}`)
      }}
    >
      <div className='flex justify-between'>
        <div className='flex gap-2'>
          <Image
            src={
              consultation?.ticketType == 'doctorConsultation'
                ? '/images/DoctorConsultation.svg'
                : '/images/prescription.png'
            }
            alt=''
            width={56}
            height={56}
          />
          <div>
            <p className='text-sm font-bold capitalize'>
              Appointment No:{consultation?.appointmentId}
            </p>
            <p className='text-sm'>
              {consultationTypeMeaning[consultation?.ticketType]}
            </p>
            <p className='text-sm font-bold capitalize'>
              {consultationStatusMeaning[consultation?.status]}
            </p>
          </div>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <ChevronRight />
        </div>
      </div>
    </div>
  )
}
