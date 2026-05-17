import { Category, Transaction, Budget, RecurringTransaction } from '@/types/database'

// Default categories matching schema.sql
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-alojamiento', name: 'Alojamiento y servicios', type: 'expense', icon: 'Home', color: '#3b82f6', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-prestamos', name: 'Préstamos y deudas', type: 'expense', icon: 'CreditCard', color: '#ef4444', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-alimentacion', name: 'Alimentación y supermercado', type: 'expense', icon: 'ShoppingBag', color: '#f59e0b', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-transporte', name: 'Transporte y auto', type: 'expense', icon: 'Car', color: '#10b981', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-seguros', name: 'Seguros y salud', type: 'expense', icon: 'Heart', color: '#ec4899', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-ocio', name: 'Ocio y tiempo libre', type: 'expense', icon: 'Compass', color: '#8b5cf6', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-salario', name: 'Salario', type: 'income', icon: 'Briefcase', color: '#10b981', is_default: true, is_archived: false, created_at: '' },
  { id: 'cat-inversiones', name: 'Inversiones', type: 'income', icon: 'TrendingUp', color: '#3b82f6', is_default: true, is_archived: false, created_at: '' },
]

// Mock initial data if localStorage is empty
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'mock-user',
    category_id: 'cat-salario',
    subcategory_id: null,
    type: 'income',
    amount: 35000,
    description: 'Salario Quincenal',
    transaction_date: new Date().toISOString().split('T')[0],
    currency: 'HNL',
    receipt_url: null,
    receipt_filename: null,
    recurring_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-2',
    user_id: 'mock-user',
    category_id: 'cat-alojamiento',
    subcategory_id: null,
    type: 'expense',
    amount: 12000,
    description: 'Pago Renta del Mes',
    transaction_date: new Date().toISOString().split('T')[0],
    currency: 'HNL',
    receipt_url: null,
    receipt_filename: null,
    recurring_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-3',
    user_id: 'mock-user',
    category_id: 'cat-alimentacion',
    subcategory_id: null,
    type: 'expense',
    amount: 1850,
    description: 'Supermercado semanal',
    transaction_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
    currency: 'HNL',
    receipt_url: null,
    receipt_filename: null,
    recurring_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-4',
    user_id: 'mock-user',
    category_id: 'cat-transporte',
    subcategory_id: null,
    type: 'expense',
    amount: 500,
    description: 'Combustible',
    transaction_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    currency: 'HNL',
    receipt_url: null,
    receipt_filename: null,
    recurring_id: null,
    created_at: new Date().toISOString()
  }
]

const INITIAL_BUDGETS: Budget[] = [
  { id: 'b-1', user_id: 'mock-user', category_id: 'cat-alojamiento', subcategory_id: null, amount: 15000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), created_at: '' },
  { id: 'b-2', user_id: 'mock-user', category_id: 'cat-alimentacion', subcategory_id: null, amount: 8000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), created_at: '' },
  { id: 'b-3', user_id: 'mock-user', category_id: 'cat-transporte', subcategory_id: null, amount: 3000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), created_at: '' },
]

const INITIAL_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-1',
    user_id: 'mock-user',
    category_id: 'cat-alojamiento',
    subcategory_id: null,
    type: 'expense',
    amount: 12000,
    description: 'Pago Renta',
    frequency: 'monthly',
    day_of_month: 5,
    day_of_week: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true,
    last_generated_date: null,
    created_at: new Date().toISOString()
  }
]

// Initialize LocalStorage helpers
function getLocalData<T>(key: string, initial: T[]): T[] {
  if (typeof window === 'undefined') return initial
  const val = localStorage.getItem(key)
  if (!val) {
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(val)
}

function setLocalData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function createMockSupabaseClient() {
  const getCategories = () => getLocalData('finanzapp_categories', DEFAULT_CATEGORIES)
  const getTransactions = () => getLocalData('finanzapp_transactions', INITIAL_TRANSACTIONS)
  const getBudgets = () => getLocalData('finanzapp_budgets', INITIAL_BUDGETS)
  const getRecurring = () => getLocalData('finanzapp_recurring', INITIAL_RECURRING)
  
  const getSettings = () => {
    if (typeof window === 'undefined') return {}
    const val = localStorage.getItem('finanzapp_settings')
    if (!val) {
      const initial = {
        user_id: 'mock-user',
        full_name: 'Usuario Local',
        default_currency: 'HNL',
        theme: 'system',
        monthly_income_goal: 50000,
        notifications_enabled: true
      }
      localStorage.setItem('finanzapp_settings', JSON.stringify(initial))
      return initial
    }
    return JSON.parse(val)
  }

  const queryState = {
    table: '',
    filters: [] as any[],
    orderCol: '',
    orderAsc: true,
    limitVal: null as number | null,
    rangeFrom: null as number | null,
    rangeTo: null as number | null
  }

  const mockBuilder = (table: string) => {
    queryState.table = table
    
    const builder: any = {
      select: (fields?: string) => builder,
      insert: (records: any) => {
        const list = getLocalData(`finanzapp_${table}`, [])
        const toAdd = Array.isArray(records) ? records : [records]
        const withIds = toAdd.map(r => ({
          id: r.id || `${table}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          ...r
        }))
        setLocalData(`finanzapp_${table}`, [...list, ...withIds])
        
        // Mock chain resolve response
        builder.mockResponse = { data: Array.isArray(records) ? withIds : withIds[0], error: null }
        return builder
      },
      update: (fields: any) => {
        builder.updateFields = fields
        return builder
      },
      upsert: (records: any, options?: any) => {
        const list = getLocalData(`finanzapp_${table}`, [])
        const toAdd = Array.isArray(records) ? records : [records]
        
        const newList = [...list]
        toAdd.forEach(rec => {
          // simple check by id or categories
          const idx = newList.findIndex((x: any) => x.id === rec.id || (table === 'budgets' && x.category_id === rec.category_id && x.month === rec.month && x.year === rec.year))
          if (idx !== -1) {
            newList[idx] = { ...newList[idx], ...rec }
          } else {
            newList.push({
              id: rec.id || `${table}-${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString(),
              ...rec
            })
          }
        })
        setLocalData(`finanzapp_${table}`, newList)
        builder.mockResponse = { data: records, error: null }
        return builder
      },
      delete: () => {
        builder.isDelete = true
        return builder
      },
      eq: (col: string, val: any) => {
        queryState.filters.push({ type: 'eq', col, val })
        return builder
      },
      gte: (col: string, val: any) => {
        queryState.filters.push({ type: 'gte', col, val })
        return builder
      },
      lte: (col: string, val: any) => {
        queryState.filters.push({ type: 'lte', col, val })
        return builder
      },
      lt: (col: string, val: any) => {
        queryState.filters.push({ type: 'lt', col, val })
        return builder
      },
      range: (from: number, to: number) => {
        queryState.rangeFrom = from
        queryState.rangeTo = to
        return builder
      },
      order: (col: string, options?: any) => {
        queryState.orderCol = col
        queryState.orderAsc = options?.ascending !== false
        return builder
      },
      limit: (val: number) => {
        queryState.limitVal = val
        return builder
      },
      single: async () => {
        const result = await builder.execute()
        return { data: Array.isArray(result.data) ? result.data[0] : result.data, error: result.error }
      },
      // support both promise then-able and direct calls
      then: async (resolve: any) => {
        const response = await builder.execute()
        resolve(response)
      },
      execute: async () => {
        if (builder.mockResponse) return builder.mockResponse
        
        let list: any[] = []
        if (table === 'categories') list = getCategories()
        else if (table === 'transactions') list = getTransactions()
        else if (table === 'budgets') list = getBudgets()
        else if (table === 'recurring_transactions') list = getRecurring()
        else if (table === 'user_settings') return { data: getSettings(), error: null }

        // Apply filters
        queryState.filters.forEach(filter => {
          if (filter.type === 'eq') {
            list = list.filter(item => item[filter.col] === filter.val)
          } else if (filter.type === 'gte') {
            list = list.filter(item => item[filter.col] >= filter.val)
          } else if (filter.type === 'lte') {
            list = list.filter(item => item[filter.col] <= filter.val)
          } else if (filter.type === 'lt') {
            list = list.filter(item => item[filter.col] < filter.val)
          }
        })

        // Apply update or delete if queued
        if (builder.updateFields) {
          const allList = getLocalData(`finanzapp_${table}`, [])
          // find items matching filters in the full list
          const newList = allList.map((item: any) => {
            const matchesAll = queryState.filters.every(f => item[f.col] === f.val)
            return matchesAll ? { ...item, ...builder.updateFields } : item
          })
          setLocalData(`finanzapp_${table}`, newList)
          return { data: builder.updateFields, error: null }
        }

        if (builder.isDelete) {
          const allList = getLocalData(`finanzapp_${table}`, [])
          const newList = allList.filter((item: any) => {
            const matchesAll = queryState.filters.every(f => item[f.col] === f.val)
            return !matchesAll
          })
          setLocalData(`finanzapp_${table}`, newList)
          return { data: null, error: null }
        }

        // Apply Join mocks for Categories & Subcategories
        if (table === 'transactions' || table === 'budgets' || table === 'recurring_transactions') {
          const cats = getCategories()
          list = list.map(item => ({
            ...item,
            categories: cats.find(c => c.id === item.category_id) || null
          }))
        }

        // Sort
        if (queryState.orderCol) {
          list.sort((a, b) => {
            const valA = a[queryState.orderCol]
            const valB = b[queryState.orderCol]
            if (valA < valB) return queryState.orderAsc ? -1 : 1
            if (valA > valB) return queryState.orderAsc ? 1 : -1
            return 0
          })
        }

        if (queryState.limitVal) {
          list = list.slice(0, queryState.limitVal)
        }

        if (queryState.rangeFrom !== null && queryState.rangeTo !== null) {
          list = list.slice(queryState.rangeFrom, queryState.rangeTo + 1)
        }

        // Reset state
        queryState.filters = []
        queryState.orderCol = ''
        queryState.limitVal = null
        queryState.rangeFrom = null
        queryState.rangeTo = null

        return { data: list, error: null }
      }
    }
    return builder
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'mock-user', email: 'local@finanzapp.com' } }, error: null }),
      signUp: async () => ({ data: { user: { id: 'mock-user', email: 'local@finanzapp.com' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'mock-user', email: 'local@finanzapp.com' } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: mockBuilder,
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-receipt.png' }, error: null }),
        createSignedUrl: async () => ({ data: { signedUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400' }, error: null })
      })
    }
  }
}
