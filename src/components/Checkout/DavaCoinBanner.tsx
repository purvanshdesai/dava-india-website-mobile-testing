'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function OneMembershipBanner() {
  const features = [
    {
      image: '/images/Free e-Consultation.svg',
      alt: 'Free Tele-consultation Unlimited',
      text: 'Unlimited tele-Consultation'
    },
    // {
    //   image: '/images/Discounts.svg',
    //   alt: 'Discounts',
    //   text: 'Discounts'
    // },
    {
      image: '/images/Dava Coins.svg',
      alt: 'Dava Coins',
      text: 'Dava Coins'
    },
    {
      image: '/images/Exclusive Deals.svg',
      alt: 'Exclusive Deals',
      text: 'Exclusive Deals'
    },
    {
      image: '/images/Premium Support.svg',
      alt: 'Premium Support',
      text: 'Premium Support'
    },
    {
      image: '/images/Free Delivery.svg',
      alt: 'Free Delivery',
      text: 'Free Delivery'
    }
  ]

  const scrollFeatures = [...features, features[0]]

  const [translateY, setTranslateY] = useState(0)
  const [transitionDuration, setTransitionDuration] = useState(0)
  const itemHeight = 50
  const intervalTime = 2000
  const transitionSpeed = 500

  useEffect(() => {
    let index = 0
    let interval: NodeJS.Timeout | null = null

    const startScroll = () => {
      interval = setInterval(() => {
        index++
        setTransitionDuration(transitionSpeed)
        setTranslateY(-itemHeight * index)
        if (index === scrollFeatures.length - 1) {
          setTimeout(() => {
            setTransitionDuration(0)
            setTranslateY(0)
            index = 0
          }, transitionSpeed)
        }
      }, intervalTime)
    }

    startScroll()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  return (
    <div className='p-2'>
      <Link href={'/profile/membership'} className='block w-full'>
        <div className='w-full cursor-pointer rounded-lg bg-[linear-gradient(180deg,_rgba(45,167,113,1),_rgba(42,141,97,1))] px-4 py-3 text-white'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-shrink-0'>
              <div className='inline-flex items-center justify-center rounded-lg px-3 py-2 shadow-sm'>
                <Image
                  src='/images/membership-logo.svg'
                  alt='One Membership'
                  width={120}
                  height={30}
                />
              </div>
            </div>
            <div className='flex-1 overflow-hidden' style={{ height: '50px' }}>
              <div
                className='flex flex-col'
                style={{
                  transform: `translateY(${translateY}px)`,
                  transition: `transform ${transitionDuration}ms ease-in-out`
                }}
              >
                {scrollFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className='flex h-[50px] items-center justify-start gap-3 px-1'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center'>
                        <Image
                          src={feature.image}
                          alt={feature.alt}
                          width={36}
                          height={36}
                          className='object-contain'
                        />
                      </div>
                      <span className='text-[10px] font-bold leading-none text-white'>
                        {feature.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
