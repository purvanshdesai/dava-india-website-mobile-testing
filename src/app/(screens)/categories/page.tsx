import type { Metadata } from 'next'
import MobileCategoriesComponent from '@/components/Categories'

export const metadata: Metadata = {
  title: 'Dava India | Categories',
  description: 'Dava India Ecommerce app'
}

export default function AboutPage() {
  return (
    <div className=''>
      <MobileCategoriesComponent />
    </div>
  )
}
