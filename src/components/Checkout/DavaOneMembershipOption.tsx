import Image from 'next/image'
import React from 'react'
import { Checkbox } from '../ui/checkbox'
import useCheckoutStore from '@/store/useCheckoutStore'
import useUserDetailsStore from '@/store/useUserDetailsStore'
import { davaOneMembershipAmount } from '@/constants'
import { IndianRupeeIcon } from 'lucide-react'

export default function DavaOneMembershipOption() {
  const {
    isDavaOneMembershipAdded,
    toggleApplyDavaOneMembership,
    isOrderConfirmed,
    checkoutCopy
  } = useCheckoutStore(state => state)
  const { davaoneMembership } = useUserDetailsStore(state => state)

  if (
    (davaoneMembership && davaoneMembership?.status === 'active') ||
    (isOrderConfirmed && !checkoutCopy?.isDavaOneMembershipAdded)
  )
    return <></>

  return (
    <div className='rounded-md bg-white p-3 shadow'>
      <div className='flex items-center gap-4'>
        {!isOrderConfirmed && (
          <div className='mt-1'>
            <Checkbox
              checked={isDavaOneMembershipAdded}
              onCheckedChange={(checked: boolean) =>
                toggleApplyDavaOneMembership(
                  checked,
                  checked ? davaOneMembershipAmount : 0
                )
              }
            />
          </div>
        )}

        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='flex text-lg font-normal text-[#107649]'>
              <div className='relative h-6 w-16'>
                <Image
                  src={'/images/membership/DavaONELogo.svg'}
                  alt='Membership crown'
                  className=''
                  fill
                />
              </div>
              <span className='mt-0.5'> Membership</span>
            </h1>
          </div>

          <div>
            <div className='flex items-center justify-center pr-3 text-right text-sm'>
              <IndianRupeeIcon size={12} />
              <span>99.00</span>
            </div>
          </div>
        </div>
      </div>

      {isOrderConfirmed && checkoutCopy?.isDavaOneMembershipAdded && (
        <div className='flex items-center gap-2 p-2'>
          <p className='text-sm'>
            <span className='font-bold text-primary-green'>Yayy!</span> you have
            purchased DavaONE membership
          </p>
        </div>
      )}
    </div>
  )
}
