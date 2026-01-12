import React from 'react'
import { CircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
// import Image from 'next/image'

const InnerDavaCard = () => {
  const membershipFeatures = [
    'Free Delivery',
    'Premium Support',
    'Discounts',
    'Exclusive Deals',
    'Dava Coins',
    'Free Consultation'
  ]
  const membership = useTranslations('HomePageMembership')
  return (
    <div>
      <div className='py-6'>
        <div
          className='relative w-full rounded-md bg-gradient-to-b'
          style={{
            background: 'linear-gradient(to bottom, #2DA771,#2A8D61)'
          }}
        >
          <div
            className='absolute left-0 top-0 h-full w-full rounded-lg'
            style={{
              backgroundImage: `url('/images/membership/DavaMembership.svg')`,
              backgroundColor: 'transparent',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center',
              backgroundSize: '',
              zIndex: 0
            }}
          />
          <div className='space-y-2 p-3 text-white md:p-4'>
            <div className='relative flex items-center'>
              <p className='flex items-center gap-2 rounded-3xl bg-white px-2 pb-2 pt-0.5 text-sm font-semibold text-primary-teal'>
                <img
                  src='/images/membership/DavaONELogo.svg'
                  alt='DavaOne'
                  className='w-12'
                />
                <span className='mt-1.5'> {membership('membership')}</span>
              </p>
            </div>

            <div className='grid items-center justify-center pt-3 md:grid-cols-[2fr_1fr] md:pt-0'>
              <div className='grid grid-cols-2 gap-6'>
                {membershipFeatures.map((f, idx) => {
                  return (
                    <div
                      className='flex items-center gap-2 text-sm font-medium'
                      key={idx}
                    >
                      <CircleIcon size={10} className='rounded-full bg-white' />
                      {f}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {/* <div
            style={{
              // position: 'relative',
              width: 'auto',
              height: '237px'
            }}
            className='mt-5'
          >
            <Image
              src={`/images/membership/DavaInnerPrice.svg`}
              alt='Footer Logo'
              fill
              priority={false}
            />
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default InnerDavaCard
