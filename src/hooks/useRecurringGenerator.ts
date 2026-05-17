import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPendingExecutionDates } from '@/lib/utils/recurring'

export function useRecurringGenerator() {
  const hasRun = useRef(false)

  useEffect(() => {
    // Only run once per session load
    if (hasRun.current) return
    hasRun.current = true

    const runGenerator = async () => {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      // Fetch active recurring transactions
      const { data: recurringList, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('is_active', true)

      if (fetchError || !recurringList) return

      const today = new Date()
      let transactionsToInsert: any[] = []
      let updatesToRecurring: { id: string; last_generated_date: string }[] = []

      for (const recurring of recurringList) {
        const pendingDates = getPendingExecutionDates(recurring, today)
        
        if (pendingDates.length > 0) {
          // Generate new transactions for each missing date
          for (const date of pendingDates) {
            transactionsToInsert.push({
              user_id: userData.user.id,
              category_id: recurring.category_id,
              subcategory_id: recurring.subcategory_id,
              type: recurring.type,
              amount: recurring.amount,
              description: recurring.description || `Generado automáticamente (Recurrencia)`,
              transaction_date: date.toISOString().split('T')[0],
              currency: 'HNL', // Default currency
              recurring_id: recurring.id
            })
          }
          
          // The last date is the most recent we generated
          const lastDate = pendingDates[pendingDates.length - 1]
          updatesToRecurring.push({
            id: recurring.id,
            last_generated_date: lastDate.toISOString().split('T')[0]
          })
        }
      }

      if (transactionsToInsert.length > 0) {
        // Insert transactions
        const { error: insertError } = await supabase
          .from('transactions')
          .insert(transactionsToInsert)
          
        if (insertError) {
          console.error('Failed to generate recurring transactions', insertError)
          return
        }

        // Update recurring records with new last_generated_date
        // Supabase JS doesn't have a bulk update with different values easily without RPC,
        // so we'll do it iteratively for simplicity (usually a small number of active recurring)
        for (const update of updatesToRecurring) {
          await supabase
            .from('recurring_transactions')
            .update({ last_generated_date: update.last_generated_date })
            .eq('id', update.id)
        }
        
        console.log(`Generated ${transactionsToInsert.length} pending transactions.`)
      }
    }

    runGenerator()
  }, [])
}
