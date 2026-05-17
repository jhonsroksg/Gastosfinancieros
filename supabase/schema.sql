-- ==============================================================================
-- 1. TABLAS
-- ==============================================================================

-- 1. Categorías
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text,
  color text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 2. Subcategorías
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- 3. Transacciones
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id),
  subcategory_id uuid references public.subcategories(id),
  type text check (type in ('income', 'expense')) not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text default 'HNL',
  description text,
  transaction_date date not null,
  receipt_url text,
  receipt_filename text,
  recurring_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para Transacciones
create index idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index idx_transactions_category on public.transactions(category_id);

-- 4. Presupuestos mensuales
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  subcategory_id uuid references public.subcategories(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  month int not null check (month between 1 and 12),
  year int not null,
  created_at timestamptz default now(),
  unique(user_id, category_id, subcategory_id, month, year)
);

-- 5. Recurrentes
create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id),
  subcategory_id uuid references public.subcategories(id),
  type text check (type in ('income', 'expense')) not null,
  amount numeric(12,2) not null,
  description text,
  frequency text check (frequency in ('daily','weekly','biweekly','monthly','yearly')) not null,
  day_of_month int,
  day_of_week int,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  last_generated_date date,
  created_at timestamptz default now()
);

-- 6. Configuración del usuario
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade not null,
  default_currency text default 'HNL',
  full_name text,
  avatar_url text,
  theme text default 'light',
  monthly_income_goal numeric(12,2),
  notifications_enabled boolean default true,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.user_settings enable row level security;

-- Políticas para Categories
create policy "users_own_categories_select" on public.categories for select using (auth.uid() = user_id);
create policy "users_own_categories_insert" on public.categories for insert with check (auth.uid() = user_id);
create policy "users_own_categories_update" on public.categories for update using (auth.uid() = user_id);
create policy "users_own_categories_delete" on public.categories for delete using (auth.uid() = user_id);

-- Políticas para Subcategories
create policy "users_own_subcategories_select" on public.subcategories for select using (auth.uid() = user_id);
create policy "users_own_subcategories_insert" on public.subcategories for insert with check (auth.uid() = user_id);
create policy "users_own_subcategories_update" on public.subcategories for update using (auth.uid() = user_id);
create policy "users_own_subcategories_delete" on public.subcategories for delete using (auth.uid() = user_id);

-- Políticas para Transactions
create policy "users_own_transactions_select" on public.transactions for select using (auth.uid() = user_id);
create policy "users_own_transactions_insert" on public.transactions for insert with check (auth.uid() = user_id);
create policy "users_own_transactions_update" on public.transactions for update using (auth.uid() = user_id);
create policy "users_own_transactions_delete" on public.transactions for delete using (auth.uid() = user_id);

-- Políticas para Budgets
create policy "users_own_budgets_select" on public.budgets for select using (auth.uid() = user_id);
create policy "users_own_budgets_insert" on public.budgets for insert with check (auth.uid() = user_id);
create policy "users_own_budgets_update" on public.budgets for update using (auth.uid() = user_id);
create policy "users_own_budgets_delete" on public.budgets for delete using (auth.uid() = user_id);

-- Políticas para Recurring Transactions
create policy "users_own_recurring_select" on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "users_own_recurring_insert" on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "users_own_recurring_update" on public.recurring_transactions for update using (auth.uid() = user_id);
create policy "users_own_recurring_delete" on public.recurring_transactions for delete using (auth.uid() = user_id);

-- Políticas para User Settings
create policy "users_own_settings_select" on public.user_settings for select using (auth.uid() = user_id);
create policy "users_own_settings_insert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "users_own_settings_update" on public.user_settings for update using (auth.uid() = user_id);
create policy "users_own_settings_delete" on public.user_settings for delete using (auth.uid() = user_id);

-- ==============================================================================
-- 3. STORAGE BUCKET PARA RECIBOS
-- ==============================================================================

-- Crear el bucket 'receipts' (si no existe)
insert into storage.buckets (id, name, public) 
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Políticas de Storage
create policy "user_receipts_select" on storage.objects
  for select using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
  
create policy "user_receipts_insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "user_receipts_update" on storage.objects
  for update using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "user_receipts_delete" on storage.objects
  for delete using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

-- ==============================================================================
-- 4. TRIGGER PARA SEMILLA INICIAL (SEED)
-- ==============================================================================

-- Función que se ejecuta al crear un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Crear configuración por defecto
  insert into public.user_settings (user_id)
  values (new.id);

  -- 2. Insertar las 11 categorías de gasto y 2 de ingreso (por defecto)
  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    (new.id, 'Alojamiento', 'expense', 'home', '#3b82f6', true),
    (new.id, 'Transporte', 'expense', 'car', '#f59e0b', true),
    (new.id, 'Escuela y Cuidado', 'expense', 'graduation-cap', '#8b5cf6', true),
    (new.id, 'Comida', 'expense', 'utensils', '#ef4444', true),
    (new.id, 'Mascotas', 'expense', 'paw-print', '#ec4899', true),
    (new.id, 'Cuidado personal', 'expense', 'heart', '#f43f5e', true),
    (new.id, 'Entretenimiento', 'expense', 'clapperboard', '#06b6d4', true),
    (new.id, 'Préstamos', 'expense', 'credit-card', '#64748b', true),
    (new.id, 'Impuestos', 'expense', 'landmark', '#475569', true),
    (new.id, 'Ahorros e Inversiones', 'expense', 'piggy-bank', '#10b981', true),
    (new.id, 'Regalos y Donaciones', 'expense', 'gift', '#d946ef', true),
    (new.id, 'Legal', 'expense', 'scale', '#6366f1', true),
    (new.id, 'Ingreso Principal', 'income', 'briefcase', '#059669', true),
    (new.id, 'Ingresos Adicionales', 'income', 'trending-up', '#14b8a6', true);
    
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que escucha la creación en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- FIN DEL SCRIPT
-- ==============================================================================
