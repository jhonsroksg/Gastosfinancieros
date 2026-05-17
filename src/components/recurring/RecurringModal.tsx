import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RecurringForm } from './RecurringForm'
import { RecurringTransaction } from '@/types/database'

interface RecurringModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: RecurringTransaction
}

export function RecurringModal({ isOpen, onClose, initialData }: RecurringModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] h-[90vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Recurrencia' : 'Nueva Recurrencia'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RecurringForm initialData={initialData} onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
