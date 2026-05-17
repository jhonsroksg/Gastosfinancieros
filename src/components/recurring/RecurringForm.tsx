import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateRecurring, useUpdateRecurring } from '@/hooks/useRecurring'
import { RecurringTransaction } from '@/types/database'
import { useAuthUser } from '@/hooks/useAuthUser'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CategorySelector } from '../transactions/CategorySelector'

const recurringSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive({ message: 'Debe ser mayor a 0' }),
  category_id: z.string().min(1, { message: 'Selecciona una categoría' }),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
  day_of_month: z.number().min(1).max(31).optional().nullable(),
  day_of_week: z.number().min(0).max(6).optional().nullable(),
  start_date: z.string(), // YYYY-MM-DD
  is_active: z.boolean(),
})

type RecurringFormValues = z.infer<typeof recurringSchema>

interface RecurringFormProps {
  initialData?: RecurringTransaction
  onSuccess?: () => void
}

export function RecurringForm({ initialData, onSuccess }: RecurringFormProps) {
  const createMutation = useCreateRecurring()
  const updateMutation = useUpdateRecurring()
  const user = useAuthUser()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: initialData ? {
      type: initialData.type,
      amount: initialData.amount,
      category_id: initialData.category_id || '',
      description: initialData.description || '',
      frequency: initialData.frequency,
      day_of_month: initialData.day_of_month,
      day_of_week: initialData.day_of_week,
      start_date: initialData.start_date,
      is_active: initialData.is_active,
    } : {
      type: 'expense',
      amount: undefined,
      description: '',
      frequency: 'monthly',
      day_of_month: new Date().getDate(),
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
    },
  })

  const selectedType = watch('type')
  const frequency = watch('frequency')

  const onSubmit = async (data: RecurringFormValues) => {
    if (!user) return

    try {
      if (initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          ...data,
        })
      } else {
        await createMutation.mutateAsync({
          user_id: user.id,
          ...data,
        })
      }
      onSuccess?.()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <>
              <Button
                type="button"
                variant={field.value === 'expense' ? 'default' : 'outline'}
                className={field.value === 'expense' ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}
                onClick={() => field.onChange('expense')}
              >
                Gasto
              </Button>
              <Button
                type="button"
                variant={field.value === 'income' ? 'default' : 'outline'}
                className={field.value === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                onClick={() => field.onChange('income')}
              >
                Ingreso
              </Button>
            </>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Monto</Label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
              value={field.value || ''}
            />
          )}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input placeholder="Ej. Pago de Netflix" {...field} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <CategorySelector
              type={selectedType}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Frecuencia</Label>
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diaria</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Fecha de inicio</Label>
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <Input type="date" {...field} />
            )}
          />
        </div>
      </div>

      {frequency === 'monthly' && (
        <div className="space-y-2">
          <Label>Día del mes</Label>
          <Controller
            name="day_of_month"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min="1"
                max="31"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                value={field.value || ''}
              />
            )}
          />
        </div>
      )}

      {frequency === 'weekly' && (
        <div className="space-y-2">
          <Label>Día de la semana (0=Dom, 6=Sáb)</Label>
          <Controller
            name="day_of_week"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min="0"
                max="6"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                value={field.value || ''}
              />
            )}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-900">
        <div className="space-y-0.5">
          <Label className="text-base">Recurrencia activa</Label>
          <p className="text-sm text-muted-foreground">Generar transacciones automáticamente</p>
        </div>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar Recurrencia'}
      </Button>
    </form>
  )
}
