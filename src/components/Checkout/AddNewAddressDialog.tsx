import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit3Icon, PlusIcon } from 'lucide-react'

import { addressFormSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import {
  createUserAddress,
  patchUserAddress
} from '@/utils/actions/userAddressActions'
import { useSession } from 'next-auth/react'
import { useFetchLocationByZipCode } from '@/utils/hooks/zipCodeHooks'
import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import FormDialog from '@/components/Form/FormDialog'
import { useToast } from '@/hooks/use-toast'

export function AddNewAddressDialog({ addressId, loading, address }: any) {
  const { toast } = useToast()
  // states
  const fetchAddresses = useDeliveryAddressStore(state => state.fetchAddresses)
  const [addressType, setAddressType]: any = useState<'Home' | 'Office' | ''>(
    ''
  )
  const [pinCode, setPinCode] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: newLocation, isLoading } = useFetchLocationByZipCode(
    pinCode,
    pinCode?.length == 6
  )

  const cart = useTranslations('Cart')

  // form
  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      userName: address?.userName ?? '',
      phoneNumber: address?.phoneNumber ?? '',
      alternatePhoneNumber: address?.alternatePhoneNumber ?? '',
      addressLine1: address?.addressLine1 ?? '',
      addressLine2: address?.addressLine2 ?? '',
      postalCode: address?.postalCode ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      isDefault: address?.isDefault ?? false,
      type: address?.type ?? ''
    }
  })

  useEffect(() => {
    if (address?.type) {
      handleTypeSelection(address?.type)
    }
  }, [address, form])

  useEffect(() => {
    if (newLocation || !isLoading) {
      if (!form.getValues('postalCode')) {
        form.setValue('postalCode', newLocation?.location?.zipCode)
      }
      form.setValue('addressLine2', newLocation?.location?.area)
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
      let result
      if (addressId) {
        result = await patchUserAddress(addressId, data)
      } else {
        result = await createUserAddress({
          ...data,
          country: 'india',
          userId: session?.data?.user?.id
        })
      }

      if (result?.invalidZipCode) {
        toast({
          title: 'Invalid postal code provided!',
          description: result?.message
        })

        return
      }

      fetchAddresses()
      setDialogOpen(false)
    } catch (error) {
      console.log(error)
    }
  }
  // dialog inner content
  const formContent = (
    <>
      {!loading && !isLoading && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(data => {
              console.log('Form is being submitted')
              onSubmit(data)
            })}
          >
            <div className='flex flex-col gap-4'>
              {/* Name */}
              <div>
                <Input
                  {...form.register('userName')}
                  placeholder='Enter your name*'
                  style={{ backgroundColor: '#F9F9F9' }}
                />
                {form.formState.errors.userName && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.userName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Input
                  {...form.register('phoneNumber')}
                  placeholder='Mobile Number*'
                  style={{ backgroundColor: '#F9F9F9' }}
                />
                {form.formState.errors.phoneNumber && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Alternate Phone */}
              <div>
                <Input
                  {...form.register('alternatePhoneNumber')}
                  placeholder='Alternate Mobile Number*'
                  style={{ backgroundColor: '#F9F9F9' }}
                />
                {form.formState.errors.alternatePhoneNumber && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.alternatePhoneNumber.message}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <Input
                  {...form.register('postalCode')}
                  placeholder='Pin Code*'
                  style={{ backgroundColor: '#F9F9F9' }}
                  onChange={e => setPinCode(e.target.value)}
                />
                {form.formState.errors.postalCode && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.postalCode.message}
                  </p>
                )}
              </div>

              {/* Address 1 */}
              <div>
                <Input
                  {...form.register('addressLine1')}
                  placeholder='Address'
                  style={{ backgroundColor: '#F9F9F9' }}
                />
                {form.formState.errors.addressLine1 && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.addressLine1.message}
                  </p>
                )}
              </div>

              {/* Address 2 */}
              <div>
                <Input
                  {...form.register('addressLine2')}
                  placeholder='Locality / Town*'
                  style={{ backgroundColor: '#F9F9F9' }}
                />
                {form.formState.errors.addressLine2 && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.addressLine2.message}
                  </p>
                )}
              </div>

              {/* City & State */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Input
                    readOnly
                    {...form.register('city')}
                    placeholder='City / District*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />
                  {form.formState.errors.city && (
                    <p className='text-xs text-red-600'>
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    readOnly
                    {...form.register('state')}
                    placeholder='State*'
                    style={{ backgroundColor: '#F9F9F9' }}
                  />
                  {form.formState.errors.state && (
                    <p className='text-xs text-red-600'>
                      {form.formState.errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Type */}
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
                    {cart('home')}
                  </Badge>
                  <Badge
                    className={`border-primary ${
                      addressType === 'office' ? 'bg-orange-100' : 'bg-white'
                    } cursor-pointer text-black hover:bg-orange-100`}
                    onClick={() => handleTypeSelection('office')}
                  >
                    {cart('office')}
                  </Badge>
                </div>
                {form.formState.errors.type && (
                  <p className='text-xs text-red-600'>
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>

              {/* Default Address */}
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
          </form>
        </Form>
      )}
    </>
  )

  // Trigger
  const trigger = addressId ? (
    <div>
      {' '}
      <Button variant={'outline'} size={'sm'} className='flex gap-2'>
        <Edit3Icon size={16} />
        {cart('edit_address')}
      </Button>
    </div>
  ) : (
    <div
      className='flex cursor-pointer items-center gap-3 text-sm font-semibold text-red-400'
      onClick={() => setDialogOpen(true)}
    >
      <PlusIcon />
      {cart('add_new_address')}
    </div>
  )

  return (
    <FormDialog
      trigger={trigger}
      title={addressId ? 'Edit Address' : 'Add New Address'}
      content={formContent}
      footerActions={null}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    />
  )
}
