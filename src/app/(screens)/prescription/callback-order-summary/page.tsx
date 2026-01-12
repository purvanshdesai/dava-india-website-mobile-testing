import type { Metadata } from 'next'

import DeliveryAddressSummary from '@/components/Checkout/DeliveryAddressSummary'
import PrescriptionOrderSuccess from '@/components/Checkout/PrescriptionOrderSuccess'
import PaymentSummaryEmpty from '@/components/Checkout/PaymentSummaryEmpty'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Order Confirmation | Dava India',
  description: 'Dava India Ecommerce app'
}

export default function CallbackOrderSummary() {
  const cartTranslations = useTranslations('Cart')

  return (
    <div className='flex w-full justify-center p-4 pb-6 md:px-6'>
      <div className='w-full lg:w-3/4'>
        <h1 className='pb-4 text-xl font-semibold'>
          {cartTranslations('order_confirmation')}
        </h1>

        <div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]'>
            <div className='space-y-4'>
              <PrescriptionOrderSuccess />
              {/* <PrescriptionFiles /> */}
              <DeliveryAddressSummary hideEdit={true} />
            </div>

            <div className='space-y-4'>
              <PaymentSummaryEmpty />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
