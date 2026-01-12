'use client'

import { trackUserLoggedOut } from '@/analytics/trackers/authTracker'
import LanguagesDrawer from '@/components/languagesDrawer'
import MobileNavBar from '@/components/NavBar'
import { editProfile } from '@/components/utils/icons'
import { defaultLocale } from '@/i18n/config'
import { getUserLocale } from '@/i18n/locale'
import useCheckoutStore from '@/store/useCheckoutStore'
import { handleSignOut } from '@/utils/actions/authActions'
import {
  ArrowLeft,
  ChevronRight,
  Languages,
  LogOut,
  MessageCircleMore,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  UserRoundCog,
  CoinsIcon,
  IndianRupee
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { useTransitionRouter } from 'next-view-transitions'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShieldPlus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
const languages = [
  { name: 'Language - English', code: 'en' },
  { name: 'অসমীয়া - Assamese', code: 'as' },
  { name: 'বাংলা - Bengali', code: 'bn' },
  { name: 'ગુજરાતી - Gujarati', code: 'gu' },
  { name: 'हिंदी - Hindi', code: 'hi' },
  { name: 'ಕನ್ನಡ - Kannada', code: 'kn' },
  { name: 'മലയാളം - Malayalam', code: 'ml' },
  { name: 'मराठी - Marathi', code: 'mr' },
  // { name: 'মণিপুরী - Manipuri', code: 'mni' },
  { name: 'नेपाली - Nepali', code: 'ne' },
  { name: 'ଓଡ଼ିଆ - Oriya', code: 'or' },
  { name: 'ਪੰਜਾਬੀ - Punjabi', code: 'pa' },
  { name: 'தமிழ் - Tamil', code: 'ta' },
  { name: 'తెలుగు - Telugu', code: 'te' },
  { name: 'भोजपुरी - Bhojpuri', code: 'boj' }
]
const Profile = ({ isProfile = false }: any) => {
  const router = useTransitionRouter()
  const settingsmanager = useTranslations('SettingsManager')
  const totalProducts = useCheckoutStore(state => state.totalProducts)
  // const { data } = useSession()

  const { data: session } = useSession() as any
  const isAuthenticated = session?.user || false

  const pathname = usePathname()
  const [openLanguageDrawer, setLanguageDrawer] = useState<any>(false)
  const [selectedTranslationLang, setSelectedTranslationLang] =
    useState<any>('')
  const sidebarOptions = [
    {
      label: 'My Profile',
      href: '/profile/my-profile',
      icon: <UserRound size={isProfile ? 16 : 20} />,
      iconBg: '#37582A',
      i18nKey: 'my_profile'
    },
    {
      label: 'My orders',
      href: '/me/orders',
      icon: <Package size={isProfile ? 16 : 20} color='#F02F51' />,
      iconBg: '#FFC0CB',
      i18nKey: 'my_orders'
    },
    {
      label: 'My Consultations',
      href: '/me/consultations',
      icon: <Package size={isProfile ? 16 : 20} color='#F02F51' />,
      iconBg: '#FFC0CB',
      i18nKey: 'my_consultations'
    },
    // {
    //   label: 'DavaONE Membership',
    //   href: '/me/membership',
    //   icon: <Crown size={isProfile ? 16 : 20} />,
    //   iconBg: '#FCAA17',
    //   i18nKey: 'dava_membership'
    // },
    {
      label: 'Dava Wallet',
      href: '/me/dava-coins',
      icon: <CoinsIcon size={isProfile ? 16 : 20} />,
      iconBg: '#FCAA17',
      i18nKey: ''
    },
    {
      label: 'Refer and Earn',
      href: '/me/refer-and-earn',
      icon: <IndianRupee size={isProfile ? 16 : 20} />,
      iconBg: '#37582A',
      i18nKey: 'refer-and-earn'
    },
    {
      label: 'Patients',
      href: '/me/patients',
      icon: <UserRoundCog size={isProfile ? 16 : 20} />,
      iconBg: '#37582A',
      i18nKey: 'patients'
    },
    {
      label: 'Language',
      href: '/profile/languages-settings',
      icon: <Languages size={isProfile ? 16 : 20} color='#B2A000' />,
      iconBg: '#FFFACD',
      i18nKey: 'language'
    },
    {
      label: 'Need help?',
      href: '/profile/need-help',
      icon: <MessageCircleMore size={isProfile ? 16 : 20} color='#5151FB' />,
      iconBg: '#E2E2FA',
      i18nKey: 'need_help'
    },
    {
      label: 'Policies',
      href: '/profile/policy',
      icon: <ShieldPlus size={isProfile ? 16 : 20} />,
      iconBg: '#37582A',
      i18nKey: 'Policies'
    },
    {
      label: 'Logout',
      href: '',
      icon: <LogOut size={isProfile ? 16 : 20} />,
      iconBg: '#DC2626',
      i18nKey: 'logout'
    }
  ]
  const handleSignOutUser = async () => {
    await trackUserLoggedOut({
      name: session?.user?.name,
      email: session?.user?.email,
      dateTime: new Date().toISOString()
    })

    await handleSignOut()

    router.push('/login')

    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }
  const handleMyOrders = () => {
    router.push('/orders')
  }

  const handleLanguages = () => {
    setLanguageDrawer(true)
  }

  const handleNeedHelp = () => {
    router.push('/profile/need-help')
  }
  const handlePolicies = () => {
    router.push('/profile/policy')
  }
  const handleMyConsultation = () => {
    router.push('/consultations')
  }
  const handleMyProfile = () => {
    if (!isAuthenticated) router.push('/login')
    else router.push('/profile/my-profile')
  }
  const handlePatients = () => {
    if (!isAuthenticated) router.push('/login')
    else router.push('/profile/patients')
  }

  const callDynamicFunctions = (label: any) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    switch (label) {
      case 'Logout':
        handleSignOutUser()
        break
      case 'My orders':
        handleMyOrders()
        break
      case 'Language':
        handleLanguages()
        break
      case 'Need help?':
        handleNeedHelp()
        break
      case 'My Consultations':
        handleMyConsultation()
        break
      case 'My Profile':
        handleMyProfile()
        break
      case 'Patients':
        handlePatients()
        break

      case 'Policies':
        handlePolicies()
        break

      // case 'DavaONE Membership':
      //   router.push('/profile/membership')
      //   break

      case 'Dava Wallet':
        router.push('/profile/dava-coins')
        break

      case 'Refer and Earn':
        router.push('/profile/refer-and-earn')
        break

      default:
        console.log('Unknown action:', label)
        break
    }
  }

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login')
  //   }
  // }, [isAuthenticated])

  useEffect(() => {
    const setUserLocale = async () => {
      const locale = (await getUserLocale()) ?? defaultLocale
      setSelectedTranslationLang(languages.find((l: any) => l.code === locale))
    }

    setUserLocale()
  }, [])

  return (
    <div className='h-screen overflow-y-scroll bg-none'>
      <div className='mb-2 flex flex-row items-center justify-between bg-white px-4 py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>{settingsmanager('my_profile')}</p>
        </div>

        <div className='flex flex-row items-center justify-center'>
          <div
            className='mr-3 rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.push('/search')}
          >
            <Search color='#3C3C3C' size={20} />
          </div>
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
        </div>
      </div>
      <div className='p-2'>
        <div className='relative flex h-[95px] flex-row items-start justify-between rounded-lg bg-[#008080] p-5 text-white'>
          <div className='mr-5 flex flex-row items-center justify-center'>
            <Image
              src={`/images/ProfileAvtar.svg`}
              alt='profile'
              height={50}
              width={50}
            />

            <div>
              {!isAuthenticated ? (
                <div
                  className={`ml-3 flex flex-col ${isProfile ? 'text-xs' : 'text-sm'}`}
                >
                  <div
                    className='cursor-pointer font-semibold capitalize'
                    onClick={() => {
                      router.push('/login')
                    }}
                  >
                    click to Sign In
                  </div>
                </div>
              ) : (
                <div
                  className={`ml-3 flex flex-col ${isProfile ? 'text-xs' : 'text-sm'}`}
                >
                  <div className='font-semibold'>
                    {settingsmanager('hello')}, {session?.user?.name}
                  </div>

                  <div>
                    {session?.user?.phoneNumber?.replace(
                      /(\+\d{2})(\d{5})(\d{5})/,
                      '$1 $2 $3'
                    )}
                  </div>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <span
                className='absolute right-6 top-6 cursor-pointer'
                onClick={() => router.push('/profile/my-profile')}
              >
                {editProfile}
              </span>
            )}
          </div>

          {/* <div>
            <PenLine />
          </div> */}
        </div>
        <div>
          <div className='mt-5 rounded-lg'>
            <ul
              className={`mb-12 flex flex-col gap-1 text-sm ${isProfile ? 'mt-1.5' : ''}`}
            >
              {sidebarOptions.map((option, index) => {
                if (!isAuthenticated && option?.label === 'Logout') return <></>

                const isActive = pathname.slice(3) === option.href

                return (
                  <li
                    key={index}
                    className={`flex cursor-pointer items-center justify-between ${isProfile ? 'p-1' : 'p-5'} mb-0.5 gap-3 rounded-md bg-white`}
                    style={{
                      backgroundColor: !isProfile && isActive ? '#FDF0E9' : ''
                    }}
                    onClick={() => callDynamicFunctions(option.label)}
                  >
                    <div className='flex w-full flex-row items-center justify-start'>
                      <span
                        className='mr-3 rounded-full p-2 text-white'
                        style={{ backgroundColor: option.iconBg }}
                      >
                        {option.icon}
                      </span>

                      <span
                        className={`${isProfile ? 'text-xs' : ''} cursor-pointer`}
                      >
                        {option.i18nKey == 'patients' ||
                        'policies' ||
                        !option.i18nKey
                          ? option.label
                          : settingsmanager(option.i18nKey)}
                      </span>
                    </div>

                    <span className='flex flex-row items-center justify-center'>
                      <div>
                        {option.label === 'Language'
                          ? selectedTranslationLang?.name
                          : null}
                      </div>
                      <ChevronRight />
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {openLanguageDrawer && (
          <LanguagesDrawer
            closeDrawer={() => setLanguageDrawer(false)}
            selectedLanguage={(item: any) => {
              setSelectedTranslationLang(item)
            }}
          />
        )}
      </div>

      <div className='fixed bottom-0 w-full'>
        <MobileNavBar />
      </div>
    </div>
  )
}

export default Profile
