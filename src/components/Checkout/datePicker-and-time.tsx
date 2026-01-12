'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useCheckoutStore from '@/store/useCheckoutStore'
import { startOfDay } from 'date-fns'

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

type Props = {
  selectedDate?: Date | string
  setSelectedDate: (date: Date | undefined) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  isConsulatationOrder?: boolean
  width?: string
  availableSlots?: any
}

export default function DateTimeSelector({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  isConsulatationOrder,
  width,
  availableSlots
}: Props) {
  const today = startOfDay(new Date())
  // Only allow today's date
  const allowedDate = today
  const [open, setOpen] = useState(false)
  const { setTimeOfConsult, dateOfConsult, timeOfConsult } = useCheckoutStore(
    state => state
  )

  // Auto-select date on mount if not already selected
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(allowedDate)
    }
  }, [])

  // Helper to convert "13:30" to "01:30 PM"
  function convertTo12Hour(time24?: string): string {
    if (!time24 || !time24.includes(':')) return ''
    const [hourStr, minuteStr] = time24.split(':')
    const hour = parseInt(hourStr, 10)
    if (isNaN(hour)) return ''
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12.toString().padStart(2, '0')}:${minuteStr} ${period}`
  }

  const handleSave = () => {
    if (selectedDate && selectedTime) {
      setOpen(false)
    }
  }

  // Convert start/end time pairs to labels matching timeSlots format
  const availableSlotSet = new Set(
    (
      availableSlots?.map((slot: any) => {
        const start = convertTo12Hour(slot?.startTime)
        const end = convertTo12Hour(slot?.endTime)
        if (!start || !end) return null
        return `${start} - ${end}`
      }) ?? []
    ).filter(Boolean)
  )

  useEffect(() => {
    if (isConsulatationOrder) {
      const parsed = dateOfConsult ? new Date(dateOfConsult as any) : undefined
      if (parsed && !isNaN(parsed.getTime())) {
        setSelectedDate(parsed as any)
      }
      if (timeOfConsult) setSelectedTime(timeOfConsult as any)
    }
  }, [isConsulatationOrder, dateOfConsult, timeOfConsult])

  function formatDisplayDate(inputDate: any, fallback: Date): string {
    if (!inputDate) return fallback.toDateString()
    try {
      const d = inputDate instanceof Date ? inputDate : new Date(inputDate)
      if (isNaN(d.getTime())) return fallback.toDateString()
      return d.toDateString()
    } catch {
      return fallback.toDateString()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className={` ${width ? width : 'w-fit'} rounded-md border border-[#FA582D] bg-white px-4 py-2 text-sm text-[#FA582D]`}
        >
          {selectedDate && selectedTime
            ? `${formatDisplayDate(selectedDate, allowedDate)} - ${selectedTime}`
            : 'Choose date & time'}
        </Button>
      </DialogTrigger>

      <DialogContent className={`h-[550px] max-w-sm rounded-lg p-0`}>
        <div className='flex items-center justify-between p-2 text-sm font-medium text-gray-800'>
          <DialogTitle className='text-sm font-medium'>
            Select date and time for consultation
          </DialogTitle>
        </div>

        <div className='overflow-y-auto'>
          <div className='flex flex-col items-center px-3 pt-2'>
            <label className='mb-1 block text-[11px] font-medium text-gray-500'>
              Select Date
            </label>
            <div className='w-full max-w-[300px]'>
              <Input
                readOnly
                value={formatDisplayDate(
                  selectedDate ?? allowedDate,
                  allowedDate
                )}
                className='cursor-default'
              />
            </div>
          </div>

          <div className='mt-10 px-3 pt-3 text-[10px] text-gray-500'>
            Select time (you will get a call within 30 mins of the selected
            time)
          </div>

          <div className='grid grid-cols-3 gap-2 px-3 py-3'>
            {timeSlots
              .filter((slot: any) => {
                const isAvailable = availableSlotSet.has(slot)
                const slotStartTime = slot.split(' - ')[0]
                let isPast = false

                if (selectedDate) {
                  const today = startOfDay(new Date())
                  const dateObj =
                    selectedDate instanceof Date
                      ? selectedDate
                      : new Date(selectedDate as any)
                  const isToday =
                    startOfDay(dateObj).getTime() === today.getTime()

                  if (isToday) {
                    const now = new Date()
                    const [hourStr, minuteStr, meridiem] =
                      slotStartTime?.split(/[:\s]/)
                    let hour = parseInt(hourStr, 10)
                    const minute = parseInt(minuteStr, 10)

                    if (!isNaN(hour) && !isNaN(minute)) {
                      if (meridiem === 'PM' && hour !== 12) hour += 12
                      if (meridiem === 'AM' && hour === 12) hour = 0

                      const slotTime = new Date(dateObj)
                      if (!isNaN(slotTime.getTime())) {
                        slotTime.setHours(hour, minute, 0, 0)
                        isPast = now > slotTime
                      }
                    }
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
                      if (isConsulatationOrder) setTimeOfConsult(slot)
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

        <div className='px-3 pb-3'>
          <Button
            className='h-9 w-full bg-[#f26321] text-sm font-medium text-white hover:bg-[#e45717]'
            onClick={handleSave}
            disabled={!selectedDate || !selectedTime}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
