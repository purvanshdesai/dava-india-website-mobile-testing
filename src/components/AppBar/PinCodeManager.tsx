import React, { useState } from 'react'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { MapPin } from 'lucide-react'
import useCheckoutStore from '@/store/useCheckoutStore'
import PinCodeDrawer from './PinCodePopover'
import Image from 'next/image'

export default function MobilePinCodeManager() {
  const { currentLocation } = useCheckoutStore(state => state)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleOpenDrawer = () => setIsDrawerOpen(true)
  const handleCloseDrawer = () => setIsDrawerOpen(false)

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <div
            className='flex w-56 cursor-pointer items-center gap-1.5 rounded-full py-1.5 text-sm'
            onClick={handleOpenDrawer}
          >
            <div
              className='mx-1 rounded-full bg-gradient-to-b p-1.5'
              style={{
                background: 'linear-gradient(to bottom, #2DA771,#2A8D61)'
              }}
            >
              <MapPin size={12} className='text-white' />
            </div>

            <span className='text-base font-bold text-primary'>
              {currentLocation?.zipCode || 'Enter Pincode'}
              <span className='text-base text-label'>,</span>
            </span>
            <span className='truncate text-base font-medium text-label'>
              {currentLocation?.area || ''}
            </span>

            <div className='relative ml-1 h-4 w-4'>
              <Image
                src={'/images/drowdown-arrow.svg'}
                alt='Dropdown Arrow'
                fill
                objectFit='contain'
              />
            </div>
          </div>
        </PopoverTrigger>
        {/* PinCodeDrawer is triggered separately */}
        {isDrawerOpen && (
          <PinCodeDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
        )}
      </Popover>
    </div>
  )
}
