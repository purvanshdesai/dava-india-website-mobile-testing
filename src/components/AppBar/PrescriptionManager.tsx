import { FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTransitionRouter } from 'next-view-transitions'
import useCheckoutStore from '@/store/useCheckoutStore'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Button } from '../ui/button'
import { useState } from 'react'

export default function PrescriptionManager() {
  const { setPrescriptionUrl, setProceedWithItemsWithoutPrescription } =
    useCheckoutStore()
  const router = useTransitionRouter()
  const common = useTranslations('Common')

  const [selectedOption, setSelectedOption] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  const handleContinue = () => {
    if (selectedOption === 'upload') {
      // handle upload logic
      router.push('/prescription/upload')
    } else if (selectedOption === 'talk') {
      setOpen(false)
      router.push('/doctorConsultation') // example route
    }
  }

  return (
    <div className='w-full'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div
            onClick={() => {
              setPrescriptionUrl([])
              setProceedWithItemsWithoutPrescription(false)
              setSelectedOption('')
            }}
            className='flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm dark:bg-gray-700'
          >
            <div className='rounded-full bg-primary-green p-1.5'>
              <FileText size={18} className='text-white' />
            </div>
            <span className='hidden md:block'>
              {common('upload_prescription')}
            </span>
            <span className='block md:hidden'>Upload</span>
          </div>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Upload a valid prescription</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <label className='flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm'>
              <input
                type='radio'
                className='accent-primary outline-none ring-transparent'
                name='prescriptionOption'
                value='upload'
                checked={selectedOption === 'upload'}
                onChange={() => setSelectedOption('upload')}
              />
              Upload Prescription
            </label>
            <label className='flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm'>
              <input
                className='accent-primary outline-none ring-transparent'
                type='radio'
                name='prescriptionOption'
                value='talk'
                checked={selectedOption === 'talk'}
                onChange={() => setSelectedOption('talk')}
              />
              Don’t have a prescription? Talk to a Doctor
            </label>
          </div>
          <DialogFooter>
            <div className='flex items-center justify-between gap-3'>
              <DialogClose asChild>
                <Button variant='outline' className='w-full'>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleContinue}
                className='w-full'
                disabled={!selectedOption}
              >
                Continue
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
