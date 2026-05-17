import { RecurringTransaction } from '@/types/database'
import { RecurringItem } from './RecurringItem'

interface RecurringListProps {
  transactions: RecurringTransaction[]
  onEdit: (r: RecurringTransaction) => void
}

export function RecurringList({ transactions, onEdit }: RecurringListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔁</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Sin recurrencias</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Configura gastos o ingresos fijos (como la hipoteca o salario) para que se registren automáticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((recurring) => (
        <RecurringItem key={recurring.id} recurring={recurring} onEdit={onEdit} />
      ))}
    </div>
  )
}
