import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { fetchCollectionNavigationPath } from '@/utils/actions/navigationActions'

export default function FullBanner({ layout }: { layout: any }) {
  const router = useRouter()
  const [banner, setBanner] = useState<any>(null)
  const [properties, setProperties] = useState<any>(null)

  useEffect(() => {
    if (layout?.banner) {
      setBanner(layout?.banner?.device?.mobile)
      setProperties(layout?.banner?.properties)
    }
  }, [layout])

  const handleClickBanner = async () => {
    try {
      console.log(properties)
      const { redirectType, redirectUrl, collection } = properties
      if (redirectType === 'externalLink') {
        window.open(redirectUrl, '_blank')
      } else if (redirectType === 'collection') {
        // Fetch collection info navigation
        const slug = await fetchCollectionNavigationPath(collection)
        router.push(`/categories/${(slug ?? []).join('/')}`)
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (!banner) return <></>

  return (
    <div>
      <div className='cursor-pointer p-3' onClick={() => handleClickBanner()}>
        {/* <div style={{ position: 'relative', width: '100%', height: '400px' }}> */}
        <Image
          src={banner?.imageUrl}
          alt={banner?.title}
          width={656} // Set width of the original image
          height={328}
          layout='responsive' // Makes the image responsive
          priority // Ensures the image loads immediately for better UX
          className='overflow-hidden rounded-2xl'
        />
        {/* </div> */}
      </div>
    </div>
  )
}
