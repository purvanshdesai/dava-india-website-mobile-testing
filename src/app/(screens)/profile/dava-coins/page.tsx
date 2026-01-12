'use client'
import Image from 'next/image'
import { useFetchDavaCoinsHistory } from '@/utils/hooks/davaCoinsHooks'
import dayjs from 'dayjs'
import useUserDetailsStore from '@/store/useUserDetailsStore'
import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DavaCoinsPage() {
  const { data: coinsHistory, isLoading } = useFetchDavaCoinsHistory()
  const { davaCoinsBalance, fetchUserDetails } = useUserDetailsStore(
    state => state
  )
  const router = useRouter()

  // Refetch user details when page loads to ensure balance is up-to-date
  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  return (
    <div className='bg-white'>
      {/* Header */}
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeftIcon color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Dava Wallet</p>
        </div>
      </div>

      <div className='mt-14 p-4'>
        <div
          className='relative mb-6 overflow-hidden rounded-xl p-4 text-white md:p-6'
          style={{ background: 'linear-gradient(to bottom, #2DA771,#2A8D61)' }}
        >
          <div className='mb-1 flex items-center gap-2'>
            <Image
              src='/images/dava-multiple-coins.svg'
              alt='DavaCoins'
              width={52}
              height={52}
            />
            <p className='text-2xl font-bold md:text-2xl'>DavaCoins</p>
          </div>

          <p className='mb-2 text-base font-semibold md:text-base'>
            Earn DavaCoin on Every Order!
          </p>

          <div className='space-y-2 text-xs md:text-sm'>
            <p>1. Spend ₹0–499 & get 5% cashback as DavaCoin.</p>
            <p>2. Spend ₹500–999 & get 10% back as DavaCoin.</p>
            <p>3. Spend ₹1000 or more & get 20% back as DavaCoin.</p>
          </div>

          <div className='pointer-events-none absolute right-2 top-2 h-12 w-auto md:h-16'>
            <Image
              src='/images/multi-tablets.svg'
              alt='Tablets'
              width={84}
              height={84}
            />
          </div>

          <div className='absolute bottom-1 right-3 text-[8px]'>
            *T & C applied
          </div>
        </div>
        <div className='mb-6 rounded-xl border border-[#DFE4EA] bg-white p-4 shadow-xl'>
          <div className='flex flex-col items-center text-center'>
            <div className='h-10 w-auto md:h-12'>
              <Image
                src='/images/dava-multiple-coins.svg'
                alt='coin'
                width={56}
                height={56}
              />
            </div>
            <div className='mt-0 flex items-center gap-2'>
              <p className='text-2xl font-bold text-gray-900'>
                {davaCoinsBalance}
              </p>
              <span className='text-sm font-semibold text-gray-700'>Coins</span>
            </div>
            <span className='mt-1 text-xs text-gray-600'>
              Your Dava Wallet <br /> ( 1 Coin is equivalent to the value of
              Rs.1 )
            </span>
          </div>
        </div>

        {/* Coin Usage Table */}
        <h3 className='mb-2 text-sm font-bold text-gray-700'>
          Coin Usage History
        </h3>
        <div className='space-y-2'>
          {(coinsHistory?.data ?? [])
            .sort(
              (a: any, b: any) =>
                dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
            )
            .map((item: any, idx: number) => (
              <div
                key={idx}
                className='space-y-2 rounded-md border border-gray-100 p-3 text-xs hover:bg-gray-50'
              >
                <div className={``}>
                  <strong>Description</strong>: {item.description}
                </div>
                <div className=''>
                  <strong>OrderId</strong>: {item.orderId ?? '-'}
                </div>
                <div className='flex items-center gap-1'>
                  <span className='font-bold'>Coins:</span>
                  <div
                    className={`${item.usageType === 'credit' ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {item.usageType === 'credit'
                      ? `+${item.coins}`
                      : `-${item.coins}`}
                  </div>
                </div>

                <div className=''>
                  {dayjs(item.createdAt).format('DD MMM YYYY')}
                </div>
              </div>
            ))}

          {!isLoading && (!coinsHistory || !coinsHistory?.data?.length) && (
            <div className='flex items-center justify-center p-4 text-sm'>
              No history found!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
