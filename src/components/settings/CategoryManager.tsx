import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { Category } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as Icons from 'lucide-react'
import { Plus, Archive, ArchiveRestore } from 'lucide-react'

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
      color: '#94a3b8', // Default slate color
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

    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg ${cat.is_archived ? 'bg-slate-50 dark:bg-slate-900 opacity-60' : 'bg-white dark:bg-slate-950'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md" style={{ backgroundColor: `${cat.color}20`, color: cat.color || '#94a3b8' }}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{cat.name} {cat.is_default && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-2">Default</span>}</p>
          </div>
        </div>
        {!cat.is_default && (
          <Button variant="ghost" size="icon" onClick={() => handleToggleArchive(cat)}>
            {cat.is_archived ? <ArchiveRestore className="w-4 h-4 text-emerald-600" /> : <Archive className="w-4 h-4 text-slate-400 hover:text-rose-500" />}
          </Button>
        )}
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
