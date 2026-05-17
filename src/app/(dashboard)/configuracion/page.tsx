'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { DataImportExport } from '@/components/settings/DataImportExport'
import { DangerZone } from '@/components/settings/DangerZone'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Gestiona tu cuenta, personaliza tus categorías y exporta tus datos
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="datos">Datos y Respaldo</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-8">
          <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-4">Ajustes Personales</h3>
            <ProfileSettings />
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-8">
          <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-1">Tus Categorías</h3>
            <p className="text-sm text-slate-500 mb-6">Agrega nuevas o archiva las que ya no utilizas</p>
            <CategoryManager />
          </div>
        </TabsContent>

        <TabsContent value="datos" className="space-y-8">
          <DataImportExport />
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  )
}
