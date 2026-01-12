'use client'

import { useGetAllOrderTrackingStatus } from '@/utils/hooks/appDataHooks'
import { useFetchOrderTrackingById } from '@/utils/hooks/orderHooks'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { RiderLocation } from '../../../types/tracking'
import RiderInfo from './Tracking/RiderInfo'
import Timeline from './Tracking/Timeline'
import { TrackingMap } from './Tracking/TrackingMap'
import { ArrowLeft } from 'lucide-react'
import { DELIVERY_MODES } from '@/constants'

type SocketState = 'idle' | 'connecting' | 'connected' | 'disconnected'

export function TrackingPage() {
  const router = useRouter()
  const { orderId }: { orderId: string } = useParams()
  const searchParams = useSearchParams()

  const { data: trackingStatuses } = useGetAllOrderTrackingStatus()
  const [riderLocation, setRiderLocation] = useState<RiderLocation | any>(null)

  const {
    data: order,
    isLoading,
    isError,
    error: orderError
  } = useFetchOrderTrackingById({
    orderId,
    orderTrackingId: searchParams.get('orderTrackingId') ?? '',
    lastRiderStatus: riderLocation?.status ?? ''
  })

  const [, setSocketState] = useState<SocketState>('idle')
  const [error, setError] = useState<string | null>(orderError?.message ?? '')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (
      !order?.isTrackingEnabled ||
      !order.shipmentId ||
      order?.orderTrackingType !== 'order'
    ) {
      return
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket'],
      query: { shipmentId: order.shipmentId }
    })

    socketRef.current = socket
    queueMicrotask(() => setSocketState('connecting'))

    socket.on('connect', () => {
      setSocketState('connected')
    })

    socket.on('disconnect', () => {
      setSocketState('disconnected')
    })

    socket.on('rider:update', (payload: RiderLocation) => {
      console.log('🚀 ~ TrackingPage ~ payload:', payload)
      setRiderLocation(payload)
    })

    socket.on('tracking:error', (payload: { message?: string }) => {
      setError(payload?.message ?? 'Live tracking unavailable')
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [order?.shipmentId])

  if (isLoading) {
    return (
      <section className='flex h-[600px] flex-col items-center justify-center bg-white'>
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px'
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
        <div>
          <p className='text-sm'>Loading your order details…</p>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className='page-shell error'>
        <h1>Something went wrong</h1>
        <p>{error}</p>
      </section>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Order #{order?.orderId}</p>
        </div>
      </div>
      <div className='flex w-full justify-center'>
        <div className='w-full'>
          <div
            className={`grid grid-cols-1 gap-4 ${order?.orderTrackingType == 'order' ? 'md:grid-cols-[1fr_2fr]' : 'md:grid-cols-1'} `}
          >
            {order?.orderTrackingType == 'order' &&
              order?.deliverMode === DELIVERY_MODES.STANDARD && (
                <div className='mt-12'>
                  <RiderInfo
                    order={order}
                    trackingStatuses={trackingStatuses}
                    riderInfo={riderLocation}
                  />
                </div>
              )}
            <div className='pb-20'>
              {order?.orderTrackingType === 'order' &&
                order?.deliverMode === DELIVERY_MODES.ONE_DAY && (
                  <TrackingMap
                    disableLiveTracking={!order?.isTrackingEnabled}
                    storeLocation={order.store.location}
                    userLocation={order.user.location}
                    riderLocation={riderLocation}
                    route={order.route}
                    deliveryMode={order.deliverMode}
                  />
                )}

              {order?.orderTrackingType == 'order' &&
                order?.deliverMode === DELIVERY_MODES.ONE_DAY && (
                  <RiderInfo
                    order={order}
                    trackingStatuses={trackingStatuses}
                    riderInfo={riderLocation}
                  />
                )}

              {/* {order?.deliverMode === DELIVERY_MODES.STANDARD && ( */}
              <Timeline order={order} trackingStatuses={trackingStatuses} />
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
