import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { RecurringTransaction } from '@/types/database'
import { toast } from 'sonner'

export function useRecurringTransactions() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recurring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*, categories(*), subcategories(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as RecurringTransaction[]
    },
  })
}

export function useCreateRecurring() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRec: Partial<RecurringTransaction>) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([newRec])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success('Recurrencia creada')
    },
    onError: (error) => {
      toast.error('Error al crear recurrencia: ' + error.message)
    },
  })
}

export function useUpdateRecurring() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message)
    },
  })
}

export function useDeleteRecurring() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success('Recurrencia eliminada')
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message)
    },
  })
}
