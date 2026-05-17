import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { Category } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as Icons from 'lucide-react'
import { Plus, Archive, ArchiveRestore, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'

export function CategoryManager() {
  // We want to see all categories here, including archived
  const { data: categories, isLoading } = useCategories(true)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense')
  const supabase = createClient()
  const queryClient = useQueryClient()

  if (isLoading) return <div>Cargando categorías...</div>

  const handleCreate = async () => {
    if (!newCatName.trim()) return

    const { data: userData } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('categories').insert({
      name: newCatName.trim(),
      type: newCatType,
      user_id: userData.user?.id,
      color: '#3b82f6', // Default beautiful blue color
      icon: 'Tag'
    })

    if (error) {
      toast.error('Error al crear categoría')
    } else {
      toast.success('Categoría creada')
      setNewCatName('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  }

  const handleToggleArchive = async (cat: Category) => {
    // Check if it's default
    if (cat.is_default) {
      toast.error('No puedes archivar categorías por defecto')
      return
    }

    const { error } = await supabase
      .from('categories')
      .update({ is_archived: !cat.is_archived })
      .eq('id', cat.id)

    if (error) {
      toast.error('Error al actualizar')
    } else {
      toast.success(cat.is_archived ? 'Categoría restaurada' : 'Categoría archivada')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  }

  const expenses = categories?.filter(c => c.type === 'expense') || []
  const incomes = categories?.filter(c => c.type === 'income') || []

  const CategoryRow = ({ cat }: { cat: Category }) => {
    // @ts-ignore
    const Icon = cat.icon ? Icons[cat.icon] || Icons.Circle : Icons.Circle

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editName, setEditName] = useState(cat.name)
    const [editColor, setEditColor] = useState(cat.color || '#94a3b8')
    const [editIconName, setEditIconName] = useState(cat.icon || 'Tag')

    const PRESET_COLORS = [
      '#ef4444', // Red
      '#f97316', // Orange
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#d946ef', // Fuchsia
      '#ec4899', // Pink
      '#64748b', // Slate
    ]

    const PRESET_ICONS = [
      'Home', 'Car', 'GraduationCap', 'Utensils', 'PawPrint', 'Heart',
      'Clapperboard', 'CreditCard', 'Landmark', 'PiggyBank', 'Gift',
      'Scale', 'Briefcase', 'TrendingUp', 'ShoppingBag', 'Tag',
      'Coffee', 'Gamepad', 'Music', 'Phone', 'Plane', 'Activity', 'ShieldCheck'
    ]

    const handleSave = async () => {
      if (!editName.trim()) return

      const { error } = await supabase
        .from('categories')
        .update({
          name: editName.trim(),
          color: editColor,
          icon: editIconName
        })
        .eq('id', cat.id)

      if (error) {
        toast.error('Error al actualizar categoría')
      } else {
        toast.success('Categoría actualizada con éxito')
        setIsEditOpen(false)
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      }
    }

    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg ${cat.is_archived ? 'bg-slate-50 dark:bg-slate-900 opacity-60' : 'bg-white dark:bg-slate-950'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md" style={{ backgroundColor: `${cat.color}20`, color: cat.color || '#94a3b8' }}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm flex items-center gap-2">
              {cat.name} 
              {cat.is_default && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Default</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Edit2 className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Nombre de la Categoría</label>
                  <Input 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Ej. Restaurantes"
                  />
                </div>

                {/* Color Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Color Distintivo</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${editColor === c ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Seleccionar Icono</label>
                  <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto p-1 border rounded-lg bg-slate-50 dark:bg-slate-900">
                    {PRESET_ICONS.map(iconName => {
                      // @ts-ignore
                      const PreviewIcon = Icons[iconName] || Icons.Circle
                      const isSelected = editIconName === iconName

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setEditIconName(iconName)}
                          className={`flex items-center justify-center p-2 rounded-lg transition-all ${isSelected ? 'bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          style={{ color: isSelected ? editColor : '#64748b' }}
                        >
                          <PreviewIcon className="w-5 h-5" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!editName.trim()}>
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!cat.is_default && (
            <Button variant="ghost" size="icon" onClick={() => handleToggleArchive(cat)}>
              {cat.is_archived ? <ArchiveRestore className="w-4 h-4 text-emerald-600" /> : <Archive className="w-4 h-4 text-slate-400 hover:text-rose-500" />}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Create New */}
      <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-4">
        <h3 className="font-medium">Nueva Categoría Personalizada</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            placeholder="Nombre (ej. Salud Privada)" 
            value={newCatName} 
            onChange={e => setNewCatName(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button 
              type="button"
              variant={newCatType === 'expense' ? 'default' : 'outline'}
              onClick={() => setNewCatType('expense')}
            >Gastos</Button>
            <Button 
              type="button"
              variant={newCatType === 'income' ? 'default' : 'outline'}
              onClick={() => setNewCatType('income')}
            >Ingresos</Button>
          </div>
          <Button onClick={handleCreate} disabled={!newCatName.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Agregar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-rose-500 flex items-center gap-2">
            Gastos ({expenses.length})
          </h3>
          <div className="space-y-2">
            {expenses.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-emerald-600 flex items-center gap-2">
            Ingresos ({incomes.length})
          </h3>
          <div className="space-y-2">
            {incomes.map(cat => <CategoryRow key={cat.id} cat={cat} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
