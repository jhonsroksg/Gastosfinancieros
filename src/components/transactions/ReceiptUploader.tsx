import { useState, useRef } from 'react'
import { Camera, Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReceiptUploaderProps {
  onFileSelect: (file: File | null) => void
}

export function ReceiptUploader({ onFileSelect }: ReceiptUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe exceder 5MB')
      return
    }

    onFileSelect(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // It's a PDF or other type
      setPreview('document')
    }
  }

  const clearFile = () => {
    setPreview(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Recibo (opcional)
      </label>
      
      {!preview ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Subir archivo
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-dashed sm:hidden"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = "environment"
                fileInputRef.current.accept = "image/*"
                fileInputRef.current.click()
              }
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            Tomar foto
          </Button>
        </div>
      ) : (
        <div className="relative inline-block border rounded-lg overflow-hidden group w-full h-32 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          {preview === 'document' ? (
            <div className="flex flex-col items-center text-slate-500">
              <Paperclip className="w-8 h-8 mb-2" />
              <span className="text-sm">Documento adjunto</span>
            </div>
          ) : (
            <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
          )}
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearFile}
            >
              <X className="w-4 h-4 mr-2" /> Quitar
            </Button>
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, application/pdf"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">JPG, PNG, PDF. Máximo 5MB.</p>
    </div>
  )
}
