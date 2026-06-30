import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteTransaction } from '@/hooks/useTransactions'
import { Trash2, Edit2, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { TransactionForm } from './TransactionForm'

interface TransactionDetailsModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailsModal({ transaction, isOpen, onClose }: TransactionDetailsModalProps) {
  const deleteMutation = useDeleteTransaction()
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
    }
    
    if (transaction?.receipt_url && isOpen) {
      const getUrl = async () => {
        const { data } = await supabase.storage
          .from('receipts')
          .createSignedUrl(transaction.receipt_url!, 60 * 60) // 1 hour
        
        if (data) {
          setReceiptUrl(data.signedUrl)
        }
      }
      getUrl()
    } else {
      setReceiptUrl(null)
    }
  }, [transaction, isOpen, supabase])

  if (!transaction) return null

  const isIncome = transaction.type === 'income'

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      await deleteMutation.mutateAsync(transaction.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transacción' : 'Detalle de Transacción'}</DialogTitle>
        </DialogHeader>
        
        {isEditing ? (
          <div className="mt-4">
            <TransactionForm
              initialData={transaction}
              onSuccess={() => {
                setIsEditing(false)
                onClose()
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p className="text-sm font-medium text-slate-500 mb-2">
                {format(new Date(transaction.transaction_date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <p className={`text-4xl font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
              </p>
              <div className="inline-block mt-4 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${transaction.categories?.color}20`, color: transaction.categories?.color || 'inherit' }}>
                {transaction.categories?.name}
                {transaction.subcategories && ` • ${transaction.subcategories.name}`}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">Descripción</p>
                <p className="text-base mt-1">{transaction.description || 'Sin descripción'}</p>
              </div>

              {receiptUrl && (
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-2">Recibo Adjunto</p>
                  <div className="relative rounded-lg border overflow-hidden group">
                    {transaction.receipt_filename?.endsWith('.pdf') ? (
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-col">
                        <p className="text-sm font-medium mb-2">{transaction.receipt_filename}</p>
                        <a href={receiptUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm">Ver Documento</Button>
                        </a>
                      </div>
                    ) : (
                      <div className="relative h-48 w-full">
                        <img src={receiptUrl} alt="Recibo" className="object-contain w-full h-full bg-slate-100 dark:bg-slate-800" />
                        <a href={receiptUrl} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary"><Download className="w-4 h-4" /></Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
