'use client'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Edit3Icon, IndianRupeeIcon } from 'lucide-react'
import Image from 'next/image'

import useCheckoutStore, { getCheckoutProducts } from '@/store/useCheckoutStore'
import dayjs from 'dayjs'
import { Link } from 'next-view-transitions'
import { useEffect, useState } from 'react'

import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
import { useTransitionRouter } from 'next-view-transitions'
// import DavaOneMembershipOption from './DavaOneMembershipOption'

export default function ItemsSummary() {
  const router = useTransitionRouter()
  const {
    products: cartProducts,
    isOrderConfirmed,
    confirmedOrder,
    discountAmount,
    appliedCouponData
  } = useCheckoutStore(state => state)
  const [products, setProducts] = useState<Array<any>>([])
  const cart = useTranslations('Cart')
  const productTranslation = useTranslations('Product')

  useEffect(() => {
    setProducts(getCheckoutProducts() ?? [])
  }, [cartProducts])

  const maxDays: any = products
    .map(product => product.deliveryDate)
    .reduce((max: any, current: any) => (current > max ? current : max), 0)

  return (
    <div className='space-y-4'>
      <Card className='dark:bg-gray-900'>
        <CardHeader className='rounded-t-lg bg-gray-50 p-3 dark:bg-gray-700'>
          <CardTitle className='flex items-center justify-between text-sm font-semibold'>
            <span>
              {cart('order')}
              {isOrderConfirmed && (
                <span className='font-bold'>#{confirmedOrder?.orderId}</span>
              )}
            </span>
            {!isOrderConfirmed && (
              <Link href={'/checkout/cart'}>
                <Edit3Icon size={20} className='cursor-pointer' />
              </Link>
            )}
          </CardTitle>
          <CardDescription>
            {isOrderConfirmed ? (
              <span>
                {dayjs(confirmedOrder?.createdAt ?? new Date()).format(
                  'DD MMMM YYYY [at] hh:mm A'
                )}
              </span>
            ) : (
              <span>
                {products.length &&
                  dayjs().add(maxDays, 'days').format('DD MMMM YYYY')}
              </span>
            )}

            {discountAmount > 0 && (
              <div className='space-y-1 pt-3 text-xs text-black'>
                <p>
                  Coupon <strong>{appliedCouponData.couponName}</strong> applied
                </p>
                <p>
                  You <strong>Saved ₹{discountAmount}</strong> on this order.
                </p>
              </div>
            )}
          </CardDescription>
        </CardHeader>

        {products.map((product: any, idx) => {
          return (
            <div className='w-full' key={idx}>
              <div>
                <div className='relative grid grid-cols-[100px_1fr] items-center gap-4 p-3'>
                  <div
                    style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px'
                    }}
                    className='overflow-hidden rounded-md'
                    onClick={() =>
                      router.push(`/products/${product?.seo?.url}`)
                    }
                  >
                    <Image
                      src={product?.thumbnail}
                      alt={product?.title}
                      fill
                      priority={false}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className='space-y-2'>
                    <div className='space-y-2'>
                      <div className='space-y-1'>
                        <div className='grid grid-cols-[1fr_20px] gap-3'>
                          <h1 className='line-clamp-2 text-sm font-semibold'>
                            {product?.title}
                          </h1>
                        </div>
                      </div>

                      {product?.isNotDeliverable ? (
                        <p className='text-xs text-red-600'>
                          {cart('not_available_for_this_location')}
                          {product?.note && <p>{product?.note}</p>}
                        </p>
                      ) : product?.isNotDeliverable ? (
                        <p className='text-xs text-red-600'>
                          {cart('out_of_stock')}
                        </p>
                      ) : (
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          {productTranslation('expected_delivery_date')}{' '}
                          {dayjs()
                            .add(
                              product?.deliveryTime,
                              product?.timeDurationType
                            )
                            .format('DD MMM YYYY HH:mm A')}{' '}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center text-center text-sm text-label dark:text-label-dark'>
                      {product?.quantity} Quantity
                    </div>
                    <div className={`flex gap-2 text-right text-sm`}>
                      {discountAmount > 0 && (
                        <div className='flex items-center justify-center text-right text-lg font-bold'>
                          <IndianRupeeIcon size={16} />
                          {Number(
                            product?.total - product?.discountAmount
                          ).toFixed(2)}
                        </div>
                      )}

                      <div
                        className={`flex items-center ${discountAmount > 0 ? 'line-through' : ''}`}
                      >
                        <IndianRupeeIcon size={12} />
                        {Number(product?.total).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
            </div>
          )
        })}
        {/* <div>
          <DavaOneMembershipOption />
        </div> */}
        <div className='p-2 text-xs'>
          {'*'} {cart('price_variation_based_on_batch')}
        </div>
      </Card>
    </div>
  )
}
