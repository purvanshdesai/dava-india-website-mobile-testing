'use client'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import FormDialog from '../Form/FormDialog'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateMembershipOrder } from '@/utils/hooks/membershipOrderHooks'
import { ArrowLeftIcon, XIcon } from 'lucide-react'
import { davaOneMembershipAmount } from '@/constants'

const MembershipSuccess = ({ name }: any) => {
  const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center px-4'>
      <button
        className='absolute right-1 top-1 p-2'
        onClick={() => router.push('/profile/membership')}
      >
        <XIcon size={20} />
      </button>
      <div className='w-full max-w-md p-6 text-center'>
        {/* Icon and Name */}
        <div className='my-6 flex items-end justify-center gap-1'>
          <div className='relative h-16 w-12'>
            <Image
              src={'/images/membership/DavaCrown.svg'}
              alt='Membership crown'
              className=''
              fill
            />
          </div>
          <h2 className='mb-1 text-xl font-semibold'>{name}</h2>
        </div>

        {/* Membership Text */}
        <p className='mb-4 text-sm font-semibold text-gray-700'>
          Now you are a DavaOne member
        </p>
        <p className='mb-6 text-sm text-gray-600'>Enjoy more benefits now on</p>

        {/* Button */}
        <Button className='' onClick={() => router.push('/profile/membership')}>
          View Membership Page
        </Button>
      </div>

      {/* Confetti */}
      <div className='absolute bottom-1 left-7'>
        <div
          style={{
            position: 'relative',
            width: '60px',
            height: '60px'
          }}
        >
          <Image src={'/images/ConfettiLeft.svg'} alt='Confetti' fill />
        </div>
      </div>
      <div className='absolute bottom-1 right-7'>
        <div
          style={{
            position: 'relative',
            width: '60px',
            height: '60px'
          }}
        >
          <Image src={'/images/ConfettiRight.svg'} alt='Confetti' fill />
        </div>
      </div>
    </div>
  )
}

const PlanConfirmation = () => {
  const dialogRef: any = useRef(null)
  const [paymentForm, setPaymentForm] = useState('')
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  const { mutateAsync: createMembershipOrder, isPending } =
    useCreateMembershipOrder()

  useEffect(() => {
    const formData = document.getElementById('payment_post') as HTMLFormElement
    if (formData) {
      formData.submit()
    }
  }, [paymentForm])

  useEffect(() => {
    const status = searchParams?.get('status')
    if (status === 'success') setShowSuccess(true)
  }, [searchParams])

  const purchaseMembership = async () => {
    try {
      setPaymentLoading(true)
      // Create a Order
      const order = await createMembershipOrder({
        deviceType: 'mobile-web'
      })
      setPaymentForm(order?.paymentForm)
    } catch (e) {
      console.log(e)
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: paymentForm }} />
      <div className='bg-white'>
        {/* Header */}
        <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
          <div className='flex flex-row items-center justify-center'>
            <div
              className='rounded-full bg-[#F4F4F4] p-2'
              onClick={() => router.back()}
            >
              <ArrowLeftIcon color='#3C3C3C' size={20} />
            </div>
            <p className='ml-2 font-semibold'>Order Confirmation</p>
          </div>
        </div>

        {/* Content */}
        <div className='mt-12 items-start justify-between gap-4 p-6 md:flex'>
          {/* Left Section */}
          <div className='flex w-full items-center justify-between rounded-lg border bg-white p-4 md:w-3/5'>
            <div className='flex flex-col gap-2'>
              <h1 className='mb-2 flex text-sm font-medium text-[#107649]'>
                <div className='relative mb-1 h-5 w-14'>
                  <Image
                    src={'/images/membership/DavaONELogo.svg'}
                    alt='Membership crown'
                    className=''
                    fill
                  />
                </div>
                <span className='mt-[3px]'> Membership</span>
              </h1>
              <div className='flex w-full items-center gap-2'>
                <div
                  style={{
                    position: 'relative',
                    width: '45px',
                    height: '45px'
                  }}
                >
                  <Image src={'/images/membership/Flat.svg'} alt='Flat' fill />
                </div>

                <p className='text-sm'>You are purchasing davaone membership</p>
              </div>
            </div>
            <p className='text-sm font-semibold text-gray-800'>
              ₹{davaOneMembershipAmount}
            </p>
          </div>

          {/* Right Section */}
          <div className='mt-6 w-full md:mt-0 md:w-2/5'>
            <div className='rounded-lg border bg-white'>
              <h3 className='mb-4 rounded-t-lg bg-[#F9F9F9] p-4 text-base font-semibold text-gray-800'>
                Payment Summary
              </h3>
              <div className='my-4 flex flex-col gap-2'>
                <div className='flex justify-between px-4 text-sm text-gray-600'>
                  <p>MRP Total</p>
                  <p>₹{davaOneMembershipAmount}</p>
                </div>
                <div className='mt-2 flex justify-between px-4 text-sm font-semibold text-gray-800'>
                  <p>Total Payable</p>
                  <p>₹{davaOneMembershipAmount}</p>
                </div>
                <div className='px-4 pt-4'>
                  <Button
                    className='w-full'
                    onClick={() => purchaseMembership()}
                    disabled={isPending || paymentLoading}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='p-3'>
          <FormDialog
            trigger={
              <Button className='invisible w-full' ref={dialogRef}>
                Proceed
              </Button>
            }
            title='Congratulations'
            content={<MembershipSuccess name={'Sarath'} />}
            footerActions={null}
            open={showSuccess}
            onOpenChange={setShowSuccess}
          />
        </div>
      </div>
    </>
  )
}

export default PlanConfirmation
