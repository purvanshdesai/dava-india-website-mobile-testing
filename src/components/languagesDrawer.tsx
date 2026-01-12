'use client'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import React, { useEffect, useRef, useState } from 'react'
import { getUserLocale, setUserLocale } from '@/i18n/locale'
import { defaultLocale } from '@/i18n/config'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useTranslations } from 'next-intl'
const languages = [
  { name: 'Language - English', code: 'en' },
  { name: 'অসমীয়া - Assamese', code: 'as' },
  { name: 'বাংলা - Bengali', code: 'bn' },
  { name: 'ગુજરાતી - Gujarati', code: 'gu' },
  { name: 'हिंदी - Hindi', code: 'hi' },
  { name: 'ಕನ್ನಡ - Kannada', code: 'kn' },
  { name: 'മലയാളം - Malayalam', code: 'ml' },
  { name: 'मराठी - Marathi', code: 'mr' },
  // { name: 'মণিপুরী - Manipuri', code: 'mni' },
  { name: 'नेपाली - Nepali', code: 'ne' },
  { name: 'ଓଡ଼ିଆ - Oriya', code: 'or' },
  { name: 'ਪੰਜਾਬੀ - Punjabi', code: 'pa' },
  { name: 'தமிழ் - Tamil', code: 'ta' },
  { name: 'తెలుగు - Telugu', code: 'te' },
  { name: 'भोजपुरी - Bhojpuri', code: 'boj' }
]
const LanguagesDrawer = ({ closeDrawer, selectedLanguage }: any) => {
  const [selectedLang, setSelectedLang] = useState<any>({})
  const [isOpen, setIsOpen] = useState(true)
  const drawerRef = useRef<any>(null)
  const commonTranslations = useTranslations('Common')
  const handleClickOutside = (event: any) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      // router.push('/profile')
      selectedLanguage(selectedLang)
      closeDrawer(false)
      setIsOpen(false)
    }
  }
  useEffect(() => {
    const setUserLocale = async () => {
      const locale = (await getUserLocale()) ?? defaultLocale
      setSelectedLang(languages.find((l: any) => l.code === locale))
    }

    setUserLocale()
  }, [])

  const handleLangChange = async (lang: any) => {
    await setUserLocale(lang.code)
    setSelectedLang(lang)
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div>
      {isOpen && (
        <Drawer open={isOpen}>
          <DrawerContent ref={drawerRef} className='h-3/4'>
            <DrawerHeader className='flex flex-row items-center justify-between border-b-2'>
              <DrawerTitle className=''>{commonTranslations('choose_language')}</DrawerTitle>
              <Button
                className=''
                size={'sm'}
                variant={'default'}
                onClick={() => {
                  closeDrawer(false)
                  setIsOpen(false)
                }}
              >
                {commonTranslations('apply')}
              </Button>
            </DrawerHeader>
            <div className='h-[calc(100vh-150px)] overflow-y-auto p-5'>
              <RadioGroup>
                {languages.map((lang: any) => {
                  const isSelected = selectedLang?.code === lang.code
                  return (
                    <div
                      key={lang.code}
                      className={`flex h-[50px] cursor-pointer items-center rounded-lg border p-3 text-sm ${
                        isSelected ? 'border-orange-600' : 'border-gray-300'
                      }`}
                      onClick={async () => handleLangChange(lang)}
                    >
                      <RadioGroupItem
                        className='text-primary'
                        value={lang.code}
                        id={lang.code}
                        checked={isSelected}
                      />
                      <Label
                        htmlFor={lang.code}
                        className='ml-3 cursor-pointer'
                      >
                        {lang.name}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export default LanguagesDrawer
