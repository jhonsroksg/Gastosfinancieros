import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useSubcategories } from '@/hooks/useCategories'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { CategorySelector } from './CategorySelector'
import { TransactionDatePicker } from './TransactionDatePicker'
import { ReceiptUploader } from './ReceiptUploader'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  category_id: z.string().min(1, { message: 'Selecciona una categoría' }),
  subcategory_id: z.string().optional(),
  transaction_date: z.date(),
  description: z.string().max(200).optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  onSuccess?: () => void
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateTransaction()
  const supabase = createClient()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      transaction_date: new Date(),
      description: '',
    },
  })

  const selectedType = watch('type')
  const selectedCategoryId = watch('category_id')
  
  const { data: subcategories } = useSubcategories(selectedCategoryId)

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('Usuario no autenticado')

      const transactionId = crypto.randomUUID()
      let receipt_url = null
      let receipt_filename = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${user.id}/${transactionId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        receipt_url = filePath
        receipt_filename = file.name
      }

      await createMutation.mutateAsync({
        id: transactionId,
        user_id: user.id,
        type: data.type,
        amount: data.amount,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        transaction_date: data.transaction_date.toISOString().split('T')[0],
        description: data.description,
        receipt_url,
        receipt_filename,
      })

      if (isRecurring) {
        // Here we would trigger Mission 4 logic
        console.log('User wants to make this recurring')
      }

      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      // Error is handled by mutation toast
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                Gasto
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Ingreso
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      <div className="space-y-2">
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10 h-16 text-3xl font-bold rounded-2xl"
                autoFocus
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                value={field.value || ''}
              />
            </div>
          )}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
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
              onChange={(val) => {
                field.onChange(val)
                setValue('subcategory_id', undefined)
              }}
            />
          )}
        />
        {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
      </div>

      {subcategories && subcategories.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label>Subcategoría</Label>
          <div className="flex flex-wrap gap-2">
            <Controller
              name="subcategory_id"
              control={control}
              render={({ field }) => (
                <>
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => field.onChange(sub.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        field.value === sub.id
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </>
              )}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Fecha</Label>
        <Controller
          name="transaction_date"
          control={control}
          render={({ field }) => (
            <TransactionDatePicker date={field.value} setDate={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Descripción (opcional)</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              placeholder="Ej. Almuerzo con clientes"
              className="resize-none"
              {...field}
            />
          )}
        />
      </div>

      <ReceiptUploader onFileSelect={setFile} />

      <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-900">
        <div className="space-y-0.5">
          <Label className="text-base">Hacer recurrente</Label>
          <p className="text-sm text-muted-foreground">Repetir este gasto automáticamente</p>
        </div>
        <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
      </div>

      <Button
        type="submit"
        className={`w-full h-12 text-lg font-bold rounded-xl text-white ${
          selectedType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
