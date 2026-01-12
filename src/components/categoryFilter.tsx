'use client'
import useCategoriesFilterStore from '@/store/useCategoriesFilterStore'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

const CategoriesFilter = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('price')
  const { price, discount } = useCategoriesFilterStore()
  const common = useTranslations('Common')
  const [priceValues, setPriceValues] = useState<string>(price || '')
  const [discountValues, setDiscountValues] = useState<string>(discount || '')
  const { setPriceCategoriesValue, setDiscountCategoriesValue } =
    useCategoriesFilterStore()

  const handleCheckboxChange = (category: string, value: string) => {
    if (category === 'price') {
      // Since it's single-select, directly set the value
      setPriceValues(value)
      setPriceCategoriesValue(value)
    } else if (category === 'discount') {
      // Since it's single-select, directly set the value
      setDiscountValues(value)
      setDiscountCategoriesValue(value)
    }
  }

  const handleClearFilters = () => {
    setPriceValues('')
    setPriceCategoriesValue('')
    setPriceValues('')
    setDiscountValues('')
  }

  const keyLabel = (key: any) => {
    switch (key) {
      case '100':
        return 'up to 100'
      case '200':
        return 'up to 200'
      case '300':
        return 'up to 300'
      default:
        return 'None'
    }
  }

  return (
    <div>
      <div className=''>
        {/* <div className='sticky top-0 z-50 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-2'>
          <div className='flex flex-row items-center justify-center'>
            <div
              className='rounded-full bg-[#F4F4F4] p-2'
              onClick={() => router.back()}
            >
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
            <p className='ml-2 text-sm font-semibold'>Filter</p>
          </div>

          <div className='flex flex-row items-center justify-center gap-2'>
            <div
              className='mr-1 p-2 font-semibold text-[#E75634]'
              onClick={handleClearFilters}
            >
              Clear Filter
            </div>
          </div>
        </div> */}
        <div>
          <div className='flex flex-row items-center justify-end gap-2'>
            <div
              className='mr-1 p-2 font-semibold text-[#E75634]'
              onClick={handleClearFilters}
            >
              {common('clear_filter')}
            </div>
          </div>
        </div>

        <div className='flex h-screen '>
          <div
            className='w-4/12 overflow-y-auto '
            style={{ height: 'calc(100vh - 60px)' }}
          >
            {/* Price Option */}
            <div
              className={`flex cursor-pointer flex-col items-center gap-2 p-4 text-xs font-semibold ${
                selectedCategory === 'price'
                  ? 'border-r-4 border-orange-500 bg-white'
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory('price')}
            >
              <div
                style={{
                  position: 'relative',
                  height: '20px'
                }}
                className={`flex w-full flex-row justify-between ${
                  selectedCategory === 'price' ? 'text-orange-500' : ''
                }`}
              >
                <p>{common('price')}</p>
                {priceValues && <p>1</p>}{' '}
                {/* Show count if a value is selected */}
              </div>
            </div>

            {/* Discount Option */}
            <div
              className={`flex cursor-pointer flex-col items-center gap-2 p-4 text-xs font-semibold ${
                selectedCategory === 'discount'
                  ? 'border-r-4 border-orange-500 bg-white'
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory('discount')}
            >
              <div
                style={{
                  position: 'relative',
                  height: '20px'
                }}
                className={`flex w-full flex-row justify-between ${
                  selectedCategory === 'discount' ? 'text-orange-500' : ''
                }`}
              >
                <p>{common('discount')}</p>
                {discountValues && <p>1</p>}{' '}
                {/* Show count if a value is selected */}
              </div>
            </div>
          </div>

          <div
            style={{ height: 'calc(100vh - 60px)' }}
            className='flex w-full flex-col overflow-y-auto bg-white'
          >
            <div className='flex flex-col gap-4 bg-white p-4 '>
              {selectedCategory === 'price' &&
                ['100', '200', '300'].map(item => (
                  <label key={item} className='flex items-center'>
                    <input
                      type='radio' // Changed to radio for single-select behavior
                      className='mr-2'
                      name='price' // Add name attribute to group them
                      value={item}
                      checked={priceValues === item} // Ensure UI reflects state
                      onChange={() => handleCheckboxChange('price', item)}
                    />
                    {keyLabel(item)}
                  </label>
                ))}
              {selectedCategory === 'discount' &&
                ['100', '200', '300'].map(item => (
                  <label key={item} className='flex items-center'>
                    <input
                      type='radio' // Changed to radio for single-select behavior
                      className='mr-2'
                      name='discount' // Add name attribute to group them
                      value={item}
                      checked={discountValues === item} // Ensure UI reflects state
                      onChange={() => handleCheckboxChange('discount', item)}
                    />
                    {item}% Off or more
                  </label>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesFilter
