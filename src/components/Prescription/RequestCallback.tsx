'use client'
import React from 'react'
import { Button } from '../ui/button'
import { useTransitionRouter } from 'next-view-transitions'
import { useConsultationOrder } from '@/utils/hooks/orderHooks'
import useCheckoutStore from '@/store/useCheckoutStore'

export default function RequestCallback() {
  const router = useTransitionRouter()
  const orderConsultationOrder = useConsultationOrder()
  const {
    selectedAddress,
    prescriptionFiles,
    patientId,
    dateOfConsult,
    timeOfConsult
  } = useCheckoutStore()

  const handleRequestCallback = async () => {
    await orderConsultationOrder.mutateAsync({
      issue: 'prescription-upload',
      prescription_url: prescriptionFiles,
      address: selectedAddress,
      items: [],
      patientId: patientId,
      dateOfConsult,
      timeOfConsult
    })
    router.push('/prescription/callback-order-summary')
  }
  return (
    <div>
      <Button className='px-10' onClick={() => handleRequestCallback()}>
        Request Callback
      </Button>
    </div>
  )
}
