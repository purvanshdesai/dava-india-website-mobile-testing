'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useConsultationOrder } from '@/utils/hooks/orderHooks'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useCheckoutStore from '@/store/useCheckoutStore'
import { Form } from '@/components/ui/form'
import FormTextAreaField from '@/components/Form/FormTextAreaField'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { consultDoctor } from '@/lib/zod'
import { DoctorConsultationPhone } from '@/components/utils/icons'
import PatientSelection from '@/components/Checkout/PatientSelection'
import usePatientsStore from '@/store/userPatientStore'
import { trackDoctorConsultation } from '@/analytics/trackers/appEventTracker'
import DateTimeSelector from '@/components/Checkout/datePicker-and-time'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useFetchSlotsWithDate } from '@/utils/hooks/slotHooks'
import { addDays, startOfDay } from 'date-fns'

const timeSlots = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '05:30 PM - 06:00 PM',
  '06:00 PM - 06:30 PM',
  '06:30 PM - 07:00 PM',
  '07:00 PM - 07:30 PM',
  '07:30 PM - 08:00 PM'
]

// Helper to convert "13:30" to "01:30 PM" (safe)
function convertTo12Hour(time24?: string): string {
  if (!time24 || !time24.includes(':')) return ''
  const [hourStr, minuteStr] = time24.split(':')
  const hour = parseInt(hourStr, 10)
  if (isNaN(hour)) return ''
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12.toString().padStart(2, '0')}:${minuteStr} ${period}`
}

export default function CreateConsultation() {
  const router = useRouter()
  const { mutateAsync, isSuccess, isError, isPending } = useConsultationOrder()
  const { currentLocation, patientId } = useCheckoutStore(state => state)
  const { patients } = usePatientsStore(state => state)
  const session = useSession()

  const form = useForm<z.infer<typeof consultDoctor>>({
    resolver: zodResolver(consultDoctor),
    defaultValues: {
      comment: ''
    }
  })

  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [editPhone, setEditPhone] = useState(false)

  // ✅ Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false)

  const isLoggedIn = session.status === 'authenticated'

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setPhoneInput('09876543242')
  }, [])

  const handleConfirmConsultation = async (data: { comment: string }) => {
    if (!selectedDate || !selectedTime) {
      form.setError('comment', {
        message: 'Please select a date and time for consultation'
      })
      return
    }

    try {
      if (!isLoggedIn) {
        router.push('/login')
        return
      }

      await mutateAsync({
        issue: 'doctor-consultation',
        ...data,
        address: { phoneNumber: phoneInput },
        patientId: patientId,
        dateOfConsult: selectedDate,
        timeOfConsult: selectedTime
      })

      trackDoctorConsultation({
        userId: session?.data.user.id ?? '',
        address: '',
        pincode: '',
        reasonForConsultation: data?.comment
      })

      setShowConfirmation(true)
    } catch (error) {
      throw error
    }
  }

  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const { mutateAsync: slotsMutation } = useFetchSlotsWithDate()

  // Only allow today's date
  const today = startOfDay(new Date())
  const allowedDate = today

  // Auto-select date on mount
  useEffect(() => {
    if (!selectedDate) {
      const autoSelectDate = async () => {
        setSelectedDate(allowedDate)
        await handleDateChange(allowedDate, true)
      }
      autoSelectDate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDateChange = async (date: any, isAutoSelect = false) => {
    try {
      if (!isAutoSelect) {
        setSelectedDate(date)
      }
      if (date) {
        const res = await slotsMutation(date) // 🔥 Fetch slots for the selected date
        const slots = Array.isArray(res) ? res : []
        setAvailableSlots(slots)

        // Check if all slots are closed
        const availableSlotSet = new Set(
          (
            slots?.map((slot: any) => {
              const start = convertTo12Hour(slot?.startTime)
              const end = convertTo12Hour(slot?.endTime)
              if (!start || !end) return null
              return `${start} - ${end}`
            }) ?? []
          ).filter(Boolean)
        )

        const today = startOfDay(new Date())
        const isToday = startOfDay(date).getTime() === today.getTime()
        let allSlotsClosed = true

        for (const slot of timeSlots) {
          const isAvailable = availableSlotSet.has(slot)
          const slotStartTime = slot.split(' - ')[0]
          let isPast = false

          if (isToday) {
            const now = new Date()
            const [hourStr, minuteStr, meridiem] = slotStartTime?.split(/[:\s]/)
            let hour = parseInt(hourStr, 10)
            const minute = parseInt(minuteStr, 10)

            if (!isNaN(hour) && !isNaN(minute)) {
              if (meridiem === 'PM' && hour !== 12) hour += 12
              if (meridiem === 'AM' && hour === 12) hour = 0

              const slotTime = new Date(date)
              if (!isNaN(slotTime.getTime())) {
                slotTime.setHours(hour, minute, 0, 0)
                isPast = now > slotTime
              }
            }
          }

          if (isAvailable && !isPast) {
            allSlotsClosed = false
            break
          }
        }

        // If all slots are closed, automatically try next date
        if (allSlotsClosed && !isAutoSelect) {
          const nextDate = addDays(date, 1)
          setSelectedDate(nextDate)
          await handleDateChange(nextDate, true)
        }
      } else {
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    }
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='flex items-center gap-4 bg-white px-4 py-3'>
        <div
          className='flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F4F4F4]'
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
        </div>
        <div className='font-bold'>Doctor Consultation</div>
      </div>

      <div className='flex-grow overflow-y-auto pb-40'>
        <div className='flex w-full justify-center'>
          {!currentLocation?.isDeliverable && (
            <div className='flex flex-col items-center justify-between gap-3'>
              <Image
                width={222}
                height={170}
                alt='not-available'
                src='/images/DoctorConsultation.svg'
              />
              <div className='pb-3 text-center font-bold'>
                We're coming to your location soon. Stay tuned for updates
              </div>
            </div>
          )}

          {currentLocation?.isDeliverable && (
            <div className='relative flex h-full w-full max-w-xl flex-col justify-between px-4 py-6'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleConfirmConsultation)}>
                  {!isSuccess && !isError && (
                    <div className='flex flex-col'>
                      <div className='flex flex-col items-center'>
                        <Image
                          width={190}
                          height={147}
                          alt='consultation'
                          src='/images/e-prescription.svg'
                        />
                      </div>

                      <div className='px-4'>
                        <PatientSelection isConsultation={true} />
                        {!patients.length && (
                          <p className='mt-4 text-xs text-red-500'>
                            Please add patient details to get e-Prescription
                          </p>
                        )}
                      </div>

                      <div className='mt-6 px-4'>
                        <FormTextAreaField
                          isSmall={true}
                          isReq={true}
                          formInstance={form as unknown as UseFormReturn}
                          label='Write down your chief complaints'
                          name='comment'
                          placeholder='Enter notes'
                        />
                      </div>

                      <div className='mt-4 flex items-start gap-3 px-4'>
                        {DoctorConsultationPhone}
                        <div className='text-sm'>
                          <p>You will get a call on:</p>
                          {editPhone ? (
                            <div className='mt-1 flex gap-2'>
                              <input
                                type='text'
                                value={phoneInput}
                                onChange={e => setPhoneInput(e.target.value)}
                                className='rounded border px-2 py-1 text-sm'
                              />
                              <button
                                type='button'
                                onClick={() => setEditPhone(false)}
                                className='text-sm font-medium text-[#F5703B]'
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className='mt-1 flex items-center gap-2'>
                              <span className='font-semibold'>
                                {phoneInput}
                              </span>
                              <button
                                type='button'
                                onClick={() => setEditPhone(true)}
                                className='text-sm font-medium text-[#F5703B]'
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='mt-4 px-4'>
                        <label className='mb-1 block text-sm font-medium'>
                          *Select date and time for consultation
                        </label>
                        <DateTimeSelector
                          selectedDate={selectedDate}
                          setSelectedDate={date => {
                            if (date) handleDateChange(date)
                          }}
                          selectedTime={selectedTime}
                          setSelectedTime={setSelectedTime}
                          availableSlots={availableSlots}
                        />
                      </div>
                    </div>
                  )}

                  {isSuccess && (
                    <div className='mt-10 flex flex-col items-center justify-center'>
                      <Image
                        width={250}
                        height={450}
                        alt='success'
                        src='/images/DoctorConsultation.svg'
                      />
                      <div className='mt-4 font-medium'>
                        Consultation request created successfully
                      </div>
                    </div>
                  )}

                  <div className='fixed bottom-0 left-0 w-full bg-white'>
                    {!isSuccess && !isError && (
                      <p className='pt-3 text-center text-[8px]'>
                        After consultation we will attach a digital prescription
                        for your added medicines
                      </p>
                    )}

                    <div className='flex gap-4 p-4 px-6'>
                      {!currentLocation?.isDeliverable || isSuccess ? (
                        <Button
                          className='w-full'
                          onClick={() => router.back()}
                        >
                          Back
                        </Button>
                      ) : (
                        <Button
                          className='w-full bg-[#F5703B] hover:bg-[#e96129]'
                          disabled={isPending || !patientId || !patients.length}
                          type='submit'
                        >
                          {isPending && (
                            <Loader2 className='mr-2 animate-spin' size={16} />
                          )}
                          Get e-Prescription
                        </Button>
                      )}
                    </div>

                    <p className='pb-2 text-center text-[8px] text-red-500'>
                      T&C - You will receive a call back between 9 AM to 6 PM
                      Monday to Saturday
                    </p>
                  </div>
                </form>
              </Form>

              {/* ✅ Confirmation Dialog UI */}
              <Dialog
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
              >
                <DialogContent className='max-w-sm space-y-4 p-6 text-center'>
                  <DialogTitle className='text-sm font-semibold text-gray-800'>
                    Confirmation
                  </DialogTitle>
                  <div className='flex justify-center'>
                    <div className='rounded-full bg-[#FA579D1A] p-4'>
                      <Image
                        src='/images/tick-icon.svg'
                        width={50}
                        height={50}
                        alt='success'
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-gray-800'>
                      A verified doctor will call in your selected slot
                    </p>
                    <p className='text-xs text-gray-700'>
                      {selectedDate?.toLocaleDateString()} {selectedTime}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs text-gray-600'>
                      You will get a call on
                    </p>
                    <p className='text-sm font-semibold text-gray-800'>
                      {phoneInput}
                    </p>
                  </div>
                  <p className='text-[11px] leading-tight text-gray-500'>
                    After the consultation, we will attach the e-prescription to
                    your order
                  </p>
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    className='h-9 w-full bg-[#f26321] text-sm font-medium text-white hover:bg-[#e45717]'
                  >
                    OK
                  </Button>
                  <p className='text-[10px] font-medium text-[#FA582D]'>
                    Disclaimer: Consultation is available only for ages 12 and
                    above
                  </p>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
