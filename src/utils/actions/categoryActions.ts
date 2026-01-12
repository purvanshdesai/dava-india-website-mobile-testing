'use server'
import api from '@/lib/axios'
const API_URL = 'consumer/collection/navigations/mobile'

export const fetchCategories = async () => {
  try {
    const response = await api.get(`${API_URL}`)
    return response.data
  } catch (error: any) {
    return error?.response.data
  }
}

export async function fetchCollection(slug: string) {
  try {
    const axiosRes = await api.get(`${API_URL}?slug_url=${slug}`)
    return axiosRes?.data ?? []
  } catch (e) {
    console.log(e)
    throw e
  }
}
