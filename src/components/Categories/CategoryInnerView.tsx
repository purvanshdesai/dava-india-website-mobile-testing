'use client'
import {
  AddressNotDeliverableIcon,
  cartIconOrange,
  cartIconWhite
} from '@/components/utils/icons'
import { toast } from '@/hooks/use-toast'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useFetchCollection } from '@/utils/hooks/categoryHooks'
import { useFetchProducts } from '@/utils/hooks/productHooks'
import {
  ArrowLeft,
  IndianRupee,
  MinusIcon,
  PlusIcon,
  Search,
  ShoppingCart
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MobileCategoryInnerLoader from '../Loader/CategoryInnerLoader'
import TranslationHandler from '@/components/utils/TranslationHandler'
import SortFilterDrawer from '../SortFilterDrawer'
import useCategoriesFilterStore from '@/store/useCategoriesFilterStore'
import FilterDrawer from '../FilterDrawer'
import { useTranslations } from 'next-intl'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '../ui/dialog'
import { trackCategoryBrowsed } from '@/analytics/trackers/appEventTracker'

export default function CategoryInnerView() {
  const productTranslation = useTranslations('Product')
  const commonTranslation = useTranslations('Common')
  const { slug }: { slug: string[] } = useParams()
  const router = useRouter()
  const { data } = useSession()
  const isAuthenticated = data?.user || false
  const [openSortDrawer, setSortDrawer] = useState<any>(false)
  const { price, discount } = useCategoriesFilterStore()
  const totalProducts = useCheckoutStore(state => state.totalProducts)

  const { data: category } = useFetchCollection((slug && slug[1]) ?? '')
  const [selectedSortOrder, setSelectedSortOrder] = useState<any>()
  const [slugUrl, setSlugUrl] = useState('') as any
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const hasTracked = useRef(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (slug.length > 1 && !slugUrl) setSlugUrl(slug[1])
  }, [slug])

  const getSlugUrls = () => {
    return slugUrl?.length > 0 ? [...slug, slugUrl] : slug
  }
  const {
    data: products,
    isLoading,
    isError
  } = useFetchProducts({
    categorySlug: getSlugUrls(),
    filter: {
      price: {
        from: 0,
        to: Number(price)
      },
      discount: {
        from: 0,
        to: Number(discount)
      },
      sortBy: selectedSortOrder
    }
  }) as any

  useEffect(() => {
    if (hasTracked.current) return

    trackCategoryBrowsed({
      userId: data?.user?.id ?? '',
      categoryName: getSlugUrls()?.join(', ')
    })

    hasTracked.current = false
  }, [])

  const {
    addOrUpdateProduct,
    products: cartProducts,
    removeProduct
  } = useCheckoutStore(state => state)
  const handleSortDrawer = () => {
    setSortDrawer(true)
  }

  const handleAddToCart = async (product: any) => {
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

  const getProductCartQuantity = (product: any) => {
    const productInCart = cartProducts?.find(p => p._id === product?._id)
    return productInCart ? productInCart.quantity : 0
  }
  if (isError) {
    return <div>Something went wrong</div>
  }

  if (
    products?.data &&
    !products.data.length &&
    category?.every((item: any) => typeof item === 'string')
  ) {
    return (
      <div>
        <div className='sticky top-0 z-50 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-2'>
          <div className='flex flex-row items-center justify-center'>
            <div
              className='rounded-full bg-[#F4F4F4] p-2'
              onClick={() => router.back()}
            >
              <ArrowLeft color='#3C3C3C' size={20} />
            </div>
            <p className='ml-2 text-sm font-semibold'>Categories</p>
          </div>

          <div className='flex flex-row items-center justify-center gap-2'>
            <div
              className='mr-1 rounded-full bg-[#F4F4F4] p-2'
              onClick={() => router.push('/checkout/cart')}
            >
              <div className='relative'>
                <ShoppingCart color='#3C3C3C' size={20} />
                {totalProducts > 0 && (
                  <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-xs text-white'>
                    {totalProducts}
                  </span>
                )}
              </div>
            </div>
            <div
              className='rounded-full bg-[#F4F4F4] p-2'
              onClick={() => router.push('/search')}
            >
              <Search color='#3C3C3C' size={20} />
            </div>
          </div>
        </div>
        <div className='flex h-[500px] items-center justify-center'>
          <div className='flex flex-col items-center gap-6'>
            <div
              style={{
                position: 'relative',
                width: '150px',
                height: '150px'
              }}
            >
              <Image
                src={`/images/EmptyProducts.svg`}
                alt='Empty Products'
                fill
                priority={false}
              />
            </div>

            <p className='text-center text-sm font-semibold'>
              {productTranslation('product-unavailable_now')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative'>
      <div className='sticky top-0 z-50 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 text-sm font-semibold capitalize'>
            {slugUrl
              ? slugUrl?.replace('-', ' ')
              : slug?.join(' ').replaceAll('-', ' ')}
          </p>
        </div>

        <div className='flex flex-row items-center justify-center gap-2'>
          <div
            className='mr-1 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/checkout/cart')}
          >
            <div className='relative'>
              <ShoppingCart color='#3C3C3C' size={20} />
              {totalProducts > 0 && (
                <span className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-xs text-white'>
                  {totalProducts}
                </span>
              )}
            </div>
          </div>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/search')}
          >
            <Search color='#3C3C3C' size={20} />
          </div>
        </div>
      </div>
      <div className='mb-10 flex'>
        {category &&
        category?.length > 0 &&
        category?.every(
          (item: any) =>
            typeof item === 'object' && item !== null && !Array.isArray(item)
        ) ? (
          <div
            className='w-4/12 overflow-y-auto'
            style={{ height: 'calc(100vh - 60px)' }}
          >
            {category &&
              category?.map((category: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSlugUrl(category?.collection?.slugUrl)}
                  className={`flex cursor-pointer flex-col items-center gap-2 p-4 text-xs font-semibold ${
                    slugUrl === category?.collection?.slugUrl
                      ? 'border-r-4 border-orange-500 bg-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '40px',
                      height: '40px'
                    }}
                  >
                    <Image
                      src={category?.collection?.image}
                      alt={category?.collection?.name || 'Category'}
                      fill
                    />
                  </div>

                  <TranslationHandler
                    word={category?.collection?.name}
                    translations={category?.collection?.translations?.name}
                  />
                </div>
              ))}
          </div>
        ) : null}

        {/* Product List */}
        {isLoading ? (
          <MobileCategoryInnerLoader />
        ) : (
          <div
            style={{ height: 'calc(100vh - 60px)' }}
            className='flex w-full flex-col overflow-y-auto'
          >
            <div className='flex flex-row items-center justify-center bg-white p-3'>
              <div
                className='mr-3 flex h-[40px] w-[106px] items-center justify-between rounded-full border border-label bg-white pl-3 pr-3'
                onClick={handleSortDrawer}
              >
                {selectedSortOrder && (
                  <div className='h-2 w-2 rounded-full border-black bg-orange-600' />
                )}
                <p className=''>{commonTranslation('sort_by')}</p>
                <div className='relative ml-1 h-4 w-4'>
                  <Image
                    src={'/images/drowdown-arrow.svg'}
                    alt='Dropdown Arrow'
                    fill
                    objectFit='contain'
                  />
                </div>
              </div>
              <div className='flex h-[40px] w-[106px] items-center rounded-full border border-label bg-white pl-3 pr-3'>
                <Drawer>
                  <DrawerTrigger>
                    <div className='flex flex-row items-center justify-between'>
                      {discount?.length > 0 ||
                        (price?.length > 0 && (
                          <div className='mr-2 h-2 w-2 rounded-full border-black bg-orange-600' />
                        ))}
                      <p
                        // onClick={() => router.push(`${categoryId}/filter`)}
                        className='mr-3'
                      >
                        {commonTranslation('filter')}{' '}
                      </p>
                      <div className='relative ml-1 h-4 w-4'>
                        <Image
                          src={'/images/drowdown-arrow.svg'}
                          alt='Dropdown Arrow'
                          fill
                          objectFit='contain'
                        />
                      </div>
                    </div>
                  </DrawerTrigger>
                  <DrawerContent className='h-3/4 bg-[#eff1f5] p-0'>
                    <DrawerHeader>
                      <DrawerTitle className='flex items-center justify-start'>
                        {commonTranslation('apply_filters')}
                      </DrawerTitle>
                    </DrawerHeader>
                    <FilterDrawer />

                    <DrawerFooter></DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>

            {products?.data &&
              products?.data?.map((product: any) => (
                <div
                  onClick={() => router.push(`/products/${product?.seo?.url}`)}
                  key={product._id}
                  className='mb-0.5 flex gap-4 bg-white p-4 shadow'
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '65px',
                      height: '65px'
                    }}
                  >
                    <Image
                      src={product?.thumbnail}
                      alt=''
                      fill
                      style={{ objectFit: 'contain' }}
                      priority={false}
                    />
                  </div>

                  <div className='flex-1'>
                    {/* {product.prescriptionReq && (
                      <span className='mb-2 inline-block rounded bg-red-100 px-2 py-1 text-xs text-primary'>
                        Prescription needed
                      </span>
                    )} */}
                    <h4 className='line-clamp-2 text-sm font-medium'>
                      <TranslationHandler
                        word={product?.title}
                        translations={product?.translations?.title}
                      />
                    </h4>
                    <p className='line-clamp-2 text-xs font-medium text-gray-800'>
                      <TranslationHandler
                        word={
                          product?.description.length > 20
                            ? product?.description.slice(0, 30) + '...'
                            : product?.description
                        }
                        translations={product?.translations?.description}
                      />
                    </p>
                    <div className='flex flex-col gap-1 text-gray-600'>
                      <div className='flex flex-col gap-1'>
                        <span className='flex items-center gap-1 text-xs font-semibold text-gray-800'>
                          <IndianRupee size={16} />
                          {Number(product.finalPrice).toFixed(2)}
                        </span>
                        <span className='flex flex-row'>
                          {product?.finalPrice !==
                            product?.maximumRetailPrice && (
                            <span className='mr-2 flex items-center gap-1 text-xs text-gray-400 line-through'>
                              MRP <IndianRupee size={16} />
                              <span className=''>
                                {Number(product.unitPrice).toFixed(2)}
                              </span>
                            </span>
                          )}
                          {product?.discount > 0 && (
                            <div className='flex'>
                              <div className='flex items-center rounded-full bg-gradient-to-b from-[#AF004F] to-[#E30067] px-3 py-1 text-[10px] text-white'>
                                {product?.discountType === 'flat'
                                  ? `Flat ₹${Math.round(product?.discount)}`
                                  : `${Math.round(product?.discount)}%`}{' '}
                                {commonTranslation('off')}
                              </div>
                            </div>
                          )}
                        </span>
                        {/* <div className='mb-1 flex items-center justify-center gap-0.5 rounded-md bg-primary-green px-2 py-0.5 text-xs font-semibold text-white'>
                          <img
                            src='/images/Home/DavaMembership/crown.svg'
                            alt='crown'
                            className='mr-1 h-5 w-5'
                          />
                          <IndianRupee size={14} />
                          {Number(product?.maximumRetailPrice).toFixed(2)}
                          <p className='truncate'>&nbsp;&nbsp;DavaONE</p>
                        </div> */}
                        {/* <div className='flex items-center justify-start gap-0.5 rounded-md text-xs font-semibold text-primary-teal'>
                          <span className='flex items-center gap-1'>
                            <IndianRupee size={14} />
                            {Number(product?.maximumRetailPrice).toFixed(2)}
                            <p className='truncate'>{ commonTranslation('with') }</p>
                          </span>
                          <div className='relative ml-1 h-6 w-10'>
                            <img
                              src='/images/membership/DavaONELogo.svg'
                              alt='crown'
                              className=''
                            />
                          </div>
                        </div> */}
                      </div>
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
                            }}
                          >
                            <PlusIcon size={16} className='text-primary' />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className='group flex cursor-pointer items-center justify-center gap-0.5 rounded-md border border-primary text-xs font-semibold text-primary hover:bg-primary hover:text-white'
                          onClick={async e => {
                            e.preventDefault()
                            e.stopPropagation()

                            await handleAddToCart(product)
                          }}
                        >
                          <span className='hidden group-hover:block'>
                            {cartIconWhite}
                          </span>
                          <span className='block group-hover:hidden'>
                            {cartIconOrange}
                          </span>
                          {productTranslation('add_to_cart')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {openSortDrawer && (
        <SortFilterDrawer
          closeDrawer={() => setSortDrawer(false)}
          selectedSort={(item: any) => {
            setSelectedSortOrder(item)
            setSortDrawer(false)
          }}
          selectValue={selectedSortOrder}
        />
      )}

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
