'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useTranslations } from 'next-intl'
import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useSession } from 'next-auth/react'
import { fetchLocationByZipCode } from '@/utils/actions/zipCodeActions'
import { MapPinned } from 'lucide-react'

export default function PinCodeDrawer({ isOpen, onClose }: any) {
  const session = useSession()
  const isLoggedIn = session.status === 'authenticated'
  const drawerRef = useRef<any>(null)
  const locationManager = useTranslations('LocationManager')
  const productTranslation = useTranslations('Product')
  const cart = useTranslations('Cart')

  const { addresses } = useDeliveryAddressStore(state => state)
  const {
    changeAddress: handleAddressChange,
    setCurrentLocation,
    currentLocation
  } = useCheckoutStore(state => state)

  const [zipCode, setZipCode] = useState(currentLocation?.zipCode ?? '')
  const [isZipCodeNotExist, setZipCodeNotExistStatus] = useState(false)
  // const [tempData, setTempData] = useState({}) as any
  const [isLoading, setIsLoading] = useState(true)

  const handleClickOutside = (event: any) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      onClose()
    }
  }

  useEffect(() => {
    const fetchNewLocation = async () => {
      setIsLoading(true)
      const res = await fetchLocationByZipCode(zipCode)
      if (!res.location) setZipCodeNotExistStatus(true)
      else {
        setCurrentLocation(res)
        // setTempData(res)
        setZipCodeNotExistStatus(false)
      }
      setIsLoading(false)
    }

    if (zipCode?.length === 6 && zipCode !== currentLocation?.zipCode)
      fetchNewLocation()
  }, [zipCode])

  const handleApply = () => {
    if (zipCode?.length === 6 && !isZipCodeNotExist) {
      // setCurrentLocation(tempData)
      onClose()
    }
  }
  const handleSelectAddress = (address: any) => {
    setZipCode(address?.postalCode)
    handleAddressChange(address)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div>
      {isOpen && (
        <Drawer open={isOpen}>
          <DrawerContent ref={drawerRef} className='h-3/5'>
            <DrawerHeader className='flex flex-row justify-start border-b-2'>
              <DrawerTitle>{locationManager('choose_location')}</DrawerTitle>
            </DrawerHeader>
            <div className='h-[calc(100vh-150px)] overflow-y-auto p-5'>
              <div className='flex flex-col gap-3 divide-y divide-gray-300'>
                <div className='flex flex-col gap-3 px-4 pb-2 pt-4'>
                  <span className='text-sm font-semibold'>
                    {locationManager('enter_pincode')}
                  </span>
                  <div className='w-50 relative'>
                    <MapPinned
                      className='absolute left-2 top-2 text-gray-500'
                      size={20}
                    />
                    <Input
                      placeholder={locationManager('pincode')}
                      value={zipCode}
                      className='px-10 text-sm font-semibold'
                      onChange={e => setZipCode(e.target.value)}
                      autoFocus={false}
                    />
                    <div
                      className='absolute right-2 top-2 font-semibold text-primary'
                      onClick={handleApply}
                    >
                      {cart('apply_button')}
                    </div>
                  </div>
                  {!isLoading && (
                    <div>
                      {isZipCodeNotExist ? (
                        <p className='text-xs font-semibold italic text-red-600'>
                          {productTranslation('pincode_not_available')}
                        </p>
                      ) : (
                        <p className='text-xs italic text-label'>
                          {zipCode && zipCode.length > 6 ? (
                            <span className='italic text-red-600'>
                              Enter valid pincode
                            </span>
                          ) : (
                            `${currentLocation?.area}, ${currentLocation?.district}`
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {isLoggedIn ? (
                  <div className='max-h-96 overflow-y-auto'>
                    {addresses && addresses.length > 0 && (
                      <div className='px-3 pb-4'>
                        <p className='px-2 py-3 text-base font-semibold'>
                          My Addresses
                        </p>
                        <ul className='flex flex-col gap-2 px-2'>
                          {addresses?.map((address: any) => {
                            const isSelected =
                              currentLocation?.zipCode == address?.postalCode

                            return (
                              <li
                                key={address?._id}
                                onClick={() => handleSelectAddress(address)}
                                className={`rounded border ${
                                  isSelected
                                    ? 'bg-primary-dim'
                                    : 'cursor-pointer'
                                } ${
                                  isSelected
                                    ? 'border-primary'
                                    : 'border-[#DDDDDD]'
                                } p-3 text-sm`}
                              >
                                <p className='font-semibold'>
                                  {address?.userName},
                                </p>
                                {address?.type && (
                                  <span> {address?.type}, </span>
                                )}
                                <span>
                                  {address.addressLine1}, {address.addressLine2}
                                  , {address.city}
                                </span>
                                <p>
                                  {address.state}, {address.country}
                                </p>
                                <p className='font-semibold'>
                                  {address.postalCode}
                                </p>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-3 p-4'>
                    <Button type='button' className='w-full'>
                      {locationManager('sign_in')}
                    </Button>
                    <span className='text-xs text-gray-400'>
                      {locationManager('sign_in_description')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
