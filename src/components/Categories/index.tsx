'use client'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import MobileNavBar from '../NavBar'
import MobileCategoriesLoader from '../Loader/CategoriesLoader'
import TranslationHandler from '@/components/utils/TranslationHandler'
import Link from 'next/link'
import { useFetchNavigation } from '@/utils/hooks/navigationHooks'
import { useFetchCollection } from '@/utils/hooks/categoryHooks'
import { useEffect, useState } from 'react'
import { trackCategoryBrowsed } from '@/analytics/trackers/appEventTracker'
import { useSession } from 'next-auth/react'

export default function MobileCategoriesComponent() {
  const { data: mainCategories, isLoading } = useFetchNavigation()
  const router = useRouter()
  const { data: session } = useSession()
  const [slugUrl, setSlugUrl] = useState('') as any

  const { data: subCategories } = useFetchCollection(slugUrl ?? '')

  useEffect(() => {
    if (mainCategories?.length > 0) {
      setSlugUrl(mainCategories[0].slugUrl ?? '')
    }
  }, [mainCategories])

  useEffect(() => {
    if (!slugUrl) return

    trackCategoryBrowsed({
      userId: session?.user?.id ?? '',
      categoryName: slugUrl
    })
  }, [subCategories])

  const listData = mainCategories?.length > 0 ? mainCategories : []
  const handleNavigateToCategory = (category: any) => {
    router.push(`/categories/${slugUrl}/${category?.slugUrl}`)
  }

  return (
    <>
      {isLoading ? (
        <MobileCategoriesLoader />
      ) : (
        <div className='relative mb-12'>
          <div className='sticky top-0 z-50 mb-2 flex flex-row items-center justify-center bg-white px-4 py-2'>
            <Link href={'/'}>
              <div
                className=''
                style={{ position: 'relative', width: '150px', height: '60px' }}
              >
                <Image
                  src={'/images/Logo.svg'}
                  alt='Davainda Logo'
                  className='cursor-pointer'
                  fill
                  priority={true}
                />
              </div>
            </Link>

            <div className='absolute right-4 flex flex-row items-center justify-center'>
              <div
                className='rounded-full bg-[#F4F4F4] p-2'
                onClick={() => router.push('/search')}
              >
                <Search color='#3C3C3C' size={20} />
              </div>
            </div>
          </div>

          <div className='flex'>
            <div
              className='w-1/4 overflow-y-auto'
              style={{ height: 'calc(98vh - 84px)' }}
            >
              {listData.map((data: any) => (
                <div
                  key={data._id}
                  className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg bg-white p-4 text-xs font-semibold ${
                    slugUrl === data?.slugUrl
                      ? 'border-r-4 border-orange-500 bg-white'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setSlugUrl(data.slugUrl)}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    <Image src={data?.image} alt='' fill priority={false} />
                  </div>
                  {/* {data?.name} */}
                  <div className='text-center'>
                    <TranslationHandler
                      word={data?.name}
                      translations={data?.translations?.name}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className='w-3/4 overflow-y-auto'
              style={{ height: 'calc(98vh - 84px)' }}
            >
              <div className='grid grid-cols-2 gap-4 p-4'>
                {subCategories &&
                  subCategories.map((data: any) => (
                    <div
                      key={data._id}
                      className='flex cursor-pointer flex-col items-center gap-3 rounded-lg bg-white p-4 text-xs font-semibold'
                      onClick={() => handleNavigateToCategory(data?.collection)}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100px',
                          height: '100px'
                        }}
                      >
                        <Image
                          src={data?.collection?.image}
                          alt=''
                          fill
                          priority={false}
                        />
                      </div>
                      {/* {data?.name} */}
                      <div className='text-center'>
                        <TranslationHandler
                          word={data?.collection?.name}
                          translations={data?.collection?.translations?.name}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className='fixed bottom-0 w-full'>
            <MobileNavBar />
          </div>
        </div>
      )}
    </>
  )
}
