'use client'
// import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFetchAllCoupons, useFetchCoupon } from '@/utils/hooks/couponHooks'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTranslations } from 'next-intl'
// import { cn } from '@/lib/utils'
import Image from 'next/image'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '../ui/input'

export default function MobileCoupon() {
  // const cart = useTranslations('Cart')
  const { toast } = useToast()
  const settingsmanager = useTranslations('SettingsManager')
  const router = useRouter()
  const session: any = useSession()
  const {
    applyCoupon,
    removeCoupon,
    subTotal,
    appliedCouponData: appliedCouponFromStore,
    products
  } = useCheckoutStore(state => state)
  // const [couponCode, setCouponCode] = useState<string>('')
  const [message, setMessage] = useState('')
  const [, setAppliedCouponCode] = useState<any>(null)
  // const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  // const [appliedCouponData, setAppliedCouponData] = useState<any>(null)
  const [coupons, setCoupons] = useState<any>([])
  const [appliedPopup, setAppliedPopup] = useState<any>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [manualCouponCode, setManualCouponCode] = useState('')

  const { mutateAsync: fetchAllCoupons } = useFetchAllCoupons()

  const fetchAllCouponsFn = async () => {
    try {
      const res = await fetchAllCoupons({
        total: subTotal,
        email: session?.data?.user?.email,
        phoneNumber: session?.data?.user?.phoneNumber,
        isNewCode: true
      })
      if (res?.message) {
        setMessage(res?.message)
        setCoupons([])
      } else {
        setMessage('')
        setCoupons(res)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchAllCouponsFn()
  }, [])

  const { mutateAsync: verifyCoupon } = useFetchCoupon()

  const handleApplyCoupon = async (coupon: any) => {
    if (isApplying || !coupon) return
    setIsApplying(true)
    try {
      const res = await verifyCoupon({
        couponCode: coupon?.couponCode ?? coupon,
        totalAmount: subTotal,
        items: products.map((p: any) => ({
          productId: p._id,
          quantity: p.quantity,
          isSelected: p.isSelected,
          consultationId: p?.consultationId,
          isConsultationItem: p.isConsultationItem,
          isBuyNowItem: p.isBuyNowItem,
          prescriptionReq: p.prescriptionReq,
          batchNo: p.batchNo,
          expiryDate: p.expiryDate,
          storeId: p.storeId,
          collections: p.collections
        }))
      })

      if (res?.couponName) {
        if (
          appliedCouponFromStore &&
          appliedCouponFromStore?.couponCode !== res.couponCode
        ) {
          await removeCoupon()
        }

        // Get discount amount before applying coupon to calculate only the new discount
        const discountBefore = useCheckoutStore.getState().discountAmount || 0

        const computeTargetDiscount = (r: any) => {
          if (typeof r?.discountAmount === 'number' && r.discountAmount > 0) {
            // API returned the discount amount for this specific coupon
            return r.discountAmount
          }
          if (typeof r?.discountValue === 'number') {
            if (r?.discountType === 'percentage') {
              const disc = (subTotal * r.discountValue) / 100
              return r?.maximumDiscountValue
                ? Math.min(disc, r.maximumDiscountValue)
                : disc
            }
            return r.discountValue
          }
          return 0
        }
        const targetDiscount = Number(computeTargetDiscount(res))
        const couponForStore = { ...res, discountValue: targetDiscount }

        await applyCoupon(couponForStore)
        setAppliedCouponCode(res.couponCode)

        // Calculate saved amount for this specific coupon only
        // Use the computed target discount (which is the discount for this coupon)
        // If not available, calculate difference to ensure we only show new discount
        let saved = targetDiscount
        if (saved === 0) {
          // Fallback: calculate difference (new total discount - old total discount)
          const discountAfter = useCheckoutStore.getState().discountAmount || 0
          saved = Math.max(0, discountAfter - discountBefore)
        }

        setAppliedPopup({
          code: res?.couponCode,
          amount: Number(saved) || 0
        })

        toast({
          title: 'Coupon Applied',
          description: `${res.couponName} was successfully applied.`
        })

        setTimeout(() => {
          setAppliedPopup(null)
          router.push('/checkout/cart')
        }, 3000)
      } else {
        toast({
          title: 'Invalid Coupon',
          description: res?.message || 'This coupon cannot be applied.',
          variant: 'destructive'
        })
      }
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: 'Failed to apply coupon. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsApplying(false)
    }
  }
  const handleManualCouponApply = async () => {
    await removeCoupon()
    if (!manualCouponCode.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a coupon code.',
        variant: 'destructive'
      })
      return
    }

    await handleApplyCoupon({
      couponCode: manualCouponCode.trim()
    })
    setManualCouponCode('')
  }

  return (
    <div className=''>
      {appliedPopup && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/35' />
          <div
            className='pointer-events-none absolute inset-0 z-10'
            style={{
              backgroundImage: "url('/images/confettii.gif')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
          <div className='relative z-20 w-[360px] rounded-2xl bg-white p-6 text-center shadow-xl'>
            <div
              className='mx-auto mb-2'
              style={{ position: 'relative', width: '64px', height: '64px' }}
            >
              <Image
                src='/images/GreenTick.gif'
                alt='Success'
                fill
                objectFit='contain'
              />
            </div>
            <p className='text-sm font-medium text-gray-600'>
              ‘{appliedPopup?.code}’ Applied
            </p>
            <p className='mt-2 text-2xl font-bold text-black'>
              You Saved ₹{Number(appliedPopup?.amount).toFixed(0)}
            </p>
            <p className='mt-2 text-sm font-semibold text-[#E75634]'>
              Yaay! Thanks
            </p>
          </div>
        </div>
      )}
      <div className='mb-2 flex flex-row items-center justify-between bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>

          <p className='ml-2 font-semibold'>{settingsmanager('coupons')}</p>
        </div>

        <div className='flex flex-row items-center justify-center'>
          <Link href={'/search'}>
            <div className='rounded-full bg-[#F4F4F4] p-2'>
              <Search color='#3C3C3C' size={20} />
            </div>
          </Link>
        </div>
      </div>
      <div className='flex w-full items-center gap-3'>
        <div className='relative w-full'>
          <div className='flex items-center gap-2 border-b bg-white p-2 py-4'>
            <Input
              placeholder='Coupon Code'
              value={manualCouponCode}
              onChange={e => setManualCouponCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleManualCouponApply()
                }
              }}
            />
            <Button
              className='bg-primary dark:bg-primary-dim'
              onClick={handleManualCouponApply}
            >
              <span className='px-3'>Apply</span>
            </Button>
          </div>
          {message ? (
            <div className='m-2 flex flex-col items-center space-y-3 bg-white py-4'>
              <div className='relative' style={{ width: 101, height: 101 }}>
                <Image
                  src='/images/couponMessage.svg'
                  alt='Coupon Gift'
                  fill
                  objectFit='contain'
                />
              </div>
              <span className='text-sm'>{message}</span>
            </div>
          ) : (
            <div className='m-2 space-y-4'>
              {coupons.map((coup: any, idx: number) => (
                <div
                  key={idx}
                  className='grid grid-cols-[40px_1fr_auto] items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-sm'
                >
                  <div className='relative h-10 w-10'>
                    <Image
                      src='/images/couponImg.svg'
                      alt='Coupon Icon'
                      fill
                      objectFit='contain'
                    />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-base font-semibold uppercase'>
                      {coup.couponCode || coup.couponName}
                    </span>
                    <span className='text-[13px] leading-5 text-gray-700'>
                      Flat {coup.discountValue}
                      {coup.discountType === 'percentage' ? '%' : ''} off on
                      medicines.
                    </span>
                    <span className='text-[13px] leading-5 text-gray-700'>
                      Minimum order value: Rs.{coup.minimumPurchaseValue}{' '}
                      <span className='text-[#010101]'>T&C Apply</span>
                    </span>
                    {idx === 0 && (
                      <div className='mt-2 flex items-start gap-2'>
                        <img
                          src='/images/info-icon.svg'
                          alt='info'
                          className='h-4 w-4 object-contain'
                        />

                        <span className='text-[13px] font-medium text-[#54863C]'>
                          This coupon applies only on one product in the cart.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='self-center'>
                    {appliedCouponFromStore?.couponCode === coup.couponCode ? (
                      <Button
                        variant='ghost'
                        className='text-sm font-semibold uppercase text-red-600'
                        onClick={async () => {
                          if (isApplying) return
                          setIsApplying(true)
                          try {
                            await removeCoupon()
                            setAppliedPopup(null)
                          } finally {
                            setIsApplying(false)
                          }
                        }}
                        disabled={isApplying}
                      >
                        REMOVE
                      </Button>
                    ) : (
                      <Button
                        variant='ghost'
                        className='text-sm font-semibold uppercase text-[#E14F2C]'
                        onClick={() => handleApplyCoupon(coup)}
                        disabled={isApplying}
                      >
                        APPLY
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
