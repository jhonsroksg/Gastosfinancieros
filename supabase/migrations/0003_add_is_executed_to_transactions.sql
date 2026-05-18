-- Agrega la columna is_executed a la tabla transactions
ALTER TABLE public.transactions
ADD COLUMN is_executed BOOLEAN NOT NULL DEFAULT false;

-- Si se necesita actualizar las transacciones existentes a ejecutadas (opcional, pero útil si se asume que las transacciones pasadas ya ocurrieron).
-- UPDATE public.transactions SET is_executed = true WHERE type = 'expense';
