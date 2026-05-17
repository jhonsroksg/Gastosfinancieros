# FinanzApp 💰

Una aplicación web moderna, responsiva y rápida para el control de tus gastos personales. 
Construida con **Next.js 14**, **Supabase**, **Tailwind CSS v4** y **React Query**.

## Características Principales ✨

- **Registro Rápido**: Formulario de un solo clic con atajos de fecha y calculadora integrada.
- **Subida de Recibos**: Adjunta fotos o PDFs a tus transacciones (almacenado seguro en Supabase Storage).
- **Dashboard Interactivo**: Gráficas de tendencias en tiempo real con _Recharts_ y carga diferida (lazy loading).
- **Gestor de Presupuestos**: Alertas visuales con código de color cuando excedes el presupuesto del mes.
- **Automatización**: Generador invisible de transacciones recurrentes (hipotecas, suscripciones, salarios) sin necesidad de configurar un CRON en el servidor.
- **PWA (Progressive Web App)**: Instalable en dispositivos iOS y Android con caché offline básico y un rendimiento de >90 en Lighthouse.
- **Modo Oscuro Nativo**: Soporte completo para temas del sistema con `next-themes`.

---

## Estructura Tecnológica 🛠️

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript.
- **Estilos**: Tailwind CSS v4 + `shadcn/ui` + `framer-motion`.
- **Datos y Estado**: `@tanstack/react-query` + `zustand`.
- **Formularios**: `react-hook-form` + `zod`.
- **Backend & Auth**: Supabase (PostgreSQL + Row Level Security).
- **Service Worker**: `@serwist/next`.

---

## Instalación y Ejecución Local 🚀

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/finanzapp.git
cd finanzapp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Entorno (Supabase)
Debes tener un proyecto en [Supabase](https://supabase.com). 
1. Crea un archivo `.env.local` en la raíz del proyecto.
2. Añade tus llaves:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-larga
```

### 4. Configurar Base de Datos
Ve a la sección **SQL Editor** en tu panel de Supabase y ejecuta el contenido del archivo `supabase/schema.sql` (disponible en la carpeta `supabase` del proyecto). 
Luego, ejecuta la migración para las categorías archivadas:
```sql
alter table public.categories add column if not exists is_archived boolean default false;
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## Despliegue en Vercel (Producción) 🌍

Desplegar FinanzApp es increíblemente fácil gracias a la integración nativa con Vercel:

1. Empuja tu código a un repositorio en **GitHub**.
2. Ve a [Vercel](https://vercel.com) y selecciona **Add New Project**.
3. Importa tu repositorio de GitHub.
4. En la sección de configuración (Environment Variables), asegúrate de añadir:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz clic en **Deploy**.

Vercel detectará automáticamente que es un proyecto de Next.js, configurará los comandos de *build* (`npm run build`) y levantará tu aplicación en una URL segura con HTTPS.

---

## Notas sobre Accesibilidad y Rendimiento ⚡
FinanzApp está diseñada para priorizar el rendimiento. Si deseas medir los Core Web Vitals, asegúrate de correr Lighthouse en la versión "build" de la aplicación, no en el servidor de desarrollo local:
```bash
npm run build
npm run start
```
