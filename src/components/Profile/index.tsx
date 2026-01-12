'use client'
import Image from 'next/image'
import { useEffect } from 'react'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { useForm, UseFormReturn } from 'react-hook-form'
import { userSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useSession } from 'next-auth/react'
import { useGetUser, usePatchUserDetails } from '@/utils/hooks/auth'
import { useToast } from '@/hooks/use-toast'
import FormComboboxField from '../Form/FormCombobox'
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTransitionRouter } from 'next-view-transitions'
import FormReactDatePicker from '../Form/FormReactDatePicker'
import { useTranslations } from 'next-intl'

export default function EditProfile() {
  const settingsManager = useTranslations('SettingsManager')
  const session = useSession()
  const router = useTransitionRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      gender: '',
      height: '',
      weight: ''
    }
  })
  const userId = session?.data?.user?.id
  const { data } = useGetUser(userId)
  const totalProducts = useCheckoutStore(state => state.totalProducts)
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        phone: data?.phoneNumber,
        dateOfBirth: data?.dateOfBirth ? new Date(data?.dateOfBirth) : null
      })
    }
  }, [data])
  const updateUserData = usePatchUserDetails()

  const handleSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      const updatedDetails = { ...data, phoneNumber: data?.phone }
      await updateUserData.mutateAsync({ id: userId, data: updatedDetails })
      toast({
        title: 'Success',
        description: `Your details has been updated `
      })
    } catch (error) {
      console.log(error, 'error while patching')
    }
  }

  return (
    <div className='w-full bg-gray-100'>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>{ settingsManager('my_profile') }</p>
        </div>

        <div className='flex flex-row items-center justify-center'>
          <div
            className='mr-3 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/search')}
          >
            <Search color='#3C3C3C' size={20} />
          </div>
          <div
            className='mr-1 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/checkout/cart')}
          >
            <div className='relative'>
              <ShoppingCart color='#3C3C3C' size={20} />
              {totalProducts > 0 && (
                <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-xs text-white'>
                  {totalProducts}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='mt-12 w-full rounded-lg bg-white p-8 shadow-md'>
        <div className='flex w-full flex-col items-center'>
          {/* <h2 className='mb-6 text-center text-2xl font-semibold'>
            Edit Profile
          </h2> */}
          <div className='mb-6 flex justify-center'>
            <div
              style={{ position: 'relative', width: '52px', height: '52px' }}
            >
              <Image
                src={'/images/MyProfile.svg'}
                alt='Footer Logo'
                fill
                objectFit='contain'
              />
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='w-96 space-y-7'
            >
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Your Name'
                          className='border-gray-200 bg-gray-100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            className='w-full border-gray-200 bg-gray-100 pl-12'
                            placeholder='Enter phone number'
                            value={field.value}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                field.onChange(e.target.value)
                              }
                            }}
                          />
                          <div className='absolute left-2 top-2 border-r-2 border-[#B2B2C2] pr-2'>
                            +91
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          disabled={true}
                          placeholder='Email'
                          className='border-gray-200 bg-gray-100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormComboboxField
                  formInstance={form as unknown as UseFormReturn}
                  isSmall={true}
                  multiple={false}
                  name='gender'
                  items={(
                    [
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Others', value: 'others' }
                    ] as any
                  )?.map((c: any) => ({
                    label: c.label,
                    value: c.value
                  }))}
                  className='w-full'
                />

                <FormReactDatePicker
                  className='w-full'
                  formInstance={form as unknown as UseFormReturn}
                  name='dateOfBirth'
                  placeholder='Select a date'
                  isSmall={true}
                />
                <FormField
                  control={form.control}
                  name='height'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Your Height'
                          className='border-gray-200 bg-gray-100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='weight'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Your Weight'
                          className='border-gray-200 bg-gray-100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' className='mt-4 w-full'>
                Save
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
