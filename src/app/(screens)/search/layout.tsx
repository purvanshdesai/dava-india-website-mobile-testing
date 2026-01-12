import type { Metadata } from 'next'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Search Products | DavaIndia',
  description: 'Dava India Ecommerce app'
}

export default async function UserLayout({ children }: RootLayoutProps) {
  return (
    <div className='relative'>
      {/* <div className='sticky top-0 z-50'>
        <MobileAppBar />
      </div> */}

      <div className='flex flex-row items-center justify-between bg-white py-2 px-5'>
        <div className='flex flex-row items-center justify-center'>
          <Link href={'/'}>
            <div className='cursor-pointer rounded-full bg-[#F4F4F4] p-2'>
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
          </Link>
          {/* <p className='ml-2 font-semibold'></p> */}
        </div>

        <Link href={'/'}>
              <div className=''
                style={{ position: 'relative', width: '150px', height: '60px' }}
              >
                <Image
                  src={'/images/Logo.svg'}
                  alt='Davainda Logo'
                  className='cursor-pointer'
                  fill
                  priority={true}
                />
              </div>
            </Link>

        <div className='flex flex-row items-center justify-center'>
          <Link href={'/checkout/cart'}>
            <div>

            <div className='mr-1 cursor-pointer rounded-full bg-[#F4F4F4] p-2'>
              <ShoppingCart color='#3C3C3C' size={20} />
            </div>
            
            </div>
          </Link>
        </div>
      </div>

      <div
        style={{
          minHeight: 'calc(100vh - 84px)'
        }}
      >
        <div className=''>{children}</div>
      </div>
    </div>
  )
}
