import { useQuery, useMutation } from '@tanstack/react-query'
import {
  cancelProduct,
  consultationOrder,
  createNewOrder,
  fetchOrderById,
  fetchOrders,
  fetchOrderTracking,
  returnProduct
} from '../actions/orderActions'

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createNewOrder
  })
}

export const useFetchOrders = (params?: {
  page?: number
  limit?: number
  lastRefreshed?: number
  dateFilter?: string
}) => {
  return useQuery({
    queryKey: [
      'fetch-orders',
      params?.page,
      params?.limit,
      params?.lastRefreshed,
      params?.dateFilter
    ],
    queryFn: () => fetchOrders(params)
  })
}

export const useFetchOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['fetch-order-by-id'],
    queryFn: () => fetchOrderById(orderId)
  })
}

export const useConsultationOrder = () => {
  return useMutation({
    mutationFn: consultationOrder
  })
}

export const useCancelProduct = () => {
  return useMutation({
    mutationFn: cancelProduct
  })
}

export const useReturnProduct = () => {
  return useMutation({
    mutationFn: returnProduct
  })
}

export const useFetchOrderTrackingById = ({
  orderId,
  orderTrackingId,
  lastRiderStatus
}: {
  orderId: string
  orderTrackingId: string
  lastRiderStatus?: string
}) => {
  return useQuery({
    queryKey: ['fetch-order-tracking-by-id', orderId, lastRiderStatus],
    queryFn: () => fetchOrderTracking({ orderId, orderTrackingId })
  })
}
