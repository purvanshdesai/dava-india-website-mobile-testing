'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useConsultationOrder } from '@/utils/hooks/orderHooks'
import { trackPrescriptionEnquiry } from '@/analytics/trackers/appEventTracker'
import { useSession } from 'next-auth/react'
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns'
import { useEffect } from 'react'
import { useFetchSlotsWithDate } from '@/utils/hooks/slotHooks'

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

export default function SelectSlotPage() {
  const router = useRouter()
  const session = useSession()
  const today = startOfDay(new Date())
  // Only allow today's date
  const allowedDate = today
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const { selectedAddress, prescriptionFiles, patientId } = useCheckoutStore()
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const { mutateAsync: slotsMutation } = useFetchSlotsWithDate()

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
    console.log(date, 'date')
    try {
      if (!isAutoSelect) {
        setSelectedDate(date)
      }
      if (date) {
        const res = await slotsMutation(date) // 🔥 Fetch slots for the selected date
        const slots = Array.isArray(res) ? res : []
        setAvailableSlots(slots)

        // Check if all slots are closed
        const availableSlotSetForCheck = new Set(
          slots?.map((slot: any) => {
            const start = convertTo12Hour(slot?.startTime)
            const end = convertTo12Hour(slot?.endTime)
            return `${start} - ${end}`
          }) ?? []
        )

        const today = startOfDay(new Date())
        const isToday = startOfDay(date).getTime() === today.getTime()
        let allSlotsClosed = true

        for (const slot of timeSlots) {
          const isAvailable = availableSlotSetForCheck.has(slot)
          const slotStartTime = slot.split(' - ')[0]
          let isPast = false

          if (isToday) {
            const now = new Date()
            const [hourStr, minuteStr, meridiem] = slotStartTime?.split(/[:\s]/)
            let hour = parseInt(hourStr, 10)
            const minute = parseInt(minuteStr, 10)

            if (meridiem === 'PM' && hour !== 12) hour += 12
            if (meridiem === 'AM' && hour === 12) hour = 0

            const slotTime = new Date(date)
            slotTime.setHours(hour, minute, 0, 0)
            isPast = now > slotTime
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
  // Convert start/end time pairs to labels matching timeSlots format
  const availableSlotSet = new Set(
    availableSlots?.map((slot: any) => {
      const start = convertTo12Hour(slot?.startTime)
      const end = convertTo12Hour(slot?.endTime)
      return `${start} - ${end}`
    }) ?? []
  )

  // Helper to convert "13:30" to "01:30 PM"
  function convertTo12Hour(time24: string): string {
    const [hourStr, minuteStr] = time24?.split(':')
    const hour = parseInt(hourStr, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12.toString().padStart(2, '0')}:${minuteStr} ${period}`
  }

  const orderConsultationOrder = useConsultationOrder()

  const handleRequestCallback = async () => {
    try {
      setLoading(true)
      await orderConsultationOrder.mutateAsync({
        issue: 'prescription-upload',
        prescription_url: prescriptionFiles,
        address: selectedAddress,
        items: [],
        patientId: patientId,
        dateOfConsult: selectedDate,
        timeOfConsult: selectedTime
      })

      trackPrescriptionEnquiry({
        userId: session?.data?.user?._id ?? '',
        address: selectedAddress?.fullAddress ?? '',
        pincode: selectedAddress?.postalCode ?? '',
        prescriptionUploaded: prescriptionFiles?.join(', ')
      })
      router.push('/prescription/confirm')
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen bg-white pb-24'>
      {/* ✅ Top Navbar */}
      <div className='sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-4 py-3'>
        <button
          onClick={() => router.back()}
          className='rounded-full bg-gray-100 p-2'
        >
          <ArrowLeft className='h-5 w-5 text-gray-700' />
        </button>
        <h2 className='text-md font-semibold'>Choose Date & Time</h2>
      </div>

      {/* ✅ Centered Calendar */}
      <div className='flex justify-center pt-6'>
        <div className='w-full max-w-xs'>
          <label className='mb-2 block pl-1 text-xs font-medium text-gray-500'>
            Select Date
          </label>
          <div className='flex justify-center rounded-md border p-3 shadow-sm'>
            <div className='rounded-md bg-white text-black shadow-sm'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={date => date && handleDateChange(date)}
                disabled={(date: Date) => {
                  const dateStart = startOfDay(date)
                  const allowedDateStart = startOfDay(allowedDate)
                  return (
                    isBefore(dateStart, allowedDateStart) || isAfter(dateStart, allowedDateStart)
                  )
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className='px-4 pt-6'>
        <p className='mb-2 text-[11px] text-gray-500'>
          Select time (you’ll receive a call within 30 minutes)
        </p>
        <div className='grid grid-cols-3 gap-2'>
          {timeSlots
            .filter((slot: any) => {
              const isAvailable = availableSlotSet.has(slot)
              const slotStartTime = slot.split(' - ')[0]
              let isPast = false

              if (selectedDate) {
                const today = startOfDay(new Date())
                const isToday =
                  startOfDay(selectedDate).getTime() === today.getTime()

                if (isToday) {
                  const now = new Date()
                  const [hourStr, minuteStr, meridiem] =
                    slotStartTime?.split(/[:\s]/)
                  let hour = parseInt(hourStr, 10)
                  const minute = parseInt(minuteStr, 10)

                  if (meridiem === 'PM' && hour !== 12) hour += 12
                  if (meridiem === 'AM' && hour === 12) hour = 0

                  const slotTime = new Date(selectedDate)
                  slotTime.setHours(hour, minute, 0, 0)
                  isPast = now > slotTime
                }
              }

              // Only show available and non-past slots
              return isAvailable && !isPast
            })
            .map((slot: any) => {
              return (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedTime(slot)
                  }}
                  className={`h-7 px-2 py-1 text-[10px] ${
                    selectedTime === slot
                      ? 'bg-[#FA582D] text-white'
                      : 'border text-gray-700'
                  }`}
                >
                  {slot}
                </Button>
              )
            })}
        </div>
      </div>

      {/* ✅ Sticky Bottom Continue Button */}
      <div className='fixed bottom-0 left-0 right-0 z-10 border-t bg-white p-4'>
        <Button
          loader={loading}
          className='w-full bg-[#f26321] font-semibold text-white hover:bg-[#e45717]'
          onClick={handleRequestCallback}
          disabled={!selectedDate || !selectedTime}
        >
          Request Callback
        </Button>
      </div>
    </div>
  )
}
