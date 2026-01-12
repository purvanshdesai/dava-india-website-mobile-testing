'use client'
import useNotificationStore from '@/store/useNotificationStore'
import React, { useState } from 'react'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Notification from './Notification'
import { useMarkAllAsRead } from '@/utils/hooks/notificationsHooks'
import { ArrowLeft, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

//const notificationTypes = [notif('all'), notif('unread'), notif('read')]
//const notificationTypes = ['all', 'unread', 'read']
const notificationTypes = [
  {
    value: 'all',
    i18nKey: 'all'
  },
  {
    value: 'unread',
    i18nKey: 'unread'
  },
  {
    value: 'read',
    i18nKey: 'read'
  }
]

export default function NotificationContainer() {
  const router = useRouter()
  let { notifications } = useNotificationStore()
  const { loadMoreNotification, markAllAsRead } = useNotificationStore()
  const [notificationType, setNotificationType] = useState('all')
  const markAllAsReadMutation = useMarkAllAsRead()
  const notif = useTranslations('Notification')

  if (notificationType == 'unread') {
    notifications = notifications.filter(
      (notification: any) => !notification.isRead
    )
  }
  if (notificationType == 'read') {
    notifications = notifications.filter(
      (notification: any) => notification.isRead
    )
  }

  const handleScroll = (e: any) => {
    const element = e.target // Get the target of the scroll event
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
      loadMoreNotification()
    }
  }
  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
      markAllAsRead()
    } catch (error) {
      throw error
    }
  }
  return (
    <div className='relative rounded-2xl bg-white'>
      <div className='sticky top-0 z-50 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 text-sm font-semibold'>Notifications</p>
        </div>

        <div className='flex flex-row items-center justify-center gap-2'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/search')}
          >
            <Search color='#3C3C3C' size={20} />
          </div>
        </div>
      </div>
      <div className='mt-4 px-8'>
        <div className='flex justify-between'>
          <div className='flex gap-7'>
            {notificationTypes.map(type => (
              <div
                key={type.value}
                onClick={() => setNotificationType(type.value)}
                className={`cursor-pointer font-medium capitalize ${notificationType == type.value ? 'border-b-2 border-primary text-primary' : 'text-[#697386]'}`}
              >
                {notif(type.i18nKey)}
              </div>
            ))}
          </div>
          <div
            className='cursor-pointer font-semibold text-primary'
            onClick={handleMarkAllRead}
          >
            {notif('mark_all_as_read')}
          </div>
        </div>
        <div className='border border-[#DFE4EA]'></div>
        <div className='max-h-[85vh] overflow-auto' onScroll={handleScroll}>
          {notifications.map((notification: any) => (
            <Notification key={notification?._id} notification={notification} />
          ))}
          {!notifications.length ? (
            <div className='flex flex-col items-center py-9'>
              <Image
                src={'/images/no_notification.svg'}
                width={200}
                height={200}
                alt=''
              />
              <h1>{notif('no_notification_found')}</h1>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
