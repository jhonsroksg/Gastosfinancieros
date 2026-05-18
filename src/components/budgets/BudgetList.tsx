import { useState } from 'react'
import { Budget, Category, Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { useUpsertBudget } from '@/hooks/useBudgets'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import * as Icons from 'lucide-react'
import { Check, Edit2, AlertCircle, ChevronDown, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BudgetListProps {
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
  month: number
  year: number
}

export function BudgetList({ categories, budgets, transactions, month, year }: BudgetListProps) {
  // Only interested in expense categories for budgeting right now
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="space-y-4">
      {expenseCategories.map(category => {
        const budget = budgets.find(b => b.category_id === category.id)
        
        // Filter all transactions for this category
        const categoryTransactions = transactions.filter(
          t => t.category_id === category.id && t.type === 'expense'
        )

        return (
          <BudgetProgressItem
            key={category.id}
            category={category}
            budget={budget}
            transactions={categoryTransactions}
            month={month}
            year={year}
          />
        )
      })}
    </div>
  )
}

function BudgetProgressItem({ 
  category, 
  budget, 
  transactions, 
  month, 
  year 
}: { 
  category: Category; 
  budget?: Budget; 
  transactions: Transaction[];
  month: number;
  year: number;
}) {
  const [isEditing, setIsEditing] = useState(!budget)
  const [amount, setAmount] = useState(budget?.amount?.toString() || '')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const upsertMutation = useUpsertBudget()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const supabase = createClient()

  // @ts-ignore
  const IconComponent = category.icon ? Icons[category.icon] || Icons.HelpCircle : Icons.HelpCircle

  const handleSaveBudget = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 0) return

    await upsertMutation.mutateAsync({
      category_id: category.id,
      amount: numAmount,
      month,
      year
    })
    setIsEditing(false)
  }

  const handleCreateItem = async () => {
    const numAmount = parseFloat(newItemAmount)
    if (!newItemDesc.trim() || isNaN(numAmount) || numAmount <= 0) return

    setIsSubmitting(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('Usuario no autenticado')

      // Use the month and year props to set the date
      // We will set it to the first day of the selected month
      const transactionDate = new Date(year, month - 1, 1).toISOString().split('T')[0]

      await createTransaction.mutateAsync({
        id: crypto.randomUUID(),
        user_id: user.id,
        type: 'expense',
        amount: numAmount,
        category_id: category.id,
        transaction_date: transactionDate,
        description: newItemDesc.trim(),
        is_executed: false // Empieza desmarcado
      })
      
      setNewItemDesc('')
      setNewItemAmount('')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleItem = async (transaction: Transaction) => {
    await updateTransaction.mutateAsync({
      id: transaction.id,
      is_executed: !transaction.is_executed
    })
  }

  const budgetAmount = budget?.amount || 0
  
  // Logic: Spent only counts executed items
  const spent = transactions
    .filter(t => t.is_executed)
    .reduce((sum, t) => sum + t.amount, 0)
    
  // Logic: Total planned counts all items (to check against budget)
  const totalPlanned = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  const percentage = budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0
  const isOverBudget = budgetAmount > 0 && totalPlanned > budgetAmount
  
  let progressColor = "bg-emerald-500"
  if (percentage >= 90) progressColor = "bg-rose-500"
  else if (percentage >= 70) progressColor = "bg-yellow-500"

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header / Main Card Area */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${category.color}20`, color: category.color || '#64748b' }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</h4>
                {isOverBudget && (
                  <span title="Planificación excede el presupuesto">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Gastado: {formatCurrency(spent)}
              </p>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="w-24 h-8 text-right"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={handleSaveBudget} disabled={upsertMutation.isPending}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 group" 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
              >
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(budgetAmount)}</p>
                  <p className="text-xs text-slate-500">Presupuesto</p>
                </div>
                <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-1.5 mt-4">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-500">{percentage}% usado</span>
            <span className={`font-medium ${budgetAmount - spent < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
              {formatCurrency(Math.abs(budgetAmount - spent))} {budgetAmount - spent < 0 ? 'excedido' : 'restante'}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
            indicatorColor={progressColor}
          />
          {isOverBudget && (
            <p className="text-[10px] text-rose-500 mt-1">
              La planificación total ({formatCurrency(totalPlanned)}) supera el presupuesto.
            </p>
          )}
        </div>
      </div>

      {/* Expanded Items Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"
          >
            <div className="p-4 space-y-3">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sub-gastos</h5>
              
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-2">No hay sub-gastos registrados</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map(item => (
                    <div key={item.id} className="flex items-center justify-between group py-1">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                          <Switch 
                            checked={!!item.is_executed}
                            onCheckedChange={() => handleToggleItem(item)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <span className={`text-sm truncate transition-colors ${item.is_executed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.description || 'Sin descripción'}
                          </span>
                        </label>
                      </div>
                      <span className={`text-sm font-medium ml-4 ${item.is_executed ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Item Form */}
              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Descripción"
                  className="h-8 text-sm flex-1"
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateItem()}
                />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-8 text-sm w-24 text-right"
                  value={newItemAmount}
                  onChange={e => setNewItemAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateItem()}
                />
                <Button 
                  size="icon" 
                  className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 shrink-0" 
                  onClick={handleCreateItem}
                  disabled={isSubmitting || !newItemDesc.trim() || !newItemAmount}
                >
                  <Plus className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
