import CartComponent from '@/components/Checkout/Cart'
import { ArrowLeft, Search } from 'lucide-react'
import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
// import DavaCoinBanner from '@/components/Checkout/DavaCoinBanner'

export const metadata: Metadata = {
  title: 'Dava India | My Cart',
  description: 'Dava India Ecommerce app'
}

export default function Cart() {
  const Cart = useTranslations('Cart')
  return (
    <div>
      <div className='fixed top-0 z-50 mb-2 flex w-full flex-row items-center justify-between bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center bg-white'>
          <Link href={'/'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
          </Link>
          <p className='ml-2 font-semibold'>{Cart('cart')}</p>
        </div>

        <div className='flex flex-row items-center justify-center bg-white'>
          <Link href={'/search'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <Search color='#3C3C3C' size={20} />
            </div>
          </Link>
        </div>
      </div>
      {/* <div className='mt-14'>
        <DavaCoinBanner />
      </div> */}
      <div className='mt-12'>
        <CartComponent />
      </div>
    </div>
  )
}
