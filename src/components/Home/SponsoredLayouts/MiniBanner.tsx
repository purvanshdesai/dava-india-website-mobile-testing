'use client'
import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
// import { useDotButton } from '@/components/ui/carousel-dots'

import { useRouter } from 'next/navigation'
import { fetchCollectionNavigationPath } from '@/utils/actions/navigationActions'

export default function MiniCarousel({ layout }: any) {
  const router = useRouter()
  // const [api, setApi] = React.useState<CarouselApi>()
  const [images, setImages] = React.useState<Array<any>>([])

  React.useEffect(() => {
    if (layout?.banners) {
      const images = layout?.banners.map((b: any) => {
        return { ...b?.device?.mobile, properties: b.properties }
      })

      setImages(images ?? [])
    }
  }, [layout])

  const autoScrollEnabled = layout?.properties?.autoScroll ?? false
  const scrollTime = layout?.properties?.scrollTime
    ? Number(layout?.properties?.scrollTime) * 1000
    : 1500

  const plugin = React.useRef(
    Autoplay({ delay: scrollTime, stopOnInteraction: true })
  )

  const plugins = autoScrollEnabled ? [plugin.current] : []

  // const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api)

  const getColumnStyle = () => {
    const { banners } = layout
    return banners.length === 2
      ? 'md:basis-1/2'
      : banners.length >= 3
        ? 'md:basis-1/3'
        : ''
  }

  const handleClickBanner = async (banner: any) => {
    try {
      const { redirectType, redirectUrl, collection } = banner?.properties
      if (redirectType === 'externalLink') {
        window.open(redirectUrl, '_blank')
      } else if (redirectType === 'collection') {
        // Fetch collection info navigation
        const slug = await fetchCollectionNavigationPath(collection)
        router.push(`/categories/${(slug ?? []).join('/')}`)
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (!images?.length) return <></>

  return (
    <div className='relative  pl-3 pr-3 '>
      <Carousel
        // setApi={setApi}
        opts={{
          loop: true
        }}
        plugins={plugins}
        className=''
        // onMouseEnter={autoScrollEnabled ? plugin.current.stop : undefined}
        // onMouseLeave={autoScrollEnabled ? plugin.current.reset : undefined}
      >
        <CarouselContent className='w-full space-x-3 '>
          {images?.map((banner, index) => (
            <CarouselItem
              key={index}
              className={`relative flex w-full items-center justify-center  ${getColumnStyle()}`}
            >
              <div className='w-full '>
                <Card className={`overflow-hidden rounded-3xl`}>
                  <CardContent
                    className='relative p-0'
                    style={{ width: '100%' }}
                    onClick={() => handleClickBanner(banner)}
                  >
                    <Image
                      src={banner?.imageUrl}
                      alt={banner?.title}
                      width={656} // Set width of the original image
                      height={328}
                      priority
                      className='overflow-hidden rounded-2xl '
                      layout='responsive' // Makes the image responsive
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious className='absolute left-[1rem] top-1/2 z-10 -translate-y-1/2 transform' />
        <CarouselNext className='absolute right-[1rem] top-1/2 z-10 -translate-y-1/2 transform' /> */}

        {/* <div className='absolute bottom-6 left-1/2 right-1/2 flex items-center justify-center gap-2 duration-300'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`${index === selectedIndex ? 'bg-white px-3.5' : 'bg-primary-light-blue px-1'} rounded-md py-1`}
            ></DotButton>
          ))}
        </div> */}
      </Carousel>
    </div>
  )
}
