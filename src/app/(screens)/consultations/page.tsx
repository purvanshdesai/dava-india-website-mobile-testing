'use client'
import ConsultationItem from '@/components/Consultations/ConsultationItem'
import { useGetConsultationsInfinite } from '@/utils/hooks/consultationsHooks'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'

export default function MyConsultations() {
  const router = useRouter()
  const containerRef = useRef<any>(null)

  const { data, fetchNextPage, hasNextPage, isFetching } =
    useGetConsultationsInfinite({
      $limit: 10
    })

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (hasNextPage && !isFetching) {
        fetchNextPage()
      }
    }
  }

  const consultations: any[] = data?.pages.flatMap(page => page.data) || []

  return (
    <div
      onScroll={handleScroll}
      ref={containerRef}
      className='flex-1 overflow-auto'
    >
      <div className='flex items-center gap-4 bg-white px-4 py-3'>
        <div
          className='flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F4F4F4]'
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
        </div>
        <div className='font-bold'>My Consultations</div>
      </div>
      <div className='mt-2 flex-1 bg-white'>
        {consultations.map((consultation, index) => (
          <ConsultationItem consultation={consultation} key={index} />
        ))}
      </div>
    </div>
  )
}
