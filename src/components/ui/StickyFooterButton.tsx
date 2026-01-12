'use client'

import { Button } from './button'

type Props = {
  disabled?: boolean
  onClick: () => void
  label?: string
  loading?: boolean
}

export default function StickyFooterButton({
  disabled,
  onClick,
  label = 'Continue',
  loading
}: Props) {
  return (
    <div className='fixed bottom-0 left-0 right-0 z-10 border-t bg-white p-4'>
      <Button
        loader={loading}
        className='w-full bg-[#f26321] font-semibold text-white hover:bg-[#e45717]'
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  )
}
