import { create } from 'zustand'
import { CategoriesFilterStore } from '../../types/storeTypes'

const useCategoriesFilterStore = create<CategoriesFilterStore>((set: any) => ({
  price: '',
  discount: '',
  setPriceCategoriesValue: (price: string) => {
    set({ price })
  },
  setDiscountCategoriesValue: (discount: string) => {
    set({ discount })
  }
}))
export default useCategoriesFilterStore
