import { useState } from 'react'
import { Budget, Category, Transaction } from '@/types/database'
import { formatCurrency } from '@/lib/utils/currency'
import { useUpsertBudget } from '@/hooks/useBudgets'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import * as Icons from 'lucide-react'
import { Check, Edit2, AlertCircle } from 'lucide-react'

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
        
        // Calculate spent amount for this category
        const spent = transactions
          .filter(t => t.category_id === category.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        return (
          <BudgetProgressItem
            key={category.id}
            category={category}
            budget={budget}
            spent={spent}
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
  spent, 
  month, 
  year 
}: { 
  category: Category; 
  budget?: Budget; 
  spent: number;
  month: number;
  year: number;
}) {
  const [isEditing, setIsEditing] = useState(!budget)
  const [amount, setAmount] = useState(budget?.amount?.toString() || '')
  const upsertMutation = useUpsertBudget()

  // @ts-ignore
  const IconComponent = category.icon ? Icons[category.icon] || Icons.HelpCircle : Icons.HelpCircle

  const handleSave = async () => {
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

  const budgetAmount = budget?.amount || 0
  const percentage = budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0
  
  let progressColor = "bg-emerald-500"
  if (percentage >= 90) progressColor = "bg-rose-500"
  else if (percentage >= 70) progressColor = "bg-yellow-500"

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: `${category.color}20`, color: category.color || '#64748b' }}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</h4>
            <p className="text-xs text-slate-500">
              Gastado: {formatCurrency(spent)}
            </p>
          </div>
        </div>

        <div className="text-right flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0.00"
                className="w-24 h-8 text-right"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={handleSave} disabled={upsertMutation.isPending}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
              <div className="text-right">
                <p className="text-sm font-bold">{formatCurrency(budgetAmount)}</p>
                <p className="text-xs text-slate-500">Presupuesto</p>
              </div>
              <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
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
      </div>
    </div>
  )
}
