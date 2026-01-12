'use client'
import React from 'react'
import { XCircleIcon } from 'lucide-react'
import { useState } from 'react'

export default function TaxChange() {
  const [showNotice, setNoticeStatus] = useState(true)

  if (!showNotice) return <></>

  return (
    <div className='relative rounded-md bg-primary px-2 py-1'>
      <p className='text-center text-xs text-white'>
        As per amendments in the GST Act, 2017, notified by the Government of
        India, the MRP on products may slightly vary from the billed amount. You
        are charged as per current GST rates, effective 22nd September 2025.
      </p>

      <div className='absolute right-2 top-1 rounded-full bg-white'>
        <XCircleIcon
          color='black'
          size={16}
          onClick={() => setNoticeStatus(false)}
          className='cursor-pointer'
        />
      </div>
    </div>
  )
}
