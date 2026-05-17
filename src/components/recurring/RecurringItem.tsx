import { RecurringTransaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { Switch } from '@/components/ui/switch'
import { useUpdateRecurring, useDeleteRecurring } from '@/hooks/useRecurring'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'

interface RecurringItemProps {
  recurring: RecurringTransaction
  onEdit: (r: RecurringTransaction) => void
}

export function RecurringItem({ recurring, onEdit }: RecurringItemProps) {
  const updateMutation = useUpdateRecurring()
  const deleteMutation = useDeleteRecurring()

  const isIncome = recurring.type === 'income'
  const category = recurring.categories
  // @ts-ignore
  const IconComponent = category?.icon ? Icons[category.icon] || Icons.Repeat : Icons.Repeat

  const handleToggle = () => {
    updateMutation.mutate({ id: recurring.id, is_active: !recurring.is_active })
  }

  const handleDelete = () => {
    if (confirm('¿Eliminar esta recurrencia? Ya no se generarán más transacciones.')) {
      deleteMutation.mutate(recurring.id)
    }
  }

  const frequencyText = {
    daily: 'Diaria',
    weekly: `Semanal${recurring.day_of_week !== null ? ` (Día ${recurring.day_of_week})` : ''}`,
    biweekly: 'Quincenal',
    monthly: `Mensual${recurring.day_of_month ? ` (Día ${recurring.day_of_month})` : ''}`,
    yearly: 'Anual',
  }

  return (
    <div className={`w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-opacity ${!recurring.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
        <div 
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
          style={{ backgroundColor: category?.color ? `${category.color}20` : '#f1f5f9' }}
        >
          <IconComponent 
            className="w-6 h-6" 
            style={{ color: category?.color || '#64748b' }} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {recurring.description || category?.name || 'Recurrencia'}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {frequencyText[recurring.frequency]} • <span className={isIncome ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}>
              {isIncome ? '+' : '-'}{formatCurrency(recurring.amount)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs text-slate-500 font-medium">Activa</span>
          <Switch checked={recurring.is_active} onCheckedChange={handleToggle} />
        </div>
        <Button variant="ghost" size="icon" onClick={() => onEdit(recurring)}>
          <Edit2 className="w-4 h-4 text-slate-500" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 text-rose-500" />
        </Button>
      </div>
    </div>
  )
}
