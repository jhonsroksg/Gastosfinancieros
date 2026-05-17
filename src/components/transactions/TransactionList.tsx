import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteTransactions } from '@/hooks/useTransactions'
import { TransactionItem } from './TransactionItem'
import { TransactionDetailsModal } from './TransactionDetailsModal'
import { Transaction } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

interface TransactionListProps {
  filters?: {
    type?: 'income' | 'expense'
    month?: string
    categoryId?: string
  }
}

export function TransactionList({ filters }: TransactionListProps) {
  const { ref, inView } = useInView()
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(filters)

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="w-32 h-4 mb-2" />
                <Skeleton className="w-24 h-3" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="w-20 h-5 mb-2 ml-auto" />
              <Skeleton className="w-16 h-3 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className="text-center text-red-500 py-8">Error al cargar transacciones</div>
  }

  const transactions = data?.pages.flatMap((page) => page.data) || []

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No hay transacciones</h3>
        <p className="text-slate-500 dark:text-slate-400">
          No encontramos registros para los filtros seleccionados.
        </p>
      </div>
    )
  }

  // Group by date
  const grouped = transactions.reduce((acc, curr) => {
    const date = curr.transaction_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(curr)
    return acc
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="pb-8">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-y border-slate-100 dark:border-slate-800/50 first:border-t-0 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {new Date(date).toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence>
                {items.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TransactionItem 
                      transaction={transaction} 
                      onClick={setSelectedTransaction} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div ref={ref} className="py-6 flex justify-center">
        {isFetchingNextPage && <Skeleton className="w-8 h-8 rounded-full" />}
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
}
