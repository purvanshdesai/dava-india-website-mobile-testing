import Image from 'next/image'
import type { Metadata } from 'next'
// import AppBar from '@/components/AppBar'

export const metadata: Metadata = {
  title: 'Dava India | Sign In',
  description: 'Dava India Ecommerce app'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      {/* <AppBar /> */}

      <div
        className='flex min-h-screen justify-center overflow-y-auto'
        // style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <div className='w-full bg-white dark:bg-slate-900'>
          <div className='grid grid-cols-1 items-center justify-between gap-12'>
            <div className='flex w-full flex-col items-center justify-center pt-20'>
              <div>
                <Image
                  src={'/images/ProfileForm.svg'}
                  alt='Auth logo'
                  width={249}
                  height={166}
                />
              </div>
            </div>
            <div className='flex w-full items-center justify-center'>
              <div className='w-11/12'>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
