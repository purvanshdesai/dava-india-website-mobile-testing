import React from 'react'
import { useTranslations } from 'next-intl'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const paginationTranslate = useTranslations('Pagination')
  const getPageNumbers = () => {
    const pageNumbers = []

    if (totalPages <= 3) {
      // If the total number of pages is 5 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Show dots and only relevant pages
      if (currentPage > 2) {
        pageNumbers.push(1)
        if (currentPage > 3) pageNumbers.push('...')
      }

      // Show previous, current, and next page
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 0 && i <= totalPages) {
          pageNumbers.push(i)
        }
      }

      if (currentPage < totalPages - 1) {
        if (currentPage < totalPages - 2) pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <div className='mt-4 flex justify-center space-x-2'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded px-4 py-2 text-xs ${currentPage === 1 ? 'bg-gray-300' : 'bg-primary text-white'}`}
      >
        {paginationTranslate('previous')}
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`rounded px-4 py-2 text-xs ${
            currentPage === page ? 'bg-primary text-white' : 'bg-gray-200'
          } ${page === '...' ? 'cursor-default' : ''}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded px-4 py-2 text-xs ${currentPage === totalPages ? 'bg-gray-300' : 'bg-primary text-white'}`}
      >
        {paginationTranslate('next')}
      </button>
    </div>
  )
}

export default Pagination
