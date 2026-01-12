'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import SetNewPasswordMobile from '@/components/Auth/MobileResetPassword'

export default function ResetPassword() {
  return (
    <div className='mt-6 text-center'>
      <Suspense>
        <SetNewPasswordMobile />
      </Suspense>
      <div className={'mt-4 py-3 text-center text-sm text-label'}>
        <Link href={'/login'} className='text-blue-500'>
          Click here
        </Link>{' '}
        for login
      </div>
    </div>
  )
}
