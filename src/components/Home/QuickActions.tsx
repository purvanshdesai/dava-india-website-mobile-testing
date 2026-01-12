import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useTransitionRouter } from 'next-view-transitions'

const actions = [
  {
    title: 'Order Medicine',
    description: 'Order our generic medicines',
    image: 'drugs.gif',
    href: '/products',
    i18nKey: 'home_order_medicine',
    i18nDescKey: 'order_medicine_description'
  },
  // {
  //   title: 'Consult Doctor',
  //   description: 'Consult an experienced doctor for prescription',
  //   image: 'doctor.gif',
  //   href: '/doctorConsultation',
  //   i18nKey: 'home_consult_doctor',
  //   i18nDescKey: 'consult_doctor_description'
  // },
  {
    title: 'Previously Bought',
    description: 'Check your previously bought items',
    image: 'PrevBought.gif',
    href: '/orders',
    i18nKey: 'home_previously_bought',
    i18nDescKey: 'previously_bought_description'
  },
  {
    title: 'Deals For You',
    description: 'Check special deals for you',
    image: 'sale.gif',
    href: '/categories/health-conditions',
    i18nKey: 'home_deals_for_you',
    i18nDescKey: 'deals_for_you_description'
  }
]

export default function MobileQuickActions() {
  const homepage = useTranslations('HomePage')
  const router = useTransitionRouter()
  const handleOnClickCard = (a: any) => {
    if (a.href != '') router.push(a.href)
  }
  return (
    <div className='m-2 mx-4 rounded-l-lg'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {actions.map((a, idx) => {
          return (
            <div
              onClick={() => handleOnClickCard(a)}
              key={idx}
              className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border bg-white p-3 duration-300 hover:scale-105 hover:border-primary dark:bg-gray-900 md:p-4 ${

                idx === 0 ? 'col-span-2' : 'px-4'


              }`}
            >
              <div
                style={{ position: 'relative', width: '80px', height: '80px' }}
              >
                <Image
                  src={`/images/QuickActions/${a.image}`}
                  alt={a.title}
                  fill
                  priority={false}
                />
              </div>
              <div className='space-y-1 text-center'>
                <p className='text-sm font-semibold'>{homepage(a.i18nKey)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
