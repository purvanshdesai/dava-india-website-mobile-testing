import Image from 'next/image'
import React, { useState, ReactNode, useRef, useEffect } from 'react'
import { Trash2Icon } from 'lucide-react'
import { pdfjs } from 'react-pdf'
import { uploadFiles } from '@/utils/fileUpload'
import useCheckoutStore from '@/store/useCheckoutStore'
import { useTransitionRouter } from 'next-view-transitions'
import heic2any from 'heic2any'
import { Button } from '../ui/button'

pdfjs.GlobalWorkerOptions.workerSrc = pdfjs.GlobalWorkerOptions.workerSrc =
  '/pdf.worker.min.mjs'

interface FileUpdateComponentProps {
  renderButton?: (handleUpload: () => void, isLoading: boolean) => ReactNode
  onFileUpload: (files: any) => void
  isLoggedIn: boolean
}

const RequestMedicineFileUploadComponent: React.FC<
  FileUpdateComponentProps
> = ({ renderButton, onFileUpload, isLoggedIn }) => {
  const router = useTransitionRouter()
  const { prescriptionFiles } = useCheckoutStore(state => state)
  const fileBtn = useRef<any>(null)
  const [files, setFiles] = useState<any[]>(
    prescriptionFiles?.length ? prescriptionFiles : []
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

  const allowedFileTypes = [
    'image/png',
    'image/jpeg',
    'application/pdf',
    'image/heif',
    'image/heic'
  ]

  const openFilePicker = () => {
    if (!isLoggedIn) {
      router.push(
        `/login?redirect=${encodeURIComponent('/prescription/upload')}`
      )
      return
    }
    fileBtn?.current?.click()
  }

  const convertHeifToJpg = async (hFile: File) => {
    try {
      const blob: any = await heic2any({
        blob: hFile,
        toType: 'image/jpg'
      })
      return new File(
        [blob],
        hFile?.name?.replace('heic', 'jpg')?.replace('heif', 'jpg'),
        { type: 'image/jpg' }
      )
    } catch (error) {
      console.error('Conversion failed:', error)
      return null
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setLoading(true)
      const selectedFiles = event.target.files
      if (!selectedFiles) return

      const validFiles: File[] = []
      const invalidFiles: string[] = []

      for (const file of Array.from(selectedFiles)) {
        if (allowedFileTypes.includes(file.type)) {
          if (file.type === 'image/heif' || file.type === 'image/heic') {
            const convertedFile: File | null = await convertHeifToJpg(file)
            if (convertedFile) validFiles.push(convertedFile)
          } else validFiles.push(file)
        } else {
          invalidFiles.push(file.name)
        }
      }

      if (invalidFiles.length > 0) {
        setError(`Invalid files: ${invalidFiles.join(', ')}`)
      } else {
        setError(null)
      }

      const files = await uploadFiles(validFiles)
      const fileUrls = files?.map((file: any) => file?.objectUrl)
      setFiles(prevFiles => [...prevFiles, ...fileUrls])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFile = (objectUrl: string) => {
    setFiles(prevFiles => prevFiles.filter(url => url !== objectUrl))
  }

  const displayedFiles =
    isCollapsed && files.length > 2 ? files.slice(0, 2) : files
  const hiddenCount = isCollapsed && files.length > 2 ? files.length - 2 : 0

  useEffect(() => {
    onFileUpload(files)
  }, [files])

  return (
    <div className='file-update-component'>
      <input
        ref={fileBtn}
        type='file'
        multiple
        accept='.png, .jpeg, .jpg, .pdf, .heif, .heic'
        onChange={handleFileChange}
        className='hidden'
      />
      {error && <p className='mt-1 text-[11px] text-red-500'>{error}</p>}

      {renderButton ? (
        renderButton(openFilePicker, isLoading)
      ) : (
        <Button
          onClick={openFilePicker}
          variant={'outline'}
          size={'sm'}
          className='w-full py-1.5 text-xs'
        >
          {isLoading ? 'Uploading...' : 'Upload File'}
        </Button>
      )}

      <div className='mt-3 flex flex-wrap gap-3 rounded-md'>
        {displayedFiles.map((file: string, idx: number) => {
          const isPdf = file.toLowerCase().endsWith('.pdf')
          return (
            <div
              key={idx}
              className='relative h-36 w-32 overflow-hidden rounded-md border border-gray-200 shadow-sm'
            >
              {isPdf ? (
                <iframe
                  src={file}
                  className='h-full w-full'
                  title={`PDF Preview ${idx}`}
                />
              ) : (
                <Image
                  src={file}
                  alt='Image File preview'
                  fill
                  className='object-cover'
                />
              )}
              <button
                onClick={() => handleRemoveFile(file)}
                className='absolute right-1 top-1 flex items-center justify-center rounded-full bg-red-500/20 p-1 transition hover:bg-red-500/40'
              >
                <Trash2Icon size={14} className='text-red-600' />
              </button>
            </div>
          )
        })}

        {hiddenCount > 0 || !isCollapsed ? (
          <div
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='relative flex h-36 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-400'
          >
            {isCollapsed ? (
              <>
                <span className='text-sm font-semibold text-gray-600'>
                  +{hiddenCount}
                </span>
                <span className='mt-0.5 text-[11px] text-primary underline'>
                  Show More
                </span>
              </>
            ) : (
              <span className='text-[11px] text-primary underline'>
                Show Less
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default RequestMedicineFileUploadComponent
