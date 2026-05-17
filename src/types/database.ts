export type Category = {
  id: string
  user_id?: string | null
  name: string
  type: 'income' | 'expense'
  icon: string | null
  color: string | null
  is_default: boolean
  is_archived: boolean
  created_at: string
}

export type Subcategory = {
  id: string
  category_id: string
  user_id: string
  name: string
  created_at: string
}

export type Transaction = {
  id: string
  user_id: string
  category_id: string | null
  subcategory_id: string | null
  type: 'income' | 'expense'
  amount: number
  currency: string
  description: string | null
  transaction_date: string
  receipt_url: string | null
  receipt_filename: string | null
  recurring_id: string | null
  created_at: string
  updated_at?: string
  
  categories?: Category | null
  subcategories?: Subcategory | null
}

export type RecurringTransaction = {
  id: string
  user_id: string
  category_id: string | null
  subcategory_id: string | null
  type: 'income' | 'expense'
  amount: number
  description: string | null
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  day_of_month: number | null
  day_of_week: number | null
  start_date: string
  end_date: string | null
  is_active: boolean
  last_generated_date: string | null
  created_at: string
  
  // Joins
  categories?: Category | null
  subcategories?: Subcategory | null
}

export type Budget = {
  id: string
  user_id: string
  category_id: string
  subcategory_id: string | null
  amount: number
  month: number
  year: number
  created_at: string
  
  // Joins
  categories?: Category | null
  subcategories?: Subcategory | null
}

