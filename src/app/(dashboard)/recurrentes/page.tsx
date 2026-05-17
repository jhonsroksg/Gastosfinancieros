'use client'

import { useState } from 'react'
import { useRecurringTransactions } from '@/hooks/useRecurring'
import { RecurringList } from '@/components/recurring/RecurringList'
import { RecurringModal } from '@/components/recurring/RecurringModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RecurringTransaction } from '@/types/database'

export default function RecurringPage() {
  const { data: recurringList, isLoading } = useRecurringTransactions()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringTransaction | undefined>()

  const handleCreate = () => {
    setEditingItem(undefined)
    setModalOpen(true)
  }

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recurrentes</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona tus gastos e ingresos fijos automáticos
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva recurrencia
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <RecurringList transactions={recurringList || []} onEdit={handleEdit} />
      )}

      {modalOpen && (
        <RecurringModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialData={editingItem}
        />
      )}
    </div>
  )
}
