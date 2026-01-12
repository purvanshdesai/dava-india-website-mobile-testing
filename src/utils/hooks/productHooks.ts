import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProductsById,
  fetchProductsInfinite
} from '../actions/productsAction'

export const useFetchProductsInfinite = (params: {
  category?: string[] | string
  sponsored?: string
  filter?: any
}) => {
  const { category, sponsored, filter } = params

  return useInfiniteQuery({
    queryKey: ['find-products', category, sponsored, filter],
    queryFn: ({ pageParam = 1 }) =>
      fetchProductsInfinite({ ...params, pageParams: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined
      return allPages.length + 1
    },
    initialPageParam: 1
  })
}

export const useFetchProductsById = (
  slug: string,
  addressId: string | undefined,
  zipCode: string | undefined
) => {
  return useQuery({
    queryKey: ['fetch-products', slug, addressId, zipCode],
    queryFn: () => fetchProductsById({ slug, addressId, zipCode })
  })
}
export const useFetchProducts = (params: {
  categorySlug?: string[]
  sponsored?: string
  filter?: any
  page?: any
  limit?: any
  category?: any
}) => {
  const { sponsored, filter, categorySlug, page, limit } = params
  return useQuery({
    queryKey: ['find-products', sponsored, filter, categorySlug, page, limit],
    queryFn: () => fetchProducts(params)
  })
}
