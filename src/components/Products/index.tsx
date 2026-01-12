'use client'
import React, { useEffect } from 'react'
import { useFetchProductsInfinite } from '@/utils/hooks/productHooks'
import ProductCard from './ProductCard'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import useCommonStore from '@/store/useCommonStore'
import MobileProductLoader from '../Loader/ProductsLoader'
import { useElementOnScreen } from '@/hooks/useElementOnScreen'
import { ArrowLeft, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ProductList() {
  const productTranslation = useTranslations('Product')
  const homepage = useTranslations('HomePage')
  const searchParams = useSearchParams()
  const category: string = searchParams.get('category') as string
  const sponsored: string = searchParams.get('sponsored') as string

  const [containerRef, isVisible] = useElementOnScreen() as any
  const {
    data: products,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFetchProductsInfinite({
    category: category ?? '',
    sponsored: sponsored ?? ''
  })

  const setAppBarSearchStatus = useCommonStore(
    state => state.setAppBarSearchStatus
  )
  const appBarSearch = useCommonStore(state => state.showAppBarSearch)

  useEffect(() => {
    setAppBarSearchStatus(true)
  }, [appBarSearch !== true])

  const slugToString = (slug: string) => {
    return slug
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize the first letter of each word
  }
  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isError) {
    return <div>Something went wrong</div>
  }

  return (
    <>
      {' '}
      <div className='fixed top-0 z-50 mb-2 flex w-full flex-row items-center justify-between bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center bg-white'>
          <Link href={'/'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
          </Link>
          <p className='ml-2 font-semibold'>{productTranslation('products')}</p>
        </div>

        <div className='flex flex-row items-center justify-center bg-white'>
          <Link href={'/search'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <Search color='#3C3C3C' size={20} />
            </div>
          </Link>
        </div>
      </div>
      <div className='mt-16 grid grid-cols-1 gap-4'>
        <div className='pl-3 pt-3 text-xs font-medium text-label'>
          <Link className={'cursor-pointer'} href={'/'}>
            {homepage('home_button')}
          </Link>{' '}
          /{' '}
          <span className='text-xs font-semibold text-primary'>
            {category || sponsored
              ? slugToString(category ?? sponsored)
              : productTranslation('all_products')}
          </span>
        </div>

        {/* <div className='overflow-auto'>
        {isLoading ? (
          <div>
            <MobileProductLoader />
          </div>
        ) : products?.length > 0 ? (
          <div className='grid grid-cols-2 gap-4 px-4 sm:grid-cols-3'>
            {products.map((product: any, index: number) => {
              return (
                <div
                  key={index}
                  className='fade-in-up animate-delay-100 h-full opacity-0'
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard index={index} product={product} />
                </div>
              )
            })}
          </div>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='flex flex-col items-center'>
              <div
                style={{
                  position: 'relative',
                  width: '150px',
                  height: '150px'
                }}
              >
                <Image
                  src={`/images/EmptyProducts.svg`}
                  alt='Empty Products'
                  fill
                  priority={false}
                />
              </div>

              <p className='text-center text-sm font-semibold'>
                Product not available for now !
              </p>
            </div>
          </div>
        )}
      </div> */}
        <div className='overflow-auto'>
          {isLoading ? (
            <div>
              <MobileProductLoader />
            </div>
          ) : products && products?.pages.flatMap(page => page).length > 0 ? (
            <div className='grid grid-cols-2 gap-4 px-4 sm:grid-cols-3'>
              {products.pages.flatMap((page, pageIndex) =>
                page.map((product: any, index: number) => (
                  <div
                    key={`${pageIndex}-${index}`}
                    className='fade-in-up animate-delay-100 h-full opacity-0'
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard index={index} product={product} />
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center'>
                <div
                  style={{
                    position: 'relative',
                    width: '150px',
                    height: '150px'
                  }}
                >
                  <Image
                    src={`/images/EmptyProducts.svg`}
                    alt='Empty Products'
                    fill
                    priority={false}
                  />
                </div>

                <p className='text-center text-sm font-semibold'>
                  {productTranslation('product-unavailable_now')}
                </p>
              </div>
            </div>
          )}
          {/* Infinite Scroll Trigger */}
          <div ref={containerRef} />
          {isFetchingNextPage && <div>Loading more products...</div>}
        </div>
      </div>
    </>
  )
}
