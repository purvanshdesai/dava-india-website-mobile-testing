'use client'
import React, { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useProductViewStore from '@/store/useProductViewStore'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useFetchProductsById } from '@/utils/hooks/productHooks'
import ProductImages from './Images'
import ProductInfo from './Info'
import ProductDescription from './Description'
import SimilarProducts from './SimilarProducts'
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react'
import MobileProductInnerViewLoader from '../../Loader/ProductInnerViewLoader'
import MobileNavBar from '../../NavBar'
import { trackProductViewed } from '@/analytics/trackers/productTracker'
import { useSession } from 'next-auth/react'

export default function ProductView() {
  const routeParams: { productId: string } = useParams()
  const hasTrackedRef = useRef(false)
  const { data: session } = useSession()

  const setProductView = useProductViewStore(state => state.setProductView)
  const { currentLocation, selectedAddress } = useCheckoutStore(state => state)
  const router = useRouter()
  const totalProducts = useCheckoutStore(state => state.totalProducts)

  const {
    data: product,
    isLoading,
    isError
  } = useFetchProductsById(
    routeParams?.productId,
    selectedAddress?._id,
    currentLocation?.zipCode
  )

  useEffect(() => {
    if (!product || hasTrackedRef.current) return

    const prod = product?.current

    trackProductViewed({
      productName: prod?.title,
      productSku: prod?.sku,
      userId: session?.user?.id ?? '',
      category: (prod?.collections ?? [])?.map((p: any) => p.name).join(', '),
      stockStatus: prod?.outOfStock ? 'Not Available' : 'Available',
      price: prod?.finalPrice,
      deviceType: 'mobile-web'
    })

    hasTrackedRef.current = true
  }, [product])

  if (isError)
    return <div className='p-4 text-center'>Error while loading product!</div>

  setProductView(product ?? [])

  return (
    <>
      {isLoading ? (
        <div>
          <MobileProductInnerViewLoader />
        </div>
      ) : (
        <div className=''>
          <div className='fixed top-0 z-50 mb-2 flex w-full flex-row items-center justify-between bg-white px-4 py-2'>
            <div
              className='rounded-full bg-[#F4F4F4] p-2'
              onClick={() => router.back()}
            >
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
            <div className='flex flex-row items-center justify-center'>
              <div
                className='mr-3 rounded-full bg-[#F4F4F4] p-2'
                onClick={() => router.push('/search')}
              >
                <Search color='#3C3C3C' size={20} />
              </div>
              <div
                className='mr-3 rounded-full bg-[#F4F4F4] p-2'
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
              {/* <div className='rounded-full bg-[#F4F4F4] p-2'>
                <ForwardIcon color='#3C3C3C' size={20} />
              </div> */}
            </div>
          </div>

          <div className='mt-20 flex flex-col justify-center'>
            
            <div className='mt-2 bg-white'>
              <div className='p-4 dark:bg-gray-900'>
                <div className='grid grid-cols-1 gap-6'>
                  <div className='mb-5'>
                    <ProductImages />
                  </div>

                  <div className=''>
                    <ProductInfo product={product} />
                  </div>
                </div>
              </div>

              <div className='py-6'>
                <ProductDescription product={product} />
              </div>
            </div>

            <div className='mb-20'>
              {' '}
              <SimilarProducts />
            </div>

            <div className='fixed bottom-0 w-full'>
              <MobileNavBar />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
