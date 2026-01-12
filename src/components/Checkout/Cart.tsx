'use client'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useEffect, useState } from 'react'
import EmptyCart from './EmptyCart'
import CartProducts from './CartProducts'
import PaymentSummary from './PaymentSummary'
import MobileCartLoader from '../Loader/CartLoader'
import MobileNavBar from '../NavBar'
// import { ChevronRight } from 'lucide-react'
// import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LastMinBuy from '../Products/ProductView/LastMinBuy'
import UploadPrescriptionCheckout from '../UploadPrescriptionCheckout'
// import DeliveryMode from './DeliveryMode'
import PatientSelection from './PatientSelection'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useFetchAllCoupons, useFetchCoupon } from '@/utils/hooks/couponHooks'

export default function CartComponent() {
  const [showDialog, setShowDialog] = useState(false)
  const resetOrderConfirmation = useCheckoutStore(
    state => state.resetOrderConfirmation
  )
  const cart = useTranslations('Cart')
  const router = useRouter()
  const session: any = useSession()
  const isLoggedIn = session.status === 'authenticated'
  const { toast } = useToast()
  const totalProducts = useCheckoutStore(state => state.totalProducts)
  const loading = useCheckoutStore(state => state.loading)
  const products = useCheckoutStore(state => state.products)
  useEffect(() => {
    resetOrderConfirmation()
  }, [])

  const {
    applyCoupon,
    removeCoupon,
    subTotal,
    discountAmount,
    appliedCouponData: appliedCouponFromStore,
    deliveryMode,
    setDeliveryMode
  } = useCheckoutStore(state => state)
  const prescribedProducts = products.filter(p => p.prescriptionReq)

  const { mutateAsync: fetchAllCoupons } = useFetchAllCoupons()
  const { mutateAsync: verifyCoupon } = useFetchCoupon()

  const [coupons, setCoupons] = useState<any[]>([])
  const [recommendedCoupon, setRecommendedCoupon] = useState<any>(null)
  const [couponDiscountValue, setCouponDiscountValue] = useState<number>(0)
  const [celebrate, setCelebrate] = useState<{
    code: string
    saved: number
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleRemoveCoupon = () => {
    removeCoupon()
  }

  useEffect(() => {
    setDeliveryMode('standard')
  }, [])

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()

    const shouldShowDialog = hour < 9 || hour >= 20

    if (shouldShowDialog) {
      setShowDialog(true)
    }
  }, [deliveryMode])

  const fetchAllCouponsFn = async () => {
    try {
      const res = await fetchAllCoupons({
        total: subTotal,
        email: session?.data?.user?.email,
        phoneNumber: session?.data?.user?.phoneNumber,
        isNewCode: true
      })
      if (Array.isArray(res)) {
        setErrorMessage('')
        setCoupons(res)
      } else {
        setErrorMessage(res?.message || '')
        setCoupons([])
      }
    } catch (error) {
      setErrorMessage((error as any)?.message || 'Failed to load coupons.')
      setCoupons([])
    }
  }

  useEffect(() => {
    if (isLoggedIn) fetchAllCouponsFn()
  }, [isLoggedIn, subTotal])

  const calcDiscountValue = (coupon: any): number => {
    if (!coupon) return 0
    let value = 0
    if (coupon.discountType === 'percentage') {
      const disc = (subTotal * coupon.discountValue) / 100
      if (
        coupon?.maximumDiscountValue !== undefined &&
        disc > coupon?.maximumDiscountValue
      ) {
        value = Math.min(disc, coupon?.maximumDiscountValue)
      } else {
        value = disc
      }
    } else if (coupon.discountType === 'fixedAmount') {
      value = coupon.discountValue
    }
    return value
  }

  useEffect(() => {
    if (coupons.length) {
      const calculated = coupons.map(c => ({
        ...c,
        finalDiscountedValue: calcDiscountValue(c)
      }))
      const best = calculated.reduce(
        (max, c) =>
          c.finalDiscountedValue > max.finalDiscountedValue ? c : max,
        calculated[0]
      )
      setRecommendedCoupon(best)
      setCouponDiscountValue(best.finalDiscountedValue)
    } else {
      setRecommendedCoupon(null)
      setCouponDiscountValue(0)
    }
  }, [coupons])

  const handleApplyRecommended = async () => {
    const coupon = recommendedCoupon
    if (!coupon) return router.push('/checkout/cart/coupon')
    try {
      const res = await verifyCoupon({
        couponCode: coupon.couponCode,
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
        setErrorMessage('')
        const computeTargetDiscount = (r: any) => {
          if (typeof r?.discountAmount === 'number') return r.discountAmount
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
        toast({
          title: 'Coupon Applied',
          description: `${res.couponName} was successfully applied.`
        })
        setCelebrate({
          code: res.couponCode || res.couponName,
          saved: Number(targetDiscount)
        })
        setTimeout(() => setCelebrate(null), 3000)
      } else {
        setErrorMessage(res?.message || 'This coupon cannot be applied.')
        toast({
          title: 'Invalid Coupon',
          description: res?.message || 'This coupon cannot be applied.',
          variant: 'destructive'
        })
      }
    } catch (err) {
      const errMsg =
        (err as any)?.message || 'Failed to apply coupon. Please try again.'
      setErrorMessage(errMsg)
      toast({
        title: 'Something went wrong',
        description: errMsg,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className='flex w-full justify-center pb-6'>
      <div className='w-full'>
        {celebrate && (
          <div className='pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center'>
            <div className='absolute inset-0 bg-black/35' />
            <div
              className='pointer-events-none absolute inset-0 z-[1001]'
              style={{
                backgroundImage: "url('/images/confettii.gif')",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover'
              }}
            />
            <div className='relative z-[1002] w-[320px] rounded-2xl bg-white px-8 py-6 text-center shadow-xl md:w-[380px]'>
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
              <p className='text-base font-semibold text-black'>
                '{celebrate.code}' Applied
              </p>
              <p className='mt-1 text-2xl font-normal text-black'>
                You Saved ₹{Number(celebrate.saved).toFixed(2)}
              </p>
              <p className='mt-1 text-sm font-medium text-[#E14F2C]'>
                Yay! Thanks
              </p>
            </div>
          </div>
        )}
        <div className='mb-16'>
          {loading ? (
            <MobileCartLoader />
          ) : totalProducts === 0 ? (
            <EmptyCart />
          ) : (
            <div className='mt-0 grid grid-cols-1 gap-4'>
              <CartProducts />
              <div className='space-y-4'>
                {prescribedProducts.length > 0 && (
                  <div>
                    <UploadPrescriptionCheckout />
                  </div>
                )}
                {prescribedProducts.length > 0 && (
                  <div>
                    <PatientSelection isConsultation={false} />
                  </div>
                )}

                <div className='relative flex flex-col gap-4 rounded-none border-t border-[#E75634] px-8 py-6 dark:bg-primary-green-dim'>
                  <div
                    className='absolute left-0 top-0 h-full w-full rounded-lg'
                    style={{
                      backgroundImage: `url('/images/couponBG.svg')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      zIndex: 0
                    }}
                  />
                  <div className='relative z-40 flex flex-col'>
                    <div className='-mt-5 grid grid-cols-[60px_1fr] items-center gap-2 text-lg font-semibold text-black dark:text-black'>
                      <div
                        style={{
                          position: 'relative',
                          width: '60px',
                          height: '60px'
                        }}
                      >
                        <Image
                          src={'/images/discountIcon.gif'}
                          alt='Footer Logo'
                          fill
                          objectFit='contain'
                        />
                      </div>
                      <div>{cart('apply_coupon')}</div>
                    </div>
                    <div className='grid grid-cols-[60px_1fr_auto] items-center'>
                      <div
                        style={{
                          position: 'relative',
                          width: '60px',
                          height: '28px'
                        }}
                      >
                        <Image
                          src={
                            appliedCouponFromStore
                              ? '/images/AppliedIcon.svg'
                              : '/images/percentageIcon.svg'
                          }
                          alt={
                            appliedCouponFromStore ? 'Applied' : 'Percentage'
                          }
                          fill
                          objectFit='contain'
                        />
                      </div>
                      <span className='text-xs font-normal text-black'>
                        {!coupons?.length && !errorMessage
                          ? 'No offers available at the moment!'
                          : errorMessage
                            ? errorMessage
                            : appliedCouponFromStore
                              ? `You saved ₹${Number(discountAmount).toFixed(0)} with ‘${appliedCouponFromStore?.couponCode}’`
                              : recommendedCoupon
                                ? `Save ₹${Number(couponDiscountValue).toFixed(2)} with ${recommendedCoupon?.couponCode}`
                                : 'No coupons available'}
                      </span>
                      {appliedCouponFromStore ? (
                        <Button
                          variant='outline'
                          className='rounded-md px-4 text-sm'
                          onClick={handleRemoveCoupon}
                        >
                          Remove
                        </Button>
                      ) : recommendedCoupon ? (
                        <Button
                          variant='outline'
                          className='rounded-md px-4 text-sm'
                          onClick={handleApplyRecommended}
                        >
                          Apply
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {/* {coupons.length > 0 && ( */}
                  <div
                    className='relative z-40 flex cursor-pointer items-center gap-1 pt-1 text-sm font-semibold text-[#E75634]'
                    onClick={() => router.push('/checkout/cart/coupon')}
                  >
                    <span className='no-underline'>View/Add Coupons</span>

                    <Image
                      src='/images/viewAllIcon.svg'
                      alt='View All'
                      width={18}
                      height={18}
                      className='ml-1'
                    />
                  </div>
                  {/* )} */}
                </div>

                {/* <DeliveryMode /> */}
                <PaymentSummary nextPath='/checkout/address' />
              </div>

              <div className=''>
                <LastMinBuy />
              </div>
            </div>
          )}
        </div>
        <div className='fixed bottom-0 w-full'>
          <MobileNavBar />
        </div>
      </div>
      <Dialog open={showDialog}>
        <DialogContent className='text-white'>
          <DialogTitle className='text-black'>
            Notice for Same-Day Delivery
          </DialogTitle>
          <Image
            className='mx-auto'
            src={'/images/LateDelivery.svg'}
            alt={'dia'}
            height={100}
            width={328}
          />

          <p className='text-muted-foreground flex items-center justify-center text-sm text-black'>
            Same Day delivery is available between 9 AM to 8 PM only
          </p>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
