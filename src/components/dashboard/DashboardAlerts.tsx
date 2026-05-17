import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/currency'

interface DashboardAlertsProps {
  alerts: {
    category: { name: string; color: string | null }
    spent: number
    budget: number
    percentage: number
  }[]
}

export function DashboardAlerts({ alerts }: DashboardAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center text-orange-600 dark:text-orange-500">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Categorías cerca del límite
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const remaining = alert.budget - alert.spent
            const isExceeded = remaining < 0

            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: alert.category.color || '#cbd5e1' }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {alert.category.name}:
                  </span>
                  <span className={isExceeded ? 'text-rose-600 font-semibold' : 'text-orange-600 font-medium'}>
                    {alert.percentage.toFixed(0)}% usado
                  </span>
                </div>
                <div className="text-slate-500">
                  {isExceeded ? (
                    <span className="text-rose-500">Excedido por {formatCurrency(Math.abs(remaining))}</span>
                  ) : (
                    <span>quedan {formatCurrency(remaining)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
