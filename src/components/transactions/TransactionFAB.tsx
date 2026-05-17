import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TransactionForm } from './TransactionForm'

export function TransactionFAB() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-[80px] right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white z-50 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none sm:w-[500px] sm:side-right p-0">
        <div className="p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-center">Nueva Transacción</SheetTitle>
          </SheetHeader>
          <TransactionForm onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
