import MobileCoupon from '@/components/Checkout/Coupon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dava India | My Coupons',
  description: 'Dava India Ecommerce app'
}

export default function Coupon() {
  return (
    <div>
      <MobileCoupon />
    </div>
  )
}
