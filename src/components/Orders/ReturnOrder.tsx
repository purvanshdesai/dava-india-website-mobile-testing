'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { getReturnProductSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useReturnProduct } from '@/utils/hooks/orderHooks'
import dynamic from 'next/dynamic'
import { ArrowLeft, UploadIcon } from 'lucide-react'
import { useGetAllReturnReasons } from '@/utils/hooks/appDataHooks'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { trackOrderReturnRequest } from '@/analytics/trackers/orderTracker'
import { useSession } from 'next-auth/react'
import { Switch } from '@/components/ui/switch' // ✅ add a toggle switch
import { Input } from '@/components/ui/input' // ✅ for quantity field
import { useToast } from '@/hooks/use-toast'

const FileUploadComponent = dynamic(
  () => import('@/components/Prescription/FileUpload'),
  { ssr: false }
)
export default function ReturnOrder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const orderId: any = searchParams.get('orderId')
  const productId: any = searchParams.get('productId')
  const quantityParam = searchParams.get('quantity')
  const productQuantity =
    Number.isFinite(Number(quantityParam)) && Number(quantityParam) > 0
      ? parseInt(quantityParam as string, 10)
      : 1

  const [returnWhole, setReturnWhole] = useState(true)

  const { data: session } = useSession()

  const { data: returnReasons, isPending: returnReasonsPending } =
    useGetAllReturnReasons()

  const returnProductSchema = getReturnProductSchema(productQuantity)

  const form = useForm<
    z.infer<typeof returnProductSchema> & { quantity?: number }
  >({
    resolver: zodResolver(returnProductSchema),
    defaultValues: {
      reason: '',
      note: '',
      images: [],
      quantity: 1
    }
  })

  const { mutateAsync: returnProduct, isPending } = useReturnProduct()

  const handleOnSubmit = async (data: any) => {
    try {
      const payload = {
        orderId,
        productId,
        ...data,
        returnQuantity: returnWhole ? productQuantity : data.returnQuantity // ✅ handle quantity logic
      }

      await returnProduct(payload as any)

      trackOrderReturnRequest({
        orderId,
        userId: session?.user?.id ?? '',
        productId,
        reasonForReturn: data.reason + ' - ' + data.note
      })
      router.push('/orders')
    } catch (e: any) {
      toast({
        title: 'Oops!',
        description: e.message
      })
    }
  }

  if (returnReasonsPending) return <div>Loading...</div>
  return (
    <div>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Return Order</p>
        </div>
      </div>
      <div className='mt-20 bg-white px-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(data => {
              handleOnSubmit(data)
            })}
          >
            <div className='flex flex-col gap-4'>
              <div className='mb-2'>
                <div className='mb-4 ml-1 text-xs font-semibold'>
                  Return Guidelines
                </div>
                <div className='flex gap-3'>
                  <div>
                    <Image
                      src='/images/ReturnPopup.svg' // Replace with your image path
                      alt='Return Image'
                      width={150}
                      height={300}
                      className='object-contain'
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <p className='text-xs'>
                      1. Please return the products in their original packaging.
                      Partially used products will not be accepted.
                    </p>
                    <p className='text-xs'>
                      2. Attach clear pictures of the batch ID along with a
                      description and picture of the issue with the product.
                    </p>
                    <p className='text-xs'>
                      3. The original invoice must be included with the return.
                    </p>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-4 p-3'>
                <FormField
                  control={form.control}
                  name='reason'
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Your Reason' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {returnReasons?.map((reason: any, idx: number) => {
                            return (
                              <SelectItem key={idx} value={reason?.statusCode}>
                                {reason?.name}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ✅ Quantity Logic */}
                {productQuantity > 1 && (
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Return whole product?
                      </span>
                      <Switch
                        checked={returnWhole}
                        onCheckedChange={setReturnWhole}
                      />
                    </div>

                    {!returnWhole && (
                      <>
                        <FormField
                          control={form.control}
                          name='returnQuantity'
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type='number'
                                  min={1}
                                  max={productQuantity}
                                  placeholder='Enter quantity to return'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='text-xs text-label'>
                          Max Quantity: {productQuantity}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Textarea
                  {...form.register('note')}
                  placeholder='Enter note*'
                  style={{ backgroundColor: '#F9F9F9' }}
                />

                <div>
                  <FileUploadComponent
                    onFileUpload={(_, filesObject) => {
                      form.setValue('images', filesObject ?? [])
                    }}
                    renderButton={(openFilePicker, isLoading) => (
                      <div
                        className='mt-2 flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border-2 border-dashed p-3 text-sm'
                        onClick={openFilePicker}
                      >
                        <UploadIcon
                          size={20}
                          className={`${isLoading ? 'animate-bounce' : ''}`}
                        />
                        {isLoading ? 'Uploading ...' : 'Attach Product Image'}
                      </div>
                    )}
                    isLoggedIn={true}
                  />

                  {form?.formState?.errors &&
                    form.formState?.errors?.images && (
                      <div className='pt-2 text-xs text-red-600'>
                        Please attach at least one product image
                      </div>
                    )}
                </div>
              </div>

              <Button
                type='submit'
                className='mt-4 w-full'
                variant={'destructive'}
                disabled={isPending}
              >
                Return Product
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
