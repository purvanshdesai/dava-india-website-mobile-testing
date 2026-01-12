'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { shareApp } from '@/utils/actions/shareApp'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Search,
    ShoppingCart
  } from 'lucide-react'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTranslations } from 'next-intl'

export default function AppShare() {
  const [contactMethod, setContactMethod] = useState('email')
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const shareapp = useTranslations('ShareApp')
   const totalProducts = useCheckoutStore(state => state.totalProducts)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleContactChange = (value: string) => {
    setContactMethod(value)
    setInputValue('')
    setError('')
  }

  const validateInput = () => {
    if (contactMethod === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%±]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(inputValue)) {
        setError('Please enter a valid email address.')
        return false
      }
    } else {
      const phoneRegex = /^(\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/

      if (!phoneRegex.test(inputValue)) {
        setError('Please enter a valid 10-digit phone number.')
        return false
      }
    }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    if (!inputValue) {
      setError(`Please enter your ${contactMethod}.`)
      setLoading(false)
      return
    }

    setError('')
    if (validateInput()) {
      // alert(inputValue)
      try {
        await shareApp({
          sharingMedium: contactMethod,
          shareWith: inputValue
        })
        toast({
          title: 'Success',
          description: 'Link sent successfully!'
        })

        setInputValue('')
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message
        })
      }
    }
    setLoading(false)
  }

  return (
    <div className='relative'>
      <div className='sticky top-0 z-50 mb-2 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-4'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 text-sm font-semibold'>App Download</p>
        </div>

        <div className='flex flex-row items-center justify-center gap-2'>
          <div
            className='mr-1 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/checkout/cart')}
          >
            <div className='relative'>
              <ShoppingCart color='#3C3C3C' size={20} />
              {totalProducts > 0 && (
                <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-xs text-white'>
                  {totalProducts}
                </span>
              )}
            </div>
          </div>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/search')}
          >
            <Search color='#3C3C3C' size={20} />
          </div>
        </div>
      </div>
      <div className='flex min-h-full flex-col rounded-xl bg-white'>
        <div
          style={{
            position: 'relative',
            width: '329px',
            height: '253px',
            margin: 'auto'
          }}
        >
          <Image
            src={'/images/AppShare.svg'}
            alt='App share Image'
            className='cursor-pointer'
            fill
            priority={true}
          />
        </div>

        <div className='items-left flex flex-col space-y-4 p-4'>
          <h1 className='text-xl font-bold'>{shareapp('download_our_app')}</h1>

          <div className='mt-4'>
            <p>
            {shareapp('download_desc_2')}
            </p>
          </div>

          <div className='mt-6'>
            <RadioGroup
              value={contactMethod}
              onValueChange={handleContactChange}
              className='flex flex-row space-x-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='email' id='email' />
                <label htmlFor='email' className='text-sm font-medium'>
                  Email
                </label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='phone' id='phone' />
                <label htmlFor='phone' className='text-sm font-medium'>
                  Phone
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className='mt-6 flex flex-col'>
            <div className='relative mr-5 flex w-full flex-row items-center rounded-md border border-gray-300'>
              <Input
                type={contactMethod === 'email' ? 'email' : 'tel'}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={
                  contactMethod === 'email'
                    ? 'Enter email'
                    : 'Enter phone number'
                }
                className={`border-1.5 ${contactMethod === 'phone' ? 'pl-16' : ''}`}
              />
              {contactMethod === 'phone' && (
                <div className='absolute left-2 top-2 flex items-center gap-2 px-1 text-label'>
                  +&#8201;91
                  <span className='text-label'>|</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className='mb-10 mt-6 w-1/2 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600'
            >
              {loading ? 'Loading...' : shareapp('share_app_button')}
            </Button>
          </div>
          {error && <p className='text-sm text-red-500'>{error}</p>}

          <div className='relative flex w-full flex-col'>
            <p>{shareapp('download_from_the_app')}:</p>
            <div className='mt-4'>
              <Link href={'https://apps.apple.com'}>
                <div className='relative h-12 w-full rounded-lg bg-black'>
                  <Image
                    src={'/images/AppStoreButton.svg'}
                    alt='App store button'
                    className='cursor-pointer'
                    fill
                    priority={true}
                  />
                </div>
              </Link>
              <Link href={'https://play.google.com'}>
                <div className='relative mt-2 h-12 w-full rounded-lg bg-black'>
                  <Image
                    src={'/images/PlayStoreButton.svg'}
                    alt='Play store button'
                    className='cursor-pointer'
                    fill
                    priority={true}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
