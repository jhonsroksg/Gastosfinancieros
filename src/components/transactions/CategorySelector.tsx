import { useCategories } from '@/hooks/useCategories'
import { Skeleton } from '@/components/ui/skeleton'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategorySelectorProps {
  type: 'income' | 'expense'
  value: string | null
  onChange: (value: string) => void
}

export function CategorySelector({ type, value, onChange }: CategorySelectorProps) {
  const { data: categories, isLoading } = useCategories()

  const filteredCategories = categories?.filter((c) => c.type === type) || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 min-h-[90px] gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-14 h-3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto p-1">
      {filteredCategories.map((category) => {
        // @ts-ignore
        const IconComponent = category.icon ? Icons[category.icon] || Icons.Tag : Icons.Tag
        const isSelected = value === category.id

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-2 focus:outline-none min-h-[90px]",
              isSelected
                ? "bg-white dark:bg-slate-950 shadow-sm font-semibold"
                : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
            style={{
              borderColor: isSelected ? category.color || '#3b82f6' : undefined,
              boxShadow: isSelected ? `0 0 0 1.5px ${category.color || '#3b82f6'}` : undefined
            }}
          >
            <div 
              className="p-1.5 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: `${category.color || '#3b82f6'}15`,
                color: category.color || '#3b82f6'
              }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight break-words max-w-full">
              {category.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
