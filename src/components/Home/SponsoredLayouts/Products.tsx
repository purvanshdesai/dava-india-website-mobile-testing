'use client'
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import MobileProductCard from '../../Products/ProductCard'
import TranslationHandler from '@/components/utils/TranslationHandler'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
// import { fetchCollectionNavigationPath } from '@/utils/actions/navigationActions'

export default function MobileProductsLayout({ layout }: { layout: any }) {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const commonTranslation = useTranslations('Common')

  useEffect(() => {
    // REMOVE-TODO
    const productsList = layout?.products ?? []
    setProducts(productsList)
  }, [layout])

  // const stringToSlug = (str: string) => {
  //   return str
  //     .trim() // Remove leading and trailing spaces
  //     .replace(/\s+/g, '-') // Replace spaces with hyphens
  //     .toLowerCase() // Convert to lowercase
  // }

  const onClickViewAll = async () => {
    // Fetch collection info navigation
    // const slug = await fetchCollectionNavigationPath(layout?.collection?._id)
    // router.push(`/categories/${(slug ?? []).join('/')}`)
    router.push(`/products?category=${layout?.collection?.slugUrl}`)

  }

  const getBackgroundImage = (theme: string | undefined) => {
    switch (theme) {
      case 'theme-mariegold':
        return '/images/Mariegold.svg'
      case 'theme-rose':
        return '/images/Rose.svg'
      case 'theme-lavender':
        return '/images/Lavender.svg'
      default:
        return null
    }
  }

  if (!products?.length) return <></>

  return (
    <div>
      <div className='flex items-center justify-between p-4'>
        <p className='text-sm font-semibold capitalize'>
          <TranslationHandler
            word={layout?.title}
            translations={layout?.translations?.title}
          />
        </p>
        <div>
          <div
            className='flex items-center gap-2'
            onClick={() => onClickViewAll()}
          >
            <div className='cursor-pointer text-xs font-semibold text-primary'>
              {commonTranslation('view_all')}
            </div>

            <div
              style={{
                position: 'relative',
                width: '16px',
                height: '16px'
              }}
            >
              <Image src={'/images/Play.svg'} alt='' fill priority={false} />
            </div>
          </div>
        </div>
      </div>
      <div className='relative'>
        <div
          className='absolute left-0 top-0 h-full w-full'
          style={{
            backgroundImage: layout?.properties?.theme
              ? `url(${getBackgroundImage(layout?.properties?.theme)})`
              : 'none',
            backgroundColor: layout?.properties?.theme
              ? 'transparent'
              : '#FFFFFF',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            zIndex: 0
          }}
        />
        {/* Content Layer */}
        <div className='relative pt-3 pb-3'>
          <Carousel opts={{ slidesToScroll: 'auto' }}>
            <CarouselContent className='gap-0'>
              {products &&
                products.map((product: any, index: number) => (
                  <CarouselItem
                    key={index}
                    className='fade-in-up animate-delay-100 relative my-3 flex basis-2/3 items-center justify-center px-2.5 opacity-0'
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className='h-full w-full'>
                      <MobileProductCard index={index} product={product} />
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  )
}
