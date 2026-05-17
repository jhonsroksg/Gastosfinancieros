'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts'
import { DashboardRecent } from '@/components/dashboard/DashboardRecent'
import { MonthSelector } from '@/components/budgets/MonthSelector'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data, isLoading, isError } = useDashboardData(currentDate)

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12 text-rose-500">
        Ocurrió un error al cargar los datos del dashboard.
      </div>
    )
  }

  const { userSettings, kpis, charts, alerts, recentTransactions } = data
  const firstName = userSettings?.full_name?.split(' ')[0] || 'Usuario'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hola, {firstName} <span className="inline-block animate-wave">👋</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Este es tu resumen financiero
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
        </div>
      </div>

      {/* Top 4 KPIs */}
      <DashboardKPIs kpis={kpis} />

      {/* Main Charts: Donut & Line Chart */}
      <DashboardCharts 
        donutData={charts.donutData}
        top5Categories={charts.top5Categories}
        lineChartData={charts.lineChartData}
      />

      {/* Alerts for budgets near limit */}
      {alerts.length > 0 && <DashboardAlerts alerts={alerts} />}

      {/* Recent Transactions List */}
      <DashboardRecent transactions={recentTransactions} />

    </div>
  )
}
