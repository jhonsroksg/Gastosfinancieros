import { format, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonthSelectorProps {
  currentDate: Date
  onChange: (date: Date) => void
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  const handlePrev = () => onChange(subMonths(currentDate, 1))
  const handleNext = () => onChange(addMonths(currentDate, 1))
  const handleToday = () => onChange(new Date())

  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
      <Button variant="ghost" size="icon" onClick={handlePrev}>
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold capitalize">
          {format(currentDate, 'MMMM', { locale: es })}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          {format(currentDate, 'yyyy')}
        </span>
      </div>

      <Button variant="ghost" size="icon" onClick={handleNext}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
