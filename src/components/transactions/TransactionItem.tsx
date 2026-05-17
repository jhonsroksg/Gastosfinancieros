import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import * as Icons from 'lucide-react'
import { Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionItemProps {
  transaction: Transaction
  onClick: (transaction: Transaction) => void
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isIncome = transaction.type === 'income'
  const category = transaction.categories

  // @ts-ignore
  const IconComponent = category?.icon ? Icons[category.icon] || Icons.Circle : Icons.Circle

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    // We add timezone offset to match the DB string exactly, or just use date-fns natively
    if (isToday(date)) return 'Hoy'
    if (isYesterday(date)) return 'Ayer'
    return format(date, "d MMM", { locale: es })
  }

  return (
    <button
      onClick={() => onClick(transaction)}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-sm"
          style={{ backgroundColor: category?.color ? `${category.color}20` : '#f1f5f9' }}
        >
          <IconComponent 
            className="w-6 h-6" 
            style={{ color: category?.color || '#64748b' }} 
          />
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            {category?.name || 'Sin Categoría'}
            {transaction.subcategories && (
              <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {transaction.subcategories.name}
              </span>
            )}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
              {transaction.description || 'Sin descripción'}
            </span>
            {transaction.receipt_url && (
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className={cn(
          "font-bold",
          isIncome ? "text-emerald-600 dark:text-emerald-500" : "text-slate-900 dark:text-white"
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
          {getRelativeDate(transaction.transaction_date)}
        </p>
      </div>
    </button>
  )
}
