import React, { useState } from 'react'
import dayjs from 'dayjs'

interface TimelineItem {
  date?: string
  dateTime?: string
  authorType?: string
  authorName: string
  label: string
  status?: string | null
  location?: string
  comment?: string
  statusCode: string
}

interface TimelineProps {
  items: TimelineItem[]
}

const TimelineActivity: React.FC<TimelineProps> = ({ items }) => {
  const [showAll, setShowAll] = useState(false)

  // Flatten list (no grouping) and sort latest first
  const flatItems = [...items].sort(
    (a, b) =>
      dayjs(b.date || b.dateTime).valueOf() -
      dayjs(a.date || a.dateTime).valueOf()
  )

  // Show only first 4 until "View More"
  const visibleItems = showAll ? flatItems : flatItems.slice(0, 4)

  return (
    <div>
      {visibleItems.map((item, idx) => {
        const dateStr = dayjs(item.date || item.dateTime).format('DD MMM, YYYY')
        const timeStr = dayjs(item.date || item.dateTime).format('hh:mm A')

        return (
          <div className='relative flex gap-x-3' key={idx}>
            {/* Time */}
            <div className='w-20 pt-1 text-right text-xs text-gray-500 dark:text-neutral-400'>
              {dateStr}
            </div>

            {/* Icon + Line */}
            <div className='relative flex flex-col items-center after:absolute after:bottom-0 after:left-[15px] after:top-0 after:w-[2px] after:-translate-x-0.5 after:bg-[#51B22A] last:after:hidden dark:after:bg-neutral-700'>
              <div className='relative z-10 flex h-7 w-7 items-center justify-center'>
                <div className='h-3.5 w-3.5 rounded-full bg-[#009045] dark:bg-neutral-600'></div>
              </div>
            </div>

            {/* Right Content */}
            <div className='flex-1 pb-4 pt-0.5'>
              <div
                className={`rounded-md border p-3 ${idx === 0 ? 'border border-[#51B22A] bg-[#EAFFF6]' : 'bg-gray-50'}`}
              >
                <h3 className='flex flex-col text-gray-800 dark:text-white md:flex-row md:items-center md:gap-x-2'>
                  <span className='text-sm'>
                    <span className='font-semibold'>Status:</span> {item.label}
                  </span>
                </h3>
                <h3 className='flex flex-col text-gray-800 dark:text-white md:flex-row md:items-center md:gap-x-2'>
                  <span className='text-sm'>
                    <span className='font-semibold'>Time:</span> {timeStr}
                  </span>
                </h3>
                {item?.location && (
                  <div className='mt-1 flex flex-col text-xs text-gray-600 dark:text-neutral-400 md:flex-row md:gap-x-4'>
                    <span>{item.location}</span>
                  </div>
                )}

                {item.statusCode === 'refund_completed' && (
                  <p className='mt-1 text-xs text-gray-600 dark:text-neutral-400'>
                    *Refund will be credited within 7 working days from the
                    initiation date.
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* View More / View Less */}
      {flatItems.length > 4 && (
        <div className='mt-4 text-center'>
          <button
            onClick={() => setShowAll(prev => !prev)}
            className='rounded-md px-4 py-2 text-sm font-medium text-primary underline'
          >
            {showAll ? 'View Less' : `View More (${flatItems.length - 4})`}
          </button>
        </div>
      )}
    </div>
  )
}

export default TimelineActivity
