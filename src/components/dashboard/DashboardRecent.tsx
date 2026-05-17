import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Transaction } from '@/types/database'
import { TransactionItem } from '../transactions/TransactionItem'
import { TransactionDetailsModal } from '../transactions/TransactionDetailsModal'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DashboardRecentProps {
  transactions: Transaction[]
}

export function DashboardRecent({ transactions }: DashboardRecentProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Últimas transacciones</CardTitle>
        <Link href="/transacciones">
          <Button variant="link" className="text-emerald-600 p-0 h-auto font-medium">
            Ver todas
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.length > 0 ? (
            transactions.map(t => (
              <TransactionItem 
                key={t.id} 
                transaction={t} 
                onClick={setSelectedTransaction} 
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay transacciones recientes
            </div>
          )}
        </div>
      </CardContent>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </Card>
  )
}
