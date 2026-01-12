'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import usePatientsStore from '@/store/userPatientStore'
import { ArrowLeft, Circle, CircleCheck } from 'lucide-react'
import StickyFooterButton from '@/components/ui/StickyFooterButton'

export default function SelectPatientPage() {
  const router = useRouter()
  const { patients } = usePatientsStore(state => state)
  const [selected, setSelected] = useState('')

  return (
    <div className='relative min-h-screen bg-white pb-24'>
      {/* ✅ Top Banner */}
      <div className='flex items-center justify-start border-b bg-white px-4 py-3'>
        <button
          onClick={() => router.back()}
          className='rounded-full bg-gray-100 p-2'
        >
          <ArrowLeft className='h-5 w-5 text-gray-700' />
        </button>
        <h2 className='text-md ml-2 font-semibold'>Select Patient</h2>
        <button
          onClick={() => router.push('/profile/patients/new')}
          className='ml-auto text-sm font-medium text-primary'
        >
          + Add Patient
        </button>
      </div>

      {/* ✅ Content */}
      <div className='pt-2'>
        {' '}
        {/* Removed px-4 for edge-to-edge */}
        <div className='space-y-2'>
          {patients.map((patient: any) => {
            const isSelected = selected === patient._id
            return (
              <div
                key={patient._id}
                onClick={() => setSelected(patient._id)}
                className={`flex cursor-pointer items-center space-x-3 border-b px-4 py-4 ${isSelected ? 'bg-[#FFECEA]' : ''}`}
              >
                {isSelected ? (
                  <CircleCheck className='text-primary' size={20} />
                ) : (
                  <Circle className='text-gray-400' size={20} />
                )}
                <p className='text-sm'>{patient.name}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ✅ Sticky Continue Button */}
      <StickyFooterButton
        label='Continue'
        disabled={!selected}
        onClick={() => router.push('/prescription/select-slot')}
      />
    </div>
  )
}
