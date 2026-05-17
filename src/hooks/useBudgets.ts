import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Budget } from '@/types/database'
import { toast } from 'sonner'

export function useBudgets(month: number, year: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, categories(*), subcategories(*)')
        .eq('month', month)
        .eq('year', year)

      if (error) throw error
      return data as Budget[]
    },
  })
}

export function useUpsertBudget() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (budget: Partial<Budget> & { category_id: string; month: number; year: number }) => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('No auth')

      const { data, error } = await supabase
        .from('budgets')
        .upsert([{ ...budget, user_id: userData.user.id }], { 
          onConflict: 'user_id,category_id,subcategory_id,month,year',
          ignoreDuplicates: false
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.month, variables.year] })
    },
    onError: (error) => {
      toast.error('Error al guardar presupuesto: ' + error.message)
    },
  })
}

export function useCopyBudgets() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fromMonth, fromYear, toMonth, toYear }: { fromMonth: number, fromYear: number, toMonth: number, toYear: number }) => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('No auth')

      // Fetch from previous
      const { data: previousBudgets, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', fromMonth)
        .eq('year', fromYear)

      if (fetchError) throw fetchError
      if (!previousBudgets || previousBudgets.length === 0) {
        throw new Error('No hay presupuestos en el mes anterior para copiar')
      }

      // Format for new month
      const newBudgets = previousBudgets.map(b => ({
        user_id: userData.user.id,
        category_id: b.category_id,
        subcategory_id: b.subcategory_id,
        amount: b.amount,
        month: toMonth,
        year: toYear,
      }))

      const { data, error } = await supabase
        .from('budgets')
        .upsert(newBudgets, { 
          onConflict: 'user_id,category_id,subcategory_id,month,year',
          ignoreDuplicates: false
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.toMonth, variables.toYear] })
      toast.success('Presupuesto copiado correctamente')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
