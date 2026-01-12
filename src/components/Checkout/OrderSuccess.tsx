'use client'
import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
// import { useTranslations } from 'next-intl'
import Link from 'next/link'
import useCheckoutStore from '@/store/useCheckoutStore'
import dayjs from 'dayjs'
import DeliveryAddressSummary from './DeliveryAddressSummary'
import ItemsSummary from './ItemsSummary'
import PaymentSummary from './PaymentSummary'

export default function OrderSuccessCard() {
  // const cart = useTranslations('Cart')
  const { confirmedOrder, deliveryMode, prescriptionFiles, checkoutCopy } =
    useCheckoutStore()

  // Get current time
  const currentHour = new Date().getHours()
  const isNightTime = currentHour >= 21 || currentHour < 9 // 9 PM to 9 AM

  const getExpectedDateOfDelivery = () => {
    if (typeof window === 'undefined') return ''

    const mode: any = JSON.parse(localStorage.getItem('deliveryMode') ?? '{}')

    if (mode.mode === 'standard') {
      return dayjs()
        .add(mode.deliveryTime, mode?.timeDurationType ?? 'days')
        .format('DD MMM YYYY')
    }

    if (mode.mode === 'oneDay')
      return dayjs().add(1, 'hour').format('DD MMM YYYY')
  }

  // Use checkoutCopy if available for prescription files
  const files =
    prescriptionFiles && prescriptionFiles.length > 0
      ? prescriptionFiles
      : checkoutCopy?.prescriptionFiles || []

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='rounded-lg bg-gray-50 p-4 dark:bg-gray-700'>
          <CardTitle className='flex flex-col items-center gap-2'>
            <div className='flex flex-col items-center justify-between text-base font-semibold'>
              <div
                style={{
                  position: 'relative',
                  width: '120px',
                  height: '120px'
                }}
              >
                <Image
                  src={`/images/OrderConfirmed.svg`}
                  alt='Footer Logo'
                  fill
                  priority={false}
                />
              </div>
              <div className='flex flex-col items-center text-center'>
                <div className='text-base md:text-lg'>
                  We've received your order!
                </div>

                <div className='text-sm font-normal text-label'>
                  Expected by {getExpectedDateOfDelivery()}
                </div>

                <div className='w-full py-3 text-center'>
                  <Link
                    href={`/orders/${confirmedOrder?._id}`}
                    className='text-sm font-semi bold text-primary underline'
                  >
                    View Order Details &gt;
                  </Link>
                </div>

                {isNightTime && deliveryMode == 'oneDay' && (
                  <div className='flex-1 text-[12px] font-normal'>
                    Same Day delivery is available for orders placed between
                    <strong> 9:00 AM and 9:00 PM</strong>, Orders placed
                    afterward will be delivered the <strong>next day</strong>.
                  </div>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <DeliveryAddressSummary />

      <Card>
        <CardHeader className='bg-gray-50 p-3'>
          <CardTitle className='text-sm font-semibold'>Delivery Mode</CardTitle>
        </CardHeader>
        <div className='p-3'>
          <div className='flex items-center gap-3'>
            <Image
              src={`/images/${deliveryMode === 'standard' ? 'StandardDelivery' : 'OneDayDelivery'}.svg`}
              alt=''
              width={30}
              height={30}
            />
            <p className='text-sm font-semibold'>
              {deliveryMode === 'oneDay' ? 'Same Day Delivery' : 'Standard Delivery'}
            </p>
          </div>
        </div>
      </Card>

      <ItemsSummary />

      {files.length > 0 && (
        <Card>
          <CardHeader className='bg-gray-50 p-3'>
            <CardTitle className='text-sm font-semibold'>
              Uploaded Prescription
            </CardTitle>
          </CardHeader>
          <div className='flex gap-2 overflow-x-auto p-3'>
            {files.map((file: string, idx: number) => (
              <div
                key={idx}
                className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border'
              >
                <Image
                  src={file}
                  alt='Prescription'
                  fill
                  className='object-cover'
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <PaymentSummary nextPath='' />
    </div>
  )
}
