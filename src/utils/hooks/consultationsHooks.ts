import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getConsultation,
  getConsultations
} from '../actions/consultationsActions'

export const useGetConsultations = (query: any) => {
  return useQuery({
    queryKey: ['find-consultation'],
    queryFn: () => getConsultations(query)
  })
}

export const useGetConsultation = (consultationId: string) => {
  return useQuery({
    queryKey: ['get-consultation'],
    queryFn: () => getConsultation(consultationId)
  })
}

export const useGetConsultationsInfinite = (query: any) => {
  return useInfiniteQuery({
    queryKey: ['find-consultation-infinite'],
    queryFn: ({ pageParam }) =>
      getConsultations({ ...query, $skip: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loadedItems = pages.flatMap(page => page.data).length
      if (loadedItems >= lastPage.total) {
        return undefined // No more pages to load
      }
      return loadedItems // The next skip value
    }
  })
}
