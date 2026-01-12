import { create } from 'zustand'
import { DeliveryAddressesStore, Address } from '../../types/storeTypes'
import { fetchUserAddresses } from '../utils/actions/userAddressActions'
import { setDefaultDeliveryAddress } from './useCheckoutStore'
import { setCurrentLocationByZipCode } from './useCheckoutStore'

const useDeliveryAddressStore = create<DeliveryAddressesStore>(set => ({
  defaultAddress: null,
  addresses: [],
  loading: false,
  fetchAddresses: async () => {
    set({ loading: true })
    try {
      const addresses = await fetchUserAddresses()
      let defaultAddress: Address | any = addresses.find(
        (a: Address) => a.isDefault === true
      )

      if (!defaultAddress && addresses?.length) defaultAddress = addresses[0]

      set({ addresses, defaultAddress })
      setDefaultDeliveryAddress(defaultAddress)

      if (defaultAddress)
        setCurrentLocationByZipCode(`${defaultAddress?.postalCode}`)
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  }
}))

export default useDeliveryAddressStore
