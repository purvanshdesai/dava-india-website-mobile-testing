'use client'
import {
  Carousel,
  CarouselContent,
  CarouselItem
  // CarouselNext,
  // CarouselPrevious
} from '@/components/ui/carousel'
import ProductCard from '../ProductCard'
import useProductViewStore from '@/store/useProductViewStore'
import { ProductVariation } from '../../../../types/storeTypes'
import { useTranslations } from 'next-intl'

export default function SimilarProducts() {
  const productTranslations = useTranslations('Product')
  // Show current product variation from store
  const productVariation: ProductVariation | any = useProductViewStore(
    state => state.variation
  )

  const associatedProducts = productVariation?.associatedProducts ?? []
  if (!associatedProducts.length) return <></>

  return (
    <div
      className='w-full rounded-lg p-4'
      style={{
        background:
          'linear-gradient(to right, #FDDABA, #ADD8E5, #FFF4CD, #FFC1CB)'
      }}
    >
      {/* Content Layer */}

      <div className='z-10'>
        <Carousel opts={{ slidesToScroll: 'auto' }}>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-semibold'>{ productTranslations('similar_products')}</p>

            {/* <div className='flex items-center gap-6'>
              <div className='flex items-center gap-3'>
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </div> */}
          </div>
          <CarouselContent className='gap-0'>
            {associatedProducts &&
              associatedProducts.map((product: any, index: number) => (
                <CarouselItem
                  key={index}
                  className='fade-in-up animate-delay-100 relative my-2 flex basis-2/3 items-center justify-center px-1 opacity-0'
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className='w-full'>
                    <ProductCard index={index} product={product} />
                  </div>
                </CarouselItem>
              ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}
