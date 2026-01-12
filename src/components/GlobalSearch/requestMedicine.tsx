'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
interface MedicineRequestCardProps {
  medicineName: string
}

export default function MedicineRequestCard({
  medicineName
}: MedicineRequestCardProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const handleDialogOpen = () => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    router.push(`/search/medicine-request?medicineName=${medicineName}`)
  }

  return (
    <>
      {/* ✅ Compact Responsive Card */}
      <div className='flex w-full max-w-[90%] flex-col items-center gap-3 rounded-lg bg-white p-3 shadow-sm sm:w-[80%] sm:flex-row sm:gap-4 sm:p-4 md:w-[50%]'>
        <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-gray-100'>
          <img
            src='/images/request-medicine.svg'
            alt='Medicine'
            className='h-full w-full object-contain'
          />
        </div>

        <div className='flex flex-col items-center gap-2 text-center sm:items-start sm:text-left'>
          <h3 className='text-sm font-semibold text-gray-900'>
            {medicineName}
          </h3>
          <p className='max-w-md text-[11px] leading-snug text-gray-600'>
            This medicine is not part of our current product catalog. 
            You may place a request for it and our team will review it.
          </p>

          <button
            onClick={() => handleDialogOpen()}
            className='mt-1 rounded bg-[#E85D2A] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#d44f1f]'
          >
            Request Medicine
          </button>
        </div>
      </div>
    </>
  )
}
