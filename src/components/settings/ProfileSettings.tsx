import { useUserSettings, useUpdateSettings } from '@/hooks/useUserSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ProfileSettings() {
  const { data: settings, isLoading } = useUserSettings()
  const updateMutation = useUpdateSettings()
  const { theme, setTheme } = useTheme()

  const [formData, setFormData] = useState({
    full_name: '',
    default_currency: 'HNL',
    monthly_income_goal: '',
    notifications_enabled: true
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        full_name: settings.full_name || '',
        default_currency: settings.default_currency || 'HNL',
        monthly_income_goal: settings.monthly_income_goal ? settings.monthly_income_goal.toString() : '',
        notifications_enabled: settings.notifications_enabled ?? true
      })
    }
  }, [settings])

  if (isLoading) return <div>Cargando perfil...</div>

  const handleSave = () => {
    updateMutation.mutate({
      full_name: formData.full_name,
      default_currency: formData.default_currency,
      monthly_income_goal: formData.monthly_income_goal ? parseFloat(formData.monthly_income_goal) : null,
      notifications_enabled: formData.notifications_enabled
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input 
            value={formData.full_name} 
            onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div className="space-y-2">
          <Label>Moneda Principal</Label>
          <Select 
            value={formData.default_currency} 
            onValueChange={v => setFormData(p => ({ ...p, default_currency: v || 'HNL' }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HNL">Lempira (HNL)</SelectItem>
              <SelectItem value="USD">Dólar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
              <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tema Visual</Label>
          <Select 
            value={theme} 
            onValueChange={v => {
              setTheme(v || 'system')
              updateMutation.mutate({ theme: v || 'system' })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Meta de Ingreso Mensual</Label>
          <Input 
            type="number"
            value={formData.monthly_income_goal} 
            onChange={e => setFormData(p => ({ ...p, monthly_income_goal: e.target.value }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-900">
        <div className="space-y-0.5">
          <Label className="text-base">Notificaciones</Label>
          <p className="text-sm text-muted-foreground">Recibir alertas de presupuesto</p>
        </div>
        <Switch 
          checked={formData.notifications_enabled} 
          onCheckedChange={v => setFormData(p => ({ ...p, notifications_enabled: v }))} 
        />
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  )
}
