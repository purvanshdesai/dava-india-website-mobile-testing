import type { Metadata } from 'next'

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Dava India | Order Online',
  description: 'Davaindia Generic Pharmacy '
}

export default async function MainLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div className='relative'>
        <div>
          <div>{children}</div>
        </div>
      </div>
    </>
  )
}
