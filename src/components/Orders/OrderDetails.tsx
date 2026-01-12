'use client'
import { useFetchOrderById } from '@/utils/hooks/orderHooks'
import {
  ArrowLeft,
  ChevronRightIcon,
  Download,
  Search,
  ShoppingCart
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useGetAllOrderTrackingStatus } from '@/utils/hooks/appDataHooks'
import { useParams } from 'next/navigation'
import { useTransitionRouter } from 'next-view-transitions'
import MobileNavBar from '../NavBar'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

export default function OrderDetails() {
  const { orderId }: { orderId: string } = useParams()
  const session = useSession() as any
  const router = useTransitionRouter()
  const totalProducts = useCheckoutStore(state => state.totalProducts)
  const myorder = useTranslations('MyOrders')
  const productTranslation = useTranslations('Product')
  const cart = useTranslations('Cart')
  const common = useTranslations('Common')
  const { toast } = useToast()

  const [orderData, setOrderData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuyAgainLoading, setIsBuyAgainLoading] = useState(false)

  // Use the hook directly inside the component and avoid calling it within useEffect
  const { data, isError } = useFetchOrderById(orderId)
  const { data: trackingStatuses } = useGetAllOrderTrackingStatus()

  const { addOrUpdateProduct, setPrescriptionUrl } = useCheckoutStore()

  useEffect(() => {
    if (data) {
      setOrderData(data)
      setIsLoading(false)
    } else if (isError) {
      console.error('Error fetching order data:', isError)
      setIsLoading(false)
    }
  }, [data, isError, trackingStatuses])

  const downloadInvoice = (invoiceUrl: string) => {
    if (!invoiceUrl) return

    axios
      .get(invoiceUrl, { responseType: 'blob' })
      .then((response: any) => {
        const blob = new Blob([response.data], { type: 'pdf' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `invoice_${orderId}.pdf`
        link.click()
        URL.revokeObjectURL(link.href)
      })
      .catch(console.error)
  }

  const handleBuyAgain = async () => {
    if (!session?.data?.user) {
      router.push('/login')
      return
    }

    if (isBuyAgainLoading) return

    setIsBuyAgainLoading(true)

    try {
      // Set prescription URL if available

      if (
        orderData?.prescription?.urls &&
        orderData.prescription.urls.length > 0
      ) {
        setPrescriptionUrl(orderData.prescription.urls)
      }

      // Add all products from the order to cart
      let addedProductsCount = 0
      let failedProductsCount = 0

      for (const store of orderData?.orderItemsByStore || []) {
        for (const item of store.items) {
          try {
            const productMasterData = item.aboutProduct

            // If product details are missing (e.g. product deleted), skip
            if (!productMasterData || !productMasterData.finalPrice) {
              failedProductsCount++
              continue
            }
            if (productMasterData.isActive === false) {
              failedProductsCount++
              continue
            }

            const productData: any = normalizeProductForCart(item)
            const result: any = await addOrUpdateProduct(productData)
            console.log(result, 'result')

            if (result?.qtyLimitReached) {
              failedProductsCount++
            } else if (
              result?.notAvailable ||
              result?.noEnoughQuantity ||
              result?.outOfStock
            ) {
              failedProductsCount++
            } else {
              addedProductsCount++
            }
          } catch (error) {
            failedProductsCount++
            console.error('Error adding product to cart:', error)
          }
        }
      }

      // Show appropriate toast message
      if (addedProductsCount > 0 && failedProductsCount === 0) {
        toast({
          title: 'Products Added to Cart',
          description: `Successfully added ${addedProductsCount} product(s) to your cart`
        })
        router.push('/checkout/cart')
      } else if (addedProductsCount > 0 && failedProductsCount > 0) {
        toast({
          title: 'Partially Added to Cart',
          description: `Added ${addedProductsCount} product(s) to cart. ${failedProductsCount} product(s) could not be added due to availability issues.`
        })
        router.push('/checkout/cart')
      } else {
        toast({
          title: 'Unable to Add Products',
          description:
            'Some products from this order are currently unavailable. Please check product availability.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error in buy again:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong while adding products to cart.',
        variant: 'destructive'
      })
    } finally {
      setIsBuyAgainLoading(false)
    }
  }

  const normalizeProductForCart = (item: any) => {
    const product = item.aboutProduct || item

    return {
      _id: item?.aboutProduct._id, // ✅ this must be the product ID, not orderItem ID
      name: product.title || item.title,
      title: product.title || item.title,
      description: product.description,
      composition: product.composition || product.compositions,
      quantity: item.quantity,
      unitPrice: product.finalPrice,
      finalPrice: product.finalPrice,
      maximumRetailPrice: product.maximumRetailPrice || product.finalPrice,
      discount: product.discount || 0,
      discountType: product.discountType || 'flat',
      total: product.finalPrice * item.quantity,
      prescriptionReq: product.prescriptionReq || false,
      maxOrderQuantity: product.maxOrderQuantity || 10,
      minOrderQuantity: product.minOrderQuantity || 1,
      isSelected: true,
      isOutOfStock: false,
      isNotDeliverable: false,
      thumbnail: product.thumbnail,
      isConsultationItem: item.isConsultationItem || false,
      consultationId: null,
      collections: product.collections || [],
      tags: product.tags || [],
      seo: product.seo || {},
      images: product.images || [],
      consumption: product.consumption || '',
      brandTags: product.brandTags || [],
      aboutProduct: product
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error Fetching...</div>
  }

  return (
    <div className='h-screen w-full'>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/orders')}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>{myorder('my_orders')}</p>
        </div>

        <div className='flex flex-row items-center justify-center'>
          <div
            className='mr-3 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/search')}
          >
            <Search color='#3C3C3C' size={20} />
          </div>
          <div
            className='mr-1 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/checkout/cart')}
          >
            <div className='relative'>
              <ShoppingCart color='#3C3C3C' size={20} />
              {totalProducts > 0 && (
                <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-xs text-white'>
                  {totalProducts}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='mb-20 mt-14 flex-1 flex-col rounded-lg border'>
        {/* header */}

        <div className='flex items-center justify-between bg-gray-50 px-6 py-3'>
          <div className='flex flex-col'>
            {/* order id */}
            <div className='text-xs md:text-sm'>
              {myorder('order_id')}:{' '}
              <span className='font-bold'>#{orderData?.orderId}</span>
            </div>
          </div>
          {/* Buy Again Button */}
          <div className=''>
            <Button
              onClick={handleBuyAgain}
              disabled={isBuyAgainLoading}
              className='flex w-full items-center gap-2'
              size={'sm'}
            >
              <ShoppingCart size={16} />
              {isBuyAgainLoading ? 'Adding to Cart...' : 'Buy Again'}
            </Button>
          </div>
        </div>

        {/* product details */}
        <div className='bg-white'>
          {orderData?.orderItemsByStore?.map((store: any, idx: any) => {
            const timelineStatusList = store?.trackingDetails?.timeline?.map(
              (timeline: any) => timeline?.statusCode
            )
            return (
              <div className='' key={idx}>
                {store.items.map((item: any, idx: number) => {
                  return (
                    <div className='p-3' key={idx}>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-2 md:gap-6'>
                          <div className='relative h-16 w-16 overflow-hidden rounded-md'>
                            {item?.thumbnail ? (
                              <Image
                                src={item?.thumbnail}
                                alt='Footer Logo'
                                objectFit='contain'
                                className='rounded-md'
                                height={64}
                                width={64}
                              />
                            ) : (
                              <div>{myorder('no_image')}</div>
                            )}
                          </div>
                          <div className='flex flex-col items-start justify-start gap-1'>
                            <span className='line-clamp-2 text-sm font-semibold'>
                              {item?.title}
                            </span>
                            <span className='text-xs text-gray-400'>
                              {productTranslation('quantity')}: {item?.quantity}
                            </span>
                          </div>
                        </div>
                        <div className='text-sm font-medium'>
                          ₹{Number(item?.amount * item?.quantity).toFixed(2)}
                        </div>

                        <div>
                          <ChevronRightIcon
                            className='cursor-pointer'
                            size={18}
                            onClick={() => {
                              router.push(
                                `/track/${orderData?._id}?orderTrackingId=${store?.trackingDetails?._id}`
                              )
                            }}
                          />
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <div className='flex w-full justify-end'>
                          {!item?.isCancelRequested &&
                            !item.isReturnRequested &&
                            !timelineStatusList?.includes('dispatched') && (
                              <Button
                                variant={'destructive'}
                                onClick={() =>
                                  router.push(
                                    `/orders/cancel-order?orderId=${orderData._id}&productId=${item._id}&quantity=${item.quantity}`
                                  )
                                }
                                size={'sm'}
                              >
                                {common('cancel')}
                              </Button>
                            )}

                          {timelineStatusList?.includes('delivered') &&
                            !store.returnWindowClosed && (
                              <div className='flex items-center gap-3'>
                                {!item?.isReturnRequested && (
                                  <Button
                                    variant={'destructive'}
                                    onClick={() =>
                                      router.push(
                                        `/orders/return-order?orderId=${orderData._id}&productId=${item._id}&quantity=${item?.quantity}`
                                      )
                                    }
                                    size={'sm'}
                                  >
                                    {common('return')}
                                  </Button>
                                )}
                              </div>
                            )}

                          {store?.returnWindowClosed && (
                            <div className='flex justify-end'>
                              <p className='pt-3 text-right text-xs italic text-label'>
                                Return window closed on{' '}
                                {store?.returnWindowClosedDate}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* <div className='border-t bg-gray-50 px-3 py-6'>
                  {store?.trackingDetails?.timeline &&
                  store?.trackingDetails?.timeline?.length > 0 ? (
                    <div className='relative ml-4 space-y-3'>
                      {store?.trackingDetails?.timeline
                        .filter((t: any) =>
                          trackingStatuses
                            ?.map((ts: any) => ts.statusCode)
                            ?.includes(t.statusCode)
                        )
                        .map((t: any, idx: number) => {
                          return (
                            <div key={idx}>
                              <div className='relative flex items-center gap-4'>
                                <div className='h-3 w-3 flex-shrink-0 rounded-full bg-green-500'></div>
                                <div className='space-y-1'>
                                  <div className='flex flex-col gap-1 text-sm font-medium'>
                                    {t?.label}
                                    <span className='text-xs font-normal text-gray-500'>
                                      {dayjs(t.date).format(
                                        'DD MMM YYYY [at] hh:mm A'
                                      )}
                                    </span>
                                  </div>

                                  {t.statusLocation && (
                                    <div>
                                      <p className='text-xs font-normal text-gray-500'>
                                        {t.statusLocation} - {t.instructions}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {t.statusCode === 'refund_completed' && (
                                <div className='px-2 pl-7 pt-2'>
                                  <p className='text-xs text-label underline'>
                                    *Refund will be credited within 7 working
                                    days from the initiation date.
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className='relative ml-4'>
                      <div className='relative flex items-center gap-4'>
                        <div className='h-3 w-3 flex-shrink-0 rounded-full bg-green-500'></div>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-3 text-sm font-medium'>
                            {myorder('order_in_progress')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div> */}

                {store?.trackingDetails?.invoiceUrl ? (
                  <div className='mt-auto flex w-full items-center justify-center bg-white p-3 px-6'>
                    <div
                      className='flex cursor-pointer items-center gap-2'
                      onClick={() =>
                        downloadInvoice(store?.trackingDetails?.invoiceUrl)
                      }
                    >
                      <Download className='text-primary' size={18} />
                      <span className='text-sm text-primary'>
                        Download Invoice
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* shipping details */}
        <div className='bg-white p-3 px-6'>
          <div className='mb-3 text-sm font-semibold'>
            {myorder('shipping_details')}
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-xs font-semibold'>
              {orderData?.address?.userName}
            </span>
            <span className='w-56 text-xs font-medium text-label'>
              {orderData.address?.addressLine1},{' '}
              {orderData.address?.addressLine2},{orderData.address?.city},
              {orderData.address?.state}, Pin: {orderData?.address?.postalCode}
            </span>
            <span className='text-xs text-label'>
              {common('mobile')}:{' '}
              <span className='text-xs font-medium'>
                {orderData?.address?.phoneNumber}
              </span>
            </span>
            {orderData?.patientId && (
              <span className='text-xs text-label'>
                Patient:
                <span className='text-xs font-medium'>
                  {orderData?.patientId?.name}
                </span>
              </span>
            )}
          </div>
        </div>
        {/* price information */}
        <div className='bg-gray-50 p-3 px-6 pb-32'>
          <div className='mb-3 text-sm font-semibold'>
            {myorder('price_information')}
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>{cart('mrp_total')}</span>
            <span className='text-xs text-gray-700'>
              ₹{Number(orderData?.subTotal).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>
              {cart('shipping_charges')}
            </span>
            <span className='text-xs text-gray-700'>
              ₹ {Number(orderData?.deliveryCharge).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>{cart('tax_amount')}</span>
            <span className='text-xs text-gray-700'>
              ₹ {Number(orderData?.taxAmount).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>
              {cart('handling_charges')}
            </span>
            <span className='text-xs text-gray-700'>
              ₹ {Number(orderData?.handlingCharge).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>
              {cart('packaging_charges')}
            </span>
            <span className='text-xs text-gray-700'>
              ₹ {Number(orderData?.packingCharge).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>
              {cart('platform_fee')}
            </span>
            <span className='text-xs text-gray-700'>
              ₹ {Number(orderData?.platformFee).toFixed(2)}
            </span>
          </div>

          {/* {orderData?.isDavaOneMembershipAdded && (
            <div className='flex justify-between py-2'>
              <span className='text-xs text-gray-700'>DavaONE Membership</span>
              <span className='text-xs text-gray-700'>
                ₹ {Number(orderData?.davaOneMembershipAmount).toFixed(2)}
              </span>
            </div>
          )} */}

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>
              {cart('total_coupon_discount')}
            </span>
            <span className='text-xs text-red-600'>
              - ₹ {Number(orderData?.discountedAmount).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs text-gray-700'>Dava Coins</span>
            <span className='text-xs text-red-600'>
              - ₹ {Number(orderData?.davaCoinsUsed).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs font-medium text-green-600'>
              {cart('total_savings')}
            </span>
            <span className='text-xs font-medium text-green-600'>
              ₹ {Number(orderData?.discountedAmount).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-xs font-medium text-red-600'>
              {myorder('total_paid')}
            </span>
            <span className='text-xs font-medium text-red-600'>
              ₹{Number(orderData?.orderTotal).toFixed(2)}
            </span>
          </div>
        </div>
        {/* download invoice */}
      </div>
      <div className='fixed bottom-0 w-full'>
        <MobileNavBar />
      </div>
    </div>
  )
}
