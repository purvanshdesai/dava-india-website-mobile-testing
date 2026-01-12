'use client'
import React, { useState } from 'react'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Patient } from '../utils/icons'
import AlertBox from '../AlertBox'
import { deleteUserPatient } from '@/utils/actions/patientsActions'
import usePatientsStore from '@/store/userPatientStore'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

export default function PatientTable() {
  const router = useRouter()
  const { patients, fetchPatients } = usePatientsStore(state => state)
  const [open, setOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState('')

  const handleDeletePatient = (patientId: string) => {
    try {
      setPatientToDelete(patientId)
      setOpen(true)
    } catch (error) {
      console.log(error)
    }
  }

  const onContinue = async () => {
    try {
      await deleteUserPatient(patientToDelete)
      fetchPatients()
    } catch (error) {
      console.log(error)
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth)
    const now = new Date()

    let age = now.getFullYear() - dob.getFullYear()
    const hasHadBirthdayThisYear =
      now.getMonth() > dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())

    if (!hasHadBirthdayThisYear) {
      age--
    }

    return age
  }

  return (
    <div className='w-full rounded-lg bg-white p-6'>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Patients</p>
        </div>
      </div>
      <div className='mb-4 mt-12 flex w-full items-center justify-between gap-4'>
        <div className='flex w-full items-center gap-2'>
          <input
            type='text'
            placeholder='Search'
            className='w-full rounded-lg border p-2 px-4'
          />
        </div>
        <Button onClick={() => router.push('/profile/patients/new')}>
          Add
        </Button>
      </div>

      {patients?.length > 0 && (
        <div className='space-y-4'>
          {patients.map((patient: any, index: number) => (
            <div
              key={index}
              className='flex items-center justify-between rounded-lg bg-white p-4 shadow'
            >
              <div className='flex items-center'>
                <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-400 font-bold text-white'>
                  {Patient}
                </div>
                <div>
                  <div className='text-xs font-semibold'>{patient?.name}</div>
                  <div className='text-xs text-gray-600'>
                    Age :{' '}
                    {patient?.dateOfBirth
                      ? calculateAge(patient.dateOfBirth)
                      : '—'}
                    , Gender : {patient?.gender}
                  </div>
                  <div className='text-xs text-gray-600'>
                    Relation : {patient?.relation}
                  </div>
                </div>
              </div>
              <div className='flex space-x-4'>
                <Trash2
                  size={16}
                  className='cursor-pointer text-gray-500 hover:text-red-600'
                  onClick={() => handleDeletePatient(patient?._id)}
                />
                <Pencil
                  size={16}
                  className='cursor-pointer text-gray-500 hover:text-blue-600'
                  onClick={() =>
                    router.push(`/profile/patients/${patient._id}`)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertBox
        openState={[open, setOpen]}
        content={'Are you sure you want to delete this patient?'}
        onContinue={onContinue}
      />
    </div>
  )
}
