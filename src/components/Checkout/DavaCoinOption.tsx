'use client'

import Image from 'next/image'
import useUserDetailsStore from '@/store/useUserDetailsStore'
import { Checkbox } from '../ui/checkbox'
import useCheckoutStore from '@/store/useCheckoutStore'
import Link from 'next/link'

export default function DavaCoinOption() {
  const { davaCoinsBalance } = useUserDetailsStore(state => state)
  const { subTotal, isDavaCoinsApplied, toggleApplyDavaCoins } =
    useCheckoutStore(state => state)

  const handleApplyCoins = () => {
    if (subTotal < 199) return
    const coins = getRedeemableDavaCoins(subTotal, davaCoinsBalance ?? 0)
    toggleApplyDavaCoins(!isDavaCoinsApplied, !isDavaCoinsApplied ? coins : 0)
  }

  const getRedeemableDavaCoins = (
    totalCartPrice: number,
    davaCoinBalance: number
  ): number => {
    if (totalCartPrice < 199) {
      return 0 // below minimum cart value for redemption
    }

    let maxPercentage = 0

    if (totalCartPrice >= 199 && totalCartPrice <= 499) {
      maxPercentage = 10
    } else if (totalCartPrice >= 500 && totalCartPrice <= 999) {
      maxPercentage = 15
    } else if (totalCartPrice >= 1000) {
      maxPercentage = 20
    }

    const maxRedeemableCoins = Math.floor(
      (totalCartPrice * maxPercentage) / 100
    )

    // User can only redeem up to their balance
    return Math.min(davaCoinBalance, maxRedeemableCoins)
  }

  return (
    <div className='relative mb-4 mt-2 rounded-md border border-gray-300 bg-white p-4 pb-4'>
      <div className='flex flex-col items-start justify-between gap-3'>
        <div className='flex items-start gap-4'>
          <Checkbox
            checked={isDavaCoinsApplied}
            onCheckedChange={() => handleApplyCoins()}
            className='mt-1 cursor-pointer accent-[#ff8900]'
            disabled={subTotal < 199 ? true : false}
          />
          <div className='flex flex-col gap-2 text-sm leading-tight'>
            <div className='flex items-center gap-1'>
              <Image
                src='/images/dava-coin.svg'
                alt='coin'
                width={24}
                height={24}
              />

              <span>
                <span className='font-semibold text-[#ff3c3c]'>
                  Use DavaCoin{' '}
                </span>
                to pay
              </span>
            </div>

            <span className='text-[13px] text-gray-600'>
              <span className='font-semibold'>{davaCoinsBalance}</span> Coins
              Available
            </span>
            <Link
              href='/info/davacoin-policy'
              className='text-[13px] font-medium text-primary underline underline-offset-2'
            >
              Refer Davacoin Policy
            </Link>
          </div>
        </div>
        <div className='border-t pt-3 text-xs'>
          A user can avail <span className='font-semibold'>20%</span> of their
          DavaCoin balance on an order, with a minimum cart value of{' '}
          <span className='font-semibold'>₹199</span>
        </div>
      </div>
    </div>
  )
}
