import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchCollection } from '../actions/categoryActions'

export const useFetchCategories = () => {
  return useQuery({
    queryKey: ['find-categories'],
    queryFn: () => fetchCategories()
  })
}

export const useFetchCollection = (slug: string) => {
  return useQuery({
    queryKey: ['find-collection', slug],
    queryFn: () => fetchCollection(slug)
  })
}
