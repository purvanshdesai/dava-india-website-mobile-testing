'use client'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { IndianRupee, MinusIcon, PlusIcon } from 'lucide-react'
import { useTransitionRouter } from 'next-view-transitions'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import {
  AddressNotDeliverableIcon,
  cartIconOrange,
  cartIconWhite
} from '@/components/utils/icons'
import TranslationHandler from '@/components/utils/TranslationHandler'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog'
import { useState } from 'react'
import {
  trackProductAddedToCart,
  trackProductRemovedFromCart
} from '@/analytics/trackers/productTracker'

interface Product {
  index?: number
  className?: string
  product: any
}

export default function MobileProductCard({ className, product }: Product) {
  const router = useTransitionRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const isAuthenticated = session?.user || false

  const productTranslation = useTranslations('Product')
  const commonTranslation = useTranslations('Common')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const {
    addOrUpdateProduct,
    products: cartProducts,
    removeProduct
  } = useCheckoutStore(state => state)
  const handleAddQuantity = async (product: any) => {
    if (isAdding) return

    setIsAdding(true)
    const qtyInCart = product?.quantity
    let newQuantity = qtyInCart + 1

    if (newQuantity > product?.maxOrderQuantity) {
      toast({
        title: 'Maximum Order Quantity Reached',
        description: `You can add upto ${product?.maxOrderQuantity} quantity in cart.`
      })

      return
    }

    if (newQuantity > product?.maxOrderQuantity)
      newQuantity = product?.maxOrderQuantity

    const resp: any = await addOrUpdateProduct({
      ...product,
      quantity: +1
    })
    if (resp?.noEnoughQuantity) {
      toast({
        title: 'Insufficient Quantity!',
        description:
          'The requested quantity for this product is currently unavailable. Please reduce the quantity or explore similar items. Thank you for understanding!'
      })
    } else if (resp?.qtyLimitReached) {
      toast({
        title: 'Quantity Limit Reached!',
        description: 'You can add upto 10 quantity per product'
      })
    }
    setIsAdding(false)
  }

  const getProductCartQuantity = () => {
    const productInCart = cartProducts?.find(p => p._id === product?._id)
    return productInCart ? productInCart.quantity : 0
  }

  const handleAddToCart = async () => {
    if (isAdding) return

    setIsAdding(true)

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const res: any = await addOrUpdateProduct({ ...product, quantity: 1 })

    if (res?.qtyLimitReached) {
      toast({
        title: 'Quantity Limit Reached!',
        description: 'You can add upto 10 quantity per product'
      })
    } else if (res?.notAvailable) {
      setIsDialogOpen(true)
    } else if (res?.noEnoughQuantity) {
      toast({
        title: 'Insufficient Quantity!',
        description:
          'The requested quantity for this product is currently unavailable. Please reduce the quantity or explore similar items. Thank you for understanding!'
      })
    } else if (res?.outOfStock) {
      toast({
        title: 'Out of stock!',
        description:
          'The requested product is currently out of stock. Please explore similar items or check back later for availability updates!'
      })
    } else {
      toast({
        title: 'Product Added to Cart',
        description:
          'Great! The product has been successfully added to your cart'
      })
    }
    setIsAdding(false)
  }

  const handleTrackAddToCart = () => {
    trackProductAddedToCart({
      productName: product?.title,
      productSku: product?.sku,
      userId: session?.user?.id ?? '',
      category: (product?.collections ?? [])
        ?.map((p: any) => p.name)
        .join(', '),
      price: product?.finalPrice,
      quantity: 1
    })
  }

  const handleTrackRemoveFromCart = () => {
    trackProductRemovedFromCart({
      productName: product?.title,
      productSku: product?.sku,
      userId: session?.user?.id ?? '',
      quantity: 1,
      category: (product?.collections ?? [])?.map((p: any) => p.name).join(', ')
    })
  }

  return (
    <Card
      onClick={() => router.push(`/products/${product?.seo?.url}`)}
      className={`h-full w-full cursor-pointer overflow-hidden rounded-xl shadow-md duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
      <CardContent className='relative flex h-full w-full flex-col justify-between rounded-3xl p-0'>
        <div className='relative h-6'>
          {product?.discount > 0 && (
            <div className='absolute left-2 top-2 z-10 flex'>
              <div className='flex items-center rounded-full bg-gradient-to-b from-[#AF004F] to-[#E30067] px-3 py-1 text-[10px] text-white'>
                {product?.discountType === 'flat'
                  ? `Flat ₹${Math.round(product?.discount)}`
                  : `${Math.round(product?.discount)}%`}{' '}
                {commonTranslation('off')}
              </div>
            </div>
          )}
        </div>
        <div className='relative h-40 w-full'>
          <Image
            src={product?.thumbnail}
            alt={product?.title}
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className='mt-2 w-full space-y-2 p-2'>
          <div className={'space-y-1'}>
            <p className='line-clamp-2 text-sm font-medium'>
              <TranslationHandler
                word={product?.title}
                translations={product?.translations?.title}
              />
            </p>
            <p className='line-clamp-2 text-xs text-label'>
              <TranslationHandler
                word={product?.description}
                translations={product?.translations?.description}
              />
            </p>
          </div>
          <div className='flex items-center gap-1'>
            <div className='flex items-center text-sm font-semibold'>
              <IndianRupee size={18} />
              {Number(product?.finalPrice).toFixed(2)}
            </div>

            {product?.finalPrice !== product?.maximumRetailPrice && (
              <div className='flex items-center justify-between'>
                <span className='flex items-center text-sm text-label line-through'>
                  <IndianRupee size={12} />
                  {Number(product?.maximumRetailPrice).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {/* <div className='flex items-center justify-start gap-0.5 rounded-md px-2 py-1 text-xs font-semibold text-primary-teal'>
            <span className='flex items-center gap-1'>
              <IndianRupee size={14} />
              {Number(product?.maximumRetailPrice).toFixed(2)}
              <p className='truncate'>with</p>
            </span>
            <div className='relative ml-1 h-6 w-10'>
              <img
                src='/images/membership/DavaONELogo.svg'
                alt='crown'
                className=''
              />
            </div>
          </div> */}
          {cartProducts?.some(p => p._id === product._id) ? (
            // Show quantity controls if the product is in the cart
            <div className='flex w-full items-center rounded-md border border-primary dark:border-gray-600'>
              <Button
                variant='outline'
                size='icon'
                className='w-full border-none'
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()

                  if (getProductCartQuantity() == 1) {
                    removeProduct(product?._id)
                    handleTrackRemoveFromCart()
                  } else {
                    addOrUpdateProduct({
                      ...product,
                      quantity: -1
                    })
                  }
                }}
              >
                <MinusIcon size={16} className='text-primary' />
              </Button>
              <span className='flex w-full items-center justify-center border-x border-primary px-3 text-xs font-bold text-primary dark:border-slate-400'>
                {cartProducts.find(p => p._id === product._id)?.quantity || 1}
              </span>
              <Button
                variant='outline'
                size='icon'
                className='w-full border-none'
                onClick={async e => {
                  e.preventDefault()
                  e.stopPropagation()
                  await handleAddQuantity(product)
                  handleTrackAddToCart()
                }}
              >
                <PlusIcon size={16} className='text-primary' />
              </Button>
            </div>
          ) : (
            <div
              className='group flex cursor-pointer items-center justify-center gap-0.5 rounded-md border border-primary py-0.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white'
              onClick={async e => {
                e.preventDefault()
                e.stopPropagation()

                await handleAddToCart()
                handleTrackAddToCart()
              }}
            >
              <span className='hidden group-hover:block'>{cartIconWhite}</span>
              <span className='block group-hover:hidden'>{cartIconOrange}</span>
              {productTranslation('add_to_cart')}
            </div>
          )}
        </div>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className='sm:max-w-[700px]'
          onClick={(e: any) => e.stopPropagation()}
        >
          <DialogTitle className='text-white'>Edit profile</DialogTitle>
          <div className='flex flex-col items-center gap-4'>
            {AddressNotDeliverableIcon}
            <span className='text-sm font-semibold'>
              Sorry, we are not delivering to this pincode yet, but we will be
              available soon
            </span>
          </div>
          <DialogFooter>
            <Button
              onClick={(e: any) => {
                e.preventDefault()
                setIsDialogOpen(false)
              }}
              className='mx-auto w-24'
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
