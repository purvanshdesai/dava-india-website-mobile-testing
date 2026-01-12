'use client'

import RequestMedicineFileUploadComponent from '@/components/GlobalSearch/requestMedicineUpload'
import { Button } from '@/components/ui/button'
import { useCreateRequestMedicine } from '@/utils/hooks/medicineRequestsHooks'
import Image from 'next/image'
import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function MedicineRequestPage() {
  const [successOpen, setSuccessOpen] = useState(false)
  const [details, setDetails] = useState('')
  const [files, setFiles] = useState<any[]>([])
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [filesError, setFilesError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const {
    mutateAsync: submitRequestMedicine,
    isPending: loading,
    error
  } = useCreateRequestMedicine()

  const isFormComplete = details.trim() !== '' && files.length > 0

  const handleSubmit = async () => {
    let hasError = false
    if (details.trim() === '') {
      setDetailsError('Details are required')
      hasError = true
    }
    if (files.length === 0) {
      setFilesError('Please upload at least one file')
      hasError = true
    }
    if (hasError) return
    try {
      await submitRequestMedicine({
        medicineName: searchParams.get('medicineName') ?? '',
        notes: details,
        requestedDate: new Date().toISOString(),
        files
      })
      setSuccessOpen(true)
    } catch (err) {
      console.error('Failed to submit request:', err)
    }
  }

  const handleSuccessOk = () => {
    setSuccessOpen(false)
    router.push('/')
  }

  return (
    <div className='p-4'>
      <div className='relative flex flex-col items-center space-y-4'>
        <p className='text-sm font-semibold'>Request Medicine</p>

        <Image
          src='/images/request-medicine.svg'
          alt='Medicine Icon'
          width={70}
          height={70}
          className='sm:h-[80px] sm:w-[80px]'
        />

        <div className='w-full space-y-1.5'>
          <label className='text-xs font-medium text-gray-700'>
            Details of the medicine you are requesting
            <span className='ml-0.5 text-red-500'>*</span>
          </label>
          <textarea
            value={details}
            onChange={e => {
              setDetails(e.target.value)
              if (e.target.value.trim() !== '') setDetailsError(null)
            }}
            placeholder='Type here'
            className='h-[80px] w-full resize-none rounded-md border p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D2A]'
          />
          {detailsError && (
            <p className='mt-1 text-[11px] text-red-500'>{detailsError}</p>
          )}
        </div>

        <div className='w-full space-y-1.5'>
          <label className='text-xs font-medium text-gray-700'>
            Upload an Image of the medicine
            <span className='ml-0.5 text-red-500'>*</span>
          </label>
          <RequestMedicineFileUploadComponent
            onFileUpload={files => {
              setFiles(files)
              if (files && files.length > 0) setFilesError(null)
            }}
            isLoggedIn={true}
          />
          {filesError && (
            <p className='mt-1 text-[11px] text-red-500'>{filesError}</p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-3 w-full rounded-md text-xs font-medium transition-colors ${
            loading
              ? 'cursor-not-allowed bg-[#E85D2A]/50 text-white'
              : isFormComplete
                ? 'bg-[#E85D2A] text-white hover:bg-[#d44f1f]'
                : 'cursor-not-allowed bg-[#E85D2A]/40 text-white'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>

        {error && (
          <p className='mt-1 text-center text-[11px] text-red-500'>
            {error as any}
          </p>
        )}
      </div>

      {/* ✅ Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogTitle hidden></DialogTitle>
        <DialogContent className='w-[90%] max-w-[320px] rounded-2xl bg-white p-5 text-center sm:p-6'>
          <div className='mb-3 flex justify-center'>
            <div className='flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gray-100 sm:h-[70px] sm:w-[70px]'>
              <Image
                src='/images/success-icon.svg'
                alt='Success'
                width={60}
                height={60}
              />
            </div>
          </div>
          <p className='mb-5 text-[12px] leading-snug text-gray-700'>
            We appreciate you sharing your requirement and our R&D team will 
            evaluate the possibility of adding it in future.
          </p>
          <Button
            onClick={handleSuccessOk}
            className='rounded-md bg-[#E85D2A] px-5 py-1.5 text-xs font-medium text-white hover:bg-[#d44f1f]'
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
