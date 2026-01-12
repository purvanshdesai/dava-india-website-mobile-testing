'use client'
import * as React from 'react'
import Image from 'next/image'
import { Share2 } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel'

import useProductViewStore from '@/store/useProductViewStore'

import { DotButton, useDotButton } from '@/components/ui/carousel-dots'
import { ProductVariation } from '../../../../types/storeTypes'

interface ProductImages {
  product: any
}

export default function ProductImages() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [, setCurrent] = React.useState(0)
  // const [imageUrl, setImageUrl] = useState<string>('')
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api)

  const productVariation: ProductVariation | any = useProductViewStore(
    state => state.variation
  )

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  React.useEffect(() => {
    if (productVariation?.images?.length) {
      // setImageUrl(productVariation?.images[0]?.objectUrl)
    }
    // TODO - Set empty state image
  }, [productVariation])

  if (!productVariation)
    return <div className='text-sm'>Error Loading product!</div>

  return (
    <div className='rounded-md'>
      <div className='relative rounded-lg border'>
        {/* Share button at top-right corner of product card */}
        <button
          aria-label='Share product'
          onClick={() => {
            const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
            const title = productVariation?.title || 'Davaindia'
            const text = 'Check out this product on Davaindia'
            const shareData: any = { title, text, url: currentUrl }
            if (typeof navigator !== 'undefined' && (navigator as any).share) {
              ;(navigator as any).share(shareData).catch(() => {})
            } else if (typeof window !== 'undefined') {
              window.navigator.clipboard?.writeText(currentUrl)
            }
          }}
          className='absolute right-2 top-2 z-10 rounded-full border bg-white p-2 shadow-sm'
        >
          <Share2 size={16} className='text-gray-700' />
        </button>
        <Carousel
          setApi={setApi}
          opts={{
            loop: true
          }}
          className='h-[400px]'
        >
          <CarouselContent className='flex h-[400px] flex-row'>
            {[...productVariation?.images].map((image, index) => (
              <CarouselItem key={index}>
                <Image
                  src={image?.objectUrl}
                  alt={image.objectDetails.originalFileName || 'Carousel Image'}
                  // fill
                  style={{ objectFit: 'contain' }}
                  height={400}
                  width={400}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className='absolute left-1/2 right-1/2 mt-6 flex items-center justify-center gap-2 duration-300'>
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`${index === selectedIndex ? 'bg-[#E75634] px-3.5' : 'border bg-primary-light-blue px-1'} rounded-md py-1`}
              ></DotButton>
            ))}
          </div>
        </Carousel>
      </div>
    </div>
  )
}
