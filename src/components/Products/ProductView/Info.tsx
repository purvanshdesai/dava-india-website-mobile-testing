'use client'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2Icon,
  IndianRupeeIcon,
  PlusIcon,
  MinusIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTransitionRouter } from 'next-view-transitions'
import { useToast } from '@/hooks/use-toast'
import useProductViewStore from '@/store/useProductViewStore'
import { Input } from '@/components/ui/input'
import useDeliveryAddressStore from '@/store/useDeliveryAddressStore'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { fetchLocationByZipCode } from '@/utils/actions/zipCodeActions'
import { AddressNotDeliverableIcon, cartIcon } from '@/components/utils/icons'
import { ProductVariation } from '../../../../types/storeTypes'
import TranslationHandler from '@/components/utils/TranslationHandler'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import {
  trackProductAddedToCart,
  trackProductRemovedFromCart
} from '@/analytics/trackers/productTracker'
import MedicineReminder from './MedicineReminder'

// import InnerDavaCard from './InnerDavaCard'

interface ProductInfo {
  product: any
}

const productInfo = [
  {
    title: 'Compositions',
    image: 'composition.svg',
    value: 'compositions',
    show: true
  },
  {
    title: 'Expires on or after',
    image: 'expiry.svg',
    value: 'expiryDate',
    show: true
  },
  {
    title: 'Consumptions',
    image: 'Consumption.svg',
    value: 'consumption',
    show: true
  },
  // {
  //   title: 'Manufacturer',
  //   image: 'manufacturer.svg',
  //   value: 'manufacturer',
  //   show: true
  // },
  // {
  //   title: 'Marketer',
  //   image: 'marketer.svg',
  //   value: 'marketer',
  //   show: true
  // },
  {
    title: 'Country of origin',
    image: 'globe.svg',
    value: 'country',
    show: true
  }
]

export default function ProductInfo({ product }: ProductInfo) {
  const router = useTransitionRouter()
  const productTranslation = useTranslations('Product')
  const cart = useTranslations('Cart')
  const { data: session } = useSession()
  const isAuthenticated = session?.user || false

  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // const membershipFeatures = [
  //   'Free Delivery',
  //   'Dava Coins',
  //   'Exclusive Deals',
  //   'Discounts',
  //   'Premium Support',
  //   'Consultation'
  // ]

  // Stores

  // Show current product variation from store
  const productVariation: ProductVariation | any = useProductViewStore(
    state => state.variation
  )

  const isProductNotAvailable =
    productVariation?.outOfStock || productVariation?.notDeliverable

  const productVariations: ProductVariation[] | any = useProductViewStore(
    state => state.variations
  )

  const setCurrentProductVariation: ProductVariation | any =
    useProductViewStore(state => state.setCurrentProductVariation)

  const {
    addOrUpdateProduct,
    buyNow: buyProduct,
    currentLocation,
    deliveryPolicy,
    setCurrentLocation,
    products: cartProducts,
    removeProduct
  } = useCheckoutStore(state => state)

  const [pinCode, setPinCode] = useState<any>(currentLocation?.zipCode)
  const [isZipCodeNotExist, setZipCodeNotExistStatus] = useState(false)

  const { selectedAddress } = useCheckoutStore(state => state)

  const fetchAddresses = useDeliveryAddressStore(state => state.fetchAddresses)

  // Hooks Management ---------------------------------
  const [quantity, setQuantity] = useState(1)

  const [isInvalidVariationSelected, setInvalidVariationStatus] =
    useState(false)

  const [variationCategories] = useState(product?.variationCategories ?? [])
  const [variationCategoryValues] = useState(
    product?.variationCategoryValues ?? {}
  )

  // Initial Mapping for product view when loads
  const initialVariationMapping = variationCategories.reduce(
    (acc: any, v: string) => {
      const variations = variationCategoryValues[v] ?? []
      acc[v] = variations.length ? variations[0] : ''

      return acc
    },
    {}
  )

  const [variationMapping, setVariationMapping] = useState(
    initialVariationMapping
  )

  useEffect(() => {
    findProductVariation()
  }, [variationMapping])

  useEffect(() => {
    const fetchNewLocation = async () => {
      const res = await fetchLocationByZipCode(pinCode)
      if (!res.location) setZipCodeNotExistStatus(true)
      else {
        // setCurrentLocation(res)
        setZipCodeNotExistStatus(false)
      }
    }

    if (pinCode?.length == 6 && pinCode !== currentLocation?.zipCode)
      fetchNewLocation()
  }, [pinCode])

  const handleApply = async () => {
    if (pinCode?.length === 6 && !isZipCodeNotExist) {
      const res = await fetchLocationByZipCode(pinCode)
      if (res.location) {
        setCurrentLocation(res)
        setZipCodeNotExistStatus(false)
      } else {
        setZipCodeNotExistStatus(true)
      }
    }
  }

  // -----------------------------------------------

  const handleAddToCart = async () => {
    if (isAdding) return

    setIsAdding(true)
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const res: any = await addOrUpdateProduct({
      ...productVariation,
      quantity,
      addressId: selectedAddress?._id
    })

    if (res?.qtyLimitReached) {
      toast({
        title: 'Quantity Limit Reached!',
        description: 'You can add upto 10 quantity per product'
      })

      return
    }

    handleTrackAddToCart(quantity)

    showProductStatusMessage(res)
    setIsAdding(false)
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const res: any = await buyProduct({ ...productVariation, quantity })

    if (res?.notAvailable || res?.noEnoughQuantity) {
      showProductStatusMessage(res)
      return
    }

    fetchAddresses()

    router.push('/checkout/confirmation')
  }
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
    } else if (resp?.outOfStock) {
      toast({
        title: 'Out of stock!',
        description:
          'The requested product is currently out of stock. Please explore similar items or check back later for availability updates!'
      })
    }
    setIsAdding(false)
  }

  const showProductStatusMessage = (res: any) => {
    if (res?.notAvailable) {
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
  }

  const getProductCartQuantity = (product: any) => {
    const productInCart = cartProducts?.find(p => p._id === product?._id)
    return productInCart ? productInCart.quantity : 0
  }

  const handleVariationChange = (category: string, value: string) => {
    setVariationMapping((state: any) => {
      return { ...state, [category]: value }
    })
  }

  const findProductVariation = () => {
    // Function to compare variations
    const isMatchingVariation = (
      productVariation: any,
      searchVariation: any
    ) => {
      return Object.keys(searchVariation).every(
        (key: string) => productVariation[key] === searchVariation[key]
      )
    }

    // Find the product with the matching variation
    const foundVariation = productVariations?.find(
      (pVariation: ProductVariation) =>
        isMatchingVariation(pVariation.variation, variationMapping)
    )

    if (!foundVariation) {
      setInvalidVariationStatus(true)
      return
    }

    setInvalidVariationStatus(false)
    setCurrentProductVariation(foundVariation)
  }
  const calculateDiscount = (
    originalPrice: number,
    discountedPrice: number
  ) => {
    if (!originalPrice || !discountedPrice) return 0
    return ((originalPrice - discountedPrice) / originalPrice) * 100
  }

  const handleTrackAddToCart = (quantity = 1) => {
    trackProductAddedToCart({
      productName: productVariation?.title,
      productSku: productVariation?.sku,
      userId: session?.user?.id ?? '',
      category: (product?.collections ?? [])
        ?.map((p: any) => p.name)
        .join(', '),
      price: productVariation?.finalPrice,
      quantity
    })
  }

  const handleTrackRemoveFromCart = () => {
    trackProductRemovedFromCart({
      productName: productVariation?.title,
      productSku: productVariation?.sku,
      userId: session?.user?.id ?? '',
      quantity: 1,
      category: (productVariation?.collections ?? [])
        ?.map((p: any) => p.name)
        .join(', ')
    })
  }

  const discountPercentage = calculateDiscount(
    productVariation?.maximumRetailPrice,
    productVariation?.finalPrice
  )
  return (
    <div>
      <div className='space-y-4'>
        <h1 className='text-base font-semibold'>
          <TranslationHandler
            word={productVariation?.title}
            translations={productVariation?.translations?.title}
          />
        </h1>
        <p className='line-clamp-1 text-xs leading-4 text-label'>
          <TranslationHandler
            word={productVariation?.description}
            translations={productVariation?.translations?.description}
          />
        </p>

        <div className='flex items-center gap-4'>
          {productVariation?.prescriptionReq ? (
            <Badge
              className='hover:bg-transperant bg-red-400 bg-opacity-10 text-xs font-semibold text-primary dark:bg-red-300 dark:text-red-600'
              // variant={'outline'}
            >
              {productTranslation('prescription_needed')}
            </Badge>
          ) : null}

          {isProductNotAvailable ? (
            <div>
              <span className='flex items-center gap-1 text-sm font-semibold text-red-600'>
                {productVariation.outOfStock
                  ? productTranslation('out_of_stock')
                  : productTranslation(
                      'product_not_deliverable_to_this_location'
                    )}
              </span>
              {productVariation?.outOfStock && isAuthenticated && (
                <MedicineReminder
                  productId={productVariation._id}
                  productTitle={productVariation.title}
                  isOutOfStock={productVariation.outOfStock}
                />
              )}
            </div>
          ) : (
            <span className='flex items-center gap-1 text-sm'>
              <CheckCircle2Icon size={20} className='text-primary-green' />
              {productTranslation('in_stock')}
            </span>
          )}
        </div>

        <div className='grid grid-cols-2 gap-6 py-6'>
          {productInfo?.map((info, idx) => {
            if (!info.show) return <></>
            if (
              (info.value === 'consumption' &&
                !productVariation[info.value]?.label) ||
              productVariation[info.value]?.label == 'None'
            ) {
              return null
            }
            const gridClass =
              idx === 0 || idx === productInfo.length - 1 ? 'col-span-2' : ''

            return (
              <div key={idx} className={`flex items-center gap-4 ${gridClass}`}>
                <div
                  className='relative flex-shrink-0'
                  style={{
                    // position: 'relative',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <Image
                    src={`/images/ProductDescription/${info.image}`}
                    alt={info?.title}
                    fill
                    priority={true}
                  />
                </div>
                <div className='space-y-1'>
                  <p className='break-words text-sm font-semibold text-label'>
                    {info.title}
                    {/* <TranslationHandler
                      word={info?.title}
                      translations={info?.translations?.title}
                    /> */}
                  </p>
                  <p className='text-sm font-semibold'>
                    {['manufacturer', 'marketer'].includes(info.value)
                      ? 'Davaindia'
                      : info.value === 'country'
                        ? 'India'
                        : info.value === 'expiryDate'
                          ? productVariation[info.value]
                            ? dayjs(productVariation[info.value]).format(
                                process.env.DATE_FORMAT
                              )
                            : '--'
                          : info.value === 'consumption'
                            ? productVariation[info.value]?.label
                            : productVariation[info.value]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className='rounded-md border p-5'>
          <div className='mb-2 space-y-1'>
            <div className='flex items-center gap-4'>
              <span className='flex items-center text-base font-semibold'>
                <IndianRupeeIcon size={20} />{' '}
                {Number(productVariation?.finalPrice).toFixed(2)}
              </span>
              {productVariation?.finalPrice !==
                productVariation?.maximumRetailPrice && (
                <span className='flex items-center text-sm text-label line-through'>
                  <IndianRupeeIcon size={18} />{' '}
                  {Number(productVariation?.maximumRetailPrice).toFixed(2)}
                </span>
              )}
              <span>
                {discountPercentage !== 0 && (
                  <div
                    className='rounded-md bg-gradient-to-b px-1 py-0.5 text-xs font-semibold text-primary-teal'
                    // style={{
                    //   background: 'linear-gradient(to bottom, #2DA771,#2A8D61)'
                    // }}
                  >
                    {Math.round(discountPercentage)}% OFF
                  </div>
                )}
              </span>
            </div>
            <p className='text-sm text-label'>
              {productTranslation('inclusive_of_all_taxes')}
            </p>
            <p className='text-xs text-label'>
              {productTranslation('return_desc')}
              <span
                className='cursor-pointer px-1 font-medium text-primary'
                onClick={() => router.push('/terms-and-conditions')}
              >
                {productTranslation('return_policy')}
              </span>
            </p>
          </div>
          {/* <div className='mb-2 flex items-center gap-1 rounded-md text-sm text-primary-teal'>
            <span className='flex items-center gap-1 font-semibold'>
              <IndianRupee size={14} />
              {Number(productVariation?.maximumRetailPrice).toFixed(2)}
            </span>
            with
            <div className='relative mb-1 h-6 w-10'>
              <Image
                src={'/images/membership/DavaONELogo.svg'}
                alt='Membership crown'
                className=''
                fill
              />
            </div>
          </div> */}
          {/* Quantity */}
          {!isProductNotAvailable &&
            !cartProducts?.some(p => p._id === product._id) && (
              <div className='py-3'>
                <p className='pb-3 text-sm font-semibold'>
                  {productTranslation('quantity')}
                </p>
                <div className='flex w-1/2 items-center'>
                  <div className='flex w-full items-center justify-evenly rounded-md border border-primary'>
                    <Button
                      className='py-2 text-primary'
                      size={'icon'}
                      variant={'ghost'}
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      <MinusIcon size={20} />
                    </Button>

                    <span className='border-x border-primary px-6 py-2 font-medium'>
                      {quantity}
                    </span>
                    <Button
                      className='py-2 text-primary'
                      size={'icon'}
                      variant={'ghost'}
                      onClick={() => {
                        if (quantity < 10) setQuantity(quantity + 1)
                        else {
                          toast({
                            title: 'Quantity Limit Reached!',
                            description:
                              'You can add upto 10 quantity per product'
                          })
                        }
                      }}
                    >
                      <PlusIcon size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Variation Settings */}

        {variationCategories?.length > 0 && (
          <div className='pb-6'>
            <div className='flex flex-col gap-6'>
              {variationCategories?.map((c: string, idx: number) => {
                return (
                  <div key={idx}>
                    <div className='flex items-center gap-3 text-sm font-semibold'>
                      <h1 className='text-label dark:text-label-dark'>{c}:</h1>
                      <span>{variationMapping[c]}</span>
                    </div>

                    <div className='flex items-center gap-3 pt-3'>
                      {variationCategoryValues[c]?.map((v: string) => {
                        return (
                          <Badge
                            key={v}
                            onClick={() => handleVariationChange(c, v)}
                            className={`cursor-pointer border border-gray-300 py-1 text-sm font-medium text-default hover:bg-primary-green-dim ${variationMapping[c] === v ? 'bg-primary-green-dim font-semibold text-primary-green' : 'bg-gray-100'}`}
                          >
                            {v}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isInvalidVariationSelected ? (
          <div className='pb-10 font-semibold text-red-400'>
            {productTranslation('product-unavailable_categories')}
          </div>
        ) : (
          <div>
            {!isProductNotAvailable && (
              <div className='flex flex-col items-center gap-6'>
                {!cartProducts?.some(p => p._id === product._id) && (
                  <Button className='w-full' onClick={() => handleBuyNow()}>
                    {productTranslation('buy_now')}
                  </Button>
                )}
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

                        if (getProductCartQuantity(product) == 1) {
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
                    <span className='flex w-full items-center justify-center border-x border-primary px-3 text-sm font-bold text-primary dark:border-slate-400'>
                      {cartProducts.find(p => p._id === product._id)
                        ?.quantity || 1}
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
                  <Button
                    className='flex w-full items-center gap-1'
                    variant={'outline'}
                    onClick={async () => {
                      await handleAddToCart()
                    }}
                  >
                    <span>{cartIcon}</span>
                    {productTranslation('add_to_cart')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* {!isProductNotAvailable && ( */}
        <div className='pt-6'>
          <div className='flex w-full flex-col items-start rounded-md bg-gray-50 p-3'>
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-2 text-sm font-semibold'>
                {productTranslation('order_is_delivering_to')}
                <div className='flex items-center gap-3'>
                  <div className='w-50 relative'>
                    <Input
                      className='appearance-none pl-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      type='number'
                      placeholder='Pincode'
                      value={pinCode}
                      onChange={event => setPinCode(event.target.value)}
                    />
                    <div
                      className='absolute left-2 top-2.5'
                      style={{
                        width: '20px',
                        height: '20px'
                      }}
                    >
                      <Image
                        src={`/images/pinRound.svg`}
                        alt='Pin'
                        fill
                        priority={false}
                      />
                    </div>
                    <div
                      className='absolute right-2.5 top-[9px] cursor-pointer font-semibold text-primary'
                      onClick={handleApply}
                    >
                      {cart('apply_button')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-3'>
              <div>
                {isZipCodeNotExist ? (
                  <p className='text-xs font-medium italic text-red-600'>
                    {productTranslation('pincode_not_available')}
                  </p>
                ) : (
                  <p className='text-xs italic text-label'>
                    {currentLocation?.area}, {currentLocation?.district}
                  </p>
                )}
              </div>
              {currentLocation?.isDeliverable ? (
                <span className='pt-3 text-sm text-gray-800'>
                  <span className='text-gray-500'>
                    {productTranslation('expected_delivery_date')}:
                  </span>

                  {deliveryPolicy?.deliveryEstimation ? (
                    dayjs(deliveryPolicy?.deliveryEstimation).format(
                      'DD MMM YYYY HH:mm A'
                    )
                  ) : (
                    <div className='flex items-center gap-2'>
                      {cart('not_available_for_this_location	')}
                    </div>
                  )}
                </span>
              ) : (
                <span className={'text-sm'}>
                  Sorry, we are not delivering here at the moment. We will
                  deliver soon.
                </span>
              )}
            </div>
          </div>
        </div>
        {/* <div className='py-6'>
          <div className='flex w-full items-center justify-center rounded-md bg-[#283C43] p-5'>
            <div className='flex flex-col items-center justify-center text-white'>
              <div className='flex items-center gap-3'>
                <div
                  style={{
                    position: 'relative',
                    width: '25px',
                    height: '25px'
                  }}
                >
                  <Image
                    src={`/images/membership/Crown.svg`}
                    alt='Footer Logo'
                    fill
                    priority={false}
                  />
                </div>
                <p className='text-sm font-semibold'>DavaONE Membership1</p>
              </div>
              <div
                style={{
                  position: 'relative',
                  width: '154px',
                  height: '117px',
                  margin: '25px 0'
                }}
              >
                <Image
                  src={'/images/membership/BillBoard.svg'}
                  alt='Membership billboard'
                  fill
                  objectFit='contain'
                />
                <div className='absolute left-12 top-9 text-sm text-white'>
                  <p>Starting from</p>
                  <strong>₹&#8201;99</strong>
                  <p>for 3 months</p>
                </div>
              </div>
              <div className='grid items-center justify-center pt-3'>
                <div className='grid grid-cols-2 gap-4'>
                  {membershipFeatures.map((f, idx) => {
                    return (
                      <div
                        className='flex items-center gap-2 text-sm font-medium'
                        key={idx}
                      >
                        <CircleIcon
                          size={10}
                          className='rounded-full bg-primary-green-dim'
                        />
                        {f}
                      </div>
                    )
                  })}
                </div>

                <div className='mb-2 mt-6 flex items-center justify-end gap-2'>
                  <div className='flex items-center gap-3 text-xs font-medium text-white'>
                    {membership('explore_button')}
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      width: '16px',
                      height: '16px'
                    }}
                  >
                    <Image
                      src={'/images/Play.svg'}
                      alt=''
                      fill
                      priority={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        {/* <InnerDavaCard /> */}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[700px]'>
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
              onClick={() => {
                setIsDialogOpen(false)
              }}
              className='mx-auto w-24'
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
