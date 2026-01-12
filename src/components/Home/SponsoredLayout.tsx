'use client'
import React, { FC, useMemo, Suspense } from 'react'

import { useFetchSponsoredSettings } from '@/utils/hooks/sponsoredHooks'

// Loaders (kept eagerly so Suspense fallback shows quickly)
import MobileProductLoader from '../Loader/ProductsLoader'
import MobileHomeCategoriesLoader from '../Loader/HomeCategoriesLoader'
import MobileCarouselLoader from '../Loader/CarouselLoader'
import MobileFullBannerLoader from '../Loader/FullBannerLoader'
import MobileAppBar from '../AppBar'
import MobileNavBar from '../NavBar'

// Lazy-loaded layout components (on-demand)
const MobileProductsLayout = React.lazy(
  () => import('./SponsoredLayouts/Products')
)
const MobileCategoriesLayout = React.lazy(
  () => import('./SponsoredLayouts/Categories')
)
const MobileQuickActions = React.lazy(() => import('./QuickActions'))
const MobileDavaMembership = React.lazy(() => import('./DavaMembership'))
const MobileGenericAbout = React.lazy(() => import('./GenericAbout'))
const MiniCarousel = React.lazy(() => import('./SponsoredLayouts/MiniBanner'))
const CarouselLayout = React.lazy(() => import('./SponsoredLayouts/Carousel'))
const FullBanner = React.lazy(() => import('./SponsoredLayouts/FullBanner'))
const BuyAgainProducts = React.lazy(
  () => import('./SponsoredLayouts/BuyAgainProducts')
)

interface LayoutItem {
  name?: string
  type?: string
  section?: React.ComponentType<any> | (() => JSX.Element) | JSX.Element
  [key: string]: any
}

interface Props {
  isForCampaign?: boolean
}

const keyFor = (layout: LayoutItem | undefined, idx: number, suffix = '') =>
  `${layout?.type ?? layout?.name ?? 'layout'}-${idx}${suffix ? `-${suffix}` : ''}`

// Map layout types to lazy components
const componentMap: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  carousel: CarouselLayout,
  'carousel-mini': MiniCarousel,
  image: FullBanner,
  'featured-products': MobileProductsLayout,
  'featured-categories': MobileCategoriesLayout,
  'davaone-membership': MobileDavaMembership,
  'generic-medicine-info': MobileGenericAbout,
  'buy-again': BuyAgainProducts
}

// Optional: map fallbacks per layout type to provide better UX while lazy-loading
const fallbackMap: Record<string, JSX.Element> = {
  carousel: <MobileCarouselLoader />,
  'carousel-mini': <MobileCarouselLoader />,
  image: <MobileFullBannerLoader />,
  'featured-products': <MobileProductLoader />,
  'featured-categories': <MobileHomeCategoriesLoader />,
  'buy-again': <MobileProductLoader />
}

/**
 * MobileSponsoredLayout (lazy-loaded layout components)
 */
const MobileSponsoredLayout: FC<Props> = ({ isForCampaign = false }) => {
  const { data: layoutsRaw, isLoading } = useFetchSponsoredSettings() as {
    data?: LayoutItem[]
    isLoading: boolean
  }

  // loaders to show while fetching / fallback
  const loaders = useMemo(
    () => [
      <MobileProductLoader key='loader-products' />,
      <MobileHomeCategoriesLoader key='loader-categories' />,
      <MobileCarouselLoader key='loader-carousel' />,
      <MobileFullBannerLoader key='loader-fullbanner' />
    ],
    []
  )

  // Build derived layout list without mutating original fetched data
  const layouts = useMemo(() => {
    const base: LayoutItem[] = Array.isArray(layoutsRaw) ? [...layoutsRaw] : []

    // Insert quickActions after first position
    const withQuick = [...base]
    withQuick.splice(1, 0, {
      name: 'quickActions',
      // keep as a section factory so it plays well with lazy component rendering
      section: () => <MobileQuickActions />
    })

    // Append buyAgain at end
    withQuick.push({
      name: 'buyAgain',
      type: 'buy-again',
      section: () => <BuyAgainProducts />
    })

    return withQuick
  }, [layoutsRaw])

  // renderer for a single layout item
  const renderLayout = (layout: LayoutItem, idx: number) => {
    const { type } = layout

    // If campaign mode, some layout types should be hidden
    const hideInCampaign = (t?: string) =>
      Boolean(
        isForCampaign &&
          (t === 'image' ||
            t === 'featured-products' ||
            t === 'featured-categories' ||
            t === 'buy-again' ||
            t === 'davaone-membership')
      )

    if (hideInCampaign(type)) {
      return <div key={keyFor(layout, idx, 'hidden')} />
    }

    // If we have a mapped lazy component for the type -> render it inside Suspense
    if (type && componentMap[type]) {
      const LazyComp = componentMap[type]
      const fallback = fallbackMap[type] ?? <div style={{ minHeight: 80 }} />

      return (
        <Suspense key={keyFor(layout, idx)} fallback={fallback}>
          {/* Pass layout by prop for the mapped components */}
          <LazyComp layout={layout} />
        </Suspense>
      )
    }

    // If layout.section exists, it could be:
    // - a JSX element -> render directly
    // - a component factory (function) -> call/render it
    if (layout.section) {
      const section = layout.section

      if (React.isValidElement(section)) {
        return <div key={keyFor(layout, idx)}>{section}</div>
      }

      if (typeof section === 'function') {
        // If section returns JSX directly (factory) we want to call it but ensure it's
        // executed as a React component so hooks inside work correctly when needed.
        const SectionComponent = section as React.ComponentType<any>

        // If the section is one of the lazy components we created above, prefer to render
        // it inside Suspense. We attempt to match by comparing reference names (best-effort)
        const name =
          (SectionComponent as any)?.displayName ||
          (SectionComponent as any)?.name

        // Try to find matching lazy component for nicer fallback
        const lazyMatchKey = Object.keys(componentMap).find(k => {
          const comp = componentMap[k] as any
          return comp?.displayName === name || comp?.name === name
        })

        if (lazyMatchKey && componentMap[lazyMatchKey]) {
          const LazyMatch = componentMap[lazyMatchKey]
          const fallback = fallbackMap[lazyMatchKey] ?? (
            <div style={{ minHeight: 80 }} />
          )
          return (
            <Suspense key={keyFor(layout, idx)} fallback={fallback}>
              <LazyMatch layout={layout} />
            </Suspense>
          )
        }

        // Render section directly (this will also run hooks inside it if it's a component)
        return <SectionComponent key={keyFor(layout, idx)} />
      }
    }

    // fallback empty block with unique key
    return <div key={keyFor(layout, idx, 'empty')}></div>
  }

  return (
    <div className='relative space-y-6 pb-20'>
      <div className='sticky top-0 z-[15]'>
        <MobileAppBar hideUploadPrescription={isForCampaign} />
      </div>

      {!isForCampaign && (
        <div className='fixed bottom-0 z-50 w-full'>
          <MobileNavBar />
        </div>
      )}

      {/* Show loaders if still loading and we don't have a usable layout list */}
      {isLoading && (!layoutsRaw || layoutsRaw.length === 0) ? (
        <>{loaders.map(l => l)}</>
      ) : (
        // Render layouts
        <>{layouts.map((layout, idx) => renderLayout(layout, idx))}</>
      )}
    </div>
  )
}

export default MobileSponsoredLayout
