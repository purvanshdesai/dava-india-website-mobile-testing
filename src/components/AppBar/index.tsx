'use client'

import useCommonStore from '@/store/useCommonStore'
import { Bell, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import React, { useEffect, useState } from 'react'
import MobilePinCodeManager from './PinCodeManager'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import PrescriptionManager from './PrescriptionManager'

interface Props {
  hideUploadPrescription?: boolean
}

export default function MobileAppBar({
  hideUploadPrescription = false
}: Props) {
  const global = useTranslations('GlobalSearch')
  const showAppBarSearch = useCommonStore(state => state.showAppBarSearch)
  const router = useRouter()

  const setAppBarSearchStatus = useCommonStore(
    state => state.setAppBarSearchStatus
  )

  useEffect(() => {
    setAppBarSearchStatus(true)
  }, [])

  const searchOptions = global('search_types')
    .split('/')
    .map(v => v.trim()) // search options
  searchOptions.push(searchOptions[0])
  const [translateY, setTranslateY] = useState(0) // initial translateY position
  const [transitionDuration, setTransitionDuration] = useState(0) // initial transition duration
  const maxTransforms = searchOptions.length // number of moves before resetting
  const intervalTime = 1250 // interval time in milliseconds

  const SearchField = () => {
    useEffect(() => {
      let transformCount = 0
      let interval: NodeJS.Timeout | null = null
      let animationRunning = false // Track if animation is running

      const scroll = () => {
        if (transformCount === 0) {
          setTransitionDuration(400)
        }
        setTranslateY(prevY => prevY - 20) // Move by -20px
        transformCount++
      }

      const reset = () => {
        setTransitionDuration(0) // Reset transition duration
        setTranslateY(0) // Reset to initial position
        transformCount = 0
      }

      const waitTillScrollFinish = async () => {
        return new Promise<void>(resolve => {
          interval = setInterval(() => {
            scroll()
            if (transformCount === maxTransforms) {
              clearInterval(interval!)
              reset()
              resolve()
            }
          }, intervalTime)
        })
      }

      const animateLoop = async () => {
        if (animationRunning) return // Prevent multiple instances

        animationRunning = true
        while (true) {
          if (transformCount === 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
            scroll()
          }
          await waitTillScrollFinish()
        }
      }

      animateLoop()

      // Cleanup interval on component unmount
      return () => {
        if (interval) clearInterval(interval)
      }
    }, [])

    return (
      <>
        {showAppBarSearch && (
          <div
            className='relative flex h-[80px] items-center justify-center bg-gradient-to-b px-3'
            style={{
              background: 'linear-gradient(to bottom, #2DA771,#2A8D61)'
            }}
          >
            <div className=''>
              <Image
                src={`/images/cubic.svg`}
                alt='SearchBanner'
                fill
                priority={true}
              />
            </div>
            <div className='fade-in-up animate-delay-100 flex w-full items-center rounded-full border bg-gray-100 px-3 py-1.5 dark:border-gray-600 dark:bg-gray-700 md:max-w-96'>
              <div className='rounded-full bg-primary p-1.5 text-white'>
                <Search size={18} />
              </div>
              <Link href={'/search'}>
                <div
                  className={
                    'flex w-full cursor-text gap-x-1 bg-gray-100 pl-3 text-sm text-[#a9a9a9] dark:bg-gray-700'
                  }
                >
                  <div className='mt-1'>{global('search')}</div>
                  <div
                    className={
                      'pointer-events-none flex h-7 flex-col overflow-hidden'
                    }
                  >
                    <ul
                      className={`duration-${transitionDuration} mb-1 mt-1 flex transform flex-col ${transitionDuration === 0 ? 'transition-none' : 'transition-transform'}`}
                      style={{ transform: `translateY(${translateY}px)` }}
                    >
                      {searchOptions.map((option, idx) => (
                        <li key={idx}>{option}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className='flex w-full items-center border-b bg-white pb-4 dark:border-gray-600 dark:bg-slate-900'>
      <div className='flex w-full flex-col items-center gap-3'>
        <div className='flex w-full flex-col gap-1'>
          <div className='flex items-center justify-between pl-4'>
            <Link href={'/'}>
              <div
                style={{ position: 'relative', width: '150px', height: '60px' }}
              >
                <Image
                  src={'/images/Logo.svg'}
                  alt='Davainda Logo'
                  className='cursor-pointer'
                  fill
                  priority={true}
                />
              </div>
            </Link>
            <div className='mr-2 flex items-center gap-1'>
              {!hideUploadPrescription && <PrescriptionManager />}
              <div
                className='rounded-full bg-gray-200 p-2'
                onClick={() => {
                  router.push('/notifications')
                }}
              >
                <Bell size={18} className='text-gray-800' />
              </div>
            </div>
          </div>

          <div className='mb-3 mt-1 px-3'>
            <MobilePinCodeManager />
          </div>
          <div className='w-full'>{SearchField()}</div>
        </div>
      </div>
    </div>
  )
}
