'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import ZohoChat from './ZohoBot'
import { useTransitionRouter } from 'next-view-transitions'
import { ArrowLeft } from 'lucide-react'
import MobileNavBar from '../NavBar'

export default function NeedHelp() {
  const settingsmanager = useTranslations('SettingsManager')
  const session = useSession() as any
  const router = useTransitionRouter()

  return (
    <div className={'h-full'}>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between border-b-2 bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>{ settingsmanager('need_help') }</p>
        </div>
      </div>
      <div className='h-full rounded-2xl bg-white'>
        <h1 className='p-[30px] text-xl font-semibold'>Need Help?</h1>
        <div className='flex h-2/3 items-center justify-center px-8'>
          <div className={'flex flex-col items-center'}>
            <Image
              src={'/images/chat.svg'}
              alt={'chat-icon'}
              height={100}
              width={100}
            />
            <div className={'py-4 font-semibold'}>
              {settingsmanager('start_chatting_with_customer_care')}
            </div>
            <div className={'py-2'}>
              <ZohoChat
                label={settingsmanager('start_chatting')}
                variant={'profile'}
                user={{
                  name: session?.data?.user.name,
                  email: session?.data?.user.email
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='fixed bottom-0 w-full'>
        <MobileNavBar />
      </div>
    </div>
  )
}
