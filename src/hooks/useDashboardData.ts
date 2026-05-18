import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { Transaction, Budget, Category } from '@/types/database'

export function useDashboardData(selectedDate: Date) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboardData', selectedDate.toISOString().substring(0, 7)],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('No user found')

      // Date ranges
      const currentMonthStart = startOfMonth(selectedDate)
      const currentMonthEnd = endOfMonth(selectedDate)
      
      const previousMonthStart = startOfMonth(subMonths(selectedDate, 1))
      const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1))
      
      const sixMonthsAgo = startOfMonth(subMonths(selectedDate, 5)) // 6 months total including current

      // Fetch User Settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Fetch Budgets for current month
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*, categories(*)')
        .eq('user_id', userId)
        .eq('month', selectedDate.getMonth() + 1)
        .eq('year', selectedDate.getFullYear())

      // Fetch Transactions from 6 months ago to end of current month
      // We do one big fetch for performance instead of multiple queries
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*, categories(*), subcategories(*)')
        .eq('user_id', userId)
        .gte('transaction_date', sixMonthsAgo.toISOString().split('T')[0])
        .lte('transaction_date', currentMonthEnd.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false })

      const allTransactions = (transactionsData || []) as Transaction[]
      const transactions = allTransactions.filter(t => t.type === 'income' || t.is_executed)
      const budgets = (budgetsData || []) as Budget[]

      // --- KPIs Calculation ---
      
      // Current Month
      const currentMonthTx = transactions.filter(t => {
        const d = parseISO(t.transaction_date)
        return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd })
      })
      
      const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const currentExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      const currentBalance = currentIncome - currentExpense

      // Previous Month
      const prevMonthTx = transactions.filter(t => {
        const d = parseISO(t.transaction_date)
        return isWithinInterval(d, { start: previousMonthStart, end: previousMonthEnd })
      })
      
      const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const prevExpense = prevMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

      const incomeChange = prevIncome === 0 ? 100 : ((currentIncome - prevIncome) / prevIncome) * 100
      const expenseChange = prevExpense === 0 ? 100 : ((currentExpense - prevExpense) / prevExpense) * 100

      // Savings Rate
      const savingsRate = currentIncome === 0 ? 0 : (currentBalance / currentIncome) * 100
      
      // Budget Compliance
      const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
      const totalBudgetedExpenses = currentMonthTx
        .filter(t => t.type === 'expense' && budgets.some(b => b.category_id === t.category_id))
        .reduce((sum, t) => sum + t.amount, 0)
      const budgetCompliance = totalBudget === 0 ? 0 : (totalBudgetedExpenses / totalBudget) * 100

      // --- Charts Data ---
      
      // Donut Chart: Current month expenses by category
      const expensesByCategory = currentMonthTx
        .filter(t => t.type === 'expense' && t.categories)
        .reduce((acc, t) => {
          const catId = t.category_id!
          if (!acc[catId]) {
            acc[catId] = {
              name: t.categories!.name,
              value: 0,
              color: t.categories!.color || '#cbd5e1'
            }
          }
          acc[catId].value += t.amount
          return acc
        }, {} as Record<string, { name: string, value: number, color: string }>)

      const donutData = Object.values(expensesByCategory).sort((a, b) => b.value - a.value)
      const top5Categories = donutData.slice(0, 5)

      // Line Chart: 6 months trend
      const trendDataMap = new Map<string, { month: string, income: number, expense: number }>()
      
      // Initialize 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(selectedDate, i)
        // Ensure month format is YYYY-MM
        const monthKey = d.toISOString().substring(0, 7)
        // Name like "Jan", "Feb"
        const monthName = new Intl.DateTimeFormat('es-HN', { month: 'short' }).format(d)
        trendDataMap.set(monthKey, { month: monthName, income: 0, expense: 0 })
      }

      transactions.forEach(t => {
        const monthKey = t.transaction_date.substring(0, 7)
        if (trendDataMap.has(monthKey)) {
          const current = trendDataMap.get(monthKey)!
          if (t.type === 'income') current.income += t.amount
          if (t.type === 'expense') current.expense += t.amount
        }
      })

      const lineChartData = Array.from(trendDataMap.values())

      // --- Alerts: Categories in risk ---
      const riskCategories = budgets.map(b => {
        const spent = currentMonthTx
          .filter(t => t.type === 'expense' && t.category_id === b.category_id)
          .reduce((sum, t) => sum + t.amount, 0)
        
        const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0
        return {
          category: b.categories!,
          spent,
          budget: b.amount,
          percentage
        }
      }).filter(c => c.percentage >= 80).sort((a, b) => b.percentage - a.percentage)

      // --- Recent Transactions ---
      const recentTransactions = transactions.slice(0, 5)

      return {
        userSettings: settings,
        kpis: {
          currentIncome,
          incomeChange,
          currentExpense,
          expenseChange,
          currentBalance,
          savingsRate,
          budgetCompliance
        },
        charts: {
          donutData,
          top5Categories,
          lineChartData
        },
        alerts: riskCategories,
        recentTransactions
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
