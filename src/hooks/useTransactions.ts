import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types/database'
import { toast } from 'sonner'

const PAGE_SIZE = 20

export function useInfiniteTransactions(filters?: { type?: 'income' | 'expense'; month?: string; categoryId?: string }) {
  const supabase = createClient()

  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('transactions')
        .select('*, categories(*), subcategories(*)', { count: 'exact' })
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters?.month) {
        // month is YYYY-MM
        const startDate = `${filters.month}-01`
        const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString().split('T')[0]
        query = query.gte('transaction_date', startDate).lt('transaction_date', endDate)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data as Transaction[],
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
        count,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

export function useCreateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTransaction: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transacción registrada')
    },
    onError: (error) => {
      toast.error('Error al guardar la transacción: ' + error.message)
    },
  })
}

export function useDeleteTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transacción eliminada')
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message)
    },
  })
}

export function useUpdateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transacción actualizada')
    },
    onError: (error) => {
      toast.error('Error al actualizar la transacción: ' + error.message)
    },
  })
}
