import { useMutation } from '@tanstack/react-query'
import { fetchSlotsWithDate } from '../actions/slotActions'

export const useFetchSlotsWithDate = () => {
  return useMutation({
    mutationFn: fetchSlotsWithDate
  })
}
