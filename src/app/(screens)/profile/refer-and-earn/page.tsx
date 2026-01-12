'use client'

import React from 'react'
import Image from 'next/image'
import { Copy, ArrowLeftIcon } from 'lucide-react'
import { useFetchReferAndEarn } from '@/utils/hooks/useUserReferral'
import { useToast } from '@/hooks/use-toast'
import { Link, useTransitionRouter } from 'next-view-transitions'

export default function ReferAndEarn() {
  const { toast } = useToast()
  const { data: referral } = useFetchReferAndEarn() as any
  const referralLink = `${window?.location?.origin}/login?ref=${referral?.referralCode ?? '...'}`
  const router = useTransitionRouter()

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)

    toast({
      title: 'Link Copied!',
      description: 'Now you can share with your friends and family!'
    })
  }

  return (
    <div className='flex bg-gray-100'>
      {/* Header */}
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.replace('/profile')}
          >
            <ArrowLeftIcon color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Refer and Earn</p>
        </div>
      </div>

      <div className='mt-12 w-full space-y-8 self-start rounded-2xl bg-white p-6 shadow-md'>
        {/* Subtitle */}
        <p className='flex flex-col items-center gap-3 text-gray-700'>
          Refer davaindia app to friends and family and Earn
          <div>
            <Image
              src='/images/refer-coin.png'
              alt='DavaCoin Icon'
              width={20}
              height={20}
              className='inline-block'
            />
            <span className='font-bold text-pink-600'>50 DavaCoin</span> in your
            account
          </div>
        </p>

        {/* Orange Box */}
        <div
          className='relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:flex-row md:items-start'
          style={{ backgroundColor: 'rgba(255, 245, 236, 1)' }}
        >
          {/* Background Image */}
          <Image
            src='/images/refer-and-earn-bg.png'
            alt='Refer Background'
            fill
            className='object-cover object-center opacity-30' // adjust opacity & position
            priority
          />

          {/* Content Wrapper so text stays above bg */}
          <div className='relative z-10 w-full space-y-4 md:w-2/3'>
            <p className='font-semibold'>Your Referral link :</p>

            <div className='flex w-full justify-center md:justify-start'>
              <Image
                src='/images/refer-and-earn.svg'
                alt='Hexagon Visual'
                width={443}
                height={350}
                className='object-contain opacity-90'
              />
            </div>

            {/* Referral Link */}
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-3'>
                <p className='break-all text-sm text-primary underline'>
                  {referralLink || 'Loading...'}
                </p>
                <Copy
                  className='h-4 w-4 flex-shrink-0 cursor-pointer text-gray-600'
                  onClick={() => handleCopy(referralLink)}
                />
              </div>
            </div>

            {/* Share Button */}
            <button
              className='rounded-md bg-orange-500 px-5 py-2 text-sm text-white hover:bg-orange-600'
              onClick={() =>
                navigator.share?.({
                  title: 'Davaindia Referral',
                  url: referralLink
                })
              }
            >
              🔗 Share
            </button>

            {/* Terms */}
            <p className='text-xs text-gray-600'>
              By entering into this programme, you agree and accept our{' '}
              <Link
                href='/terms-and-conditions'
                className='text-blue-600 underline'
              >
                Terms & Conditions
              </Link>
            </p>

            {/* How to Use */}
            <div className='text-sm text-gray-700'>
              <p className='mb-1 font-semibold'>How to use :</p>
              <p>
                To get{' '}
                <span className='font-semibold text-pink-600'>50 DavaCoin</span>
                , share your referral code or link with your friends and family
                and ask them to use this link to download the app. Your coin
                will be credited once your referee completes their first order.
              </p>
            </div>
          </div>
        </div>

        {/* Green Box */}
        {/* <div
          className='flex flex-col justify-between gap-6 rounded-xl md:flex-row'
          style={{ backgroundColor: 'rgba(237, 255, 245, 1)' }}
        >
          <div className='w-full space-y-4 p-6 md:w-2/3'>
            <p className='font-semibold'>Enter the Code</p>
            <p className='text-sm text-gray-700'>
              Enter the code you received from the referrer
            </p>

            <input
              type='text'
              placeholder='Enter the code you received from the referrer'
              className='w-full rounded-md border border-gray-300 px-4 py-2'
            />

            <button className='w-fit rounded-md bg-orange-500 px-5 py-2 text-sm text-white hover:bg-orange-600'>
              Submit
            </button>

            <p className='text-xs text-gray-600'>
              By entering into this programme, you agree and accept our{' '}
              <a href='#' className='text-blue-600 underline'>
                Terms & Conditions
              </a>
            </p>
          </div>

          <div className='flex w-full justify-center md:w-auto md:justify-end'>
            <Image
              src='/images/refer-and-earn.png'
              alt='Hexagon Visual'
              width={443}
              height={350}
              className='object-contain opacity-90'
            />
          </div>
        </div> */}
      </div>
    </div>
  )
}
