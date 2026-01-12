'use client'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import React, { useEffect, useRef, useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useTranslations } from 'next-intl'

const SortFilterDrawer = ({ closeDrawer, selectedSort, selectValue }: any) => {
  const common = useTranslations('Common')
  const cart = useTranslations('Cart')
  const sortData = [
    { name: common('relevance'), code: 'relevance' },
    { name: common('sort_low_high'), code: 'price-asc' },
    { name: common('sort_high_low'), code: 'price-desc' },
    { name: common('discount'), code: 'discount' }
  ]
  const [selectedLang, setSelectedLang] = useState<any>()
  const [isOpen, setIsOpen] = useState(true)
  const drawerRef = useRef<any>(null)
  const handleSortChange = async (lang: any) => {
    selectedSort(lang?.code)
    setSelectedLang(lang)
    //  closeDrawer(false)
    //  setIsOpen(false)
  }

  useEffect(() => {
    if (selectValue) {
      const result: any = sortData.find(item => item.code === selectValue)
      setSelectedLang(result)
    }
  }, [selectValue])
  return (
    <div>
      {isOpen && (
        <Drawer open={isOpen}>
          <DrawerContent ref={drawerRef} className='h-3/4'>
            <DrawerHeader className='flex flex-row items-center justify-between border-b-2'>
              <DrawerTitle className=''>{common('sort_by')}</DrawerTitle>
              <Button
                className=''
                size={'sm'}
                variant={'default'}
                onClick={() => {
                  closeDrawer(false)
                  setIsOpen(false)
                }}
              >
                {cart('apply_button')}
              </Button>
            </DrawerHeader>
            <div className='h-[calc(100vh-150px)] overflow-y-auto p-5'>
              <RadioGroup>
                {sortData.map((lang: any) => {
                  const isSelected = selectedLang?.code === lang.code
                  return (
                    <div
                      key={lang.code}
                      className={`flex h-[50px] cursor-pointer items-center rounded-lg border p-3 text-sm ${
                        isSelected ? 'border-orange-600' : 'border-gray-300'
                      }`}
                      onClick={async () => handleSortChange(lang)}
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

export default SortFilterDrawer
