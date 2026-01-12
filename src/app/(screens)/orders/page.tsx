import MobileNavBar from '@/components/NavBar'
import OrdersTable from '@/components/Orders/OrdersTable'
import React from 'react'

export default function MyOrders() {
  return (
    <>
      <div className='mb-20'>
        <OrdersTable />
      </div>
      <div className='fixed bottom-0 w-full'>
        <MobileNavBar />
      </div>
    </>
  )
}
