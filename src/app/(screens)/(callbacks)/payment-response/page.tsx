'use client'

import { useEffect, useRef, useState } from 'react'
import { useVerifyPayment } from '@/utils/hooks/paymentHooks'
import { useSearchParams } from 'next/navigation'
import { useTransitionRouter } from 'next-view-transitions'
import useCheckoutStore from '@/store/useCheckoutStore'
import { PaymentVerificationPage } from '@/components/Payment/PaymentVerificationPage'
import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'
import usePatientsStore from '@/store/userPatientStore'
import useUserDetailsStore from '@/store/useUserDetailsStore'
import { removeUtmDetailsInLocal } from '@/utils/utmManager'

export default function PaymentResponsePage() {
  const searchParams = useSearchParams()
  const router = useTransitionRouter()
  const { fetchCart, updateSuccessOrderStatus } = useCheckoutStore()
  const fetchAddresses = useDeliveryAddressStore(state => state.fetchAddresses)
  const fetchPatients = usePatientsStore(state => state.fetchPatients)
  const fetchUserAccount = useUserDetailsStore(state => state.fetchUserDetails)

  const isVerified = useRef(false)
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>(
    'verifying'
  )
  const [orderDetails, setOrderDetails] = useState({})

  const { mutateAsync: handleVerifyPayment } = useVerifyPayment()

  const verifyPayment = async () => {
    const txnId = searchParams.get('txnId') as string
    const orderId = searchParams.get('orderId') as string
    const paymentFor = searchParams.get('paymentFor') as string

    const { verificationStatus, orderDetails, order } =
      await handleVerifyPayment({ paymentFor, paymentOrderId: txnId, orderId })

    if (verificationStatus === 'success') {
      updateSuccessOrderStatus(order)
      removeUtmDetailsInLocal()
      // Refetch user details to update Dava coin balance instantly
      await fetchUserAccount()
    }

    setStatus(verificationStatus)
    setOrderDetails(orderDetails)

    if (paymentFor === 'order') {
      router.push(
        `/checkout/confirmation?paymentGateway=payu&status=${verificationStatus}&orderId=${order?.orderId}&note=${orderDetails?.note}`
      )
    } else if (paymentFor === 'membership') {
      if (verificationStatus === 'success') {
        router.push(`/profile/membership/confirmation?status=${verificationStatus}`)
      } else router.push(`/profile/membership/confirmation`)
    }
  }

  useEffect(() => {
    const txnId = searchParams.get('txnId')
    const orderId = searchParams.get('orderId') as string
    const paymentFor = searchParams.get('paymentFor') as string

    if (!txnId || !orderId || isVerified.current) return

    if (paymentFor === 'order') {
      fetchCart()
      fetchAddresses()
      fetchPatients()
    }
    verifyPayment()
    isVerified.current = true
  }, [])

  return (
    <div>
      <PaymentVerificationPage status={status} orderDetails={orderDetails} />
    </div>
  )
}
