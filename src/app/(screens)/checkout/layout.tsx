import type { Metadata } from 'next'

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Dava India | Checkout',
  description: 'Dava India Ecommerce app'
}

export default async function MainLayoutMobile({ children }: RootLayoutProps) {
  return (
    <div>
      {/* <AppBar /> */}
      {/* <div className='mb-2 flex flex-row items-center justify-between bg-white p-5'>
        <div className='flex flex-row items-center justify-center'>
          <Link href={'/'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
          </Link>
          <p className='ml-2 font-semibold'>Cart</p>
        </div>

        <div className='flex flex-row items-center justify-center'>
          <Link href={'/search'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <Search color='#3C3C3C' size={20} />
            </div>
          </Link>
        </div>
      </div> */}
      <div
        className='overflow-y-auto'
        style={{ minHeight: 'calc(100vh - 84px)' }}
      >
        {/* <CheckoutHeader /> */}

        <div>{children}</div>
      </div>
    </div>
  )
}
