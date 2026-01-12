import MobileNavBar from '@/components/NavBar'
import ProductList from '@/components/Products'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dava India | Products',
  description: 'Dava India Ecommerce app'
}

export default function AboutPage() {
  return (
    <div className=''>
      <div className='mb-28'>
        <ProductList />
      </div>
      <div className='fixed bottom-0 w-full'>
        <MobileNavBar />
      </div>
    </div>
  )
}
