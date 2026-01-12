'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin } from 'lucide-react'

import { addressFormSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useEffect, useState } from 'react'
import {
  createUserAddress,
  fetchUserAddress,
  patchUserAddress
} from '@/utils/actions/userAddressActions'
import { useSession } from 'next-auth/react'
import { useFetchLocationByZipCode } from '@/utils/hooks/zipCodeHooks'
// import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { useParams } from 'next/navigation'
import { useTransitionRouter } from 'next-view-transitions'
import { Card, CardContent } from '@/components/ui/card'
import { useDebouncedValue } from '@/hooks/useDebounce'
import { autoCompleteMapSearch, getGMapPlaceDetails } from '@/lib/google'
import dynamic from 'next/dynamic'
import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'

const LazyMap = dynamic(
  () => import('@/components/Map/Map').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <p>Loading map...</p>
  }
)

const AddressDetails = () => {
  const { addressId }: { addressId: string } = useParams()

  const [address, setAddress] = useState<any>()
  // const fetchAddresses = useDeliveryAddressStore(state => state.fetchAddresses)
  const [addressType, setAddressType]: any = useState<'Home' | 'Office' | ''>(
    ''
  )
  const [pinCode, setPinCode] = useState<any>(null)
  const [isMapView, setMapViewStatus] = useState<boolean>(true)
  const router = useTransitionRouter()
  const { fetchAddresses } = useDeliveryAddressStore()
  const { data: newLocation, isLoading } = useFetchLocationByZipCode(
    pinCode,
    pinCode?.length === 6
  )

  const cart = useTranslations('Cart')
  const mobPro = useTranslations('MobileProfile')

  const fetch = async () => {
    const result = await fetchUserAddress(addressId)
    setAddress(result)
  }

  useEffect(() => {
    if (addressId !== 'new') {
      fetch()
    }
  }, [addressId])

  // form
  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      userName: '',
      phoneNumber: '',
      alternatePhoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      city: '',
      state: '',
      isDefault: false,
      type: '',
      coordinates: {
        longitude: address?.coordinates?.longitude ?? 77.043908,
        latitude: address?.coordinates?.latitude ?? 13.805108
      },
      fullAddress: address?.fullAddress ?? ''
    }
  })

  useEffect(() => {
    if (address) {
      // Reset the form with the fetched address data
      form.reset({
        userName: address.userName ?? '',
        phoneNumber: address.phoneNumber ?? '',
        alternatePhoneNumber: address.alternatePhoneNumber ?? '',
        addressLine1: address.addressLine1 ?? '',
        addressLine2: address.addressLine2 ?? '',
        postalCode: address.postalCode ?? '',
        city: address.city ?? '',
        state: address.state ?? '',
        isDefault: address.isDefault ?? false,
        type: address.type ?? '',
        coordinates: {
          longitude: address?.coordinates?.longitude ?? 77.043908,
          latitude: address?.coordinates?.latitude ?? 13.805108
        },
        fullAddress: address?.fullAddress ?? ''
      })

      // Set the address type for UI state
      if (address.type) {
        handleTypeSelection(address.type)
      }
    }
  }, [address, form])

  useEffect(() => {
    if (newLocation || !isLoading) {
      if (!form.getValues('postalCode')) {
        form.setValue('postalCode', newLocation?.location?.zipCode)
      }
      // form.setValue('addressLine2', newLocation?.location?.area)
      form.setValue('city', newLocation?.location?.district)
      form.setValue('state', newLocation?.location?.state)
    }
  }, [newLocation, form])

  // session to get user id
  const session = useSession() as any

  // function to set address type
  const handleTypeSelection = (type: 'home' | 'office') => {
    setAddressType(type)
    form.setValue('type', type)
  }

  // on submit to save data
  const onSubmit = async (data: z.infer<typeof addressFormSchema>) => {
    try {
      if (addressId !== 'new') {
        await patchUserAddress(addressId, data)
      } else {
        await createUserAddress({
          ...data,
          country: 'india',
          userId: session?.data?.user?.id
        })
      }
      await fetchAddresses()
      form.reset({
        userName: '',
        phoneNumber: '',
        alternatePhoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        city: '',
        state: '',
        isDefault: false,
        type: ''
      })

      setAddressType('')
      setPinCode('')
      setMapViewStatus(true)
      router.back()
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceSelection = (place: any) => {
    const getComponent = (components: any[], type: string): string => {
      return components.find(comp => comp.types.includes(type))?.long_name || ''
    }

    const getMultipleComponents: any = (
      components: any[],
      types: string[]
    ): string[] => {
      return types
        .map(type => getComponent(components, type))
        .filter(name => !!name)
    }

    const components = place.address_components || []

    // Street address
    // const streetNumber = getComponent(components, 'street_number')
    // const route = getComponent(components, 'route')
    // const premise = getComponent(components, 'premise')
    // const addressLine1 = [premise, streetNumber, route]
    //   .filter(Boolean)
    //   .join(', ')
    // form.setValue('addressLine1', addressLine1)

    // Locality details - include up to 3 levels
    const localityParts = getMultipleComponents(components, [
      'sublocality',
      'sublocality_level_1',
      'sublocality_level_2',
      'sublocality_level_3',
      'neighborhood',
      'locality'
    ])

    const addressLine2 = localityParts.slice(0, 3).join(', ') // Max 3 parts
    form.setValue('addressLine2', addressLine2)

    // Coordinates
    form.setValue('coordinates', {
      longitude: place.lng,
      latitude: place.lat
    })

    // Full address
    form.setValue('fullAddress', `${place.name}, ${place.formatted_address}`)

    // Postal code
    if (place.postalCode) {
      form.setValue('postalCode', place.postalCode)
      setPinCode(place.postalCode)
    }
  }

  const AddressAutocomplete = ({ onPlaceSelected }: any) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [places, setPlaces] = useState<Array<any>>([])
    const [isLoading, setLoading] = useState(false)

    const { debouncedValue: debouncedSearchText, isDebouncing } =
      useDebouncedValue(searchQuery, 500)

    const handleSelectPlace = async (place: any) => {
      const details: any = await getGMapPlaceDetails(place?.place_id)

      if (!details) return

      onPlaceSelected({
        ...details,
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
      })
      setSearchQuery('')
      setPlaces([])
    }

    const fetchPlaces = async () => {
      setLoading(true)
      const results = await autoCompleteMapSearch(debouncedSearchText)

      setPlaces(results ?? [])
      setLoading(false)
    }

    useEffect(() => {
      if (debouncedSearchText?.length > 3) fetchPlaces()
    }, [debouncedSearchText])

    return (
      <div className='relative flex flex-col space-y-5'>
        <div>
          <Input
            placeholder='Enter your address'
            value={searchQuery}
            onChange={(e: {
              target: { value: React.SetStateAction<string> }
            }) => {
              setSearchQuery(e.target.value)
            }}
            className='w-full rounded border border-gray-300 p-2'
            name={'address'}
          />

          {searchQuery && (
            <Card className='absolute top-full z-10 mt-1 w-full border'>
              <CardContent className='p-2'>
                {places.length > 0 ? (
                  places.map(place => {
                    // Use regex to wrap matched text in <strong>
                    const regex = new RegExp(`(${searchQuery})`, 'gi')
                    const highlightedDescription = place.description.replace(
                      regex,
                      '<strong>$1</strong>'
                    )

                    return (
                      <div
                        key={place.place_id}
                        onClick={() => handleSelectPlace(place)}
                        className='flex cursor-pointer items-center gap-1 rounded-md p-1.5 text-sm hover:bg-gray-100'
                      >
                        <MapPin className='text-red-600' size={18} />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightedDescription
                          }}
                        />
                      </div>
                    )
                  })
                ) : (
                  <p className='p-2 text-sm font-semibold text-gray-500'>
                    {isDebouncing || isLoading
                      ? 'Loading...'
                      : 'No results found'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='h-screen bg-white'>
        <div>
          <div className='mb-2 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-2'>
            <div className='flex flex-row items-center justify-center bg-white'>
              <div
                className='rounded-full bg-[#F4F4F4] p-2'
                onClick={() => router.back()}
              >
                <ArrowLeft color='#3C3C3C' size={20} />
              </div>

              <p className='ml-2 font-semibold'>
                {addressId !== 'new' ? 'Edit Address' : 'Add Address'}
              </p>
            </div>
          </div>
        </div>
        <div className='mt-2 px-4 py-2'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(data => {
                console.log('Form is being submitted')
                onSubmit(data)
              })}
            >
              {isMapView ? (
                <div>
                  <div className='col-span-2 w-full space-y-3'>
                    <AddressAutocomplete
                      onPlaceSelected={(place: any) => {
                        handlePlaceSelection(place)
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={'coordinates'}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select coordinates</FormLabel>
                          <div className='text-xs text-red-600'>
                            {form.formState.errors?.coordinates && (
                              <div>Longitude and latitude is required! </div>
                            )}
                          </div>

                          <FormControl>
                            {field.value && (
                              <LazyMap
                                addressId={addressId}
                                coordinates={{
                                  lng: form.watch('coordinates.longitude'),
                                  lat: form.watch('coordinates.latitude')
                                }}
                                onPlaceSelected={(value: any) =>
                                  field.onChange({
                                    longitude: value.lng,
                                    latitude: value.lat
                                  })
                                }
                              />
                            )}
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  <div
                    className='cursor-pointer rounded-md bg-green-700 p-3 text-white'
                    onClick={() => setMapViewStatus(true)}
                  >
                    <p className='text-sm font-bold'>Selected Address</p>

                    <div className='pt-1 text-sm'>
                      {form.watch('fullAddress')}
                    </div>
                  </div>
                  <Input
                    {...form.register('userName')}
                    placeholder='Enter your name*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />

                  <Input
                    {...form.register('phoneNumber')}
                    placeholder='Mobile Number*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />
                  <Input
                    {...form.register('alternatePhoneNumber')}
                    placeholder='Alternate Mobile Number*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />

                  <Input
                    {...form.register('postalCode')}
                    placeholder='Pin Code*'
                    style={{ backgroundColor: '#F9F9F9' }}
                    onChange={e => setPinCode(e.target.value)}
                  />

                  <Input
                    {...form.register('addressLine1')}
                    placeholder='Address*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />

                  <Input
                    {...form.register('addressLine2')}
                    placeholder='Locality / Town*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />

                  <div className='grid grid-cols-2 gap-3'>
                    <Input
                      {...form.register('city')}
                      placeholder='City / District*'
                      style={{ backgroundColor: '#F9F9F9' }}
                    />
                    <Input
                      {...form.register('state')}
                      placeholder='State*'
                      style={{ backgroundColor: '#F9F9F9' }}
                    />
                  </div>

                  <div className='col-span-3 flex flex-col gap-3'>
                    <Label className='text-xs font-semibold'>
                      {cart('save_address_as')}
                    </Label>
                    <div className='flex items-center gap-4'>
                      <Badge
                        className={`border-primary ${
                          addressType === 'home' ? 'bg-orange-100' : 'bg-white'
                        } cursor-pointer text-black hover:bg-orange-100`}
                        onClick={() => handleTypeSelection('home')}
                      >
                        {mobPro('home')}
                      </Badge>
                      <Badge
                        className={`border-primary ${
                          addressType === 'office'
                            ? 'bg-orange-100'
                            : 'bg-white'
                        } cursor-pointer text-black hover:bg-orange-100`}
                        onClick={() => handleTypeSelection('office')}
                      >
                        {cart('office')}
                      </Badge>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='isDefault'
                      {...form.register('isDefault')}
                      checked={form.watch('isDefault')}
                      onCheckedChange={(e: boolean) =>
                        form.setValue('isDefault', e)
                      }
                    />
                    <label
                      htmlFor='isDefault'
                      className='text-xs font-medium leading-none'
                    >
                      {cart('make_this_as_my_default_address')}
                    </label>
                  </div>
                  <Button type='submit' className='mt-4 w-full'>
                    {cart('save_address')}
                  </Button>
                </div>
              )}

              <div className='w-full'>
                {isMapView && (
                  <Button
                    className='ml-auto mt-5 flex w-full'
                    onClick={() => {
                      setMapViewStatus(false)
                    }}
                    disabled={!form.watch('fullAddress')}
                  >
                    Confirm and Continue
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AddressDetails
