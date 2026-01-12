'use client'
import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google'
import { PROVIDER_NAMES } from '../constants/providerNames'

const googleProvider = {
  name: PROVIDER_NAMES.GOOGLE_ANALYTICS,
  initializeUser: () => {
    try {
    } catch (err) {
      console.log(err)
    }
  },
  trackEvent: (event: string, payload?: Record<string, any>) => {
    try {
      sendGAEvent('event', event, { ...payload })
      sendGTMEvent({ event, ...payload })
    } catch (err) {
      console.log(err)
    }
  }
}

export default googleProvider
