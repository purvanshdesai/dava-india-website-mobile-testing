'use client'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, SearchIcon } from 'lucide-react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFetchGlobalSearch } from '@/utils/hooks/searchHooks'
import ProductCard from '@/components/Products/ProductCard'
import ProductLoader from '@/components/Loader/ProductsLoader'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTransitionRouter } from 'next-view-transitions'
import { useDebouncedValue } from '@/hooks/useDebounce'
import { useFetchProducts } from '@/utils/hooks/productHooks'
import ProductsCustomPagination from '@/components/ProductCustomPagination'
import { trackPrescriptionEnquirySearch } from '@/analytics/trackers/appEventTracker'
import { useSession } from 'next-auth/react'

export default function PrescriptionProductSearch() {
  const [searchText, setSearchText] = useState<string>('')
  const { totalProducts, resetConsultationOrder, prescriptionFiles } =
    useCheckoutStore()
  const router = useTransitionRouter()
  const { data: session } = useSession()

  const [page, setPage] = useState<number>(1)
  // const [totalResults, setTotalResults] = useState<number>(0)

  const { debouncedValue: debouncedSearchText, isDebouncing } =
    useDebouncedValue(searchText, 1000)

  const { data: searchResult, isLoading } =
    useFetchGlobalSearch(debouncedSearchText)

  const {
    data: products,
    isLoading: isLoadingProducts
    // isError: isErrorProducts
  } = useFetchProducts({
    categorySlug: [],
    sponsored: '',
    filter: {},
    page,
    limit: 10
  })

  const handleNavigation = () => {
    resetConsultationOrder()
    router.push('/checkout/cart')
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  useEffect(() => {
    if (searchResult && !isLoadingProducts && !isDebouncing) {
      trackPrescriptionEnquirySearch({
        userId: session?.user?.id ?? '',
        searchTerm: debouncedSearchText,
        noOfResults: searchResult?.products?.length,
        prescriptionUploaded: prescriptionFiles?.join(', ')
      })
    }
  }, [searchResult])

  return (
    <div
      className='relative flex h-full justify-center pb-12'
      //   style={{ height: 'calc(100vh - 80px)' }}
    >
      <div className='m-6 w-full pb-12'>
        <Link
          className='mb-3 flex items-center gap-3'
          href={'/prescription/upload'}
        >
          <ArrowLeft />{' '}
          <p className='text-sm font-semibold'>
            Search and add medicines with your prescription
          </p>
        </Link>

        <div className=''>
          <div className='relative mb-3 w-full'>
            <SearchIcon
              className='absolute left-4 top-3 text-primary'
              size={24}
            />
            <Input
              placeholder={'Search Products'}
              value={searchText}
              className='h-12 rounded-full px-12 text-base font-semibold placeholder:font-medium'
              onChange={e => setSearchText(e.target.value)}
              autoFocus={false}
            />
          </div>

          {isLoading || isDebouncing ? (
            <div className='md:px-6 md:py-6'>
              <ProductLoader />
            </div>
          ) : searchText && searchResult?.products?.length === 0 ? (
            <div className='flex h-[500px] items-center justify-center'>
              <div className='flex flex-col items-center gap-6'>
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
          ) : (
            <div
              className='overflow-y-auto'
              //   style={{ height: 'calc(100vh - 300px)' }}
            >
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:px-6 md:py-6 2xl:grid-cols-5'>
                {products?.data?.map((product: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className='fade-in-up animate-delay-100 opacity-0'
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard index={index} product={product} />
                    </div>
                  )
                })}
              </div>

              <ProductsCustomPagination
                currentPage={page}
                totalResults={products?.total || 0}
                resultsPerPage={10}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <div className='fixed bottom-0 flex w-full items-center justify-center gap-3 bg-white p-3'>
        <div>
          <p className='text-xs text-label'>Total Medicines in the cart</p>
          <p className='text-sm font-semibold'>{totalProducts} Medicines</p>
        </div>

        <div>
          <Button onClick={() => handleNavigation()}>
            <span className='text-base font-semibold'>Go to Cart</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
