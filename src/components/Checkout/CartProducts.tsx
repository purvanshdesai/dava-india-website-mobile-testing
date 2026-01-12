'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import {
  IndianRupeeIcon,
  MinusIcon,
  PlusIcon,
  Trash2Icon,
  // ShoppingBagIcon,
  CircleCheckIcon,
  CircleIcon,
  Plus
} from 'lucide-react'
import { Link } from 'next-view-transitions'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import dayjs from 'dayjs'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import TranslationHandler from '../utils/TranslationHandler'
import { useRouter } from 'next/navigation'
import { trackProductRemovedFromCart } from '@/analytics/trackers/productTracker'
import { useSession } from 'next-auth/react'

export default function CartProducts() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const {
    addOrUpdateProduct,
    removeProduct,
    resetBuyNow,
    products,
    setProductSelectionOnCart,
    deliveryMode
  } = useCheckoutStore(state => state)
  const cart = useTranslations('Cart')
  const productTranslation = useTranslations('Product')

  // Reset BuyNow State
  useEffect(() => {
    resetBuyNow()
  }, [])

  const totalSelected = () => {
    return products?.filter(p => p.isSelected)?.length
  }

  const handleRemoveProduct = (product: any) => {
    removeProduct(product?._id)

    trackProductRemovedFromCart({
      productName: product?.title,
      productSku: product?.sku,
      userId: session?.user?.id ?? '',
      quantity: product?.quantity,
      category: (product?.collections ?? [])?.map((p: any) => p.name).join(', ')
    })
  }

  const handleSelectAllProducts = () => {
    if (totalSelected() === products?.length) {
      setProductSelectionOnCart(
        products.map(p => ({ ...p, isSelected: false }))
      )
    } else {
      setProductSelectionOnCart(products.map(p => ({ ...p, isSelected: true })))
    }
  }

  const handleSelectAProduct = (product: any) => {
    setProductSelectionOnCart([{ ...product, isSelected: !product.isSelected }])
  }

  const normalProducts = products.filter(p => !p.prescriptionReq)
  const prescribedProducts = products.filter(p => p.prescriptionReq)

  return (
    <div className=''>
      <Card className='rounded-none dark:bg-gray-900'>
        <CardHeader className='bg-gray-50 px-3 py-4 dark:bg-gray-700'>
          <CardTitle className='text-sm font-semibold'>
            <div className='flex items-center gap-4'>
              {totalSelected() === products.length ? (
                <CircleCheckIcon
                  onClick={() => handleSelectAllProducts()}
                  size={20}
                  className='cursor-pointer text-primary'
                />
              ) : (
                <CircleIcon
                  onClick={() => handleSelectAllProducts()}
                  size={18}
                  className='cursor-pointer text-label dark:text-label-dark'
                />
              )}

              <span className='bg-[#F9F9F9] text-sm font-semibold'>
                {totalSelected()} / {products.length} {cart('is_selected')}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        {normalProducts.map((product: any, idx: number) => {
          return (
            <div className='w-full' key={idx}>
              <div>
                <div className='relative grid grid-cols-[20px_100px_1fr] p-3'>
                  <div>
                    {product.isSelected ? (
                      <CircleCheckIcon
                        onClick={() => handleSelectAProduct(product)}
                        size={20}
                        className='cursor-pointer text-primary'
                      />
                    ) : (
                      <CircleIcon
                        onClick={() => handleSelectAProduct(product)}
                        size={18}
                        className='cursor-pointer text-label dark:text-label-dark'
                      />
                    )}
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px'
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
                  <div className='space-y-3'>
                    <div className='space-y-1'>
                      <div className='grid grid-cols-[1fr_20px] gap-3'>
                        <h1 className='line-clamp-2 text-sm font-semibold'>
                          {product?.title}
                        </h1>
                      </div>

                      <p className='line-clamp-2 text-xs text-label'>
                        <TranslationHandler
                          word={product?.description}
                          translations={product?.translations?.description}
                        />
                      </p>
                    </div>

                    <div className='flex flex-col'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-3'>
                          <div className='flex items-center text-xs font-semibold'>
                            <IndianRupeeIcon size={18} />
                            {Number(product?.total).toFixed(2)}
                          </div>

                          {product?.finalPrice !==
                            product?.maximumRetailPrice && (
                            <div className='flex items-center'>
                              <span className='flex items-center text-xs text-slate-500 line-through dark:text-slate-400'>
                                <IndianRupeeIcon size={12} />{' '}
                                {Number(
                                  product?.maximumRetailPrice *
                                    product?.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {product?.isNotDeliverable ? (
                          <p className='text-xs text-red-600'>
                            {productTranslation('product_unavailable_location')}
                          </p>
                        ) : product?.isOutOfStock ? (
                          <p className='text-xs text-red-600'>
                            {productTranslation('out_of_stock')}
                          </p>
                        ) : (
                          <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {productTranslation('expected_delivery_date')}:
                            {dayjs()
                              .add(
                                product?.deliveryTime,
                                product?.timeDurationType
                              )
                              .format('DD MMM YYYY HH:mm A')}
                          </p>
                        )}
                      </div>
                      <div className='mt-2'>
                        <p className='mb-2 text-xs font-semibold'>
                          {productTranslation('quantity')}
                        </p>
                        <div className='flex flex-row items-center justify-between'>
                          <div>
                            {!product?.isNotDeliverable &&
                              !product?.isOutOfStock && (
                                <div className='flex items-center rounded-lg border border-primary dark:border-gray-600'>
                                  <Button
                                    variant={'outline'}
                                    size={'lg'}
                                    className='border-x-1 border-y-0 border-l-0'
                                    onClick={() =>
                                      product.quantity > 1 &&
                                      addOrUpdateProduct({
                                        ...product,
                                        quantity: -1
                                      })
                                    }
                                  >
                                    <MinusIcon
                                      size={18}
                                      className='text-primary'
                                    />
                                  </Button>
                                  <span className='border-primary px-5 text-sm font-bold text-primary dark:border-slate-400'>
                                    {product?.quantity}
                                  </span>
                                  <Button
                                    variant={'outline'}
                                    size={'lg'}
                                    className='border-x-1 border-y-0 border-r-0 text-[#E75634]'
                                    onClick={async () => {
                                      const resp: any =
                                        await addOrUpdateProduct({
                                          ...product,
                                          quantity: +1
                                        })

                                      if (resp?.noEnoughQuantity) {
                                        toast({
                                          title: 'Insufficient Quantity!',
                                          description:
                                            'The requested quantity for this product is currently unavailable. Please reduce the quantity or explore similar items. Thank you for understanding!'
                                        })
                                      } else if (resp?.qtyLimitReached) {
                                        toast({
                                          title: 'Quantity Limit Reached!',
                                          description:
                                            'You can add upto 10 quantity per product'
                                        })
                                      }
                                    }}
                                  >
                                    <PlusIcon
                                      size={18}
                                      className='text-primary'
                                    />
                                  </Button>
                                </div>
                              )}
                          </div>
                          <Trash2Icon
                            onClick={() => handleRemoveProduct(product)}
                            size={20}
                            className='cursor-pointer text-red-400'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
            </div>
          )
        })}
        {prescribedProducts.length > 0 && (
          <div>
            <CardHeader className='rounded-t-lg bg-gray-50 px-3 py-4 dark:bg-gray-700'>
              <CardTitle className='text-sm font-semibold text-primary-teal'>
                {cart('medicines_needing_prescription')}
              </CardTitle>
            </CardHeader>
            {prescribedProducts.map((product: any, idx: number) => {
              return (
                <div className='w-full' key={idx}>
                  <div>
                    <div className='relative grid grid-cols-[20px_100px_1fr] p-3'>
                      <div>
                        {product.isSelected ? (
                          <CircleCheckIcon
                            onClick={() => handleSelectAProduct(product)}
                            size={20}
                            className='cursor-pointer text-primary'
                          />
                        ) : (
                          <CircleIcon
                            onClick={() => handleSelectAProduct(product)}
                            size={18}
                            className='cursor-pointer text-label dark:text-label-dark'
                          />
                        )}
                      </div>
                      <div
                        style={{
                          position: 'relative',
                          width: '80px',
                          height: '80px'
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
                      <div className='space-y-3'>
                        <div className='space-y-1'>
                          <div className='grid grid-cols-[1fr_20px] gap-3'>
                            <h1 className='line-clamp-2 text-sm font-semibold'>
                              {product?.title}
                            </h1>
                          </div>

                          <p className='line-clamp-2 text-xs text-label'>
                            <TranslationHandler
                              word={product?.description}
                              translations={product?.translations?.description}
                            />
                          </p>
                        </div>

                        <div className='flex flex-col'>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-3'>
                              <div className='flex items-center text-xs font-semibold'>
                                <IndianRupeeIcon size={18} />
                                {Number(product?.total).toFixed(2)}
                              </div>

                              {product?.finalPrice !==
                                product?.maximumRetailPrice && (
                                <div className='flex items-center'>
                                  <span className='flex items-center text-xs text-slate-500 line-through dark:text-slate-400'>
                                    <IndianRupeeIcon size={12} />{' '}
                                    {Number(
                                      product?.maximumRetailPrice *
                                        product?.quantity
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {product?.isNotDeliverable ? (
                              <p className='text-xs text-red-600'>
                                {productTranslation(
                                  'product_unavailable_location'
                                )}
                                {product?.note && <p>{product?.note}</p>}
                              </p>
                            ) : product?.isOutOfStock ? (
                              <p className='text-xs text-red-600'>
                                {productTranslation('out_of_stock')}
                              </p>
                            ) : (
                              <div>
                                {deliveryMode === 'oneDay' &&
                                  (() => {
                                    const currentHour = new Date().getHours()
                                    const isWithinTimeRange =
                                      currentHour >= 9 && currentHour < 20

                                    if (!isWithinTimeRange) return null

                                    return (
                                      <p className='text-xs text-label'>
                                        {productTranslation(
                                          'expected_delivery_date'
                                        )}{' '}
                                        {dayjs()
                                          .add(
                                            product?.deliveryTime,
                                            product?.timeDurationType
                                          )
                                          .format('DD MMM YYYY HH:mm A')}{' '}
                                      </p>
                                    )
                                  })()}

                                {deliveryMode !== 'oneDay' && (
                                  <p className='text-xs text-label'>
                                    {productTranslation(
                                      'expected_delivery_date'
                                    )}{' '}
                                    {dayjs()
                                      .add(
                                        product?.deliveryTime,
                                        product?.timeDurationType
                                      )
                                      .format('DD MMM YYYY HH:mm A')}{' '}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className='mt-2'>
                            <p className='mb-2 text-xs font-semibold'>
                              {productTranslation('quantity')}
                            </p>
                            <div className='flex flex-row items-center justify-between'>
                              <div>
                                {!product?.isNotDeliverable &&
                                  !product?.isOutOfStock && (
                                    <div className='flex items-center rounded-lg border border-primary dark:border-gray-600'>
                                      <Button
                                        variant={'outline'}
                                        size={'lg'}
                                        className='border-x-1 border-y-0 border-l-0'
                                        onClick={() =>
                                          product.quantity > 1 &&
                                          addOrUpdateProduct({
                                            ...product,
                                            quantity: -1
                                          })
                                        }
                                      >
                                        <MinusIcon
                                          size={18}
                                          className='text-primary'
                                        />
                                      </Button>
                                      <span className='border-primary px-5 text-sm font-bold text-primary dark:border-slate-400'>
                                        {product?.quantity}
                                      </span>
                                      <Button
                                        variant={'outline'}
                                        size={'lg'}
                                        className='border-x-1 border-y-0 border-r-0 text-[#E75634]'
                                        onClick={async () => {
                                          const resp: any =
                                            await addOrUpdateProduct({
                                              ...product,
                                              quantity: +1
                                            })

                                          if (resp?.noEnoughQuantity) {
                                            toast({
                                              title: 'Insufficient Quantity!',
                                              description:
                                                'The requested quantity for this product is currently unavailable. Please reduce the quantity or explore similar items. Thank you for understanding!'
                                            })
                                          } else if (resp?.qtyLimitReached) {
                                            toast({
                                              title: 'Quantity Limit Reached!',
                                              description:
                                                'You can add upto 10 quantity per product'
                                            })
                                          }
                                        }}
                                      >
                                        <PlusIcon
                                          size={18}
                                          className='text-primary'
                                        />
                                      </Button>
                                    </div>
                                  )}
                              </div>
                              <Trash2Icon
                                onClick={() => handleRemoveProduct(product)}
                                size={20}
                                className='cursor-pointer text-red-400'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className='cursor-pointer rounded-none border-none dark:bg-gray-900'>
        <CardHeader className='py-3'>
          <Link href={'/'}>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-3 text-sm font-medium'>
                {' '}
                <div
                  style={{
                    position: 'relative',
                    width: '25px',
                    height: '25px'
                  }}
                >
                  <Image
                    src={'/images/AddToCartBag.svg'}
                    alt='Add to bag'
                    fill
                    priority={false}
                  />
                </div>
                {cart('add_more_items')}
              </div>
              <Plus size={20} />
            </CardTitle>
          </Link>
        </CardHeader>
      </Card>
    </div>
  )
}
