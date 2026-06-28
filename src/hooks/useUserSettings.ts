import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type UserSettings = {
  user_id: string
  default_currency: string
  full_name: string | null
  avatar_url: string | null
  theme: string
  monthly_income_goal: number | null
  notifications_enabled: boolean
}

export function useUserSettings() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('No auth')

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .single()

      if (error) throw error
      return data as UserSettings
    },
  })
}

export function useUpdateSettings() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) throw new Error('No auth')

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userData.user.id,
          ...updates
        })
        .select()
        .single()

      if (error) throw error
      return data as UserSettings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
      toast.success('Configuración guardada')
    },
    onError: (error) => {
      toast.error('Error al guardar: ' + error.message)
    },
  })
}
