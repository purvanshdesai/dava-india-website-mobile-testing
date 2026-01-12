'use client'
// import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dayjs from 'dayjs'
import useUserDetailsStore from '@/store/useUserDetailsStore'
import { ArrowLeftIcon } from 'lucide-react'
import { davaOneMembershipAmount } from '@/constants'

const membershipOptions = [
  {
    name: 'Free Delivery',
    description: 'Free delivery (25 free delivery above order 299)',
    image: '/images/Home/DavaMembership/free-shipping.svg',
    i18nKey: 'free_delivery',
    i18nDescKey: 'free_delivery_description'
  },
  {
    name: 'Dava Coin',
    description: 'Earn upto 20% on all product MRP',
    image: '/images/Home/DavaMembership/coin.svg',
    i18nKey: 'dava_coin',
    i18nDescKey: 'dava_coin_description'
  },
  // {
  //   name: 'Discount',
  //   description: 'Discount upto 5%',
  //   image: '/images/Home/DavaMembership/discount.svg',
  //   i18nKey: 'discount',
  //   i18nDescKey: 'discount_description'
  // },
  {
    name: 'Premium Support',
    description: 'Get priority support via Chat, Call & E-mail',
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
    name: 'Tele-Consultation',
    description: 'Unlimited',
    image: '/images/Home/DavaMembership/doctor.svg',
    i18nKey: 'consultation',
    i18nDescKey: 'consultation_description'
  }
]

const PlanDetails = () => {
  // const membership = useTranslations('HomePageMembership')
  const router = useRouter()

  return (
    <div className='flex flex-col items-center bg-white py-10'>
      <h1 className='mb-2 flex text-lg font-normal text-[#107649]'>
        <div className='relative mb-1 h-6 w-16'>
          <Image
            src={'/images/membership/DavaONELogo.svg'}
            alt='Membership crown'
            className=''
            fill
          />
        </div>
        <span className='mt-0.5'> Membership</span>
      </h1>
      <p className='mb-8 text-center text-xs text-gray-600'>
        Subscribe to our membership and earn more benefits
      </p>

      <div className='flex flex-col gap-6 lg:flex-row'>
        {/* Membership Card */}
        <div className='flex flex-col justify-between rounded-xl bg-gradient-to-b from-[#2A9063] to-[#FFFFFF] p-6 text-white shadow-md'>
          <div className='flex justify-between'>
            <div>
              <h2 className='text-sm font-semibold'>Membership Plan</h2>
              <div className='font-bold'>________</div>
            </div>

            <div>
              <h3 className='text-xl font-semibold'>
                ₹{davaOneMembershipAmount}
              </h3>
              <p className='text-xs font-semibold'>For 6 months.</p>
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='mt-10'>
              <div
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '100px'
                }}
              >
                <Image
                  src={'/images/membership/Flat.svg'}
                  alt='Footer Logo'
                  fill
                />
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center'>
            <Button
              className='mt-8 w-full'
              onClick={() => router.push('/profile/membership/confirmation')}
            >
              Buy Membership
            </Button>
          </div>
        </div>

        {/* Benefits List */}
        <div className='w-80 rounded-xl bg-white p-6 shadow-md lg:w-96'>
          <ul className='space-y-8 text-gray-700'>
            {membershipOptions.map((option, index) => (
              <li key={index} className='flex items-start gap-4'>
                <div
                  key={index}
                  className='relative flex-shrink-0'
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <Image
                    src={option.image}
                    alt='benefit-icon'
                    fill
                    className='object-contain'
                  />
                </div>
                <div className='flex flex-col gap-1 text-left leading-tight'>
                  <span className='text-xs font-semibold'>
                    {/* {membership(option.i18nKey)} */}
                    {option.name}
                  </span>
                  <span className='text-xs'>
                    {/* {membership(option.i18nDescKey)} */}
                    {option.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const PaidPlanDetails = ({
  user,
  membership,
  davaCoinsBalance
}: {
  user: any
  membership?: any
  davaCoinsBalance: number | any
}) => {
  const benefits = [
    {
      label: 'Days',
      value: membership
        ? dayjs(membership?.expiryOn).diff(new Date(), 'days')
        : 0,
      description: 'Remaining',
      icon: '/images/membership/SandClock.svg'
    },
    {
      label: 'Dava Coin',
      value: davaCoinsBalance ?? 0,
      description: 'Earned',
      icon: '/images/Home/DavaMembership/coin.svg'
    },
    {
      label: 'Free Delivery',
      value: membership?.freeDeliveryBalance ?? 0,
      description: 'Remaining',
      icon: '/images/Home/DavaMembership/free-shipping.svg'
    },
    {
      label: 'Tele-Consultation',
      description: 'Unlimited',
      icon: '/images/Home/DavaMembership/doctor.svg'
    }
  ]

  // const membershipTrans = useTranslations('HomePageMembership')
  return (
    <div className='relative flex min-h-screen flex-col items-center rounded-lg bg-white p-6'>
      <div
        className='absolute left-0 top-0 h-full w-full rounded-lg'
        style={{
          backgroundImage: `url('/images/membership/DavaHoneyCombBg.svg')`,
          backgroundColor: 'transparent',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          zIndex: 0
        }}
      />
      {/* Header Section */}
      <div className='z-10 flex flex-col items-center justify-center text-center'>
        <h1 className='mb-2 flex text-lg font-normal text-[#107649]'>
          <div className='relative mb-1 h-6 w-16'>
            <Image
              src={'/images/membership/DavaONELogo.svg'}
              alt='Membership crown'
              className=''
              fill
            />
          </div>
          <span className='mt-0.5'> Membership</span>
        </h1>
        <div className='mt-2 flex flex-col items-center justify-center'>
          <div className='relative mb-1 h-24 w-24'>
            <Image
              src={'/images/membership/DavaCrown.svg'}
              alt='Membership crown'
              className=''
              fill
            />
          </div>
          <div className='flex flex-col items-center gap-1'>
            <p className='text-sm font-medium'>{user?.name}</p>
            <p className='text-sm text-gray-500'>
              membership purchased at{' '}
              <strong>
                {membership
                  ? dayjs(membership?.createdAt).format('DD MMM YYYY')
                  : ''}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Remaining Benefits Section */}
      <div className='z-10 my-8 grid w-full max-w-lg grid-cols-2 gap-6'>
        {benefits.map((item, index) => (
          <div
            key={index}
            className='flex flex-col gap-4 rounded-lg bg-white p-4 shadow-lg'
          >
            <div className='flex flex-col items-start gap-2 text-xs'>
              <div
                key={index}
                className='flex-shrink-0'
                style={{
                  position: 'relative',
                  width: '32px',
                  height: '32px'
                }}
              >
                <Image src={item.icon} alt='benefit-icon' fill />
              </div>
              <span className='text-left text-[11px] font-semibold'>
                {item.label}
              </span>
            </div>
            <div className='flex flex-col items-start gap-1'>
              {item.value !== undefined && item.value !== null ? (
                <h2 className='mt-2 text-left text-2xl font-bold'>
                  {item.value}
                </h2>
              ) : (
                <div className='mt-2 h-5'></div>
              )}
              <p
                className={`text-left text-xs ${
                  item.label === 'Tele-Consultation' ? 'mt-[9px]' : ''
                }`}
              >
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className='z-10 flex flex-col items-center'>
        <h3 className='mb-4 text-base font-semibold'>Your Benefits</h3>
        <div className='w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg'>
          <ul className='space-y-8 text-gray-700'>
            {membershipOptions.map((option, index) => (
              <li key={index} className='flex items-start gap-4'>
                <div
                  className='relative flex-shrink-0'
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <Image
                    src={option.image}
                    alt='benefit-icon'
                    fill
                    className='object-contain'
                  />
                </div>
                <div className='flex flex-col gap-1 text-left leading-tight'>
                  <span className='text-xs font-semibold'>
                    {/* {membershipTrans(option.i18nKey)} */}
                    {option.name}
                  </span>
                  <span className='text-xs'>
                    {/* {membershipTrans(option.i18nDescKey)} */}
                    {option.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const MembershipScreen = () => {
  const { data: session } = useSession() as any
  const { davaoneMembership, davaCoinsBalance } = useUserDetailsStore(
    state => state
  )
  const router = useRouter()

  return (
    <div className='bg-white'>
      {/* Header */}
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.replace('/profile')}
          >
            <ArrowLeftIcon color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>DavaONE Membership</p>
        </div>
      </div>

      <div className='mt-6 p-3'>
        {davaoneMembership && davaoneMembership?.status === 'active' ? (
          <PaidPlanDetails
            user={session?.user}
            membership={davaoneMembership}
            davaCoinsBalance={davaCoinsBalance}
          />
        ) : (
          <PlanDetails />
        )}
      </div>
    </div>
  )
}
export default MembershipScreen
