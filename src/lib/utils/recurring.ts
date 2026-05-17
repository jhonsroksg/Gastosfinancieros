import { addDays, addMonths, addWeeks, addYears, differenceInDays, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns'
import { RecurringTransaction } from '@/types/database'

/**
 * Calculates the next dates a recurring transaction should be executed
 * starting from `lastGenerated` (exclusive) up to `targetDate` (inclusive).
 */
export function getPendingExecutionDates(
  recurring: RecurringTransaction,
  targetDate: Date = new Date()
): Date[] {
  const dates: Date[] = []
  
  if (!recurring.is_active) return dates

  const start = startOfDay(new Date(recurring.start_date))
  const end = recurring.end_date ? startOfDay(new Date(recurring.end_date)) : null
  const target = startOfDay(targetDate)
  
  // If it hasn't even started or ended before target, return empty
  if (isAfter(start, target)) return dates
  if (end && isBefore(end, target) && isBefore(end, start)) return dates

  // Last generated date or start date minus 1 day (so it generates on start date if applicable)
  let current = recurring.last_generated_date 
    ? startOfDay(new Date(recurring.last_generated_date))
    : addDays(start, -1)
  
  // If last generated is after target, nothing to do
  if (isAfter(current, target) || isSameDay(current, target)) return dates

  // Generate next date function based on frequency
  const getNextDate = (date: Date): Date => {
    switch (recurring.frequency) {
      case 'daily':
        return addDays(date, 1)
      case 'weekly':
        return addWeeks(date, 1)
      case 'biweekly':
        return addWeeks(date, 2)
      case 'monthly':
        return addMonths(date, 1)
      case 'yearly':
        return addYears(date, 1)
      default:
        return addMonths(date, 1)
    }
  }

  // Iterate to find all missed dates
  while (true) {
    current = getNextDate(current)
    
    // If we passed the end date, stop
    if (end && isAfter(current, end)) break
    
    // If we passed the target date, stop
    if (isAfter(current, target)) break
    
    // If it's valid, add it
    if (!isBefore(current, start)) {
      // Small adjustment for specific day requirements
      if (recurring.frequency === 'monthly' && recurring.day_of_month) {
        // Adjust current to specific day if needed, but simple addMonths handles same-day generally.
        // For strict matching:
        const candidate = new Date(current)
        candidate.setDate(Math.min(recurring.day_of_month, new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate()))
        if (!isAfter(candidate, target)) dates.push(candidate)
      } else {
        dates.push(current)
      }
    }
  }

  return dates
}
