import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { OrderDetails, RiderLocation } from '../../../../types/tracking'
import { OrderStep } from './Timeline'
import { findDateFor, getVisibleTimeline } from './utils'
import { PhoneIcon } from 'lucide-react'
import { DELIVERY_MODES } from '@/constants'

export default function RiderInfo({
  order,
  trackingStatuses,
  riderInfo
}: {
  order: OrderDetails
  trackingStatuses: any[]
  riderInfo: RiderLocation
}) {
  const arrivalDate = useMemo(() => {
    const createdAt = order?.createdAt ? dayjs(order.createdAt) : dayjs()
    const maxDays = order?.deliverMode === 'oneDay' ? 1 : 3
    const eta = createdAt.add(maxDays, 'day')
    return eta
  }, [order])

  const visibleTimeline = useMemo(() => {
    return getVisibleTimeline(order, trackingStatuses)
  }, [order, trackingStatuses])

  const mapStatusToIndex = (code: string | undefined) => {
    if (!code) return 0
    if (['delivered'].includes(code)) return 3
    if (['dispatched', 'shipped', 'picked_up'].includes(code)) return 2
    if (['order_confirmed'].includes(code)) return 1
    if (
      ['order_received', 'order_placed', 'order_under_verification'].includes(
        code
      )
    )
      return 0
    return 0
  }

  const currentStatusCode = (visibleTimeline || []).slice(0)[0]?.statusCode
  const progressIndex = mapStatusToIndex(currentStatusCode)

  return (
    <div>
      <Card className='border-0 shadow-sm'>
        <CardHeader className='bg-gray-50'>
          <CardTitle className='flex flex-col text-lg'>
            {order?.deliverMode === DELIVERY_MODES.STANDARD ? (
              <span>
                Your order is{' '}
                {order?.status === 'delivered' ? 'Delivered' : 'On the way'}
              </span>
            ) : (
              <span>
                Your order is {riderInfo ? riderInfo?.status : 'on the way'}
              </span>
            )}
            <span className='text-sm font-normal text-gray-600'>
              Order ID: <span className='font-semibold'>#{order?.orderId}</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className=''>
          {order?.deliverMode === DELIVERY_MODES.STANDARD && (
            <div className='flex items-center justify-center py-4'>
              <div
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px'
                }}
              >
                <Image
                  src={`/images/DeliveryTruck.gif`}
                  alt={'Delivery truck'}
                  fill
                  priority={false}
                  unoptimized
                />
              </div>
            </div>
          )}

          <div>
            <div className='relative mx-auto mb-8 flex'>
              <div className='absolute left-[24px] right-[24px] top-12 flex items-center'>
                <div
                  className={`h-[2px] flex-1 ${progressIndex >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}
                ></div>
                <div
                  className={`h-[2px] flex-1 ${progressIndex >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}
                ></div>
                <div
                  className={`h-[2px] flex-1 ${progressIndex >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}
                ></div>
              </div>
              <div className='z-10 flex w-full items-center justify-between gap-2'>
                <OrderStep
                  label='Received'
                  active={progressIndex >= 0}
                  date={findDateFor(
                    [
                      'order_placed',
                      'order_under_verification',
                      'order_received'
                    ],
                    visibleTimeline
                  )}
                  imageSrc={'/images/status-received.svg'}
                  isCurrent={progressIndex === 0}
                  size={12}
                />

                <OrderStep
                  label='Confirmed'
                  active={progressIndex >= 1}
                  date={findDateFor(['order_confirmed'], visibleTimeline)}
                  imageSrc={'/images/status-confirmed.svg'}
                  isCurrent={progressIndex === 1}
                  size={12}
                />

                <OrderStep
                  label='Shipped'
                  active={progressIndex >= 2}
                  date={findDateFor(['dispatched', 'shipped'], visibleTimeline)}
                  imageSrc={'/images/status-shipped.svg'}
                  isCurrent={progressIndex === 2}
                  size={12}
                />

                <OrderStep
                  label='Delivered'
                  active={progressIndex >= 3}
                  date={findDateFor(['delivered'], visibleTimeline)}
                  imageSrc={'/images/status-delivered.svg'}
                  isCurrent={progressIndex === 3}
                  size={12}
                />
              </div>
            </div>
            {riderInfo && (
              <div className='flex items-center gap-6 rounded-md bg-gray-100 p-4'>
                <div
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px'
                  }}
                >
                  <Image
                    src={`/images/Rider.svg`}
                    alt={'Delivery truck'}
                    fill
                    priority={false}
                    unoptimized
                  />
                </div>

                <div className='space-y-1'>
                  <p className='text-base font-semibold'>{riderInfo?.name}</p>
                  <div className='flex items-center gap-1'>
                    <PhoneIcon size={14} className='text-primary-green' />
                    <p className='text-xs text-label'>{riderInfo?.phone}</p>
                  </div>
                  <p className='pt-3 text-base font-medium'>
                    {riderInfo?.status?.toLowerCase() === 'delivered'
                      ? 'Delivered'
                      : 'Heading to your address'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className='h-100 mt-6 flex w-full flex-col items-center rounded bg-gray-100 p-4'>
            <div className='text-base font-semibold'>
              {order?.status == 'delivered' ? 'Delivered' : 'Arriving'} on
            </div>
            <div className='pt-3 text-xl font-bold'>
              {order?.status == 'delivered'
                ? dayjs(order?.lastActivityDateTime).format('dddd MM, hh:mm A')
                : arrivalDate.format('DD - MMM - YYYY')}
            </div>
          </div>
          <div className='mt-6 text-center'>
            <Link
              href={`/orders/${order?._id}`}
              className='text-xs font-medium text-primary underline'
            >
              View Order Details
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
