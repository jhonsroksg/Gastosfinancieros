'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { useBudgets, useCopyBudgets } from '@/hooks/useBudgets'
import { useInfiniteTransactions } from '@/hooks/useTransactions'
import { MonthSelector } from '@/components/budgets/MonthSelector'
import { BudgetList } from '@/components/budgets/BudgetList'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

export default function BudgetPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { data: categories, isLoading: catsLoading } = useCategories()
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(month, year)
  
  // We need transactions for this specific month to calculate what was spent
  const { data: transactionsData, isLoading: transLoading } = useInfiniteTransactions({
    month: `${year}-${month.toString().padStart(2, '0')}`
  })

  const copyMutation = useCopyBudgets()

  const handleCopyPrevious = () => {
    let fromMonth = month - 1
    let fromYear = year
    if (fromMonth === 0) {
      fromMonth = 12
      fromYear -= 1
    }
    copyMutation.mutate({
      fromMonth,
      fromYear,
      toMonth: month,
      toYear: year
    })
  }

  const isLoading = catsLoading || budgetsLoading || transLoading

  if (isLoading) return <div className="p-8 text-center">Cargando presupuesto...</div>

  const transactions = transactionsData?.pages.flatMap(p => p.data) || []
  
  const totalBudget = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const percentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  
  let headerColor = "bg-emerald-600"
  if (percentage >= 90) headerColor = "bg-rose-500"
  else if (percentage >= 70) headerColor = "bg-yellow-500"

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Presupuesto</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Planifica tus gastos y mantén el control
          </p>
        </div>
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
      </div>

      <div className={`${headerColor} text-white p-6 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-500`}>
        <div className="relative z-10">
          <p className="text-white/80 font-medium mb-1">Presupuesto Total vs Gastado</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-bold">{formatCurrency(totalSpent)}</h3>
            <span className="text-lg text-white/80 mb-1">/ {formatCurrency(totalBudget)}</span>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">{percentage}% utilizado</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleCopyPrevious}
          disabled={copyMutation.isPending}
          className="bg-white dark:bg-slate-900"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar del mes anterior
        </Button>
      </div>

      <BudgetList 
        categories={categories || []}
        budgets={budgets || []}
        transactions={transactions}
        month={month}
        year={year}
      />
    </div>
  )
}
