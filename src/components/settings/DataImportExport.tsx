import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { useQueryClient } from '@tanstack/react-query'
import { Transaction } from '@/types/database'

export function DataImportExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No user')

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, categories(name), subcategories(name)')
        .eq('user_id', userData.user.id)
        .order('transaction_date', { ascending: false })

      if (error) throw error

      if (!transactions || transactions.length === 0) {
        toast.info('No hay transacciones para exportar')
        return
      }

      // Format for CSV
      const csvData = transactions.map((t: any) => ({
        Fecha: t.transaction_date,
        Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
        Monto: t.amount,
        Moneda: t.currency,
        Categoria: t.categories?.name || 'Sin Categoría',
        Subcategoria: t.subcategories?.name || '',
        Descripcion: t.description || '',
      }))

      // Convert to CSV string using SheetJS (or manually)
      const ws = XLSX.utils.json_to_sheet(csvData)
      const csvString = XLSX.utils.sheet_to_csv(ws)
      
      // Download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finanzapp_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Exportación completada')
    } catch (e: any) {
      toast.error('Error al exportar: ' + e.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)

        if (data.length === 0) {
          throw new Error('El archivo está vacío')
        }

        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        if (!userId) throw new Error('No user auth')

        // Fetch user categories to map names to IDs
        const { data: categories } = await supabase.from('categories').select('*').eq('user_id', userId)
        
        let insertCount = 0
        const inserts: any[] = []

        // Very basic intelligent mapping
        // We assume columns might be named: Fecha/Date, Monto/Amount, Categoria/Category, Descripcion/Description
        for (const row of data as any[]) {
          const dateStr = row.Fecha || row.Date || row.fecha
          const amountStr = row.Monto || row.Amount || row.monto || row.Valor
          const categoryName = row.Categoria || row.Category || row.categoria
          const desc = row.Descripcion || row.Description || row.descripcion || ''
          const typeStr = row.Tipo || row.Type || row.tipo || ''

          if (!amountStr) continue // Skip empty rows

          // Parse Amount
          const amount = parseFloat(String(amountStr).replace(/[^0-9.-]+/g, ""))
          if (isNaN(amount)) continue

          // Parse Date (Excel dates can be numbers or strings)
          let parsedDate = new Date().toISOString().split('T')[0]
          if (typeof dateStr === 'number') {
            // Excel serial date to JS Date
            parsedDate = new Date((dateStr - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0]
          } else if (typeof dateStr === 'string') {
            parsedDate = new Date(dateStr).toISOString().split('T')[0]
          }

          // Map Category Name to ID
          let catId = null
          let catType = 'expense' // default
          if (categoryName) {
            const found = categories?.find((c: any) => c.name.toLowerCase() === String(categoryName).toLowerCase())
            if (found) {
              catId = found.id
              catType = found.type
            }
          }

          // If type is explicitly provided, override
          if (String(typeStr).toLowerCase().includes('ingreso') || String(typeStr).toLowerCase().includes('income')) {
            catType = 'income'
          }

          inserts.push({
            user_id: userId,
            category_id: catId,
            type: catType,
            amount: Math.abs(amount), // Ensure positive, type handles sign
            description: desc,
            transaction_date: parsedDate,
            currency: 'HNL'
          })
          insertCount++
        }

        if (inserts.length > 0) {
          const { error } = await supabase.from('transactions').insert(inserts)
          if (error) throw error
          
          toast.success(`Se importaron ${insertCount} transacciones con éxito.`)
          queryClient.invalidateQueries()
        } else {
          toast.warning('No se encontraron transacciones válidas para importar. Revisa las columnas de tu Excel.')
        }

      } catch (error: any) {
        toast.error('Error al importar: ' + error.message)
      } finally {
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            Importar desde Excel
          </CardTitle>
          <CardDescription>
            Sube tu plantilla antigua (.xlsx) para migrar tu historial. Asegúrate de tener columnas como: Fecha, Monto, Categoria, Descripcion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          <Button 
            className="w-full" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? 'Procesando...' : 'Seleccionar archivo Excel'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Exportar mis datos
          </CardTitle>
          <CardDescription>
            Descarga un respaldo en CSV de todas tus transacciones registradas hasta la fecha para abrirlo en Excel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline"
            className="w-full" 
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {isExporting ? 'Generando...' : 'Descargar CSV'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
