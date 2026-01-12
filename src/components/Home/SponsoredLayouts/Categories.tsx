// import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTransitionRouter } from 'next-view-transitions'
import TranslationHandler from '@/components/utils/TranslationHandler'
import { fetchCollectionNavigationPath } from '@/utils/actions/navigationActions'

export default function MobileCategoriesLayout({ layout }: any) {
  // const homepage = useTranslations('HomePagePopularCategories')
  const router = useTransitionRouter()
  const [collections, setCollections] = useState<Array<any>>([])

  useEffect(() => {
    setCollections(layout?.collections ?? [])
  }, [layout])

  const onClickCategory = async (item: any) => {
    // Fetch collection info navigation
    const slug = await fetchCollectionNavigationPath(item?._id)
    router.push(`/categories/${(slug ?? []).join('/')}`)
  }

  if (!collections?.length) return <></>

  return (
    <div className='  bg-white p-4 dark:bg-gray-900'>
      <div>
        <p className='text-sm font-semibold capitalize'>
          <TranslationHandler
            word={layout?.title}
            translations={layout?.translations?.title}
          />
        </p>
      </div>

      <div className='no-scrollbar flex flex-nowrap gap-5 overflow-x-auto p-2 py-4'>
        {collections?.map((item, idx) => (
          <div className='flex flex-col items-center gap-1' key={idx}>
            <div
              onClick={() => onClickCategory(item)}
              key={idx}
              className='relative h-24 w-24 cursor-pointer overflow-hidden rounded-xl border border-gray-100 shadow-lg duration-300 hover:scale-105'
            >
              <Image
                src={item?.image}
                alt={item?.name}
                fill
                objectFit='contain'
              />
            </div>

            <div className='line-clamp-1 pt-2 text-center text-xs font-semibold capitalize'>
              <TranslationHandler
                word={item.name}
                translations={item?.translations?.name}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
