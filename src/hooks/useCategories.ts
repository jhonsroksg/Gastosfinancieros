import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Category, Subcategory } from '@/types/database'

export function useCategories(includeArchived = false) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['categories', includeArchived],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        
      if (!includeArchived) {
        query = query.eq('is_archived', false)
      }

      const { data, error } = await query.order('name')

      if (error) throw error
      return data as Category[]
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useSubcategories(categoryId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      if (!categoryId) return []
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name')

      if (error) throw error
      return data as Subcategory[]
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
