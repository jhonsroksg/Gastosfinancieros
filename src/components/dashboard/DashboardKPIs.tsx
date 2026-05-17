import { formatCurrency } from '@/lib/utils/currency'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface DashboardKPIsProps {
  kpis: {
    currentIncome: number
    incomeChange: number
    currentExpense: number
    expenseChange: number
    currentBalance: number
    savingsRate: number
    budgetCompliance: number
  }
}

export function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  const isBalancePositive = kpis.currentBalance >= 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ingresos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Ingresos</h3>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {formatCurrency(kpis.currentIncome)}
          </div>
          <p className={`text-xs mt-1 flex items-center ${kpis.incomeChange >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {kpis.incomeChange >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {Math.abs(kpis.incomeChange).toFixed(1)}% mes
          </p>
        </CardContent>
        </Card>
      </motion.div>

      {/* Gastos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Gastos</h3>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <Wallet className="h-4 w-4 text-rose-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {formatCurrency(kpis.currentExpense)}
          </div>
          <p className={`text-xs mt-1 flex items-center ${kpis.expenseChange <= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {kpis.expenseChange >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {Math.abs(kpis.expenseChange).toFixed(1)}% mes
          </p>
        </CardContent>
      </Card>
      </motion.div>

      {/* Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Balance</h3>
            <div className={`p-2 rounded-full ${isBalancePositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
              <CheckCircle2 className={`h-4 w-4 ${isBalancePositive ? 'text-emerald-600' : 'text-rose-500'}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${isBalancePositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
            {isBalancePositive ? '+' : ''}{formatCurrency(kpis.currentBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {kpis.budgetCompliance > 0 ? `${kpis.budgetCompliance.toFixed(1)}% ppto usado` : 'Sin presupuesto'}
          </p>
        </CardContent>
      </Card>
      </motion.div>

      {/* Ahorro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Tasa de Ahorro</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {kpis.savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            del ingreso actual
          </p>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
