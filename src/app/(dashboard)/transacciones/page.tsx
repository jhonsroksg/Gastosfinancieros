'use client'

import { useState } from 'react'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  // We can add month and category filters here later

  const activeFilters = {
    ...(typeFilter !== 'all' && { type: typeFilter as 'income' | 'expense' })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transacciones</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Revisa tu historial de movimientos
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="expense">Gastos</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar (pronto...)"
            className="pl-9 bg-slate-50 dark:bg-slate-950"
            disabled
          />
        </div>
      </div>

      <TransactionList filters={activeFilters} />
    </div>
  )
}
