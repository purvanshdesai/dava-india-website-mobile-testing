import { PROVIDER_NAMES } from '../constants/providerNames'

let clevertap: any = null

// Initialize CleverTap
export const initializeCleverTap = async () => {
  try {
    if (typeof window === 'undefined') return // Ensure it's only run on client

    const clevertapModule = await import('clevertap-web-sdk')
    clevertap = clevertapModule.default

    if (process.env.NODE_ENV === 'development') {
      clevertap.setLogLevel(3)
    }

    console.log(
      'CleverTap initialized successfully: ',
      clevertap.getAccountID()
    )
  } catch (error) {
    console.error('Failed to initialize CleverTap:', error)
  }
}

const clevertapProvider = {
  name: PROVIDER_NAMES.CLEVERTAP,
  initializeUser: (user: any) => {
    try {
      if (
        typeof window !== 'undefined' &&
        clevertap &&
        typeof clevertap.event?.push === 'function'
      ) {
        clevertap.onUserLogin.push({
          Site: {
            Identity: user?.id,
            Name: user?.name,
            Email: user?.email,
            Phone: user?.phoneNumber
          }
        })
      } else {
        console.warn('[CleverTap] SDK not available or improperly initialized')
      }
    } catch (err) {
      console.log(err)
    }
  },
  trackEvent: (event: string, payload?: Record<string, any>) => {
    try {
      if (
        typeof window !== 'undefined' &&
        clevertap &&
        typeof clevertap.event?.push === 'function'
      ) {
        // console.log(
        //   `Tracking ==> ${event}: `,
        //   payload,
        //   clevertap.getAccountID()
        // )

        clevertap.event.push(event, payload || {})
      } else {
        console.warn('[CleverTap] SDK not available or improperly initialized')
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export default clevertapProvider
