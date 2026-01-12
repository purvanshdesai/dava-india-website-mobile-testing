'use client'
import React, { useState } from 'react'
import { ArrowLeft, TriangleAlert, UploadIcon, Info } from 'lucide-react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTransitionRouter } from 'next-view-transitions'
// import PrescriptionFileUpload from '@/components/Prescription/FileUpload'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import StickyFooterButton from '@/components/ui/StickyFooterButton'
import { uploadGuidelineKeys } from '@/constants'

const PrescriptionFileUpload = dynamic(
  () => import('@/components/Prescription/FileUpload'),
  {
    ssr: false
  }
)

export default function PrescriptionUpload() {
  const router = useTransitionRouter()
  const session = useSession()
  const commonTranslations = useTranslations('Common')
  const uploadGuideLines = uploadGuidelineKeys.map((key: string) =>
    commonTranslations(key)
  )
  const { setPrescriptionUrl, prescriptionFiles, currentLocation } =
    useCheckoutStore()
  const [showConsultationNotAvailable, setShowConsultationNotAvailable] =
    useState<boolean>(false)

  const isLoggedIn = session.status === 'authenticated'

  const handleContinue = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (!currentLocation?.isDeliverable) {
      setShowConsultationNotAvailable(true)
      return
    }
    router.push('/prescription/address')
  }

  const onFileUpload = (files: any) => {
    setPrescriptionUrl(files)
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <div className='m-6 w-full space-y-4 lg:w-11/12'>
        <Link className='flex items-center gap-3' href={'/'}>
          <ArrowLeft />{' '}
          <p className='text-lg font-semibold'>
            {commonTranslations('upload_prescription')}
          </p>
        </Link>

        <div className='grid gap-6'>
          <div className='overflow-hidden rounded-md bg-white shadow'>
            <div className='flex items-center justify-between bg-[#F9F9F9] p-4'>
              <p className='text-sm font-semibold'>
                {commonTranslations('valid_prescription_guide')}
              </p>

              {/* Only one styled red circle icon (clickable) */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className='flex h-6 w-6 items-center justify-center rounded-full border border-[#E02E0F]'>
                    <Info className='h-4 w-4 text-[#E02E0F]' />
                  </button>
                </DialogTrigger>
                <DialogContent className='max-w-[330px] rounded-xl px-6 py-5'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-full border border-[#E02E0F]'>
                      <Info className='text-[#E02E0F]' />
                    </div>
                    <div className='text-base font-semibold'>Guide Lines</div>
                    <div className='space-y-2 text-left text-sm'>
                      {uploadGuideLines.map((g, idx) => (
                        <div key={idx} className='flex items-start gap-2'>
                          <span className='text-lg leading-none text-red-500'>
                            •
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {g}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className='flex items-center gap-2 p-4'>
              <TriangleAlert className='text-yellow-500' />
              <p className='text-xs text-red-600'>
                {commonTranslations('uploaded_prescription_info')}
              </p>
            </div>

            <div className='grid grid-cols-[2fr_1fr] gap-1 px-4'>
              <div>
                <Image
                  src={'/images/Prescription/SamplePrescription.png'}
                  alt='Davainda Logo'
                  width={678}
                  height={737}
                  layout='responsive'
                />
              </div>
            </div>
          </div>

          <div className='overflow-hidden rounded-md bg-white shadow'>
            <div className='bg-[#F9F9F9] p-4'>
              <p className='text-sm font-semibold'>
                {commonTranslations('attach_prescription')}
              </p>
            </div>

            <div className='px-4 pt-4'>
              <div className='space-y-4'>
                <p className='text-xs text-label'>
                  {commonTranslations('upload_valid_prescription')}
                </p>

                <div>
                  <PrescriptionFileUpload
                    renderButton={(openFilePicker, isLoading) => (
                      <Button
                        onClick={() => {
                          if (currentLocation?.isDeliverable) openFilePicker()
                          else setShowConsultationNotAvailable(true)
                        }}
                        // disabled={isDisabled}
                        color='#008080'
                        className='w-full gap-3 bg-primary-teal font-semibold'
                      >
                        <UploadIcon
                          className={isLoading ? 'animate-bounce' : ''}
                        />
                        {isLoading
                          ? 'Uploading...'
                          : commonTranslations('upload_prescription')}
                      </Button>
                    )}
                    onFileUpload={onFileUpload}
                    isLoggedIn={isLoggedIn}
                  />
                </div>

                {/* <div>
                  <Button
                    color='#008080'
                    className='w-full gap-3 font-semibold text-primary-teal'
                    variant={'outline'}
                  >
                    <FileTextIcon />
                    Past Prescription
                  </Button>
                </div> */}
              </div>

              <div className='py-6'>
                <Separator></Separator>
              </div>

              <div className='py-6'>
                <StickyFooterButton
                  disabled={!prescriptionFiles?.length}
                  onClick={handleContinue}
                />

                <span className='flex items-center justify-center pt-3 text-xs text-red-600'>
                  {commonTranslations('upload_prescription_to_proceed')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location not deliverable popup */}
      <div>
        <Dialog
          open={showConsultationNotAvailable}
          onOpenChange={setShowConsultationNotAvailable}
        >
          <DialogContent className='sm:max-w-[700px]'>
            <div className='flex w-full justify-center'>
              {/* Zip code is not deliverable */}
              <div
                className={'flex flex-col items-center justify-between gap-3'}
              >
                <div className='flex justify-center'>
                  <Image
                    width={222}
                    height={170}
                    alt=''
                    src={'/images/DoctorConsultation.svg'}
                  />
                </div>
                <div className={'pb-3 font-bold'}>
                  We're coming to your location soon. Stay tuned for updates
                </div>
                <div>
                  <DialogClose asChild>
                    <Button className={'flex h-12 w-48 items-center'}>
                      OK
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
