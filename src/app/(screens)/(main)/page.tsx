import type { Metadata } from 'next'

import React from 'react'
import MobileSponsoredLayout from '@/components/Home/SponsoredLayout'

export const metadata: Metadata = {
  title: 'Dava India | Featured Products',
  description: 'Dava India Ecommerce app'
}

export default function MobileHome() {
  return (
    <div className='dark:bg-slate-800'>
      <div>
        {/* <GlobalSearch /> */}
        <div>
          <MobileSponsoredLayout />
        </div>
      </div>
    </div>
  )
}
