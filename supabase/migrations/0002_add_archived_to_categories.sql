-- Añadir columna de archivado a categorías
alter table public.categories add column if not exists is_archived boolean default false;
