import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface FormDialog {
  title: string
  content: any
  footerActions?: any
  trigger?: any
  open?: any
  onOpenChange?: any
  isCoupon?: any
  width?: any
}

// Reusable FormDialog component
export default function FormDialog({
  title,
  content,
  footerActions,
  trigger,
  open,
  onOpenChange,
  isCoupon = false
}: FormDialog) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
     <DialogContent
  className={cn(
    isCoupon ? 'bg-primary-light-blue' : '',
    'w-[calc(100%-2rem)] max-w-md rounded-xl p-6',
    'mx-auto',
    'shadow-lg'
  )}
>
  <DialogHeader>
    <DialogTitle className={'text-lg'}>{title}</DialogTitle>
  </DialogHeader>
  <div className='grid gap-4 pt-4'>{content}</div>
  <DialogFooter className='w-full'>{footerActions}</DialogFooter>
</DialogContent>
    </Dialog>
  )
}
