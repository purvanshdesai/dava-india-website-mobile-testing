'use client'
import {
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useFetchOrders } from '@/utils/hooks/orderHooks'
import { Search } from 'lucide-react'
import Pagination from './Pagination'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTransitionRouter } from 'next-view-transitions'
import { useSession } from 'next-auth/react'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import OrdersSkeleton from './OrdersSkeleton'
import OrderDateFilter, { type DateFilterType } from './OrderDateFilter'

const OrdersTable = () => {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1') || 1
  const ordersPerPage = parseInt(searchParams.get('limit') || '5') || 5
  const [lastRefreshed, setLastRefreshed] = useState(new Date().getTime())
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all')

  const {
    data: ordersResponse,
    isLoading,
    isError
  } = useFetchOrders({ page, limit: ordersPerPage, lastRefreshed, dateFilter })
  const { toast } = useToast()
  const session = useSession() as any
  const router = useTransitionRouter()

  const myorder = useTranslations('MyOrders')
  const commonTranslations = useTranslations('Common')
  const { addOrUpdateProduct, setPrescriptionUrl } = useCheckoutStore()
  const { data } = useSession()
  const isAuthenticated = data?.user || false
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'recent' | 'older'>('recent') // State for sorting option
  const totalProducts = useCheckoutStore(state => state.totalProducts)
  const [isBuyAgainLoading, setIsBuyAgainLoading] = useState(false)
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null)

  // Handle both paginated and non-paginated responses
  const isPaginatedResponse =
    ordersResponse &&
    typeof ordersResponse === 'object' &&
    'data' in ordersResponse
  const orders = isPaginatedResponse
    ? ordersResponse.data
    : ordersResponse || []
  const totalPages = isPaginatedResponse ? ordersResponse.totalPages : 0

  // Filter orders on frontend for search functionality (only when not using server pagination)
  const filteredOrders = orders?.filter((order: any) =>
    order.items.some(
      (item: any) =>
        item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || // Match product name
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) // Match order ID
    )
  )

  // Sort orders based on selected sortOrder (recent or older)
  const sortedOrders =
    sortOrder === 'recent' ? filteredOrders : filteredOrders?.reverse()

  // Remove the old useEffect logic since we're using server-side pagination
  /*
  useEffect(() => {
    const filteredOrders = orders?.filter((order: any) =>
      order.items.some(
        (item: any) =>
          item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || // Match product name
          order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) // Match order ID
      )
    )

    const sortedOrders =
      sortOrder === 'recent' ? filteredOrders : filteredOrders.reverse()

    const totalPages = Math.ceil((filteredOrders?.length || 0) / ordersPerPage)
    const indexOfLastOrder = page * ordersPerPage
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
    const currentOrders = sortedOrders?.slice(
      indexOfFirstOrder,
      indexOfLastOrder
    )

    setTotalPages(totalPages)
    setMyOrders(currentOrders)
  }, [orders, searchQuery, sortOrder, page])
  */

  const getOrderStatus = (order: any) => {
    const { timeline } = order?.trackingDetails ?? {}

    if (!timeline?.length) return { label: order?.status }

    return {
      label: timeline[timeline.length - 1]?.label,
      comment: timeline[timeline.length - 1]?.comment
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated])

  const getTimelineStatusList = (order: any) => {
    const { timeline } = order?.trackingDetails ?? {}
    if (!timeline) return []

    return timeline?.map((timeline: any) => timeline?.statusCode)
  }

  const handleBuyAgain = async (orderData: any) => {
    if (!session?.data?.user) {
      router.push('/login')
      return
    }

    if (isBuyAgainLoading) return
    if (loadingOrderId === orderData?._id) return
    setIsBuyAgainLoading(true)

    setLoadingOrderId(orderData?._id)

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

      for (const item of orderData.items) {
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
      setLoadingOrderId(null)
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

  if (isError) return <div>Error!</div>

  if (isLoading) return <OrdersSkeleton />

  return (
    <div className='w-full'>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
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
      <div
        className='mt-12 flex-1 flex-col rounded-lg'
        style={{ maxHeight: 'calc(90vh - 80px)' }}
      >
        <div className='flex flex-col justify-between space-y-2 rounded-t-lg'>
          <div className='mt-1 flex flex-row items-center justify-between gap-2 bg-white p-3'>
            <div className='relative flex w-full items-center justify-center'>
              <Search size={18} className='absolute left-3 text-gray-400' />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                type='text'
                placeholder='Search in my orders...'
                className='h-[48px] w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
          <div className='flex flex-row items-center justify-between gap-2 bg-white px-3 py-3'>
            <div className='w-[48%]'>
              <OrderDateFilter
                selectedFilter={dateFilter}
                onFilterChange={filter => {
                  setDateFilter(filter)
                  setLastRefreshed(new Date().getTime())
                }}
              />
            </div>
            <div className='w-[48%]'>
              <div className='flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className='flex items-center gap-2'>
                      <span className='whitespace-nowrap'>
                        {sortOrder === 'recent'
                          ? myorder('recent')
                          : myorder('older')}
                      </span>
                      <ChevronDown size={16} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className='z-[10000]'
                    align='end'
                    forceMount
                  >
                    <DropdownMenuItem
                      className='cursor-pointer'
                      onClick={() => setSortOrder('recent')}
                    >
                      {myorder('recent')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='cursor-pointer'
                      onClick={() => setSortOrder('older')}
                    >
                      {myorder('older')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className='pb-20'>
          <div className='space-y-3 p-3'>
            {sortedOrders?.map((order: any, idx: number) => {
              const orderLastStatus = getOrderStatus(order)

              const timelineStatus = getTimelineStatusList(order)

              return (
                <div key={idx} className='rounded-lg border border-gray-200'>
                  <div className='flex items-center justify-between rounded-t-lg bg-gray-50 px-3 py-2 text-sm'>
                    <div className='space-y-1'>
                      <div>
                        <span className='text-label'>
                          {myorder('order_id')}:{' '}
                        </span>
                        <span className='font-semibold'>#{order?.orderId}</span>
                      </div>

                      <div className='text-xs text-label'>
                        {dayjs(order?.createdAt).format('DD MMM YYYY, HH:mm A')}
                      </div>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-label'>
                      <div className=''>
                        <Button
                          onClick={() => handleBuyAgain(order)}
                          disabled={
                            isBuyAgainLoading && loadingOrderId === order._id
                          }
                          className='flex w-full items-center gap-2'
                          size={'sm'}
                        >
                          <ShoppingCart size={16} />
                          {isBuyAgainLoading && loadingOrderId === order._id
                            ? 'Adding to Cart...'
                            : 'Buy Again'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='bg-white p-3'>
                    {
                      <div key={idx} className={'divide-y p-2'}>
                        {order?.items.map((item: any) => {
                          return (
                            <React.Fragment key={item._id}>
                              <div className='py-3'>
                                <div className='flex flex-col bg-white md:col-span-4 md:grid md:grid-cols-[2fr_1fr_1fr]'>
                                  {/* Product Details */}
                                  <div className='col-span-1 grid grid-cols-[64px_1fr] items-center gap-4'>
                                    <div className='relative h-16 w-16 overflow-hidden rounded-md'>
                                      {item?.thumbnail ? (
                                        <Image
                                          src={item?.thumbnail}
                                          alt='Footer Logo'
                                          fill
                                          priority={false}
                                          className='rounded-md'
                                        />
                                      ) : (
                                        <div>No Image</div>
                                      )}
                                    </div>
                                    <div>
                                      <div className='flex flex-col gap-1'>
                                        <span className='line-clamp-2 text-sm font-medium'>
                                          {item?.title}
                                        </span>
                                        <span className='line-clamp-2 text-xs text-label'>
                                          {item?.description}
                                        </span>
                                        <span className='text-xs text-label'>
                                          Qty: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <div className='flex items-center justify-between pt-4 md:flex-row'>
                                    <div className='space-y-1'>
                                      <span className='flex items-center gap-2 text-xs font-medium capitalize'>
                                        <span
                                          className={`h-2 w-2 rounded-full ${
                                            order.status === 'pending'
                                              ? 'bg-orange-500'
                                              : 'bg-green-500'
                                          }`}
                                        ></span>
                                        {orderLastStatus?.label}
                                      </span>
                                    </div>
                                    <Link
                                      href={`/orders/${order._id}?page=${page}&limit=${ordersPerPage}`}
                                      className='md:hidden'
                                    >
                                      <ChevronRight size={20} />
                                    </Link>
                                  </div>

                                  {/* Link to Details */}
                                  <div className='flex items-center justify-end gap-3 pt-4'>
                                    <div>
                                      {!item?.isCancelRequested &&
                                        !item.isReturnRequested &&
                                        !timelineStatus?.includes(
                                          'dispatched'
                                        ) && (
                                          <Button
                                            variant={'destructive'}
                                            onClick={() =>
                                              router.push(
                                                `/orders/cancel-order?orderId=${order._id}&productId=${item._id}&quantity=${item.quantity}`
                                              )
                                            }
                                            size={'sm'}
                                          >
                                            {commonTranslations('cancel')}
                                          </Button>
                                        )}

                                      {timelineStatus?.includes('delivered') &&
                                        !order.returnWindowClosed && (
                                          <div className='flex items-center gap-3'>
                                            {!item?.isReturnRequested && (
                                              <Button
                                                variant={'destructive'}
                                                onClick={() =>
                                                  router.push(
                                                    `/orders/return-order?orderId=${order._id}&productId=${item._id}&quantity=${item?.quantity}`
                                                  )
                                                }
                                              >
                                                {commonTranslations('return')}
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                {order?.returnWindowClosed && (
                                  <div className='flex justify-end pt-2'>
                                    <p className='text-xs italic text-label'>
                                      Return window closed on{' '}
                                      {order?.returnWindowClosedDate}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </React.Fragment>
                          )
                        })}
                      </div>
                    }
                  </div>
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={newPage => {
                const newSearchParams = new URLSearchParams(
                  searchParams.toString()
                )
                newSearchParams.set('page', newPage.toString())
                router.push(`/orders?${newSearchParams.toString()}`)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersTable
