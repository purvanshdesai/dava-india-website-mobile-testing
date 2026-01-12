import { Metadata } from 'next'

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Dava India | Order Online',
  description: 'Dava India Ecommerce app'
}

export default async function MobileMainLayout({ children }: RootLayoutProps) {
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
