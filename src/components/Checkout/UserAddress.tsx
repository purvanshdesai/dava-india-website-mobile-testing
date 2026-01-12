'use client'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trash2Icon,
  CircleIcon,
  CircleCheckIcon,
  PlusIcon,
  Edit3Icon
} from 'lucide-react'
import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useEffect, useState } from 'react'
import { deleteUserAddress } from '@/utils/actions/userAddressActions'
import { fetchLocationByZipCode } from '@/utils/actions/zipCodeActions'
import { useTranslations } from 'next-intl'

import Image from 'next/image'
import AlertBox from '@/components/AlertBox'
import { useRouter } from 'next/navigation'

interface Address {
  hideOptions?: boolean
  selected?: boolean
  address: any
}

export default function UserAddress() {
  const router = useRouter()
  const [showOtherAddresses, setShowOtherAddresses] = useState(false)
  const [open, setOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState('')

  const { fetchAddresses, addresses, defaultAddress } = useDeliveryAddressStore(
    state => state
  )
  const cart = useTranslations('Cart')
  const {
    changeAddress: handleAddressChange,
    selectedAddress,
    setCurrentLocation
  } = useCheckoutStore(state => state)

  const handleSelectAddress = async (address: any) => {
    handleAddressChange(address)

    const location = await fetchLocationByZipCode(address?.postalCode)
    if (location) await setCurrentLocation(location)
  }

  const handleDeleteAddress = (address: string) => {
    try {
      setAddressToDelete(address)
      setOpen(true)
    } catch (error) {
      console.log(error)
    }
  }

  const onContinue = async () => {
    try {
      await deleteUserAddress(addressToDelete)
      fetchAddresses()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  useEffect(() => {
    if (!addresses.length) return

    const chosenAddress: any = addresses.find(
      address => address._id === selectedAddress?._id
    )

    if (chosenAddress && !chosenAddress?.coordinates) {
      router.push('/checkout/address/' + chosenAddress?._id)
    }
  }, [addresses])

  const getOtherAddresses = () => {
    if (!addresses?.length) return []

    return addresses?.filter(a => a._id !== defaultAddress?._id)
  }

  const AddressCard = ({ hideOptions, address }: Address) => {
    return (
      <Card
        className={`border border-gray-300 transition-all dark:bg-gray-900`}
      >
        <div className='grid grid-cols-[40px_1fr] p-4'>
          {!hideOptions && (
            <div onClick={() => handleSelectAddress(address)}>
              {selectedAddress?._id === address?._id ? (
                <CircleCheckIcon
                  size={20}
                  className='cursor-pointer text-primary'
                />
              ) : (
                <CircleIcon
                  size={18}
                  className='cursor-pointer text-label dark:text-label-dark'
                />
              )}
            </div>
          )}
          <div className='space-y-2 text-sm'>
            <h1 className='text-sm font-semibold'>
              {address.userName}{' '}
              {address?.type && (
                <span className='ml-3 rounded-full bg-primary-green-dim px-2 py-1 text-xs font-normal'>
                  {address?.type}
                </span>
              )}
            </h1>
            <p className='text-sm text-label dark:text-label-dark'>
              {address.addressLine1}, {address.addressLine2},
            </p>
            <p className='text-sm text-label dark:text-label-dark'>
              {address.city}, {address.state}, {address.country}, Pin:{' '}
              {address.postalCode}
            </p>
            <p className='flex gap-2'>
              <span className='text-label dark:text-label-dark'>Phone:</span>
              <span className='font-medium'>{address.phoneNumber}</span>
            </p>

            {!hideOptions && (
              <div className='flex gap-3 pt-3'>
                {/* <AddNewAddressDialog
                  addressId={address._id}
                  address={address}
                  loading={loading}
                /> */}
                <Button
                  onClick={() =>
                    router.push(`/checkout/address/${address._id}`)
                  }
                  variant={'outline'}
                  size={'sm'}
                  className='flex gap-2'
                >
                  <Edit3Icon size={16} />
                  {cart('edit_address')}
                </Button>

                <Button
                  variant={'outline'}
                  size={'sm'}
                  onClick={() => handleDeleteAddress(address._id)}
                  className='flex gap-2'
                >
                  <Trash2Icon size={16} />
                  {cart('remove')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {defaultAddress && (
        <div>
          <p className='pb-3 text-xs font-medium'>{cart('default_address')}</p>
          {AddressCard({ hideOptions: false, address: defaultAddress })}
        </div>
      )}

      {getOtherAddresses()?.length > 0 && (
        <div>
          {/* Toggle heading */}
          <div
            className='mt-2 flex cursor-pointer items-center justify-between border-t pt-4'
            onClick={() => setShowOtherAddresses(prev => !prev)}
          >
            <p className='text-sm font-medium'>Previously Saved Addresses</p>
            <div className='rounded border p-1'>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  showOtherAddresses ? 'rotate-180' : ''
                }`}
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>

          {/* Toggle content */}
          {showOtherAddresses && (
            <div className='mt-3 space-y-2'>
              {getOtherAddresses()
                .filter(a => !a.isDefault)
                .map((address, idx) => (
                  <div key={idx}>
                    {AddressCard({ hideOptions: false, address })}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <div className='flex flex-col gap-3'>
        {!addresses.length && (
          <Card className='border border-gray-300 dark:bg-gray-900'>
            <CardHeader className='flex flex-row items-center gap-3'>
              <div
                style={{ position: 'relative', width: '80px', height: '80px' }}
              >
                <Image
                  src={`/images/NoAddress.svg`}
                  alt='no-Address'
                  fill
                  priority={false}
                />
              </div>
              <div className='text-sm'>
                <span className='text-red-500'>No Address Available! </span>
                Please add new address by click on 'Add New Address' to continue
                your purchase.
              </div>
            </CardHeader>
          </Card>
        )}
        <Card className='flex cursor-pointer items-center justify-center rounded-lg border border-[#E75634] capitalize dark:bg-gray-900'>
          <PlusIcon color='#E75634' />{' '}
          <CardHeader
            className=''
            onClick={() => router.push('/checkout/address/new')}
          >
            <p className='text-sm text-[#E75634]'>Add new Address</p>
          </CardHeader>
        </Card>
      </div>

      <AlertBox
        openState={[open, setOpen]}
        content={'Are you sure you want to delete this address?'}
        onContinue={onContinue}
      />
    </div>
  )
}
