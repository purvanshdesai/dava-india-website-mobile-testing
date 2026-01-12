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
import Link from 'next/link'
export default function MobileGenericAbout({ layout }: { layout: any }) {
  const generic = useTranslations('HomePageGenericAbout')
  const [api, setApi] = useState<CarouselApi>()

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api)

  const content = [
    {
      label: 'Reliable',
      description:
        'Made with high-quality standards, our generics provide reliable, consistent results you can trust.',
      image: '/images/Reliable.svg',
      i18nKey: 'reliable',
      i18nDescKey: 'reliable_desc'
    },
    {
      label: 'Secure',
      description:
        'Each medicine meets strict safety standards, ensuring trusted care with every dose.',
      image: '/images/Secure.svg',
      i18nKey: 'secure',
      i18nDescKey: 'secure_desc'
    },
    {
      label: 'Affordable',
      description:
        'Quality treatments without the high price, making better health accessible for all.',
      image: '/images/Affordable.svg',
      i18nKey: 'affordable',
      i18nDescKey: 'affordable_desc'
    },
    {
      label: 'Effective',
      description:
        'Clinically proven to deliver the same benefits as branded alternatives, without compromise.',
      image: '/images/Effective.svg',
      i18nKey: 'effective',
      i18nDescKey: 'effective_desc'
    }
  ]
  return (
    <div className='bg-gradient-to-r from-white via-white to-[#C8EFFE] p-4 dark:bg-gray-900 md:p-6'>
      <div className='flex flex-col gap-6 md:flex-row md:gap-8'>
        <div>
          <div className='flex items-center gap-2'>
            <img src='/images/Home/megaphone.gif' alt='megaphone' />
            <p className='text-lg font-semibold'>
              {generic('generic_medicines_are_smarter_choice')}
            </p>
          </div>
        </div>
        <div>
          <iframe
            className='h-[180px] w-[350px] rounded-xl'
            src={layout?.properties?.videoUrl}
            title='YouTube video player'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          ></iframe>
        </div>
        <div className='flex flex-col gap-6'>
          <div className=''>
            <Carousel
              setApi={setApi}
              opts={{
                loop: true
              }}
            >
              <CarouselContent>
                {content.map((item, idx) => (
                  <CarouselItem key={idx}>
                    <div className='' key={idx}>
                      <span className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                        <div
                          style={{
                            position: 'relative',
                            width: '32px',
                            height: '32px'
                          }}
                        >
                          <Image
                            src={item.image}
                            alt='Footer Logo'
                            fill
                            priority={false}
                          />
                        </div>

                        {generic(item.i18nKey)}
                      </span>
                      <span className='text-sm'>
                        {generic(item.i18nDescKey)}
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
                      className={`${index === selectedIndex ? 'bg-[#E75634] px-3.5' : 'bg-primary-light-blue px-1'} rounded-md py-1`}
                    ></DotButton>
                  ))}
                </div>
              </div>
            </Carousel>
          </div>
          <div className='flex flex-row items-center justify-end'>
            <Link href={'/genericInfo'}>
              <div className='flex cursor-pointer items-center justify-end'>
                <span className='mr-1 text-base font-semibold text-primary'>
                  {generic('know_more_button')}
                </span>
                <div
                  style={{
                    position: 'relative',
                    width: '24px',
                    height: '24px'
                  }}
                >
                  <Image
                    src='/images/KnowMoreButton.svg'
                    alt='Footer Logo'
                    fill
                    priority={true}
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
