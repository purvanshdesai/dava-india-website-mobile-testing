import { useQuery } from '@tanstack/react-query'

import {
  getAllCancelOrderReasons,
  getAllReturnOrderReasons,
  handleGetAllOrderTrackingStatus
} from '../actions/appDataActions'

export const useGetAllOrderTrackingStatus = () => {
  return useQuery({
    queryFn: () => handleGetAllOrderTrackingStatus(),
    queryKey: ['find-tracking-statuses']
  })
}

export const useGetAllCancelReasons = () => {
  return useQuery({
    queryFn: () => getAllCancelOrderReasons(),
    queryKey: ['get-cancel-reasons']
  })
}

export const useGetAllReturnReasons = () => {
  return useQuery({
    queryFn: () => getAllReturnOrderReasons(),
    queryKey: ['get-return-reasons']
  })
}
