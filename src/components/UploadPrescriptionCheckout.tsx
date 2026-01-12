'use client'
import React, { useState, useEffect } from 'react'
import { CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useSession } from 'next-auth/react'
import { uploadGuidelineKeys } from '@/constants'
import dynamic from 'next/dynamic'
import { Checkbox } from './ui/checkbox'
//import Image from 'next/image'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog'
import DateTimeSelector from '@/components/Checkout/datePicker-and-time'
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

const PrescriptionFileUploadComponent = dynamic(
  () => import('./Prescription/FileUpload'),
  {
    ssr: false
  }
)

export default function UploadPrescriptionCheckout() {
  const session = useSession()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')

  const commonTranslations = useTranslations('Common')
  const uploadGuideLines = uploadGuidelineKeys.map((key: string) =>
    commonTranslations(key)
  )

  // const doctorGuideLines = [
  //   'Our certified doctor will call you for E prescription with in 30 mins',
  //   'Our working hours will be 8:00 AM to 6:00 PM',
  //   'Your prescription will be sent directly to the pharmacist for processing.'
  // ]

  const {
    setPrescriptionUrl,
    prescriptionFiles,
    setConsultDoctorForPrescription,
    consultDoctorForPrescription
  } = useCheckoutStore()

  const isLoggedIn = session.status === 'authenticated'
  const onFileUpload = (files: any) => {
    setPrescriptionUrl(files)
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
        const labels = (
          slots?.map((slot: any) => {
            const start = convertTo12Hour(slot?.startTime)
            const end = convertTo12Hour(slot?.endTime)
            if (!start || !end) return null
            return `${start} - ${end}`
          }) ?? []
        ).filter(Boolean) as string[]
        const availableSlotSet = new Set(labels)

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
    <div className='mt-2 border-t border-t-slate-200'>
      <CardHeader className='rounded-t-lg bg-gray-50 p-4 dark:bg-gray-700'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-bold'>
            {commonTranslations('upload_prescription')}
          </CardTitle>

          <Dialog>
            <DialogTrigger asChild>
              <button className='rounded-full border border-[#f04438] p-1'>
                <Info size={18} className='text-[#f04438]' />
              </button>
            </DialogTrigger>
            <DialogContent className='w-[90%] max-w-sm rounded-xl px-4 py-6'>
              <div className='flex flex-col items-center justify-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full border border-[#f04438] text-[#f04438]'>
                  <Info size={18} />
                </div>
                <DialogTitle className='text-center text-base font-semibold'>
                  Guide Lines
                </DialogTitle>
                <ul className='text-muted-foreground list-disc space-y-2 pl-4 text-sm'>
                  {uploadGuideLines.map((item, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 rounded-b-lg bg-white py-4'>
        {!consultDoctorForPrescription && (
          <div>
            <PrescriptionFileUploadComponent
              renderButton={openFilePicker => (
                <Button
                  onClick={openFilePicker}
                  color='#008080'
                  className='mt-2 w-full gap-3 bg-primary-teal font-semibold'
                >
                  {commonTranslations('upload_prescription')}
                </Button>
              )}
              onFileUpload={onFileUpload}
              isLoggedIn={isLoggedIn}
            />

            {/* Removed inline guidelines here since they are in dialog now */}
          </div>
        )}

        {!prescriptionFiles.length && (
          <div>
            <div>
              <h1 className='bg-[#F9F9F9] p-6 font-semibold'>
                Don't Have a prescription? Get a free Consultation
              </h1>
              <div className='my-6 w-48 rounded-lg border px-2 py-3'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='doctor-consultation'
                    checked={consultDoctorForPrescription}
                    onCheckedChange={checked =>
                      setConsultDoctorForPrescription(checked === true)
                    }
                  />
                  <label
                    htmlFor='doctor-consultation'
                    className='text-sm font-semibold text-label'
                  >
                    Doctor Consultation
                  </label>
                </div>
              </div>

              {consultDoctorForPrescription && (
                <div className='my-4'>
                  <DateTimeSelector
                    selectedDate={selectedDate}
                    setSelectedDate={date => {
                      if (date) handleDateChange(date)
                    }}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    availableSlots={availableSlots}
                    isConsulatationOrder={true}
                  />
                </div>
              )}
              <div className='mt-3 text-xs text-label'>
                📞: You’ll receive a call from +91-7965189000
              </div>
              <div className='py-2 text-xs text-label'>
                <span className='font-semibold text-red-600'>Disclaimer:</span>{' '}
                Consultation is available only for ages 12 and above.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  )
}
