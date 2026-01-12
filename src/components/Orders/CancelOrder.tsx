'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Textarea } from '../ui/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetAllCancelReasons } from '@/utils/hooks/appDataHooks'
import { useCancelProduct } from '@/utils/hooks/orderHooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { trackOrderCancelled } from '@/analytics/trackers/orderTracker'
import { useSession } from 'next-auth/react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { getCancelProductSchema } from '@/lib/zod'

export default function CancelOrder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId: any = searchParams.get('orderId')
  const productId: any = searchParams.get('productId')
  const quantityParam = searchParams.get('quantity')
  const quantity =
    Number.isFinite(Number(quantityParam)) && Number(quantityParam) > 0
      ? parseInt(quantityParam as string, 10)
      : 1

  const { data: session } = useSession()

  const { data: cancelReasons, isLoading } = useGetAllCancelReasons()

  const [cancelWhole, setCancelWhole] = useState(true)

  const cancelProductSchema = getCancelProductSchema(quantity)

  // form with dynamic schema
  const form = useForm<z.infer<typeof cancelProductSchema>>({
    resolver: zodResolver(cancelProductSchema),
    defaultValues: {
      reason: '',
      note: '',
      cancelQuantity: 1
    }
  })

  const { mutateAsync: cancelProduct, isPending } = useCancelProduct()

  const handleOnSubmit = async (data: {
    reason: string
    note: string
    cancelQuantity?: number
  }) => {
    const finalQty =
      quantity === 1 || cancelWhole ? quantity : (data.cancelQuantity ?? 1)

    await cancelProduct({
      orderId,
      productId,
      reason: data.reason,
      note: data.note,
      cancelQuantity: finalQty
    })

    trackOrderCancelled({
      orderId: orderId,
      userId: session?.user?.id ?? '',
      productId,
      cancellationReason: data.reason + ' - ' + data.note
    })

    router.push('/orders')
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className='relative'>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Cancel Order</p>
        </div>
      </div>
      <div className='mt-20 bg-white px-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOnSubmit)}>
            <div className='flex h-full flex-col gap-4'>
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
                        {cancelReasons?.map((reason: any, idx: number) => (
                          <SelectItem key={idx} value={reason?.statusCode}>
                            {reason?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity logic for mobile */}
              {quantity > 1 && (
                <div className='flex flex-col gap-2 pt-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium'>
                      Cancel whole product?
                    </label>
                    <Switch
                      checked={cancelWhole}
                      onCheckedChange={setCancelWhole}
                      className=''
                    />
                  </div>

                  {!cancelWhole && (
                    <>
                      <FormField
                        control={form.control}
                        name='cancelQuantity'
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type='number'
                                min={1}
                                max={quantity}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='text-xs text-label'>
                        Max Quantity: {quantity}
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

              <Button
                type='submit'
                className='mt-auto w-full'
                variant={'destructive'}
                disabled={isPending}
              >
                Cancel Product
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
