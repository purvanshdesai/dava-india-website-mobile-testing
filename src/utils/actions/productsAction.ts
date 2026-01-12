'use server'
import api from '@/lib/axios'
const API_PATH = '/products'

export const fetchProductsInfinite = async (params: {
  category?: string[] | string
  sponsored?: string
  filter?: any
  pageParams?: any
}) => {
  const {
    category = [],
    sponsored = '',
    filter = null,
    pageParams = 1
  } = params
  const stringFilter = filter ? JSON.stringify(filter) : null
  return await api
    .get(
      API_PATH +
        `?category=${category}&sponsored=${sponsored}&filter=${stringFilter}&page=${pageParams}`
    )
    .then(res => {
      const { data: products } = res.data
      return products
    })
    .catch(e => {
      throw e
    })
}

export const fetchProductsById = async ({
  slug,
  addressId,
  zipCode
}: {
  slug: string
  addressId: string | undefined
  zipCode: string | undefined
}) => {
  return await api
    .get(`/product?slug=${slug}&addressId=${addressId}&zipCode=${zipCode}`)
    .then(res => {
      const product = res.data

      if (!product?.variations?.length) return { ...product, variations: [] }

      const variations = product?.variations

      return { ...product, current: variations[0], variations }
    })
    .catch(e => {
      throw e
    })
}

export const fetchProductForSeo = async (slug: string) => {
  return await api
    .get(`${API_PATH}/seo/${slug}`)
    .then(res => {
      return res.data
    })
    .catch(() => {
      return {}
    })
}
export const fetchProducts = async (params: {
  categorySlug?: string[]
  sponsored?: string
  filter?: any
  page?: number
  limit?: number
  category?: string
  pageParams?: any
}) => {
  const { sponsored = '', filter, categorySlug, pageParams = 1 } = params
  const stringFilter = JSON.stringify(filter)
  return await api
    .get(
      API_PATH +
        `?category=${categorySlug}&sponsored=${sponsored}&filter=${stringFilter}&page=${pageParams}${params.limit ? `&limit=${params.limit}` : ''}`
    )
    .then(res => {
      const { data: products } = res
      return products
    })
    .catch(e => {
      throw e
    })
}
