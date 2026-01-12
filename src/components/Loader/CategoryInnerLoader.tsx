export default function MobileCategoryInnerLoader() {
  return (
    <div className='w-full'>
      <div className='flex animate-pulse flex-col gap-6 rounded-md border bg-white p-6 dark:border-gray-600 dark:bg-gray-900'>
        <div className='w-full space-y-2'>
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className='h-20 rounded-md border bg-gray-200 dark:border-gray-600 dark:bg-gray-600'
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
