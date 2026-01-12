'use client'
import useCheckoutStore from '@/store/useCheckoutStore'
import { ChartBarStacked, House, ShoppingCart, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTransitionRouter } from 'next-view-transitions'
import { usePathname } from 'next/navigation'

export default function MobileNavBar() {
  const params = usePathname()
  const router = useTransitionRouter()
  const { totalProducts } = useCheckoutStore()
  const mobileProfileTranslations = useTranslations('MobileProfile')
  const Cart = useTranslations('Cart')
  const options = [
    {
      title: mobileProfileTranslations('home'),
      value: '/',
      icon: <House size={20} />
    },
    {
      title: mobileProfileTranslations('category'),
      value: '/categories',
      icon: <ChartBarStacked size={20} />
    },
    {
      title: Cart('cart'),
      value: '/checkout/cart',
      icon: (
        <div className='relative'>
          <ShoppingCart size={20} />
          {totalProducts > 0 && (
            <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-xs text-white'>
              {totalProducts}
            </span>
          )}
        </div>
      )
    },
    {
      title: mobileProfileTranslations('you'),
      value: '/profile',
      icon: <UserRound size={20} />
    }
  ]

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between bg-white px-8 py-2'>
        {' '}
        {options.map(option => (
          <span
            key={option.value}
            className={`flex flex-col items-center gap-1 text-xs font-normal ${
              params === option.value ? 'text-primary' : 'text-gray-600'
            }`}
            onClick={() => router.push(option.value)}
          >
            {option.icon} <span>{option.title}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
