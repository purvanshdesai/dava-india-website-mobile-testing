'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel'
import { DotButton, useDotButton } from '../ui/carousel-dots'
import { useState } from 'react'
import { davaOneMembershipAmount } from '@/constants'

export default function MobileDavaMembership() {
  const membership = useTranslations('HomePageMembership')
  const [api, setApi] = useState<CarouselApi>()
  // const [images, setImages] = useState<Array<any>>([])
  // useEffect(() => {
  //   if (layout?.banners) {
  //     const images = layout?.banners.map((b: any) => {
  //       return { ...b?.device?.mobile, properties: b.properties }
  //     })

  //     setImages(images ?? [])
  //   }
  // }, [layout])
  // const autoScrollEnabled = layout?.properties?.autoScroll ?? false
  // const scrollTime = layout?.properties?.scrollTime
  //   ? layout?.properties?.scrollTime * 1000
  //   : 1500

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api)

  const membershipOptions = [
    {
      name: 'Free Delivery',
      description: '25 free delivery above order 99',
      image: '/images/Home/DavaMembership/free-shipping.svg',
      i18nKey: 'free_delivery',
      i18nDescKey: 'free_delivery_description'
    },
    {
      name: 'Dava Coin',
      description: 'Earn 2% of their purchase value as points',
      image: '/images/Home/DavaMembership/coin.svg',
      i18nKey: 'dava_coin',
      i18nDescKey: 'dava_coin_description'
    },
    {
      name: 'Discount',
      description: 'Discount upto 5%',
      image: '/images/Home/DavaMembership/discount.svg',
      i18nKey: 'discount',
      i18nDescKey: 'discount_description'
    },

    {
      name: 'Premium Support',
      description: 'No waiting in call center',
      image: '/images/Home/DavaMembership/support.svg',
      i18nKey: 'premium_support',
      i18nDescKey: 'premium_support_description'
    },
    {
      name: 'Exclusive Deals',
      description: 'On all categories',
      image: '/images/Home/DavaMembership/hot-sale.svg',
      i18nKey: 'exclusive_deals',
      i18nDescKey: 'exclusive_deals_description'
    },
    {
      name: 'e-Consultation',
      description: 'Six Complementary consultation with doctor',
      image: '/images/Home/DavaMembership/doctor.svg',
      i18nKey: 'consultation',
      i18nDescKey: 'consultation_description'
    }
  ]
  return (
    <>
      <div
        className='relative flex flex-col items-center justify-center bg-gradient-to-b p-1'
        style={{
          background: 'linear-gradient(to bottom, #FFCCC0, #D62900)'
        }}
      >
        <div
          className='absolute left-0 top-0 h-full w-full rounded-lg'
          style={{
            backgroundImage: `url('/images/membership/DavaMembership.svg')`,
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            zIndex: 0
          }}
        />
        <div className='relative mt-5 pb-4'>
          <div className='relative flex items-center justify-center'>
            <p className='flex items-center gap-2 rounded-3xl bg-white bg-opacity-40 px-2 pb-2 pt-1 text-sm font-semibold text-primary-teal'>
              <img
                src='/images/membership/DavaONELogo.svg'
                alt='DavaOne'
                className='w-12'
              />
              <span className='mt-1'> {membership('membership')}</span>
            </p>
          </div>
        </div>
        <div className='flex items-center justify-center text-sm font-medium text-white'>
          Membership @ {davaOneMembershipAmount} for 6 months
        </div>
        <div className='mb-5 mt-5'>
          <Carousel
            setApi={setApi}
            opts={{
              loop: true
            }}
            // plugins={plugins}
            // onMouseEnter={autoScrollEnabled ? plugin.current.stop : undefined}
            // onMouseLeave={autoScrollEnabled ? plugin.current.reset : undefined}
          >
            <CarouselContent className=''>
              {membershipOptions.map((item, idx) => (
                <CarouselItem key={idx}>
                  <div className='flex flex-col items-center gap-2 text-white'>
                    <div
                      className='rounded-full p-2'
                      style={{
                        backgroundImage: `radial-gradient(circle, #CCF9FD 10%, #B4EDF2 10%, #75CED7 10%, #5AC1CB 10%)`
                      }}
                    >
                      <div
                        className='rounded-full p-2'
                        style={{
                          backgroundImage: `radial-gradient(circle, #CCF9FD 100%, #B4EDF2 100%, #75CED7 100%, #5AC1CB 100%)`
                        }}
                      >
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '35px',
                            height: '35px'
                          }}
                        >
                          <Image src={item.image} alt='Footer Logo' fill />
                        </div>
                      </div>
                    </div>

                    <span className='text-sm'>{membership(item.i18nKey)}</span>
                    <span className='text-xs'>
                      {membership(item.i18nDescKey)}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className='mt-5'>
              <div className='flex items-center justify-center gap-2 duration-300'>
                {scrollSnaps.map((_, index) => (
                  <DotButton
                    key={index}
                    onClick={() => onDotButtonClick(index)}
                    className={`${index === selectedIndex ? 'bg-white px-3.5' : 'bg-primary-light-blue px-1'} rounded-md py-1`}
                  ></DotButton>
                ))}
              </div>
            </div>
          </Carousel>
        </div>
        <div className='absolute bottom-1 right-4 text-[8px] text-white'>
          *T & C applied
        </div>
      </div>
    </>
  )
}
